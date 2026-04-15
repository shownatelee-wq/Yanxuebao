import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './security/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }

  @Public()
  @Get('manifest')
  getManifest() {
    return this.appService.getManifest();
  }
}
