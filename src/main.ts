import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import env from './env';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Pizza Example')
    .setDescription('An example application about ordering pizza')
    .setVersion('1.0')
    .addTag('Pizza')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Pizza API Documentation',
  });

  await app.listen(env.PORT);
}
bootstrap();
