import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Roles } from '../security/roles.decorator';
import { parsePaginationQuery } from '../common/pagination';
import { AppDataService } from './app-data.service';

class GenerateReportDto {
  @IsString()
  @IsNotEmpty()
  studentId!: string;

  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  title?: string;
}

class ReportListQueryDto {
  @IsString()
  @IsOptional()
  studentId?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  pageSize?: number;
}

@Controller('reports')
export class ReportsController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('tutor', 'operator', 'parent')
  @Get()
  async listReports(@Query() query: ReportListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listReports(query.studentId), parsePaginationQuery(query));
  }

  @Roles('tutor', 'operator')
  @Post('generate')
  generateReport(@Body() payload: GenerateReportDto) {
    return this.appDataService.generateReport(payload);
  }
}
