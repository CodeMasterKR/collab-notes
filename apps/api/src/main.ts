import 'dotenv/config'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { ValidationPipe } from '@nestjs/common'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
  app.enableCors({
    origin: process.env.WEB_URL || 'http://localhost:5173',
    credentials: true,
  })

  const config = new DocumentBuilder()
    .setTitle('Collab Notes API')
    .setDescription('Real-time collaborative notes')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  await app.listen(process.env.PORT ?? 3001)
  console.log(`API: http://localhost:${process.env.PORT ?? 3001}`)
  console.log(`Swagger: http://localhost:${process.env.PORT ?? 3001}/api/docs`)
}

bootstrap()