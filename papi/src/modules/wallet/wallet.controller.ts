import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Wallet } from './entities/wallet.entity';

class FundWalletDto {
  amount: number;
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private walletService: WalletService) {}

  @Get()
  async getWallet(@CurrentUser('id') userId: string): Promise<Wallet> {
    return this.walletService.getWalletByUserId(userId);
  }

  @Get('balance')
  async getBalance(
    @CurrentUser('id') userId: string,
  ): Promise<{ total: number; available: number; locked: number }> {
    return this.walletService.getBalance(userId);
  }

  @Post('fund')
  async fundWallet(
    @CurrentUser('id') userId: string,
    @Body() dto: FundWalletDto,
  ): Promise<{ authorizationUrl: string; reference: string }> {
    if (!dto.amount || dto.amount < 100) {
      throw new BadRequestException('Minimum funding amount is ₦100');
    }

    return this.walletService.initializeWalletFunding(userId, dto.amount);
  }
}
