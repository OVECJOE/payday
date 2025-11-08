import { Controller, Get, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { Wallet } from './entities/wallet.entity';

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
}
