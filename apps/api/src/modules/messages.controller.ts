import { Controller, Get, Query } from '@nestjs/common';
import { Roles } from '../security/roles.decorator';
import { AppDataService } from './app-data.service';

@Controller('messages')
export class MessagesController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('parent', 'tutor', 'operator', 'student')
  @Get()
  listMessages() {
    return this.appDataService.listMessages();
  }

  @Roles('parent', 'tutor', 'operator', 'student')
  @Get('ai-records')
  listAiRecords(@Query('studentId') studentId?: string) {
    return this.appDataService.listAiRecords(studentId);
  }
}
