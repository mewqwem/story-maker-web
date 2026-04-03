import { useState, useEffect, useCallback } from 'react';
import { get, set, clear } from 'idb-keyval';

export type DetailedImageStatus = 'idle' | 'generating' | 'done' | 'error';

export interface DetailedImageTask {
  id: string;
  prompt: string;
  status: DetailedImageStatus;
  blobUrl?: string;
  imageBase64?: string;
  errorMessage?: string;
  isRestored?: boolean;
}

const STORAGE_KEY = 'story-maker-detailed-image-tasks';

export function useDetailedImageGenerator() {
  const [tasks, setTasks] = useState<DetailedImageTask[]>([]);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [resolution, setResolution] = useState('1k');

  // Load from IndexedDB on start
  useEffect(() => {
    const init = async () => {
      try {
        const savedData = await get<{
            tasks: DetailedImageTask[], 
            aspectRatio: string, 
            resolution: string
        }>(STORAGE_KEY);
        
        if (savedData && savedData.tasks && savedData.tasks.length > 0) {
          const restoredTasks = savedData.tasks.map(t => {
             const newTask = { ...t };
             if (t.status === 'generating') newTask.status = 'idle'; // reset generating state
             if (t.imageBase64 && !t.blobUrl) {
                 newTask.blobUrl = `data:image/jpeg;base64,${t.imageBase64}`;
                 newTask.isRestored = true;
             }
             return newTask;
          });
          setTasks(restoredTasks);
          if (savedData.aspectRatio) setAspectRatio(savedData.aspectRatio);
          if (savedData.resolution) setResolution(savedData.resolution);
        } else {
            // Default 1 empty task
            setTasks([{ id: `task-${Date.now()}`, prompt: '', status: 'idle' }]);
        }
      } catch (err) {
        console.error("Failed to load detailed tasks", err);
        setTasks([{ id: `task-${Date.now()}`, prompt: '', status: 'idle' }]);
      }
    };
    init();
  }, []);

  // Save to IndexedDB
  useEffect(() => {
    if (tasks.length > 0) {
      set(STORAGE_KEY, { tasks, aspectRatio, resolution }).catch(err => console.error(err));
    }
  }, [tasks, aspectRatio, resolution]);

  const addTask = () => {
    if (tasks.length >= 20) return;
    setTasks(prev => [...prev, { id: `task-${Date.now()}`, prompt: '', status: 'idle' }]);
  };

  const removeTask = (id: string) => {
    if (tasks.length <= 1) return;
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateTaskPrompt = (id: string, prompt: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, prompt } : t));
  };

  const generateSingleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task || !task.prompt.trim()) return;

    // Set generating status
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'generating', errorMessage: undefined } : t));

    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            prompt: task.prompt, 
            numberOfImages: 1,
            aspectRatio,
            resolution
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }

      const base64Str = data.imagesBase64[0];
      const dataUrl = `data:image/jpeg;base64,${base64Str}`;

      setTasks(prev => prev.map(t => t.id === id ? { 
          ...t, 
          status: 'done', 
          blobUrl: dataUrl,
          imageBase64: base64Str 
      } : t));

    } catch (err: any) {
      setTasks(prev => prev.map(t => t.id === id ? { 
          ...t, 
          status: 'error', 
          errorMessage: err.message || 'Unknown error' 
      } : t));
    }
  };

  const clearAll = async () => {
    await clear();
    setTasks([{ id: `task-${Date.now()}`, prompt: '', status: 'idle' }]);
  };

  return {
    tasks,
    aspectRatio,
    resolution,
    setAspectRatio,
    setResolution,
    addTask,
    removeTask,
    updateTaskPrompt,
    generateSingleTask,
    clearAll
  };
}
