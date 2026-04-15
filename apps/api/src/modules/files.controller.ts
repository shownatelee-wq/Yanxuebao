import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { IsOptional, IsString } from 'class-validator';
import { Roles } from '../security/roles.decorator';
import { AppDataService } from './app-data.service';

const uploadsDir = join(process.cwd(), 'tmp', 'uploads');
mkdirSync(uploadsDir, { recursive: true });

class UploadMetaDto {
  @IsString()
  @IsOptional()
  studentId?: string;
}

@Controller('files')
export class FilesController {
  constructor(private readonly appDataService: AppDataService) {}

  @Roles('parent', 'tutor', 'operator', 'student', 'expert')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadsDir,
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname);
          callback(null, `${randomUUID()}${extension}`);
        },
      }),
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body() body: UploadMetaDto) {
    if (!file) {
      throw new BadRequestException('请上传文件');
    }

    const publicUrl = `/uploads/${file.filename}`;

    const asset = await this.appDataService.createFileAsset({
      studentId: body.studentId,
      fileName: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      storagePath: file.path,
      publicUrl,
    });

    return {
      file: asset,
    };
  }
}
