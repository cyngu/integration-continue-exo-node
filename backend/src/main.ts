import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.enableCors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 204
    });

    //TODO env var for port
    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();