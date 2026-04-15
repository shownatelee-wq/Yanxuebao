import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import type { TaskType, WorkType } from '@yanxuebao/types';
import { Roles } from '../security/roles.decorator';
import { parsePaginationQuery } from '../common/pagination';
import { AppDataService } from './app-data.service';

class CreateTaskDto {
  @IsString()
  @IsOptional()
  teamId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  templateId?: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsString()
  @IsNotEmpty()
  taskType!: TaskType;

  @IsString()
  @IsOptional()
  dueAt?: string;
}

class SubmitWorkDto {
  @IsString()
  @IsNotEmpty()
  taskId!: string;

  @IsString()
  @IsOptional()
  studentId?: string;

  @IsString()
  @IsOptional()
  groupId?: string;

  @IsString()
  @IsNotEmpty()
  type!: WorkType;

  @IsString()
  @IsNotEmpty()
  content!: string;
}

class UpdateWorkDto {
  @IsString()
  @IsNotEmpty()
  content!: string;
}

class TaskListQueryDto {
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

@Controller()
export class TasksController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('tutor', 'operator', 'student', 'parent')
  @Get('tasks')
  async listTasks(@Query() query: TaskListQueryDto) {
    const tasks = await this.appDataService.listTasks({ teamId: query.teamId, studentId: query.studentId });
    return this.appDataService.paginate(tasks, parsePaginationQuery(query));
  }

  @Roles('tutor', 'operator', 'student', 'parent')
  @Get('tasks/:id')
  getTask(@Param('id') taskId: string) {
    return this.appDataService.getTask(taskId);
  }

  @Roles('tutor', 'operator', 'parent')
  @Post('tasks')
  createTask(@Body() payload: CreateTaskDto) {
    return this.appDataService.createTask(payload);
  }

  @Roles('student', 'tutor', 'operator', 'parent')
  @Post('works')
  submitWork(@Body() payload: SubmitWorkDto) {
    return this.appDataService.submitWork(payload);
  }

  @Roles('student', 'tutor', 'operator', 'parent')
  @Patch('works/:id')
  updateWork(@Param('id') workId: string, @Body() payload: UpdateWorkDto) {
    return this.appDataService.updateWork(workId, payload);
  }
}
