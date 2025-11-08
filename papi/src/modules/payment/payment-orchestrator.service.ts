import { Injectable, Logger } from '@nestjs/common';
import {
  IPaymentProvider,
  PaymentInitiationParams,
  PaymentInitiationResponse,
  PaymentVerificationResponse,
  BankAccountValidationParams,
  BankAccountValidationResponse,
  BankInfo,
} from './interfaces/payment-provider.interface';
import { PaystackProvider } from './providers/paystack.provider';

export enum ProviderHealth {
  HEALTHY = 'healthy',
  DEGRADED = 'degraded',
  DOWN = 'down',
}

interface ProviderHealthStatus {
  name: string;
  status: ProviderHealth;
  failureRate: number;
  lastChecked: Date;
}

@Injectable()
export class PaymentOrchestratorService {
  private readonly logger = new Logger(PaymentOrchestratorService.name);
  private readonly providers: Map<string, IPaymentProvider> = new Map();
  private readonly healthStatus: Map<string, ProviderHealthStatus> = new Map();
  private readonly failureThreshold = 0.2;
  private readonly checkWindow = 100;

  constructor(private paystackProvider: PaystackProvider) {
    this.registerProvider(this.paystackProvider);
  }

  private registerProvider(provider: IPaymentProvider): void {
    const name = provider.getName();
    this.providers.set(name, provider);
    this.healthStatus.set(name, {
      name,
      status: ProviderHealth.HEALTHY,
      failureRate: 0,
      lastChecked: new Date(),
    });
    this.logger.log(`Registered payment provider: ${name}`);
  }

  async initiatePayment(
    params: PaymentInitiationParams,
    preferredProvider?: string,
  ): Promise<PaymentInitiationResponse> {
    const provider = this.selectProvider(preferredProvider);
    if (!provider) {
      return {
        success: false,
        reference: params.reference,
        status: 'failed',
        message: 'No suitable payment provider found',
      };
    }

    try {
      const result = await provider.initiatePayment(params);
      this.recordProviderResult(provider.getName(), result.success);
      return result;
    } catch (error) {
      this.logger.error(
        `Payment initiation failed for provider: ${provider.getName()}`,
        error,
      );
      this.recordProviderResult(provider.getName(), false);

      const fallbackProvider = this.selectProvider(
        undefined,
        provider.getName(),
      );
      if (fallbackProvider) {
        this.logger.log(`Attempting fallback to ${fallbackProvider.getName()}`);
        try {
          const result = await fallbackProvider.initiatePayment(params);
          this.recordProviderResult(fallbackProvider.getName(), result.success);
          return result;
        } catch (fallbackError) {
          this.recordProviderResult(fallbackProvider.getName(), false);
          throw fallbackError;
        }
      }

      return {
        success: false,
        reference: params.reference,
        status: 'failed',
        message: (error as Error).message,
      };
    }
  }

  async verifyPayment(
    reference: string,
    providerName: string,
  ): Promise<PaymentVerificationResponse> {
    const provider = this.providers.get(providerName);

    if (!provider) {
      throw new Error(`Provider ${providerName} not found`);
    }

    return provider.verifyPayment(reference);
  }

  async validateBankAccount(
    params: BankAccountValidationParams,
    preferredProvider?: string,
  ): Promise<BankAccountValidationResponse> {
    const provider = this.selectProvider(preferredProvider);

    if (!provider) {
      throw new Error('No available payment provider');
    }

    return provider.validateBankAccount(params);
  }

  async getBanks(preferredProvider?: string): Promise<BankInfo[]> {
    const provider = this.selectProvider(preferredProvider);

    if (!provider) {
      throw new Error('No available payment provider');
    }

    return provider.getBanks();
  }

  private selectProvider(
    preferredProvider?: string,
    excludeProvider?: string,
  ): IPaymentProvider | null {
    if (preferredProvider && preferredProvider !== excludeProvider) {
      const provider = this.providers.get(preferredProvider);
      const health = this.healthStatus.get(preferredProvider);

      if (provider && health?.status !== ProviderHealth.DOWN) {
        return provider;
      }
    }

    const healthyProviders = Array.from(this.providers.entries())
      .filter(([name]) => {
        if (name === excludeProvider) return false;
        const health = this.healthStatus.get(name);
        return health && health.status !== ProviderHealth.DOWN;
      })
      .sort(([nameA], [nameB]) => {
        const healthA = this.healthStatus.get(nameA)!;
        const healthB = this.healthStatus.get(nameB)!;
        return healthA.failureRate - healthB.failureRate;
      });

    if (healthyProviders.length === 0) {
      this.logger.error('No healthy payment providers available');
      return null;
    }

    return healthyProviders[0][1];
  }

  private recordProviderResult(providerName: string, success: boolean): void {
    const health = this.healthStatus.get(providerName);
    if (!health) return;

    const recentFailures = success ? 0 : 1;
    const newFailureRate =
      (health.failureRate * (this.checkWindow - 1) + recentFailures) /
      this.checkWindow;

    let newStatus = ProviderHealth.HEALTHY;
    if (newFailureRate >= this.failureThreshold) {
      newStatus = ProviderHealth.DOWN;
      this.logger.warn(
        `Provider ${providerName} marked as DOWN. Failure rate: ${newFailureRate}`,
      );
    } else if (newFailureRate >= this.failureThreshold / 2) {
      newStatus = ProviderHealth.DEGRADED;
    }

    this.healthStatus.set(providerName, {
      ...health,
      status: newStatus,
      failureRate: newFailureRate,
      lastChecked: new Date(),
    });
  }

  getProviderHealth(): ProviderHealthStatus[] {
    return Array.from(this.healthStatus.values());
  }

  async performHealthCheck(): Promise<void> {
    for (const [name, provider] of this.providers) {
      try {
        await provider.getBanks();
        const health = this.healthStatus.get(name);
        if (health && health.status === ProviderHealth.DOWN) {
          this.healthStatus.set(name, {
            ...health,
            status: ProviderHealth.HEALTHY,
            failureRate: 0,
            lastChecked: new Date(),
          });
          this.logger.log(`Provider ${name} recovered and marked as HEALTHY`);
        }
      } catch (error) {
        this.logger.error(`Health check failed for ${name}`, error);
      }
    }
  }
}
