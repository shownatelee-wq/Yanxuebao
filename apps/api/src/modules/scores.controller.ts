import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { Roles } from '../security/roles.decorator';
import { parsePaginationQuery } from '../common/pagination';
import { AppDataService } from './app-data.service';

class ConfirmScoreDto {
  @IsString()
  @IsNotEmpty()
  scoreId!: string;

  @IsNumber()
  @Min(0)
  @Max(10)
  tutorScore!: number;

  @IsString()
  @IsOptional()
  comment?: string;
}

class ScoreListQueryDto {
  @IsString()
  @IsOptional()
  teamId?: string;

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

@Controller('scores')
export class ScoresController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('tutor', 'operator', 'parent')
  @Get()
  async listScores(@Query() query: ScoreListQueryDto) {
    const scores = await this.appDataService.listScores({ teamId: query.teamId, studentId: query.studentId });
    return this.appDataService.paginate(scores, parsePaginationQuery(query));
  }

  @Roles('tutor', 'operator', 'parent')
  @Post('confirm')
  confirmScore(@Body() payload: ConfirmScoreDto) {
    return this.appDataService.confirmScore(payload.scoreId, payload.tutorScore, payload.comment);
  }
}
