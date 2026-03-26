import { Controller, Post, Body, Res } from '@nestjs/common';
import type { Response } from 'express'; // Додано слово 'type'
import { AiService } from './ai.service';
import { GenerateStoryDto } from './ai.dto';
import * as fs from 'fs-extra';
import * as path from 'path';
import archiver from 'archiver'; // Прибрано '* as'

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-story')
  async generate(@Body() dto: GenerateStoryDto) {
    return this.aiService.generateStory(dto);
  }

  // Ендпоінт для створення архіву
  @Post('generate-audio-archive')
  async generateAudioArchive(
    @Body() body: { text: string; voiceId: string; projectName: string },
    @Res() res: Response,
  ): Promise<void> {
    // 1. Генеруємо аудіо
    const audioPath = await this.aiService.generateAudio(
      body.text,
      body.voiceId,
      body.projectName,
    );
    const folderPath = path.dirname(audioPath);

    // 2. Зберігаємо текст поруч з аудіо
    const textPath = path.join(folderPath, 'script.txt');
    await fs.writeFile(textPath, body.text, 'utf8');

    // 3. Налаштовуємо відповідь, щоб віддати ZIP-файл
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${body.projectName}.zip"`,
    });

    // 4. Пакуємо файли і відправляємо на клієнт
    const archive = archiver('zip', { zlib: { level: 9 } });

    // Перехоплюємо можливі помилки архіватора
    archive.on('error', (err) => {
      throw err;
    });

    archive.pipe(res);
    archive.append(fs.createReadStream(audioPath), { name: 'audio.mp3' });
    archive.append(fs.createReadStream(textPath), { name: 'script.txt' });

    await archive.finalize();
  }
}
