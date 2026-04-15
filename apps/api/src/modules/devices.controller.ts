import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import type { DeviceMode } from '@yanxuebao/types';
import { Roles } from '../security/roles.decorator';
import { AppDataService } from './app-data.service';

class BindDeviceDto {
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @IsString()
  @IsNotEmpty()
  deviceCode!: string;

  @IsIn(['rental', 'sale'])
  @IsOptional()
  mode?: DeviceMode;
}

@Controller('devices')
export class DevicesController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('parent', 'operator')
  @Post('bind')
  bindDevice(@Body() payload: BindDeviceDto) {
    return this.appDataService.bindDevice(payload);
  }

  @Roles('parent', 'operator', 'tutor')
  @Get(':code')
  async getDevice(@Param('code') code: string) {
    return {
      device: await this.appDataService.getDeviceByCode(code),
    };
  }
}
