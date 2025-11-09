import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EncryptionService } from '@common/services/encryption.service';
import {
  IPaymentProvider,
  PaymentInitiationParams,
  PaymentInitiationResponse,
  PaymentVerificationResponse,
  BankAccountValidationParams,
  BankAccountValidationResponse,
  BankInfo,
} from '../interfaces/payment-provider.interface';

export interface PaymentCollectionParams {
  amount: number;
  email: string;
  reference: string;
  metadata?: Record<string, any>;
  callbackUrl?: string;
}

export interface PaymentCollectionResponse {
  success: boolean;
  authorizationUrl: string;
  accessCode: string;
  reference: string;
  message?: string;
}

@Injectable()
export class PaystackProvider implements IPaymentProvider {
  private readonly logger = new Logger(PaystackProvider.name);
  private readonly secretKey: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(
    private configService: ConfigService,
    private encryptionService: EncryptionService,
  ) {
    this.secretKey =
      this.configService.get<string>('PAYSTACK_SECRET_KEY') ??
      'sk_test_2016461833695260325742994371';
  }

  getName(): string {
    return 'paystack';
  }

  async initiatePayment(
    params: PaymentInitiationParams,
  ): Promise<PaymentInitiationResponse> {
    try {
      const payload = {
        type: 'nuban',
        name: params.recipientName,
        account_number: params.recipientAccount,
        bank_code: params.recipientBank,
        currency: 'NGN',
      };

      const recipientResponse = (await this.makeRequest(
        '/transferrecipient',
        'POST',
        payload,
      )) as {
        status: boolean;
        message: string;
        data: { recipient_code: string };
      };

      if (!recipientResponse.status) {
        return {
          success: false,
          reference: params.reference,
          status: 'failed',
          message: recipientResponse.message || 'Failed to create recipient',
        };
      }

      const transferPayload = {
        source: 'balance',
        amount: params.amount * 100,
        recipient: recipientResponse.data.recipient_code,
        reference: params.reference,
        reason: params.narration || 'Payment from Payday',
      };

      const transferResponse = await this.makeRequest(
        '/transfer',
        'POST',
        transferPayload,
      );

      return {
        success: transferResponse.status,
        reference: params.reference,
        providerReference: transferResponse.data?.transfer_code as string,
        status: this.mapStatus(transferResponse.data?.status as string),
        message: transferResponse.message,
        data: transferResponse.data,
      };
    } catch (error) {
      this.logger.error('Paystack payment initiation failed', error);
      return {
        success: false,
        reference: params.reference,
        status: 'failed',
        message: (error as Error).message,
      };
    }
  }

  async initializePaymentCollection(
    params: PaymentCollectionParams,
  ): Promise<PaymentCollectionResponse> {
    try {
      const payload = {
        email: params.email,
        amount: params.amount * 100,
        reference: params.reference,
        metadata: params.metadata,
        callback_url: params.callbackUrl,
        currency: 'NGN',
      };

      const response = (await this.makeRequest(
        '/transaction/initialize',
        'POST',
        payload,
      )) as {
        status: boolean;
        message: string;
        data: {
          authorization_url: string;
          access_code: string;
          reference: string;
        };
      };

      if (!response.status) {
        return {
          success: false,
          authorizationUrl: '',
          accessCode: '',
          reference: params.reference,
          message: response.message || 'Failed to initialize payment',
        };
      }

      return {
        success: true,
        authorizationUrl: response.data.authorization_url,
        accessCode: response.data.access_code,
        reference: response.data.reference,
        message: response.message,
      };
    } catch (error) {
      this.logger.error(
        'Paystack payment collection initialization failed',
        error,
      );
      return {
        success: false,
        authorizationUrl: '',
        accessCode: '',
        reference: params.reference,
        message: (error as Error).message,
      };
    }
  }

  async verifyPayment(reference: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await this.makeRequest(
        `/transaction/verify/${reference}`,
        'GET',
      );

      return {
        success: response.status,
        status: this.mapStatus(response.data?.status as string),
        reference: reference,
        amount: (response.data?.amount as number) / 100 || 0,
        recipientAccount:
          (response.data?.customer as { email?: string })?.email || '',
        message: response.message,
        data: response.data,
      };
    } catch (error) {
      this.logger.error('Paystack payment verification failed', error);
      return {
        success: false,
        status: 'failed',
        reference,
        amount: 0,
        recipientAccount: '',
        message: (error as Error).message,
      };
    }
  }

  async validateBankAccount(
    params: BankAccountValidationParams,
  ): Promise<BankAccountValidationResponse> {
    try {
      const response = await this.makeRequest(
        `/bank/resolve?account_number=${params.accountNumber}&bank_code=${params.bankCode}`,
        'GET',
      );

      return {
        valid: response.status,
        accountName: response.data?.account_name as string,
        accountNumber: params.accountNumber,
        bankCode: params.bankCode,
      };
    } catch (error) {
      this.logger.error('Paystack account validation failed', error);
      return {
        valid: false,
        accountNumber: params.accountNumber,
        bankCode: params.bankCode,
      };
    }
  }

  async getBanks(): Promise<BankInfo[]> {
    try {
      const response = await this.makeRequest('/bank?currency=NGN', 'GET');
      if (!response.status || !response.data) {
        return [];
      }

      return (response.data as BankInfo[]).map((bank) => ({
        name: bank.name,
        code: bank.code,
        active: bank.active,
      }));
    } catch (error) {
      this.logger.error('Paystack get banks failed', error);
      return [];
    }
  }

  verifyWebhookSignature(payload: string, signature: string): boolean {
    return this.encryptionService.validateWebhookSignature(
      payload,
      signature,
      this.secretKey,
    );
  }

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST' = 'GET',
    body?: any,
  ): Promise<{ status: boolean; message: string; data?: Record<string, any> }> {
    const url = `${this.baseUrl}${endpoint}`;

    const options: RequestInit = {
      method,
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
    };

    if (body && method === 'POST') {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    const data = (await response.json()) as {
      status: boolean;
      message: string;
      data?: Record<string, any>;
    };

    if (!response.ok) {
      throw new Error(data.message || 'Request failed');
    }

    return data;
  }

  private mapStatus(
    paystackStatus: string,
  ): 'pending' | 'processing' | 'success' | 'failed' {
    const statusMap: Record<
      string,
      'pending' | 'processing' | 'success' | 'failed'
    > = {
      pending: 'pending',
      success: 'success',
      failed: 'failed',
      reversed: 'failed',
      processing: 'processing',
      otp: 'processing',
      queued: 'pending',
    };

    return statusMap[paystackStatus?.toLowerCase()] || 'pending';
  }
}
