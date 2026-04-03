import { get, set, clear } from 'idb-keyval';

export type ImageGenerationStatus = 'waiting' | 'generating' | 'done' | 'error';

export interface ImageTask {
  id: string;
  promptId: string;
  title: string;
  prompt: string;
  status: ImageGenerationStatus;
  blobUrl?: string; // Тимчасове посилання
  imageBase64?: string; // Збережений Base64
  errorMessage?: string;
  isRestored?: boolean; // Показує, що картка завантажена з бази
}

const STORAGE_KEY = 'story-maker-image-tasks';

// Зберігає весь масив задач в базу даних
export async function saveImageTasks(tasks: ImageTask[]): Promise<void> {
  try {
    // Зберігаємо Base64 замість Blob URL, щоб мати можливість відновити картинку після перезавантаження вкладки
    // При цьому під час виконання використовуємо Blob URL для швидкого рендеру
    await set(STORAGE_KEY, tasks);
  } catch (error) {
    console.error('Failed to save to IndexedDB', error);
  }
}

// Завантажує задачі з бази даних при старті
export async function loadImageTasks(): Promise<ImageTask[]> {
  try {
    const data = await get<ImageTask[]>(STORAGE_KEY);
    if (!data) return [];
    
    // Перетворюємо Base64 назад у BlobUrl, якщо є
    return data.map(task => {
      let blobUrl = task.blobUrl;
      if (task.imageBase64 && (!blobUrl || blobUrl.startsWith('data:'))) {
         // Щоб не витрачати ресурси на конвертацію Data URL у Blob кожного разу (або можна залишати base64)
         // Для простоти ми будемо використовувати Base64 як src в img, або конвертувати в blob.
         // Залишаємо Base64.
         task.isRestored = true;
      }
      return task;
    });
  } catch (error) {
    console.error('Failed to load from IndexedDB', error);
    return [];
  }
}

// Очищує всю історію (наприклад, перед новою генерацією)
export async function clearImageTasks(): Promise<void> {
  try {
    await clear();
  } catch (error) {
    console.error('Failed to clear IndexedDB', error);
  }
}
