import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConflictInterceptor } from './src/common/errors/interceptors/conflict.interceptor';
import { DatabaseInterceptor } from './src/common/errors/interceptors/database.interceptor';
import { UnauthorizedInterceptor } from './src/common/errors/interceptors/unauthorized.interceptor';
import { NotFoundInterceptor } from './src/common/errors/interceptors/not-found.interceptor';
import { ConfigService } from '@nestjs/config';
import { SocketIOAdapter } from 'src/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });
  const config = new DocumentBuilder()
    .setTitle('Simple blog')
    .setDescription('Simple blog API description')
    .setVersion('1.0')
    .build();

  const configService = app.get(ConfigService);
  const clientPort = parseInt(configService.get('CLIENT_PORT'));
  const clientURL = configService.get('CLIENT_URL');

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  app.useGlobalInterceptors(
    new ConflictInterceptor(),
    new DatabaseInterceptor(),
    new UnauthorizedInterceptor(),
    new NotFoundInterceptor(),
  );

  app.enableCors({
    origin: [
      `http://localhost:${clientPort}`,
      `http://localhost:${clientPort + 1}`,
      `http://localhost:${clientPort + 2}`,
      `http://localhost:${clientPort + 3}`,
      clientURL,
      new RegExp(`/^http:\/\/192\.168\.1\.([1-9]|[1-9]\d):${clientPort}$/`),
    ],
  });
  app.useWebSocketAdapter(new SocketIOAdapter(app, configService));

  await app.listen(process.env.PORT || 8080, '0.0.0.0');
}
bootstrap();
