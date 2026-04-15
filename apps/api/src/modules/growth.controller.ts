import { Controller, Get, Param } from '@nestjs/common';
import { Roles } from '../security/roles.decorator';
import { AppDataService } from './app-data.service';

@Controller('growth')
export class GrowthController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('parent', 'tutor', 'operator', 'student')
  @Get(':studentId/records')
  getGrowthRecords(@Param('studentId') studentId: string) {
    return this.appDataService.getGrowth(studentId);
  }

  @Roles('parent', 'tutor', 'operator', 'student')
  @Get(':studentId/capability-index')
  async getCapabilityIndex(@Param('studentId') studentId: string) {
    const growth = await this.appDataService.getGrowth(studentId);
    return growth.capabilityIndexRecords;
  }
}
