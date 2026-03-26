import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LibraryModule } from './library/library.module';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    // 1. Завантажуємо конфіг [cite: 2026-01-12]
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Підключаємося до бази через змінну MONGO_URI [cite: 2026-03-26]
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),

    LibraryModule,
  ],
  controllers: [AiController],
  providers: [AiService],
})
export class AppModule {}
