import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Roles } from '../security/roles.decorator';
import { parsePaginationQuery } from '../common/pagination';
import { AppDataService } from './app-data.service';

class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  startDate?: string;
}

class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  teamId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

class TeamListQueryDto {
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
export class TeamsController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('tutor', 'operator', 'student')
  @Get('teams')
  async listTeams(@Query() query: TeamListQueryDto) {
    return this.appDataService.paginate(await this.appDataService.listTeams(), parsePaginationQuery(query));
  }

  @Roles('tutor', 'operator')
  @Post('teams')
  createTeam(@Body() payload: CreateTeamDto) {
    return this.appDataService.createTeam(payload);
  }

  @Roles('tutor', 'operator', 'student')
  @Get('teams/:id')
  getTeam(@Param('id') teamId: string) {
    return this.appDataService.getTeam(teamId);
  }

  @Roles('tutor', 'operator', 'student')
  @Get('groups')
  listGroups(@Query('teamId') teamId?: string) {
    return this.appDataService.listGroups(teamId);
  }

  @Roles('tutor', 'operator')
  @Post('groups')
  createGroup(@Body() payload: CreateGroupDto) {
    return this.appDataService.createGroup(payload);
  }
}
