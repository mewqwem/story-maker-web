export class CreateLibraryItemDto {
  readonly name: string;
  readonly content: string;
  readonly type: 'story' | 'seo' | 'image' | 'voice';
  readonly service?: string;
  readonly language?: string;
}

export class UpdateLibraryItemDto {
  readonly name?: string;
  readonly content?: string;
  readonly type?: 'story' | 'seo' | 'image' | 'voice';
  readonly service?: string;
  readonly language?: string;
}
