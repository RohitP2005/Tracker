import { motion } from 'framer-motion';
import { Task } from '@/lib/types';
import { Check, Clock } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  completed: boolean;
  onToggle: () => void;
}

export default function TaskCard({ task, completed, onToggle }: TaskCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      className="w-full flex items-center gap-4 py-4 px-5 card-surface transition-colors duration-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
    >
      {/* Checkbox */}
      <div
        className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          completed
            ? 'bg-primary border-primary'
            : 'border-muted-foreground/30'
        }`}
      >
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </motion.div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 text-left">
        <span
          className={`text-body transition-all duration-200 ${
            completed ? 'text-muted-foreground line-through' : 'text-foreground'
          }`}
        >
          {task.name}
        </span>
      </div>

      {/* Specific time */}
      {task.specificTime && (
        <span className="flex items-center gap-1 text-[11px] text-primary/70 bg-primary/10 rounded-full px-2 py-0.5 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {task.specificTime}
        </span>
      )}

      {/* Duration */}
      {task.duration && (
        <span className="text-caption tabular flex-shrink-0">
          {task.duration}m
        </span>
      )}

      {/* Special badge */}
      {task.isSpecial && (
        <span className="text-[11px] text-warning bg-warning/10 rounded-full px-2 py-0.5 flex-shrink-0">
          event
        </span>
      )}
    </motion.button>
  );
}
