import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.APP_PORT ?? '3000', 10),
  url: process.env.APP_URL ?? 'http://localhost:3000',
  frontendUrl: process.env.FRONTEND_URL ?? 'http://localhost:4200',
  apiPrefix: process.env.API_PREFIX ?? 'api/v1',
  uploadDir: process.env.UPLOAD_DIR ?? 'uploads',
  maxFileSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB ?? '5', 10),
  jwtSecret: process.env.JWT_SECRET ?? 'change_me_nexalab_jwt_secret_min_32_chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  adminEmail: process.env.ADMIN_EMAIL ?? 'admin@nexalab.local',
  adminPassword: process.env.ADMIN_PASSWORD ?? 'ChangeMeAdmin123!',
  adminName: process.env.ADMIN_NAME ?? 'Administrador NEXALAB',
  throttleTtlMs: parseInt(process.env.THROTTLE_TTL_MS ?? '60000', 10),
  throttleLimit: parseInt(process.env.THROTTLE_LIMIT ?? '100', 10),
}));
