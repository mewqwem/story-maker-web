export interface IGeneratePayload {
  projectName: string;
  title: string;
  templateId: string;
  language: string;
}

export interface IGenerateResponse {
  script: string;
  projectName: string;
  success: boolean;
}
