import { motion } from 'framer-motion';
import { DietItem } from '@/lib/types';
import { Check, Clock, Flame, Dumbbell } from 'lucide-react';

interface DietCardProps {
  item: DietItem;
  completed: boolean;
  onToggle: () => void;
}

export default function DietCard({ item, completed, onToggle }: DietCardProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onToggle}
      className="w-full flex items-center gap-4 py-4 px-5 card-surface transition-colors duration-200"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
    >
      <div
        className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
          completed ? 'bg-primary border-primary' : 'border-muted-foreground/30'
        }`}
      >
        {completed && (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <Check className="w-3.5 h-3.5 text-primary-foreground" />
          </motion.div>
        )}
      </div>

      <div className="flex-1 text-left">
        <span className={`text-body transition-all duration-200 ${completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
          {item.name}
        </span>
      </div>

      {item.specificTime && (
        <span className="flex items-center gap-1 text-[11px] text-primary/70 bg-primary/10 rounded-full px-2 py-0.5 flex-shrink-0">
          <Clock className="w-3 h-3" />
          {item.specificTime}
        </span>
      )}

      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="flex items-center gap-0.5 text-[11px] text-warning tabular">
          <Flame className="w-3 h-3" />
          {item.calories}
        </span>
        <span className="flex items-center gap-0.5 text-[11px] text-primary tabular">
          <Dumbbell className="w-3 h-3" />
          {item.protein}g
        </span>
      </div>
    </motion.button>
  );
}
