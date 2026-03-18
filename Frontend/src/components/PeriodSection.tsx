import { motion } from 'framer-motion';
import { Task, PERIODS, Period } from '@/lib/types';
import TaskCard from './TaskCard';
import { isTaskCompleted, toggleTaskCompletion } from '@/lib/store';
import { useState } from 'react';

interface PeriodSectionProps {
  period: Period;
  tasks: Task[];
  date: Date;
  isActive: boolean;
  onUpdate: () => void;
}

export default function PeriodSection({ period, tasks, date, isActive, onUpdate }: PeriodSectionProps) {
  const [collapsed, setCollapsed] = useState(!isActive);
  const periodInfo = PERIODS.find(p => p.key === period)!;
  const completedCount = tasks.filter(t => isTaskCompleted(t.id, date)).length;

  if (tasks.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-6">
      <button onClick={() => setCollapsed(!collapsed)} className="w-full flex items-center justify-between py-3">
        <div className="flex items-center gap-3">
          <span className={`text-section ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
            {periodInfo.label}
          </span>
          <span className="text-caption tabular">{completedCount}/{tasks.length}</span>
        </div>
        <span className="text-[12px] text-muted-foreground tabular">{periodInfo.timeRange}</span>
      </button>

      {!collapsed && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: [0.2, 0, 0, 1] }}
          className="flex flex-col gap-2 pb-4"
        >
          {tasks.map((task, i) => (
            <motion.div key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <TaskCard
                task={task}
                completed={isTaskCompleted(task.id, date)}
                onToggle={() => { toggleTaskCompletion(task.id, date); onUpdate(); }}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
