// DTO for the incoming request [cite: 2026-03-26]
export class GenerateStoryDto {
  readonly templateId: string;
  readonly title: string;
  readonly language: string;
  readonly projectName: string;
}

// Interface for the AI response to avoid 'any' [cite: 2026-01-12]
export interface IGenerateStoryResponse {
  script: string;
  projectName: string;
  success: boolean;
}
