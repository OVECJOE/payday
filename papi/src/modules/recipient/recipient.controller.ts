import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  RecipientService,
  type CreateRecipientDto,
  type UpdateRecipientDto,
  type ValidateBankAccountDto,
} from './recipient.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Recipient, RecipientStatus } from './entities/recipient.entity';

@Controller('recipients')
@UseGuards(JwtAuthGuard)
export class RecipientController {
  constructor(private recipientService: RecipientService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createRecipient(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateRecipientDto,
  ): Promise<Recipient> {
    return this.recipientService.createRecipient(userId, dto);
  }

  @Get()
  async getUserRecipients(
    @CurrentUser('id') userId: string,
    @Query('status') status?: RecipientStatus,
  ): Promise<Recipient[]> {
    return this.recipientService.getUserRecipients(userId, status);
  }

  @Get(':id')
  async getRecipientById(
    @CurrentUser('id') userId: string,
    @Param('id') recipientId: string,
  ): Promise<Recipient> {
    return this.recipientService.getRecipientById(recipientId, userId);
  }

  @Put(':id')
  async updateRecipient(
    @CurrentUser('id') userId: string,
    @Param('id') recipientId: string,
    @Body() dto: UpdateRecipientDto,
  ): Promise<Recipient> {
    return this.recipientService.updateRecipient(recipientId, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecipient(
    @CurrentUser('id') userId: string,
    @Param('id') recipientId: string,
  ): Promise<void> {
    await this.recipientService.deleteRecipient(recipientId, userId);
  }

  @Post(':id/deactivate')
  async deactivateRecipient(
    @CurrentUser('id') userId: string,
    @Param('id') recipientId: string,
  ): Promise<Recipient> {
    return this.recipientService.deactivateRecipient(recipientId, userId);
  }

  @Post(':id/reactivate')
  async reactivateRecipient(
    @CurrentUser('id') userId: string,
    @Param('id') recipientId: string,
  ): Promise<Recipient> {
    return this.recipientService.reactivateRecipient(recipientId, userId);
  }

  @Post('validate-account')
  async validateBankAccount(
    @Body() dto: ValidateBankAccountDto,
  ): Promise<{ valid: boolean; accountName?: string }> {
    return this.recipientService.validateBankAccount(dto);
  }

  @Get('banks/list')
  async getBanks(): Promise<any[]> {
    return this.recipientService.getBanks();
  }
}
