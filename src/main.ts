/* NestJS */
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';

/* Node */
import { join } from 'path';

/* Express */
// import * as exphbs from 'express-handlebars';

/* App */
import { AppModule } from './app.module';


const PUBLIC_PATH = join(__dirname, '..', 'public');
const VIEWS_PATH = join(__dirname, '..', 'src/views');

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);

    app.use((req, res, next) => {
        res.set('X-Powered-By', 'Lots and Lots of Coffee');
        next();
    });


    // app.engine('hbs', hbs.engine);
    // app.setViewEngine('hbs');

    app.enableCors({
        origin: '*',
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        allowedHeaders: 'Content-Type, Authorization',
    });

    /* Swagger Init */
    const config = new DocumentBuilder()
        .setTitle('The Theatre')
        .setDescription('The Theatre API')
        .setVersion('2.0.0')
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    await app.listen(process.env.PORT);
}

bootstrap();