import { WeeklyTask, CompletionRecord, Task, Period, DietItem, WeeklyDietItem, DietCompletionRecord } from './types';

const STORAGE_KEYS = {
  weeklyTasks: 'rhythm-weekly-tasks',
  specialTasks: 'rhythm-special-tasks',
  completions: 'rhythm-completions',
  weeklyDiet: 'rhythm-weekly-diet',
  specialDiet: 'rhythm-special-diet',
  dietCompletions: 'rhythm-diet-completions',
};

const DEFAULT_WEEKLY_TASKS: WeeklyTask[] = [
  { id: '1', name: 'Cleanser', duration: 2, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '2', name: 'Serum', duration: 1, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '3', name: 'Sunscreen', duration: 1, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '4', name: 'Moisturizer', duration: 1, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '5', name: 'Guitar Practice', duration: 30, period: 'morning', specificTime: '10:00', days: [1,3,5] },
  { id: '6', name: 'Read 20 pages', duration: 25, period: 'afternoon', days: [0,1,2,3,4,5,6] },
  { id: '7', name: 'Workout', duration: 45, period: 'afternoon', specificTime: '15:00', days: [1,2,4,5] },
  { id: '8', name: 'Journal', duration: 10, period: 'evening', days: [0,1,2,3,4,5,6] },
  { id: '9', name: 'Night Cream', duration: 1, period: 'night', days: [0,1,2,3,4,5,6] },
  { id: '10', name: 'Meditation', duration: 15, period: 'night', specificTime: '22:00', days: [0,2,4,6] },
];

const DEFAULT_WEEKLY_DIET: WeeklyDietItem[] = [
  { id: 'd1', name: 'Oatmeal + Banana', calories: 350, protein: 12, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: 'd2', name: 'Protein Shake', calories: 200, protein: 30, period: 'morning', specificTime: '10:30', days: [1,2,3,4,5] },
  { id: 'd3', name: 'Chicken Rice Bowl', calories: 550, protein: 40, period: 'afternoon', days: [0,1,2,3,4,5,6] },
  { id: 'd4', name: 'Greek Yogurt', calories: 150, protein: 15, period: 'afternoon', specificTime: '16:00', days: [0,1,2,3,4,5,6] },
  { id: 'd5', name: 'Salmon + Veggies', calories: 500, protein: 35, period: 'evening', days: [0,1,2,3,4,5,6] },
  { id: 'd6', name: 'Casein Shake', calories: 120, protein: 24, period: 'night', days: [1,3,5] },
];

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

// --- Tasks ---
export function getWeeklyTasks(): WeeklyTask[] {
  return load(STORAGE_KEYS.weeklyTasks, DEFAULT_WEEKLY_TASKS);
}

export function saveWeeklyTasks(tasks: WeeklyTask[]) {
  save(STORAGE_KEYS.weeklyTasks, tasks);
}

export function getSpecialTasks(): Task[] {
  return load(STORAGE_KEYS.specialTasks, []);
}

export function saveSpecialTasks(tasks: Task[]) {
  save(STORAGE_KEYS.specialTasks, tasks);
}

export function getCompletions(): CompletionRecord[] {
  return load(STORAGE_KEYS.completions, []);
}

export function saveCompletions(records: CompletionRecord[]) {
  save(STORAGE_KEYS.completions, records);
}

export function getTasksForDate(date: Date): Task[] {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  
  const weekly = getWeeklyTasks()
    .filter(t => t.days.includes(dayOfWeek))
    .map(({ days, ...rest }) => rest as Task);
  
  const special = getSpecialTasks().filter(t => t.specialDate === dateStr);
  
  return [...weekly, ...special];
}

export function isTaskCompleted(taskId: string, date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return getCompletions().some(c => c.taskId === taskId && c.date === dateStr && c.completed);
}

export function toggleTaskCompletion(taskId: string, date: Date) {
  const dateStr = date.toISOString().split('T')[0];
  const completions = getCompletions();
  const existing = completions.findIndex(c => c.taskId === taskId && c.date === dateStr);
  
  if (existing >= 0) {
    completions[existing].completed = !completions[existing].completed;
  } else {
    completions.push({ taskId, date: dateStr, completed: true });
  }
  
  saveCompletions(completions);
}

export function getMissedTasks(date: Date): Task[] {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const tasks = getTasksForDate(yesterday);
  return tasks.filter(t => !isTaskCompleted(t.id, yesterday));
}

// --- Diet ---
export function getWeeklyDiet(): WeeklyDietItem[] {
  return load(STORAGE_KEYS.weeklyDiet, DEFAULT_WEEKLY_DIET);
}

export function saveWeeklyDiet(items: WeeklyDietItem[]) {
  save(STORAGE_KEYS.weeklyDiet, items);
}

export function getSpecialDiet(): DietItem[] {
  return load(STORAGE_KEYS.specialDiet, []);
}

export function saveSpecialDiet(items: DietItem[]) {
  save(STORAGE_KEYS.specialDiet, items);
}

export function getDietCompletions(): DietCompletionRecord[] {
  return load(STORAGE_KEYS.dietCompletions, []);
}

export function saveDietCompletions(records: DietCompletionRecord[]) {
  save(STORAGE_KEYS.dietCompletions, records);
}

export function getDietForDate(date: Date): DietItem[] {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  
  const weekly = getWeeklyDiet()
    .filter(t => t.days.includes(dayOfWeek))
    .map(({ days, ...rest }) => rest as DietItem);
  
  const special = getSpecialDiet().filter(t => (t as any).specialDate === dateStr);
  
  return [...weekly, ...special];
}

export function isDietCompleted(itemId: string, date: Date): boolean {
  const dateStr = date.toISOString().split('T')[0];
  return getDietCompletions().some(c => c.itemId === itemId && c.date === dateStr && c.completed);
}

export function toggleDietCompletion(itemId: string, date: Date) {
  const dateStr = date.toISOString().split('T')[0];
  const completions = getDietCompletions();
  const existing = completions.findIndex(c => c.itemId === itemId && c.date === dateStr);
  
  if (existing >= 0) {
    completions[existing].completed = !completions[existing].completed;
  } else {
    completions.push({ itemId, date: dateStr, completed: true });
  }
  
  saveDietCompletions(completions);
}

// --- Analysis ---
export function getCompletionRate(startDate: Date, endDate: Date): number {
  let total = 0;
  let completed = 0;
  
  const current = new Date(startDate);
  while (current <= endDate) {
    const tasks = getTasksForDate(current);
    total += tasks.length;
    tasks.forEach(t => {
      if (isTaskCompleted(t.id, current)) completed++;
    });
    current.setDate(current.getDate() + 1);
  }
  
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function getDailyCompletionData(startDate: Date, days: number) {
  const data = [];
  const current = new Date(startDate);
  current.setDate(current.getDate() - days + 1);
  
  for (let i = 0; i < days; i++) {
    const tasks = getTasksForDate(current);
    const completed = tasks.filter(t => isTaskCompleted(t.id, current)).length;
    data.push({
      date: current.toISOString().split('T')[0],
      day: current.toLocaleDateString('en', { weekday: 'short' }),
      total: tasks.length,
      completed,
      rate: tasks.length === 0 ? 0 : Math.round((completed / tasks.length) * 100),
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

export function getDietCompletionRate(startDate: Date, endDate: Date): number {
  let total = 0;
  let completed = 0;
  
  const current = new Date(startDate);
  while (current <= endDate) {
    const items = getDietForDate(current);
    total += items.length;
    items.forEach(item => {
      if (isDietCompleted(item.id, current)) completed++;
    });
    current.setDate(current.getDate() + 1);
  }
  
  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export function getDailyDietData(startDate: Date, days: number) {
  const data = [];
  const current = new Date(startDate);
  current.setDate(current.getDate() - days + 1);
  
  for (let i = 0; i < days; i++) {
    const items = getDietForDate(current);
    const completedItems = items.filter(item => isDietCompleted(item.id, current));
    data.push({
      date: current.toISOString().split('T')[0],
      day: current.toLocaleDateString('en', { weekday: 'short' }),
      total: items.length,
      completed: completedItems.length,
      rate: items.length === 0 ? 0 : Math.round((completedItems.length / items.length) * 100),
      caloriesConsumed: completedItems.reduce((s, d) => s + d.calories, 0),
      caloriesTotal: items.reduce((s, d) => s + d.calories, 0),
      proteinConsumed: completedItems.reduce((s, d) => s + d.protein, 0),
      proteinTotal: items.reduce((s, d) => s + d.protein, 0),
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
