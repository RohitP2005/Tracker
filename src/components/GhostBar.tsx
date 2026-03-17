import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '@/lib/types';
import { ChevronUp, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface GhostBarProps {
  missedTasks: Task[];
}

export default function GhostBar({ missedTasks }: GhostBarProps) {
  const [minimized, setMinimized] = useState(false);

  if (missedTasks.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        layout
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
        className="mx-6 mb-4"
      >
        {minimized ? (
          <motion.button
            layout
            onClick={() => setMinimized(false)}
            className="ghost-bar flex items-center gap-2 text-warning text-sm"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span className="tabular">{missedTasks.length}</span>
          </motion.button>
        ) : (
          <motion.div layout className="ghost-bar">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-warning" />
                <span className="text-sm text-warning">
                  {missedTasks.length} task{missedTasks.length !== 1 ? 's' : ''} missed yesterday
                </span>
              </div>
              <button onClick={() => setMinimized(true)} className="p-1">
                <ChevronUp className="w-4 h-4 text-warning/60" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {missedTasks.map(t => (
                <span key={t.id} className="text-xs text-warning/70 bg-warning/5 rounded-full px-2.5 py-0.5">
                  {t.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
