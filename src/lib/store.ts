import { WeeklyTask, CompletionRecord, Task, Period } from './types';

const STORAGE_KEYS = {
  weeklyTasks: 'rhythm-weekly-tasks',
  specialTasks: 'rhythm-special-tasks',
  completions: 'rhythm-completions',
};

// Default sample tasks
const DEFAULT_WEEKLY_TASKS: WeeklyTask[] = [
  { id: '1', name: 'Cleanser', duration: 2, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '2', name: 'Serum', duration: 1, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '3', name: 'Sunscreen', duration: 1, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '4', name: 'Moisturizer', duration: 1, period: 'morning', days: [0,1,2,3,4,5,6] },
  { id: '5', name: 'Guitar Practice', duration: 30, period: 'post-morning', days: [1,3,5] },
  { id: '6', name: 'Read 20 pages', duration: 25, period: 'afternoon', days: [0,1,2,3,4,5,6] },
  { id: '7', name: 'Workout', duration: 45, period: 'afternoon', days: [1,2,4,5] },
  { id: '8', name: 'Journal', duration: 10, period: 'evening', days: [0,1,2,3,4,5,6] },
  { id: '9', name: 'Night Cream', duration: 1, period: 'night', days: [0,1,2,3,4,5,6] },
  { id: '10', name: 'Meditation', duration: 15, period: 'night', days: [0,2,4,6] },
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

export function getCompletionRate(startDate: Date, endDate: Date): number {
  const completions = getCompletions();
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

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}
