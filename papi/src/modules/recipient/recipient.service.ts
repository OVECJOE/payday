import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import {
  Recipient,
  RecipientStatus,
  RecipientType,
} from './entities/recipient.entity';
import { PaymentOrchestratorService } from '../payment/payment-orchestrator.service';
import { BankInfo } from '../payment/interfaces/payment-provider.interface';

export interface CreateRecipientDto {
  name: string;
  accountNumber: string;
  bankCode: string;
  type?: RecipientType;
  email?: string;
  phone?: string;
  notes?: string;
}

export interface UpdateRecipientDto {
  name?: string;
  email?: string;
  phone?: string;
  notes?: string;
  status?: RecipientStatus;
}

export interface ValidateBankAccountDto {
  accountNumber: string;
  bankCode: string;
}

@Injectable()
export class RecipientService {
  constructor(
    @InjectRepository(Recipient)
    private recipientRepository: Repository<Recipient>,
    private paymentOrchestrator: PaymentOrchestratorService,
  ) {}

  private async findRecipientByIdAndUser(
    recipientId: string,
    userId: string,
  ): Promise<Recipient> {
    const recipient = await this.recipientRepository.findOne({
      where: { id: recipientId, userId },
    });

    if (!recipient) {
      throw new NotFoundException('Recipient not found');
    }

    return recipient;
  }

  async createRecipient(
    userId: string,
    dto: CreateRecipientDto,
  ): Promise<Recipient> {
    const existingRecipient = await this.recipientRepository.findOne({
      where: {
        userId,
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
      },
    });

    if (existingRecipient) {
      throw new ConflictException('Recipient already exists');
    }

    const validation = await this.paymentOrchestrator.validateBankAccount({
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
    });

    if (!validation.valid) {
      throw new BadRequestException('Invalid bank account details');
    }

    const banks = await this.paymentOrchestrator.getBanks();
    const bank = banks.find((b) => b.code === dto.bankCode);
    if (!bank) {
      throw new BadRequestException('Invalid bank code');
    }

    const recipient = this.recipientRepository.create({
      userId,
      name: validation.accountName || dto.name,
      accountNumber: dto.accountNumber,
      bankCode: dto.bankCode,
      bankName: bank.name,
      type: dto.type || RecipientType.INDIVIDUAL,
      email: dto.email,
      phone: dto.phone,
      notes: dto.notes,
      verified: true,
      verifiedAt: new Date(),
      status: RecipientStatus.ACTIVE,
    });

    return this.recipientRepository.save(recipient);
  }

  async updateRecipient(
    recipientId: string,
    userId: string,
    dto: UpdateRecipientDto,
  ): Promise<Recipient> {
    const recipient = await this.findRecipientByIdAndUser(recipientId, userId);

    if (dto.name !== undefined) recipient.name = dto.name;
    if (dto.email !== undefined) recipient.email = dto.email;
    if (dto.phone !== undefined) recipient.phone = dto.phone;
    if (dto.notes !== undefined) recipient.notes = dto.notes;
    if (dto.status !== undefined) recipient.status = dto.status;

    return this.recipientRepository.save(recipient);
  }

  async deleteRecipient(recipientId: string, userId: string): Promise<void> {
    const recipient = await this.findRecipientByIdAndUser(recipientId, userId);
    await this.recipientRepository.remove(recipient);
  }

  async getRecipientById(
    recipientId: string,
    userId: string,
  ): Promise<Recipient> {
    return this.findRecipientByIdAndUser(recipientId, userId);
  }

  async getUserRecipients(
    userId: string,
    status?: RecipientStatus,
  ): Promise<Recipient[]> {
    const where: FindOptionsWhere<Recipient> = { userId };
    if (status) {
      where.status = status;
    }

    return this.recipientRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async validateBankAccount(
    dto: ValidateBankAccountDto,
  ): Promise<{ valid: boolean; accountName?: string }> {
    const result = await this.paymentOrchestrator.validateBankAccount(dto);
    return {
      valid: result.valid,
      accountName: result.accountName,
    };
  }

  async getBanks(): Promise<BankInfo[]> {
    return this.paymentOrchestrator.getBanks();
  }

  async deactivateRecipient(
    recipientId: string,
    userId: string,
  ): Promise<Recipient> {
    const recipient = await this.findRecipientByIdAndUser(recipientId, userId);
    recipient.status = RecipientStatus.INACTIVE;
    return this.recipientRepository.save(recipient);
  }

  async reactivateRecipient(
    recipientId: string,
    userId: string,
  ): Promise<Recipient> {
    const recipient = await this.findRecipientByIdAndUser(recipientId, userId);
    if (!recipient.verified) {
      throw new BadRequestException('Cannot reactivate unverified recipient');
    }

    recipient.status = RecipientStatus.ACTIVE;
    return this.recipientRepository.save(recipient);
  }
}
