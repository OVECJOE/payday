export interface PaymentInitiationParams {
  amount: number;
  recipientAccount: string;
  recipientBank: string;
  recipientName: string;
  reference: string;
  narration?: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResponse {
  success: boolean;
  reference: string;
  providerReference?: string;
  status: 'pending' | 'processing' | 'success' | 'failed';
  message?: string;
  data?: any;
}

export interface PaymentVerificationResponse {
  success: boolean;
  status: 'pending' | 'processing' | 'success' | 'failed';
  reference: string;
  amount: number;
  recipientAccount: string;
  message?: string;
  data?: any;
}

export interface BankAccountValidationParams {
  accountNumber: string;
  bankCode: string;
}

export interface BankAccountValidationResponse {
  valid: boolean;
  accountName?: string;
  accountNumber: string;
  bankCode: string;
}

export interface BankInfo {
  name: string;
  code: string;
  active: boolean;
}

export interface IPaymentProvider {
  getName(): string;

  initiatePayment(
    params: PaymentInitiationParams,
  ): Promise<PaymentInitiationResponse>;

  verifyPayment(reference: string): Promise<PaymentVerificationResponse>;

  validateBankAccount(
    params: BankAccountValidationParams,
  ): Promise<BankAccountValidationResponse>;

  getBanks(): Promise<BankInfo[]>;

  verifyWebhookSignature(payload: string, signature: string): boolean;
}
