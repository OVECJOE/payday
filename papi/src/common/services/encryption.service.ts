import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly key: Buffer;
  private readonly ivLength = 16;
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly pbkdf2Iterations = 100000;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');
    if (!encryptionKey || encryptionKey.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
    }
    this.key = crypto.scryptSync(encryptionKey, 'salt', 32);
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  decrypt(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  hash(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  hashWithSalt(text: string): string {
    const salt = crypto.randomBytes(this.saltLength).toString('hex');
    const hash = crypto
      .pbkdf2Sync(text, salt, this.pbkdf2Iterations, 64, 'sha512')
      .toString('hex');
    return `${salt}:${hash}`;
  }

  verifyHash(text: string, hashedText: string): boolean {
    const [salt, originalHash] = hashedText.split(':');
    const hash = crypto
      .pbkdf2Sync(text, salt, this.pbkdf2Iterations, 64, 'sha512')
      .toString('hex');
    return hash === originalHash;
  }

  generateRandomToken(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateIdempotencyKey(): string {
    return `${Date.now()}-${crypto.randomBytes(16).toString('hex')}`;
  }

  maskSensitiveData(data: string, visibleChars = 4): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  }

  generateSecureOTP(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    const randomBytes = crypto.randomBytes(length);

    for (let i = 0; i < length; i++) {
      otp += digits[randomBytes[i] % digits.length];
    }

    return otp;
  }

  validateWebhookSignature(
    payload: string,
    signature: string,
    secret: string,
  ): boolean {
    const hash = crypto
      .createHmac('sha512', secret)
      .update(payload)
      .digest('hex');
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  }
}
