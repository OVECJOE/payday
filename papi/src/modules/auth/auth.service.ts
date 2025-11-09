import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User, UserStatus } from '../user/entities/user.entity';
import { WalletService } from '../wallet/wallet.service';
import { EncryptionService } from '@common/services/encryption.service';
import { JwtPayload } from './strategies/jwt.strategy';

export interface RegisterDto {
  email: string;
  phone: string;
  password: string;
  firstName?: string;
  lastName?: string;
  timezone?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: Partial<User>;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private encryptionService: EncryptionService,
    private walletService: WalletService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.userRepository.findOne({
      where: [{ email: dto.email }, { phone: dto.phone }],
    });

    if (existingUser) {
      throw new ConflictException('Email or phone already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepository.create({
      email: dto.email,
      phone: dto.phone,
      status: UserStatus.ACTIVE,
      passwordHash,
      firstName: dto.firstName,
      lastName: dto.lastName,
      timezone: dto.timezone || 'Africa/Lagos',
    });

    const savedUser = await this.userRepository.save(user);
    await this.walletService.createWallet(savedUser.id);
    const tokens = await this.generateTokens(savedUser);

    return {
      ...tokens,
      user: this.sanitizeUser(savedUser),
    };
  }

  async login(dto: LoginDto, ipAddress?: string): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive()) {
      throw new UnauthorizedException('Account is not active');
    }

    user.lastLoginAt = new Date();
    user.lastLoginIp = ipAddress;
    await this.userRepository.save(user);

    const tokens = await this.generateTokens(user);

    return {
      ...tokens,
      user: this.sanitizeUser(user),
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as unknown as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async refreshTokenWithPassword(
    refreshToken: string,
    password: string,
  ): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      }) as unknown as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      const user = await this.userRepository.findOne({
        where: { id: payload.sub },
      });

      if (!user || user.refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid or expired refresh token');
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }

      const tokens = await this.generateTokens(user);

      return {
        ...tokens,
        user: this.sanitizeUser(user),
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: undefined });
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (currentPassword === newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.refreshToken = undefined;
    await this.userRepository.save(user);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) return;

    const resetToken = this.encryptionService.generateRandomToken(32);
    const hashedToken = this.encryptionService.hash(resetToken);

    user.metadata = {
      ...user.metadata,
      passwordResetToken: hashedToken,
      passwordResetExpiry: new Date(Date.now() + 3600000),
    };

    await this.userRepository.save(user);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const hashedToken = this.encryptionService.hash(token);

    const user = await this.userRepository
      .createQueryBuilder('user')
      .where("user.metadata->>'passwordResetToken' = :token", {
        token: hashedToken,
      })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const resetExpiry = new Date(user.metadata.passwordResetExpiry as string);
    if (resetExpiry < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.refreshToken = undefined;
    user.metadata = {
      ...user.metadata,
      passwordResetToken: null,
      passwordResetExpiry: null,
    };

    await this.userRepository.save(user);
  }

  async validateUser(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  private async generateTokens(user: User): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'access',
    } as JwtPayload;

    const refreshTokenPayload = {
      sub: user.id,
      email: user.email,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
    } as JwtSignOptions);

    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET')!,
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
    } as JwtSignOptions);

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return {
      accessToken,
      refreshToken,
    };
  }

  private sanitizeUser(user: User): Partial<User> {
    return {
      ...user,
      passwordHash: undefined,
      refreshToken: undefined,
      twoFactorSecret: undefined,
    };
  }
}
