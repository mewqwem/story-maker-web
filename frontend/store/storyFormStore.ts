import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IGeneratePayload } from '@/type/generate';

interface StoryFormState {
  formData: IGeneratePayload;
  setFormData: (data: IGeneratePayload) => void;
  selectedVoiceId: string;
  setSelectedVoiceId: (id: string) => void;
}

export const useStoryFormStore = create<StoryFormState>()(
  persist(
    (set) => ({
      formData: {
        projectName: '',
        title: '',
        templateId: '',
        language: 'English',
      },
      setFormData: (data) => set({ formData: data }),
      selectedVoiceId: '',
      setSelectedVoiceId: (id) => set({ selectedVoiceId: id }),
    }),
    {
      name: 'story-form-storage', // name of the item in the storage (must be unique)
    }
  )
);
