import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArcjetModule } from './lib/arcjet/arcjet.module';
import { ArcjetGuard } from './common/guards/arcjet.guard';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { PrismaModule } from './lib/database/prisma.module';
import { AuthModule } from './lib/auth/auth.module';
import { UserModule } from './module/user/user.module';
import { HackatonModule } from './moduke/hackaton/hackaton.module';

@Module({
  imports: [ArcjetModule, PrismaModule, AuthModule, UserModule, HackatonModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ArcjetGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
