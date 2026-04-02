// backend/src/library/library.schema.ts [cite: 2026-03-26]
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class LibraryItem extends Document {
  @Prop({ required: true })
  name: string; // Назва шаблону або ім'я голосу

  @Prop({ required: true })
  content: string; // Текст промпту АБО Voice ID

  // Додаємо 'voice' у список дозволених типів
  @Prop({ required: true, enum: ['story', 'seo', 'image', 'voice'] })
  type: string;

  // Додаткові поля, специфічні для голосу
  @Prop({ required: false, enum: ['11labs', 'genai', 'piper', 'edge'] })
  service?: string;

  @Prop({ required: false })
  language?: string; // Наприклад: "uk", "en"

  @Prop({ required: true, index: true })
  userId: string;
}

export const LibrarySchema = SchemaFactory.createForClass(LibraryItem);
