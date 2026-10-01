import { BadRequestException, Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const uploadDir = join(
          process.cwd(),
          config.get<string>('app.uploadDir', 'uploads'),
        );
        if (!existsSync(uploadDir)) {
          mkdirSync(uploadDir, { recursive: true });
        }

        const maxMb = config.get<number>('app.maxFileSizeMb', 5);

        return {
          storage: diskStorage({
            destination: (_req, _file, cb) => cb(null, uploadDir),
            filename: (_req, file, cb) => {
              const extension = extname(file.originalname).toLowerCase() || '.jpg';
              cb(null, `${Date.now()}-${randomUUID()}${extension}`);
            },
          }),
          limits: {
            fileSize: maxMb * 1024 * 1024,
          },
          fileFilter: (
            _req: Express.Request,
            file: Express.Multer.File,
            cb: (error: Error | null, acceptFile: boolean) => void,
          ) => {
            if (!ALLOWED_MIME.has(file.mimetype)) {
              cb(
                new BadRequestException(
                  'Solo se permiten imágenes JPG, PNG, WEBP o GIF',
                ) as unknown as Error,
                false,
              );
              return;
            }
            cb(null, true);
          },
        };
      },
    }),
  ],
  controllers: [UploadsController],
  providers: [UploadsService],
  exports: [UploadsService],
})
export class UploadsModule {}
