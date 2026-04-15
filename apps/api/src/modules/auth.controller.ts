import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { DeviceMode } from '@yanxuebao/types';
import { CurrentUser } from '../security/current-user.decorator';
import type { AuthenticatedUser } from '../security/auth.types';
import { Public } from '../security/public.decorator';
import { AuthService } from './auth.service';

class WebLoginDto {
  @IsString()
  @IsNotEmpty()
  account!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

class DeviceLoginDto {
  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  deviceCode?: string;

  @IsString()
  @IsOptional()
  mode?: DeviceMode;
}

class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('web/login')
  webLogin(@Body() payload: WebLoginDto) {
    return this.authService.loginWeb(payload);
  }

  @Public()
  @Post('device/login')
  deviceLogin(@Body() payload: DeviceLoginDto) {
    return this.authService.loginDevice(payload);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() payload: RefreshTokenDto) {
    return this.authService.refreshSession(payload.refreshToken);
  }

  @Get('me')
  me(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.getProfile(user.sub);
  }
}
