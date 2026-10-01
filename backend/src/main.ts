import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);

  const uploadDir = join(
    process.cwd(),
    config.get<string>('app.uploadDir', 'uploads'),
  );
  if (!existsSync(uploadDir)) {
    mkdirSync(uploadDir, { recursive: true });
  }

  app.useStaticAssets(uploadDir, {
    prefix: '/uploads/',
  });

  const apiPrefix = config.get<string>('app.apiPrefix', 'api/v1');
  app.setGlobalPrefix(apiPrefix);

  app.enableCors({
    origin: config.get<string>('app.frontendUrl', 'http://localhost:4200'),
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = config.get<number>('app.port', 3000);
  await app.listen(port);

  console.log(`NEXALAB API running on http://localhost:${port}/${apiPrefix}`);
  console.log(`Uploads served at http://localhost:${port}/uploads/`);
}

void bootstrap();
