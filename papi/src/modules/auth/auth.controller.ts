import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Ip,
  UseGuards,
} from '@nestjs/common';
import { IsString } from 'class-validator';
import {
  AuthService,
  type RegisterDto,
  type LoginDto,
  AuthResponse,
} from './auth.service';
import { Public } from '@common/decorators/public.decorator';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

class RefreshTokenDto {
  @IsString()
  refreshToken: string;
}

class RefreshTokenWithPasswordDto {
  @IsString()
  refreshToken: string;

  @IsString()
  password: string;
}

class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class RequestPasswordResetDto {
  email: string;
}

class ResetPasswordDto {
  token: string;
  newPassword: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Ip() ipAddress: string,
  ): Promise<AuthResponse> {
    return this.authService.login(dto, ipAddress);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Post('refresh-with-password')
  @HttpCode(HttpStatus.OK)
  async refreshTokenWithPassword(
    @Body() dto: RefreshTokenWithPasswordDto,
  ): Promise<AuthResponse> {
    return this.authService.refreshTokenWithPassword(
      dto.refreshToken,
      dto.password,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(@CurrentUser('id') userId: string): Promise<void> {
    await this.authService.logout(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser('id') userId: string,
    @Body() dto: ChangePasswordDto,
  ): Promise<void> {
    await this.authService.changePassword(
      userId,
      dto.currentPassword,
      dto.newPassword,
    );
  }

  @Public()
  @Post('request-password-reset')
  @HttpCode(HttpStatus.NO_CONTENT)
  async requestPasswordReset(
    @Body() dto: RequestPasswordResetDto,
  ): Promise<void> {
    await this.authService.requestPasswordReset(dto.email);
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
  }
}
