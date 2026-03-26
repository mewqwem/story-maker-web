// backend/src/main.ts [cite: 2026-03-26]
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Дозволяємо фронтенду стукатися до нас [cite: 2026-03-26]
  app.enableCors();

  // Cloud Run вимагає порт із змінної оточення [cite: 2026-03-26]
  const port = process.env.PORT || 8080;

  // Важливо слухати '0.0.0.0' для доступу ззовні [cite: 2026-03-26]
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: http://0.0.0.0:${port}`);
}
bootstrap();
