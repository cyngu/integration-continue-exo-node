import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { readFileSync } from 'fs';
import * as yaml from 'js-yaml';
import * as swaggerUi from 'swagger-ui-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });

  // Read the YAML file
  const swaggerDocument = yaml.load(
    readFileSync(join(__dirname, '../swagger.yaml'), 'utf8'),
  );

  // Configure Swagger UI
  const CSS_URL =
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.1.0/swagger-ui.min.css';
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, { customCssUrl: CSS_URL }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
