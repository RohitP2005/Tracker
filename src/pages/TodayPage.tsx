import { useState, useCallback, useEffect } from 'react';
import { PERIODS, Period, Task } from '@/lib/types';
import { getTasksForDate, getMissedTasks, isTaskCompleted } from '@/lib/store';
import GhostBar from '@/components/GhostBar';
import PeriodSection from '@/components/PeriodSection';
import { motion } from 'framer-motion';

function getCurrentPeriod(): Period {
  const hour = new Date().getHours();
  if (hour < 9) return 'morning';
  if (hour < 12) return 'post-morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}

export default function TodayPage() {
  const [updateKey, setUpdateKey] = useState(0);
  const today = new Date();
  const tasks = getTasksForDate(today);
  const missed = getMissedTasks(today);
  const currentPeriod = getCurrentPeriod();

  const completedCount = tasks.filter(t => isTaskCompleted(t.id, today)).length;
  const totalCount = tasks.length;

  const tasksByPeriod = PERIODS.reduce((acc, p) => {
    acc[p.key] = tasks.filter(t => t.period === p.key);
    return acc;
  }, {} as Record<Period, Task[]>);

  const triggerUpdate = useCallback(() => setUpdateKey(k => k + 1), []);

  // Greeting based on time
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="min-h-screen pb-28">
      {/* Header */}
      <div className="safe-top sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
        <div className="px-6 pt-4 pb-3">
          <p className="text-caption">
            {today.toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-display mt-1"
          >
            {greeting}.
          </motion.h1>
          <p className="text-caption mt-1">
            {totalCount > 0
              ? `You have ${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} remaining.`
              : 'No tasks scheduled today.'}
          </p>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="px-6 pb-4">
            <div className="h-1 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-[11px] text-muted-foreground tabular">
                {completedCount}/{totalCount} done
              </span>
              <span className="text-[11px] text-primary tabular font-medium">
                {totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Ghost Bar */}
      <GhostBar missedTasks={missed} />

      {/* Period Sections */}
      <div className="flex flex-col gap-2" key={updateKey}>
        {PERIODS.map(p => (
          <PeriodSection
            key={p.key}
            period={p.key}
            tasks={tasksByPeriod[p.key]}
            date={today}
            isActive={p.key === currentPeriod}
            onUpdate={triggerUpdate}
          />
        ))}
      </div>

      {/* End of day marker */}
      <div className="px-6 py-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground uppercase tracking-widest">End of day</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
}
