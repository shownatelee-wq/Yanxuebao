import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminController } from './modules/admin.controller';
import { AuthController } from './modules/auth.controller';
import { AuthService } from './modules/auth.service';
import { AppDataService } from './modules/app-data.service';
import { ContentController } from './modules/content.controller';
import { DemoDataService } from './modules/demo-data.service';
import { DevicesController } from './modules/devices.controller';
import { FilesController } from './modules/files.controller';
import { GrowthController } from './modules/growth.controller';
import { MessagesController } from './modules/messages.controller';
import { PrismaModule } from './prisma/prisma.module';
import { ReportsController } from './modules/reports.controller';
import { ScoresController } from './modules/scores.controller';
import { StudentsController } from './modules/students.controller';
import { TasksController } from './modules/tasks.controller';
import { TeamsController } from './modules/teams.controller';
import { JwtAuthGuard } from './security/jwt-auth.guard';
import { RolesGuard } from './security/roles.guard';

const ACCESS_TTL_SECONDS = Number(process.env.JWT_ACCESS_TTL_SECONDS ?? 900);

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET ?? 'yanxuebao-access-dev-secret',
      signOptions: {
        expiresIn: ACCESS_TTL_SECONDS,
      },
    }),
    PrismaModule,
  ],
  controllers: [
    AppController,
    AuthController,
    StudentsController,
    DevicesController,
    TeamsController,
    TasksController,
    ScoresController,
    ReportsController,
    GrowthController,
    AdminController,
    ContentController,
    MessagesController,
    FilesController,
  ],
  providers: [
    AppService,
    DemoDataService,
    AppDataService,
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    {
      provide: APP_GUARD,
      useExisting: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useExisting: RolesGuard,
    },
  ],
})
export class AppModule {}
