import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({disableErrorMessages: false}))
  // app.useGlobalGuards(new JwtAuthGuard)
  await app.listen(3000);
}
bootstrap();
