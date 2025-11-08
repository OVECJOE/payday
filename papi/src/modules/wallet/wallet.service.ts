import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './entities/wallet.entity';

export interface WalletLockResult {
  success: boolean;
  availableBalance: number;
  lockedAmount: number;
}

export interface WalletTransferParams {
  amount: number;
  description?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletRepository: Repository<Wallet>,
    private dataSource: DataSource,
  ) {}

  async createWallet(userId: string): Promise<Wallet> {
    const existingWallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (existingWallet) {
      throw new ConflictException('Wallet already exists');
    }

    const wallet = this.walletRepository.create({
      userId,
      balance: 0,
      lockedBalance: 0,
    });

    return this.walletRepository.save(wallet);
  }

  async getWalletByUserId(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  async lockFunds(userId: string, amount: number): Promise<WalletLockResult> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      const availableBalance = wallet.getAvailableBalance();
      if (availableBalance < amount) {
        return {
          success: false,
          availableBalance,
          lockedAmount: 0,
        };
      }

      wallet.lockedBalance = Number(wallet.lockedBalance) + amount;
      await manager.save(wallet);

      return {
        success: true,
        availableBalance: wallet.getAvailableBalance(),
        lockedAmount: amount,
      };
    });
  }

  async unlockFunds(userId: string, amount: number): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');
      if (Number(wallet.lockedBalance) < amount) {
        throw new BadRequestException('Cannot unlock more than locked balance');
      }

      wallet.lockedBalance = Number(wallet.lockedBalance) - amount;
      return manager.save(wallet);
    });
  }

  async debitWallet(
    userId: string,
    amount: number,
    fromLocked = true,
  ): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');
      if (fromLocked) {
        if (Number(wallet.lockedBalance) < amount) {
          throw new BadRequestException('Insufficient locked balance');
        }

        wallet.lockedBalance = Number(wallet.lockedBalance) - amount;
      } else {
        const availableBalance = wallet.getAvailableBalance();
        if (availableBalance < amount) {
          throw new BadRequestException('Insufficient available balance');
        }
      }

      wallet.balance = Number(wallet.balance) - amount;
      return manager.save(wallet);
    });
  }

  async creditWallet(userId: string, amount: number): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      wallet.balance = Number(wallet.balance) + amount;
      return manager.save(wallet);
    });
  }

  async getBalance(userId: string): Promise<{
    total: number;
    available: number;
    locked: number;
  }> {
    const wallet = await this.getWalletByUserId(userId);

    return {
      total: wallet.getTotalBalance(),
      available: wallet.getAvailableBalance(),
      locked: Number(wallet.lockedBalance),
    };
  }

  async transferBetweenWallets(
    fromUserId: string,
    toUserId: string,
    params: WalletTransferParams,
  ): Promise<{ fromWallet: Wallet; toWallet: Wallet }> {
    return this.dataSource.transaction(async (manager) => {
      const fromWallet = await manager.findOne(Wallet, {
        where: { userId: fromUserId },
        lock: { mode: 'pessimistic_write' },
      });

      const toWallet = await manager.findOne(Wallet, {
        where: { userId: toUserId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromWallet || !toWallet) {
        throw new NotFoundException('One or both wallets not found');
      }

      if (!fromWallet.canDebit(params.amount)) {
        throw new BadRequestException('Insufficient balance for transfer');
      }

      fromWallet.balance = Number(fromWallet.balance) - params.amount;
      toWallet.balance = Number(toWallet.balance) + params.amount;

      await manager.save(fromWallet);
      await manager.save(toWallet);

      return { fromWallet, toWallet };
    });
  }

  async unlockAndRefund(userId: string, amount: number): Promise<Wallet> {
    return this.dataSource.transaction(async (manager) => {
      const wallet = await manager.findOne(Wallet, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) throw new NotFoundException('Wallet not found');

      if (Number(wallet.lockedBalance) < amount) {
        throw new BadRequestException('Cannot unlock more than locked balance');
      }

      wallet.lockedBalance = Number(wallet.lockedBalance) - amount;
      return manager.save(wallet);
    });
  }
}
