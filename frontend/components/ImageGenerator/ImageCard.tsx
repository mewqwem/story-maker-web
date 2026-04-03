import React from 'react';
import { motion } from 'framer-motion';
import { ImageTask } from '../../lib/imageStorage';
import styles from './ImageGenerator.module.css';

interface ImageCardProps {
  task: ImageTask;
  onRegenerate: (id: string) => void;
  onClick: (task: ImageTask) => void;
}

export const ImageCard: React.FC<ImageCardProps> = ({ task, onRegenerate, onClick }) => {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={task.status === 'done' ? { scale: 1.02 } : {}}
      onClick={() => task.status === 'done' && onClick(task)}
      style={{ cursor: task.status === 'done' ? 'pointer' : 'default' }}
    >
      {task.isRestored && task.status === 'done' && (
        <div className={styles.restoredIcon} title="Restored from storage">
          💾
        </div>
      )}

      {task.status === 'waiting' && (
        <div className={styles.cardSkeleton}>
          <span>Waiting in queue...</span>
        </div>
      )}

      {task.status === 'generating' && (
        <div className={styles.cardSkeleton}>
          <span>Generating...</span>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            style={{ marginTop: '1rem', fontSize: '1.5rem' }}
          >
            ⏳
          </motion.div>
        </div>
      )}

      {task.status === 'error' && (
        <div className={styles.errorState}>
          <span>Error</span>
          <p style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>{task.errorMessage}</p>
          <button 
            className={styles.errorBtn}
            onClick={(e) => {
              e.stopPropagation();
              onRegenerate(task.id);
            }}
          >
            Regenerate
          </button>
        </div>
      )}

      {task.status === 'done' && task.blobUrl && (
        <>
          <img src={task.blobUrl} alt={task.title} className={styles.cardImage} loading="lazy" />
          <div className={styles.cardOverlay}>
            <span className={styles.cardTitle}>{task.title}</span>
            <span className={styles.cardBadge}>Done</span>
          </div>
        </>
      )}
    </motion.div>
  );
};
