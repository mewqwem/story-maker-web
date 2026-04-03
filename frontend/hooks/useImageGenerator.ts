import { useState, useEffect, useCallback, useRef } from 'react';
import { ImageTask, loadImageTasks, saveImageTasks, clearImageTasks } from '../lib/imageStorage';

export function useImageGenerator() {
  const [tasks, setTasks] = useState<ImageTask[]>([]);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  
  // Ref для уникнення race conditions при збереженні
  const tasksRef = useRef<ImageTask[]>(tasks);
  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  // Завантаження з бази при старті
  useEffect(() => {
    const init = async () => {
      const savedTasks = await loadImageTasks();
      if (savedTasks.length > 0) {
        setTasks(savedTasks);
        // Якщо були незавершені, вони стануть "waiting"
        const restoredTasks = savedTasks.map(t => 
          t.status === 'generating' ? { ...t, status: 'waiting' as const } : t
        );
        setTasks(restoredTasks);
      }
    };
    init();
  }, []);

  // Збереження в базу при кожній зміні стану
  useEffect(() => {
    if (tasks.length > 0) {
      saveImageTasks(tasks);
    }
  }, [tasks]);

  // Запобігання закриттю сторінки під час генерації
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessingQueue || isGeneratingPrompts) {
        e.preventDefault();
        e.returnValue = ''; // Required for some browsers
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isProcessingQueue, isGeneratingPrompts]);

  const generatePrompts = async (idea: string, promptsCount: number, photosPerPrompt: number) => {
    setIsGeneratingPrompts(true);
    await clearImageTasks(); // Очищуємо стару базу
    setTasks([]);
    
    try {
      const res = await fetch('/api/generate-prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea, count: promptsCount })
      });
      
      if (!res.ok) throw new Error('Failed to generate prompts');
      
      const data = await res.json();
      const newTasks: ImageTask[] = [];
      
      data.forEach((item: any, promptIndex: number) => {
        const promptId = `prompt-${Date.now()}-${promptIndex}`;
        for (let i = 0; i < photosPerPrompt; i++) {
          newTasks.push({
            id: `task-${promptId}-${i}`,
            promptId: promptId,
            title: `${item.title} (${i + 1}/${photosPerPrompt})`,
            prompt: item.prompt,
            status: 'waiting'
          });
        }
      });
      
      setTasks(newTasks);
    } catch (err) {
      console.error(err);
      alert('Error generating prompts. Check console.');
    } finally {
      setIsGeneratingPrompts(false);
    }
  };

  // Процес черги
  const processNextInQueue = useCallback(async () => {
    const currentTasks = tasksRef.current;
    const nextTask = currentTasks.find(t => t.status === 'waiting');
    
    if (!nextTask) {
      setIsProcessingQueue(false);
      return; // Черга пуста або завершена
    }
    
    setIsProcessingQueue(true);
    
    // Знаходимо всі задачі з тим самим promptId, які ще чекають
    const batchTasks = currentTasks.filter(t => t.status === 'waiting' && t.promptId === nextTask.promptId);
    const batchIds = batchTasks.map(t => t.id);
    
    // Оновлюємо їх статус на "generating"
    setTasks(prev => prev.map(t => batchIds.includes(t.id) ? { ...t, status: 'generating' } : t));
    
    try {
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: nextTask.prompt, numberOfImages: batchTasks.length })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate');
      }
      
      const base64Images: string[] = data.imagesBase64;
      
      // Оновлюємо статус на "done" і проставляємо кожній задачі відповідну фотографію
      setTasks(prev => prev.map(t => {
        const batchIndex = batchIds.indexOf(t.id);
        if (batchIndex !== -1 && base64Images[batchIndex]) {
          const base64Str = base64Images[batchIndex];
          const dataUrl = `data:image/jpeg;base64,${base64Str}`;
          return { 
            ...t, 
            status: 'done', 
            blobUrl: dataUrl,
            imageBase64: base64Str 
          };
        }
        return t;
      }));
      
    } catch (err: any) {
      console.error('Task error:', err);
      setTasks(prev => prev.map(t => 
        batchIds.includes(t.id) ? { 
          ...t, 
          status: 'error', 
          errorMessage: err.message || 'Unknown error'
        } : t
      ));
    }
    
    // Рекурсивно переходимо до наступного (або таймер, щоб не заблокувати call stack)
    setTimeout(() => {
      processNextInQueue();
    }, 500); // 500ms пауза між запитами, щоб не вбити rate limits
    
  }, []);

  // Якщо з'явилися 'waiting' і ми не процесимо - запускаємо
  useEffect(() => {
    if (tasks.some(t => t.status === 'waiting') && !isProcessingQueue && !isGeneratingPrompts) {
      processNextInQueue();
    }
  }, [tasks, isProcessingQueue, isGeneratingPrompts, processNextInQueue]);

  const updateTaskStatus = (id: string, status: ImageTask['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  };

  const regenerateTask = (id: string) => {
    updateTaskStatus(id, 'waiting');
    // useEffect автоматично підхопить 'waiting' і запустить чергу
  };

  const clearAll = async () => {
    await clearImageTasks();
    setTasks([]);
  };

  const progress = tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  return {
    tasks,
    isGeneratingPrompts,
    isProcessingQueue,
    progress,
    doneCount,
    generatePrompts,
    regenerateTask,
    clearAll
  };
}
