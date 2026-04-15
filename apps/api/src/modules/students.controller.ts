import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { CurrentUser } from '../security/current-user.decorator';
import type { AuthenticatedUser } from '../security/auth.types';
import { Roles } from '../security/roles.decorator';
import { parsePaginationQuery } from '../common/pagination';
import { AppDataService } from './app-data.service';

class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  school?: string;

  @IsString()
  @IsOptional()
  grade?: string;
}

class StudentListQueryDto {
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

@Controller('students')
export class StudentsController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('parent', 'tutor', 'operator')
  @Get()
  async listStudents(@CurrentUser() user: AuthenticatedUser, @Query() query: StudentListQueryDto) {
    const students = await this.appDataService.listStudents();

    if (user.role === 'parent') {
      return this.appDataService.paginate(
        students.filter((student) => student.primaryParentUserId === user.sub),
        parsePaginationQuery(query),
      );
    }

    return this.appDataService.paginate(students, parsePaginationQuery(query));
  }

  @Roles('parent', 'tutor', 'operator', 'student')
  @Get(':id')
  getStudent(@Param('id') studentId: string) {
    return this.appDataService.getStudentOverview(studentId);
  }

  @Roles('parent', 'tutor', 'operator', 'student')
  @Get(':id/growth')
  getStudentGrowth(@Param('id') studentId: string) {
    return this.appDataService.getGrowth(studentId);
  }

  @Roles('parent', 'operator')
  @Post()
  createStudent(@CurrentUser() user: AuthenticatedUser, @Body() payload: CreateStudentDto) {
    return this.appDataService.createStudent({
      ...payload,
      parentUserId: user.role === 'parent' ? user.sub : undefined,
    });
  }
}
