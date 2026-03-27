import { useState, useCallback, useEffect } from 'react';
import { PERIODS, Period, Task, DietItem } from '@/lib/types';
import { getTasksForDate, getMissedTasks, isTaskCompleted, getDietForDate, isDietCompleted } from '@/lib/store';
import GhostBar from '@/components/GhostBar';
import PeriodSection from '@/components/PeriodSection';
import DietSection from '@/components/DietSection';
import { motion } from 'framer-motion';
import { Flame, Dumbbell } from 'lucide-react';

function getCurrentPeriod(): Period {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  if (hour < 21) return 'evening';
  return 'night';
}
type TodayPageProps = { syncVersion: number };

export default function TodayPage({ syncVersion }: TodayPageProps) {
  const [updateKey, setUpdateKey] = useState(0);
  const [view, setView] = useState<'tasks' | 'diet'>('tasks');
  const today = new Date();
  const currentPeriod = getCurrentPeriod();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [missed, setMissed] = useState<Task[]>([]);
  const [dietItems, setDietItems] = useState<DietItem[]>([]);
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [completedDietIds, setCompletedDietIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const today = new Date();
    Promise.all([
      getTasksForDate(today),
      getMissedTasks(today),
      getDietForDate(today),
    ]).then(async ([t, m, d]) => {
      setTasks(t);
      setMissed(m);
      setDietItems(d);
      const taskChecks = await Promise.all(t.map(task => isTaskCompleted(task.id, today)));
      setCompletedTaskIds(new Set(t.filter((_, i) => taskChecks[i]).map(task => task.id)));
      const dietChecks = await Promise.all(d.map(item => isDietCompleted(item.id, today)));
      setCompletedDietIds(new Set(d.filter((_, i) => dietChecks[i]).map(item => item.id)));
    });
  }, [syncVersion, updateKey]);

  const completedCount = completedTaskIds.size;
  const totalCount = tasks.length;

  const tasksByPeriod = PERIODS.reduce((acc, p) => {
    acc[p.key] = tasks.filter(t => t.period === p.key);
    return acc;
  }, {} as Record<Period, Task[]>);

  const dietByPeriod = PERIODS.reduce((acc, p) => {
    acc[p.key] = dietItems.filter(d => d.period === p.key);
    return acc;
  }, {} as Record<Period, DietItem[]>);

  // Diet stats
  const completedDiet = dietItems.filter(d => completedDietIds.has(d.id));
  const totalCalories = dietItems.reduce((s, d) => s + d.calories, 0);
  const consumedCalories = completedDiet.reduce((s, d) => s + d.calories, 0);
  const totalProtein = dietItems.reduce((s, d) => s + d.protein, 0);
  const consumedProtein = completedDiet.reduce((s, d) => s + d.protein, 0);

  const triggerUpdate = useCallback(() => setUpdateKey(k => k + 1), []);

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
          <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-display mt-1">
            {greeting}.
          </motion.h1>
          {view === 'tasks' ? (
            <p className="text-caption mt-1">
              {totalCount > 0
                ? `You have ${totalCount - completedCount} task${totalCount - completedCount !== 1 ? 's' : ''} remaining.`
                : 'No tasks scheduled today.'}
            </p>
          ) : (
            <p className="text-caption mt-1">
              {dietItems.length > 0
                ? `${completedDiet.length}/${dietItems.length} meals tracked.`
                : 'No diet plan for today.'}
            </p>
          )}
        </div>

        {/* View toggle */}
        <div className="px-6 pb-3">
          <div className="flex gap-2 p-1 rounded-xl bg-secondary">
            <button
              onClick={() => setView('tasks')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'tasks' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Tasks
            </button>
            <button
              onClick={() => setView('diet')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                view === 'diet' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              Diet
            </button>
          </div>
        </div>

        {view === 'tasks' && totalCount > 0 && (
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
              <span className="text-[11px] text-muted-foreground tabular">{completedCount}/{totalCount} done</span>
              <span className="text-[11px] text-primary tabular font-medium">
                {Math.round((completedCount / totalCount) * 100)}%
              </span>
            </div>
          </div>
        )}

        {/* Diet Stats Bar */}
        {view === 'diet' && dietItems.length > 0 && (
          <div className="px-6 pb-4">
            <div className="flex gap-3">
              <div className="flex-1 card-surface p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Flame className="w-4 h-4 text-warning" />
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Calories</span>
                </div>
                <p className="text-[20px] font-bold tracking-tighter tabular text-foreground">
                  {consumedCalories}<span className="text-muted-foreground text-[14px]">/{totalCalories}</span>
                </p>
                <div className="h-1 rounded-full bg-secondary overflow-hidden mt-2">
                  <motion.div
                    className="h-full rounded-full bg-warning"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalCalories > 0 ? (consumedCalories / totalCalories) * 100 : 0}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[11px] text-warning tabular font-medium">
                  {totalCalories > 0 ? Math.round((consumedCalories / totalCalories) * 100) : 0}%
                </span>
              </div>
              <div className="flex-1 card-surface p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Dumbbell className="w-4 h-4 text-primary" />
                  <span className="text-[11px] text-muted-foreground uppercase tracking-wider">Protein</span>
                </div>
                <p className="text-[20px] font-bold tracking-tighter tabular text-foreground">
                  {consumedProtein}g<span className="text-muted-foreground text-[14px]">/{totalProtein}g</span>
                </p>
                <div className="h-1 rounded-full bg-secondary overflow-hidden mt-2">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: 0 }}
                    animate={{ width: `${totalProtein > 0 ? (consumedProtein / totalProtein) * 100 : 0}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <span className="text-[11px] text-primary tabular font-medium">
                  {totalProtein > 0 ? Math.round((consumedProtein / totalProtein) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ghost Bar - tasks only */}
      {view === 'tasks' && <GhostBar missedTasks={missed} />}

      {/* Task Sections */}
      {view === 'tasks' && (
        <div className="flex flex-col gap-2" key={`tasks-${updateKey}`}>
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
      )}

      {/* Diet Sections */}
      {view === 'diet' && (
        <div className="flex flex-col gap-2" key={`diet-${updateKey}`}>
          {PERIODS.map(p => (
            <DietSection
              key={p.key}
              period={p.key}
              items={dietByPeriod[p.key]}
              date={today}
              isActive={p.key === currentPeriod}
              onUpdate={triggerUpdate}
            />
          ))}
        </div>
      )}

      <div className="px-6 py-8 flex items-center gap-4">
        <div className="flex-1 h-px bg-border" />
        <span className="text-[11px] text-muted-foreground uppercase tracking-widest">End of day</span>
        <div className="flex-1 h-px bg-border" />
      </div>
    </div>
  );
}
