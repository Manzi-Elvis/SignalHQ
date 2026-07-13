import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Browsers enforce CORS, command-line tools (curl, Postman) don't -- that's
  // why this gap never surfaced during any of our backend-only testing.
  // Scoped to the frontend's actual origin rather than a wildcard, since
  // we'll be sending an Authorization header (wildcards + credentials don't
  // mix well in the CORS spec anyway).
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:5173',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();