import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import type { TaskType } from '@yanxuebao/types';
import { Roles } from '../security/roles.decorator';
import { parsePaginationQuery } from '../common/pagination';
import { AppDataService } from './app-data.service';

class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  contactName?: string;

  @IsString()
  @IsOptional()
  contactPhone?: string;
}

class CreateTaskTemplateDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  taskType!: TaskType;

  @IsArray()
  @IsOptional()
  abilityTags?: string[];
}

class AdminListQueryDto {
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

@Roles('operator')
@Controller('admin')
export class AdminController {
  constructor(private readonly appDataService: AppDataService) {}

  @Get('organizations')
  async listOrganizations(@Query() query: AdminListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listOrganizations(), parsePaginationQuery(query));
  }

  @Post('organizations')
  createOrganization(@Body() payload: CreateOrganizationDto) {
    return this.appDataService.createOrganization(payload);
  }

  @Get('task-templates')
  async listTaskTemplates(@Query() query: AdminListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listTaskTemplates(), parsePaginationQuery(query));
  }

  @Post('task-templates')
  createTaskTemplate(@Body() payload: CreateTaskTemplateDto) {
    return this.appDataService.createTaskTemplate({
      ...payload,
      abilityTags: payload.abilityTags ?? [],
    });
  }

  @Get('question-bank')
  listQuestionBank() {
    return this.appDataService.listQuestionBank();
  }

  @Get('inventory')
  listInventory() {
    return this.appDataService.listInventory();
  }
}
