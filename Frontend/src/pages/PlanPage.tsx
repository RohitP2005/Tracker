import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeeklyTask, Task, WeeklyDietItem, PERIODS, Period, DAY_SHORT } from '@/lib/types';
import {
  getWeeklyTasks, saveWeeklyTasks, getSpecialTasks, saveSpecialTasks,
  getWeeklyDiet, saveWeeklyDiet, generateId,
} from '@/lib/store';
import { Plus, X, Calendar, Repeat, Trash2, UtensilsCrossed, Flame, Dumbbell } from 'lucide-react';

type ViewMode = 'weekly' | 'events' | 'diet';
type PlanPageProps = { syncVersion: number };

export default function PlanPage({ syncVersion }: PlanPageProps) {
  const [mode, setMode] = useState<ViewMode>('weekly');
  const [weeklyTasks, setWeeklyTasks] = useState<WeeklyTask[]>(getWeeklyTasks());
  const [specialTasks, setSpecialTasks] = useState<Task[]>(getSpecialTasks());
  const [weeklyDiet, setWeeklyDiet] = useState<WeeklyDietItem[]>(getWeeklyDiet());
  const [showAdd, setShowAdd] = useState(false);
  const [updateKey, setUpdateKey] = useState(0);

  // Form state
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newPeriod, setNewPeriod] = useState<Period>('morning');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCalories, setNewCalories] = useState('');
  const [newProtein, setNewProtein] = useState('');
  const isSpecial = mode === 'events';
  const isDiet = mode === 'diet';

  const refresh = useCallback(() => setUpdateKey(k => k + 1), []);

  // When the backend sync completes (signaled via syncVersion from App),
  // re-read the latest state from localStorage so this tab/device shows
  // the cloud data instead of the initial hardcoded defaults.
  useEffect(() => {
    setWeeklyTasks(getWeeklyTasks());
    setSpecialTasks(getSpecialTasks());
    setWeeklyDiet(getWeeklyDiet());
    refresh();
  }, [syncVersion, refresh]);

  const resetForm = () => {
    setNewName(''); setNewDuration(''); setNewPeriod('morning');
    setNewDays([1, 2, 3, 4, 5]); setNewDate(''); setNewTime('');
    setNewCalories(''); setNewProtein('');
    setShowAdd(false);
  };

  const handleAdd = () => {
    if (!newName.trim()) return;

    if (isDiet) {
      const item: WeeklyDietItem = {
        id: generateId(),
        name: newName.trim(),
        calories: newCalories ? parseInt(newCalories) : 0,
        protein: newProtein ? parseInt(newProtein) : 0,
        period: newPeriod,
        specificTime: newTime || undefined,
        days: newDays,
      };
      const updated = [...weeklyDiet, item];
      setWeeklyDiet(updated);
      saveWeeklyDiet(updated);
    } else if (isSpecial) {
      if (!newDate) return;
      const task: Task = {
        id: generateId(),
        name: newName.trim(),
        duration: newDuration ? parseInt(newDuration) : null,
        period: newPeriod,
        specificTime: newTime || undefined,
        isSpecial: true,
        specialDate: newDate,
      };
      const updated = [...specialTasks, task];
      setSpecialTasks(updated);
      saveSpecialTasks(updated);
    } else {
      const task: WeeklyTask = {
        id: generateId(),
        name: newName.trim(),
        duration: newDuration ? parseInt(newDuration) : null,
        period: newPeriod,
        specificTime: newTime || undefined,
        days: newDays,
      };
      const updated = [...weeklyTasks, task];
      setWeeklyTasks(updated);
      saveWeeklyTasks(updated);
    }

    resetForm();
    refresh();
  };

  const deleteWeekly = (id: string) => {
    const updated = weeklyTasks.filter(t => t.id !== id);
    setWeeklyTasks(updated); saveWeeklyTasks(updated);
  };
  const deleteSpecial = (id: string) => {
    const updated = specialTasks.filter(t => t.id !== id);
    setSpecialTasks(updated); saveSpecialTasks(updated);
  };
  const deleteDiet = (id: string) => {
    const updated = weeklyDiet.filter(d => d.id !== id);
    setWeeklyDiet(updated); saveWeeklyDiet(updated);
  };

  const toggleDay = (day: number) => {
    setNewDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  return (
    <div className="min-h-screen pb-28">
      <div className="safe-top px-6 pt-4 pb-3">
        <h1 className="text-display">Plan</h1>
        <p className="text-caption mt-1">Organize your rhythm, events, and diet.</p>
      </div>

      {/* Mode toggle */}
      <div className="px-6 mb-6">
        <div className="flex gap-1 p-1 rounded-xl bg-secondary">
          {([
            { key: 'weekly' as ViewMode, icon: Repeat, label: 'Weekly' },
            { key: 'events' as ViewMode, icon: Calendar, label: 'Events' },
            { key: 'diet' as ViewMode, icon: UtensilsCrossed, label: 'Diet' },
          ]).map(tab => (
            <button
              key={tab.key}
              onClick={() => setMode(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === tab.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Weekly tasks */}
      {mode === 'weekly' && (
        <div className="px-6" key={updateKey}>
          {PERIODS.map(period => {
            const periodTasks = weeklyTasks.filter(t => t.period === period.key);
            if (periodTasks.length === 0) return null;
            return (
              <div key={period.key} className="mb-6">
                <p className="text-section text-muted-foreground mb-3">{period.label}</p>
                <div className="flex flex-col gap-2">
                  {periodTasks.map(task => (
                    <motion.div key={task.id} layout className="card-surface px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-medium">{task.name}</span>
                          {task.specificTime && (
                            <span className="text-[11px] text-primary/70 bg-primary/10 rounded-full px-2 py-0.5">{task.specificTime}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {task.duration && <span className="text-caption tabular">{task.duration}m</span>}
                          <button onClick={() => deleteWeekly(task.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {DAY_SHORT.map((d, i) => (
                          <span key={d} className={`w-8 h-6 flex items-center justify-center rounded text-[11px] ${
                            task.days && task.days.includes(i) ? 'bg-primary/15 text-primary font-medium' : 'bg-secondary text-muted-foreground/40'
                          }`}>{d}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Events */}
      {mode === 'events' && (
        <div className="px-6" key={updateKey}>
          {specialTasks.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">No special events planned.<br />Tap + to add one.</div>
          ) : (
            <div className="flex flex-col gap-2">
              {specialTasks.sort((a, b) => (a.specialDate || '').localeCompare(b.specialDate || '')).map(task => (
                <motion.div key={task.id} layout className="card-surface px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-foreground text-sm font-medium">{task.name}</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-caption">
                          {task.specialDate && new Date(task.specialDate + 'T12:00:00').toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </span>
                        {task.specificTime && (
                          <span className="text-[11px] text-primary/70 bg-primary/10 rounded-full px-2 py-0.5">{task.specificTime}</span>
                        )}
                        <span className="text-[11px] text-warning bg-warning/10 rounded-full px-2 py-0.5">
                          {PERIODS.find(p => p.key === task.period)?.label.toLowerCase()}
                        </span>
                      </div>
                    </div>
                    <button onClick={() => deleteSpecial(task.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Diet plan */}
      {mode === 'diet' && (
        <div className="px-6" key={updateKey}>
          {PERIODS.map(period => {
            const items = weeklyDiet.filter(d => d.period === period.key);
            if (items.length === 0) return null;
            return (
              <div key={period.key} className="mb-6">
                <p className="text-section text-muted-foreground mb-3">{period.label}</p>
                <div className="flex flex-col gap-2">
                  {items.map(item => (
                    <motion.div key={item.id} layout className="card-surface px-4 py-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground text-sm font-medium">{item.name}</span>
                          {item.specificTime && (
                            <span className="text-[11px] text-primary/70 bg-primary/10 rounded-full px-2 py-0.5">{item.specificTime}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-0.5 text-[11px] text-warning tabular">
                            <Flame className="w-3 h-3" />{item.calories}
                          </span>
                          <span className="flex items-center gap-0.5 text-[11px] text-primary tabular">
                            <Dumbbell className="w-3 h-3" />{item.protein}g
                          </span>
                          <button onClick={() => deleteDiet(item.id)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        {DAY_SHORT.map((d, i) => (
                          <span key={d} className={`w-8 h-6 flex items-center justify-center rounded text-[11px] ${
                            item.days && item.days.includes(i) ? 'bg-primary/15 text-primary font-medium' : 'bg-secondary text-muted-foreground/40'
                          }`}>{d}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowAdd(true)}
        className="fixed bottom-32 right-6 w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shadow-lg z-50"
      >
        <Plus className="w-6 h-6 text-primary-foreground" />
      </motion.button>

      {/* Add modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-end"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              onClick={e => e.stopPropagation()}
              className="w-full card-surface rounded-t-3xl p-6 safe-bottom max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  {isDiet ? 'New Diet Item' : isSpecial ? 'New Event' : 'New Task'}
                </h2>
                <button onClick={() => setShowAdd(false)} className="p-1 text-muted-foreground"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  placeholder={isDiet ? 'Food name' : 'Task name'}
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                />

                {isDiet ? (
                  <div className="flex gap-3">
                    <input
                      type="number" placeholder="Calories" value={newCalories}
                      onChange={e => setNewCalories(e.target.value)}
                      className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                    <input
                      type="number" placeholder="Protein (g)" value={newProtein}
                      onChange={e => setNewProtein(e.target.value)}
                      className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                ) : (
                  <input
                    type="number" placeholder="Duration (min)" value={newDuration}
                    onChange={e => setNewDuration(e.target.value)}
                    className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                )}

                <div className="flex gap-3">
                  <select
                    value={newPeriod}
                    onChange={e => setNewPeriod(e.target.value as Period)}
                    className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  >
                    {PERIODS.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                  </select>
                  <input
                    type="time" placeholder="Specific time" value={newTime}
                    onChange={e => setNewTime(e.target.value)}
                    className="flex-1 bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {isSpecial ? (
                  <input
                    type="date" value={newDate} onChange={e => setNewDate(e.target.value)}
                    className="w-full bg-secondary rounded-xl px-4 py-3 text-sm text-foreground outline-none focus:ring-1 focus:ring-primary"
                  />
                ) : (
                  <div>
                    <p className="text-caption mb-2">Repeat on</p>
                    <div className="flex gap-2">
                      {DAY_SHORT.map((d, i) => (
                        <button key={d} onClick={() => toggleDay(i)} className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                          newDays.includes(i) ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground'
                        }`}>{d}</button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleAdd}
                  className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 text-sm font-semibold mt-2 active:scale-[0.98] transition-transform"
                >
                  Add {isDiet ? 'Diet Item' : isSpecial ? 'Event' : 'Task'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
