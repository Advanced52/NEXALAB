import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = join(
      process.cwd(),
      this.configService.get<string>('app.uploadDir', 'uploads'),
    );
    this.appUrl = this.configService.get<string>(
      'app.url',
      'http://localhost:3000',
    );

    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getUploadDir() {
    return this.uploadDir;
  }

  getMaxFileSizeBytes() {
    const mb = this.configService.get<number>('app.maxFileSizeMb', 5);
    return mb * 1024 * 1024;
  }

  buildPublicUrl(filename: string) {
    return `${this.appUrl.replace(/\/$/, '')}/uploads/${filename}`;
  }

  createFilename(originalName: string) {
    const extension = extname(originalName).toLowerCase() || '.jpg';
    return `${Date.now()}-${randomUUID()}${extension}`;
  }
}
