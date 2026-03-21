import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';
import { ZodValidationPipe } from 'nestjs-zod';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(Logger);
  app.useLogger(logger);
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Trucking App API')
    .setDescription('The trucking application API description')
    .setVersion('1.0')
    .addTag('users')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Save OpenAPI schema on startup in development
  if (process.env.NODE_ENV !== 'production') {
    const rootDir = process.cwd();
    const outputPath = path.resolve(rootDir, '../schema/openapi.json');
    const outputDir = path.dirname(outputPath);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(document, null, 2));
    logger.log(`✓ OpenAPI schema saved to: ${outputPath}`);
  }

  const port = process.env.PORT || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📝 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();
