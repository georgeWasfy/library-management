import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { VersioningType } from '@nestjs/common';
import { AcessTokenGuard } from './guards/access-token-protected-guard';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI });
  const reflector = new Reflector();
  app.useGlobalGuards(new AcessTokenGuard(reflector));
  app.use(cookieParser());
  await app.listen(3000);
}
bootstrap();
