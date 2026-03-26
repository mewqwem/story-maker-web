import { Injectable, NotFoundException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LibraryItem } from './library/library.schema';
import { GenerateStoryDto, IGenerateStoryResponse } from './ai.dto';
import axios from 'axios';
import * as fs from 'fs-extra';
import { join } from 'path';
import { Readable } from 'stream';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private configService: ConfigService,
    @InjectModel(LibraryItem.name)
    private readonly libraryModel: Model<LibraryItem>,
  ) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('API Key is missing');
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async generateStory(dto: GenerateStoryDto): Promise<IGenerateStoryResponse> {
    const { templateId, title, language, projectName } = dto;

    const template = await this.libraryModel.findById(templateId).exec();
    if (!template) throw new NotFoundException('Template not found');

    const initialPrompt = template.content
      .replace(/{title}/gi, title)
      .replace(/{language}/gi, language)
      .replace(/{projectName}/gi, projectName);

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
    });
    const chat = model.startChat({ history: [] });

    let fullStoryText = '';
    let isFinished = false;
    let iteration = 0;

    while (!isFinished && iteration < 5) {
      iteration++;
      const message =
        iteration === 1
          ? `${initialPrompt}\n\nSYSTEM RULES:\n1. Write in parts. End part with "CONTINUE".\n2. Finish with "END".\n3. Lang: ${language}.`
          : `Great. Write NEXT part. Move plot forward. Lang: ${language}.`;

      const result = await chat.sendMessage(message);
      const rawText = result.response.text();

      const cleanChunk = rawText
        .replace(/CONTINUE/gi, '')
        .replace(/END/gi, '')
        .replace(/\*\*/g, '')
        .trim();

      if (cleanChunk) fullStoryText += cleanChunk + '\n\n';
      if (rawText.includes('END')) isFinished = true;
    }

    return {
      script: fullStoryText.trim(),
      projectName,
      success: true,
    };
  }

  async generateAudio(
    text: string,
    voiceId: string,
    projectName: string,
  ): Promise<string> {
    const apiKey = this.configService.get<string>('ELEVEN_LABS_API_KEY');
    if (!apiKey) throw new Error('11Labs API Key is missing in .env');

    const apiUrl = this.configService.get<string>('VOICE_API_URL');
    if (!apiUrl) throw new Error('VOICE_API_URL is missing in .env');

    const outputFolder = join(process.cwd(), 'output', projectName);

    await fs.ensureDir(outputFolder);
    const outputPath = join(outputFolder, 'audio.mp3');

    try {
      const createResponse = await axios.post<{ task_id: string }>(
        `${apiUrl}/tasks`,
        { text: text, template_uuid: voiceId },
        {
          headers: { 'X-API-Key': apiKey, 'Content-Type': 'application/json' },
        },
      );

      const taskId = createResponse.data.task_id;
      if (!taskId) throw new Error('11Labs Audio: No Task ID returned');

      let attempts = 0;
      const maxAttempts = 450;

      while (attempts < maxAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Явно вказуємо, що очікуємо об'єкт з status
        const statusRes = await axios.get<{ status: string }>(
          `${apiUrl}/tasks/${taskId}/status`,
          {
            headers: { 'X-API-Key': apiKey },
          },
        );

        const status = statusRes.data.status;

        if (status === 'ending' || status === 'ending_processed') {
          // Для потоку даних (stream) використовуємо тип any тільки для самого запиту, щоб не сварився
          const response = await axios<Readable>({
            method: 'GET',
            url: `${apiUrl}/tasks/${taskId}/result`,
            headers: { 'X-API-Key': apiKey },
            responseType: 'stream',
          });

          // Створюємо стрім і безпечно передаємо туди дані
          const writer = fs.createWriteStream(outputPath);
          response.data.pipe(writer);

          return new Promise((resolve, reject) => {
            writer.on('finish', () => resolve(outputPath));
            writer.on('error', reject);
          });
        }

        if (status === 'error') throw new Error('11Labs Audio Task Error');
        attempts++;
      }
      throw new Error('11Labs Audio: Generation timed out');
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error(
          '11Labs Audio Error:',
          error.response?.data || error.message,
        );
      } else {
        console.error('11Labs Audio Error:', (error as Error).message);
      }
      throw error;
    }
  }
}
