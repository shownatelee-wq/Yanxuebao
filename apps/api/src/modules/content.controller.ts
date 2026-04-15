import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Roles } from '../security/roles.decorator';
import { parsePaginationQuery } from '../common/pagination';
import { AppDataService } from './app-data.service';

class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  format!: string;

  @IsString()
  @IsOptional()
  status?: string;
}

class CreateKnowledgeDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

class CreateChallengeDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  difficulty!: string;

  @IsString()
  @IsOptional()
  status?: string;
}

class CreateNewsDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  summary!: string;

  @IsString()
  @IsNotEmpty()
  category!: string;
}

class ContentListQueryDto {
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

@Controller()
export class ContentController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('expert', 'operator', 'parent', 'student', 'tutor')
  @Get('courses')
  async listCourses(@Query() query: ContentListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listCourses(), parsePaginationQuery(query));
  }

  @Roles('expert', 'operator')
  @Post('courses')
  createCourse(@Body() payload: CreateCourseDto) {
    return this.appDataService.createCourse({
      ...payload,
      status: payload.status ?? 'draft',
    });
  }

  @Roles('expert', 'operator', 'parent', 'student', 'tutor')
  @Get('knowledge')
  async listKnowledgeItems(@Query() query: ContentListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listKnowledgeItems(), parsePaginationQuery(query));
  }

  @Roles('expert', 'operator')
  @Post('knowledge')
  createKnowledgeItem(@Body() payload: CreateKnowledgeDto) {
    return this.appDataService.createKnowledgeItem(payload);
  }

  @Roles('expert', 'operator', 'parent', 'student', 'tutor')
  @Get('challenges')
  async listChallenges(@Query() query: ContentListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listChallenges(), parsePaginationQuery(query));
  }

  @Roles('expert', 'operator')
  @Post('challenges')
  createChallenge(@Body() payload: CreateChallengeDto) {
    return this.appDataService.createChallenge({
      ...payload,
      status: payload.status ?? 'draft',
    });
  }

  @Roles('expert', 'operator', 'parent', 'student', 'tutor')
  @Get('news')
  async listNews(@Query() query: ContentListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listNews(), parsePaginationQuery(query));
  }

  @Roles('expert', 'operator')
  @Post('news')
  createNews(@Body() payload: CreateNewsDto) {
    return this.appDataService.createNews({
      ...payload,
      publishedAt: new Date().toISOString(),
    });
  }
}
