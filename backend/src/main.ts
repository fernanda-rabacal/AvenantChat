import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConflictInterceptor } from './common/errors/interceptors/conflict.interceptor';
import { DatabaseInterceptor } from './common/errors/interceptors/database.interceptor';
import { UnauthorizedInterceptor } from './common/errors/interceptors/unauthorized.interceptor';
import { NotFoundInterceptor } from './common/errors/interceptors/not-found.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('Simple blog')
    .setDescription('Simple blog API description')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ConflictInterceptor(),
    new DatabaseInterceptor(),
    new UnauthorizedInterceptor(),
    new NotFoundInterceptor(),
  );

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
