import { WeeklyTask, CompletionRecord, Task, Period, DietItem, WeeklyDietItem, DietCompletionRecord } from './types';
import { apiGet, apiPut } from './api';

// ─── OFFLINE / LOCAL-STORAGE LAYER DISABLED ──────────────────────────────────
// All state now flows directly through the backend API and MongoDB.
// The localStorage cache and offline-sync helpers below are commented out.
//
// const STORAGE_KEYS = {
//   weeklyTasks: 'rhythm-weekly-tasks',
//   specialTasks: 'rhythm-special-tasks',
//   completions: 'rhythm-completions',
//   weeklyDiet: 'rhythm-weekly-diet',
//   specialDiet: 'rhythm-special-diet',
//   dietCompletions: 'rhythm-diet-completions',
// };
// ─────────────────────────────────────────────────────────────────────────────

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

const ALL_DAYS: number[] = [0, 1, 2, 3, 4, 5, 6];

function normalizeWeeklyTasks(tasks: WeeklyTask[] | unknown): WeeklyTask[] {
  if (!Array.isArray(tasks)) return [];
  return (tasks as WeeklyTask[]).map(task => {
    const rawDays = (task as any).days;
    const days = Array.isArray(rawDays) && rawDays.length > 0 ? rawDays : ALL_DAYS;
    return { ...task, days };
  });
}

function normalizeWeeklyDiet(items: WeeklyDietItem[] | unknown): WeeklyDietItem[] {
  if (!Array.isArray(items)) return [];
  return (items as WeeklyDietItem[]).map(item => {
    const rawDays = (item as any).days;
    const days = Array.isArray(rawDays) && rawDays.length > 0 ? rawDays : ALL_DAYS;
    return { ...item, days };
  });
}

// ─── OFFLINE HELPERS DISABLED ─────────────────────────────────────────────────
// function load<T>(key: string, fallback: T): T {
//   try {
//     const raw = localStorage.getItem(key);
//     return raw ? JSON.parse(raw) : fallback;
//   } catch { return fallback; }
// }
//
// function save<T>(key: string, data: T) {
//   localStorage.setItem(key, JSON.stringify(data));
//   void pushStateToServer();
// }
// ─────────────────────────────────────────────────────────────────────────────

type ServerState = {
  weeklyTasks: WeeklyTask[];
  specialTasks: Task[];
  completions: CompletionRecord[];
  weeklyDiet: WeeklyDietItem[];
  specialDiet: DietItem[];
  dietCompletions: DietCompletionRecord[];
};

// ─── OFFLINE PUSH DISABLED ───────────────────────────────────────────────────
// let pushing = false;
//
// function getLocalState(): ServerState {
//   return {
//     weeklyTasks: normalizeWeeklyTasks(load(STORAGE_KEYS.weeklyTasks, DEFAULT_WEEKLY_TASKS)),
//     specialTasks: load(STORAGE_KEYS.specialTasks, [] as Task[]),
//     completions: load(STORAGE_KEYS.completions, [] as CompletionRecord[]),
//     weeklyDiet: normalizeWeeklyDiet(load(STORAGE_KEYS.weeklyDiet, DEFAULT_WEEKLY_DIET)),
//     specialDiet: load(STORAGE_KEYS.specialDiet, [] as DietItem[]),
//     dietCompletions: load(STORAGE_KEYS.dietCompletions, [] as DietCompletionRecord[]),
//   };
// }
//
// async function pushStateToServer() {
//   if (pushing) return;
//   pushing = true;
//   try {
//     const state = getLocalState();
//     await apiPut<ServerState, void>('/state', state);
//   } catch (error) {
//     // Fail silently; remain fully functional offline.
//     console.error('Failed to sync state to server', error);
//   } finally {
//     pushing = false;
//   }
// }
// ─────────────────────────────────────────────────────────────────────────────

// In-memory cache of the current server state (fetched once per session).
let _state: ServerState | null = null;

async function getState(): Promise<ServerState> {
  if (_state) return _state;
  try {
    const remote = await apiGet<ServerState>('/state');
    _state = {
      weeklyTasks: normalizeWeeklyTasks(remote.weeklyTasks ?? DEFAULT_WEEKLY_TASKS),
      specialTasks: remote.specialTasks ?? [],
      completions: remote.completions ?? [],
      weeklyDiet: normalizeWeeklyDiet(remote.weeklyDiet ?? DEFAULT_WEEKLY_DIET),
      specialDiet: remote.specialDiet ?? [],
      dietCompletions: remote.dietCompletions ?? [],
    };
  } catch {
    _state = {
      weeklyTasks: normalizeWeeklyTasks(DEFAULT_WEEKLY_TASKS),
      specialTasks: [],
      completions: [],
      weeklyDiet: normalizeWeeklyDiet(DEFAULT_WEEKLY_DIET),
      specialDiet: [],
      dietCompletions: [],
    };
  }
  return _state;
}

async function persistState(next: ServerState): Promise<void> {
  _state = next;
  await apiPut<ServerState, void>('/state', next);
}

export async function syncFromServer() {
  _state = null;
  await getState();
}

// --- Tasks ---
export async function getWeeklyTasks(): Promise<WeeklyTask[]> {
  return (await getState()).weeklyTasks;
}

export async function saveWeeklyTasks(tasks: WeeklyTask[]) {
  const s = await getState();
  await persistState({ ...s, weeklyTasks: tasks });
}

export async function getSpecialTasks(): Promise<Task[]> {
  return (await getState()).specialTasks;
}

export async function saveSpecialTasks(tasks: Task[]) {
  const s = await getState();
  await persistState({ ...s, specialTasks: tasks });
}

export async function getCompletions(): Promise<CompletionRecord[]> {
  return (await getState()).completions;
}

export async function saveCompletions(records: CompletionRecord[]) {
  const s = await getState();
  await persistState({ ...s, completions: records });
}

export async function getTasksForDate(date: Date): Promise<Task[]> {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  const s = await getState();

  const weekly = s.weeklyTasks
    .filter(t => Array.isArray((t as any).days) && (t as any).days.includes(dayOfWeek))
    .map(({ days, ...rest }) => rest as Task);

  const special = s.specialTasks.filter(t => t.specialDate === dateStr);

  return [...weekly, ...special];
}

export async function isTaskCompleted(taskId: string, date: Date): Promise<boolean> {
  const dateStr = date.toISOString().split('T')[0];
  const completions = await getCompletions();
  return completions.some(c => c.taskId === taskId && c.date === dateStr && c.completed);
}

export async function toggleTaskCompletion(taskId: string, date: Date) {
  const dateStr = date.toISOString().split('T')[0];
  const s = await getState();
  const completions = [...s.completions];
  const existing = completions.findIndex(c => c.taskId === taskId && c.date === dateStr);

  if (existing >= 0) {
    completions[existing] = { ...completions[existing], completed: !completions[existing].completed };
  } else {
    completions.push({ taskId, date: dateStr, completed: true });
  }

  await persistState({ ...s, completions });
}

export async function getMissedTasks(date: Date): Promise<Task[]> {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  const tasks = await getTasksForDate(yesterday);
  const checks = await Promise.all(tasks.map(t => isTaskCompleted(t.id, yesterday)));
  return tasks.filter((_, i) => !checks[i]);
}

// --- Diet ---
export async function getWeeklyDiet(): Promise<WeeklyDietItem[]> {
  return (await getState()).weeklyDiet;
}

export async function saveWeeklyDiet(items: WeeklyDietItem[]) {
  const s = await getState();
  await persistState({ ...s, weeklyDiet: items });
}

export async function getSpecialDiet(): Promise<DietItem[]> {
  return (await getState()).specialDiet;
}

export async function saveSpecialDiet(items: DietItem[]) {
  const s = await getState();
  await persistState({ ...s, specialDiet: items });
}

export async function getDietCompletions(): Promise<DietCompletionRecord[]> {
  return (await getState()).dietCompletions;
}

export async function saveDietCompletions(records: DietCompletionRecord[]) {
  const s = await getState();
  await persistState({ ...s, dietCompletions: records });
}

export async function getDietForDate(date: Date): Promise<DietItem[]> {
  const dayOfWeek = date.getDay();
  const dateStr = date.toISOString().split('T')[0];
  const s = await getState();

  const weekly = s.weeklyDiet
    .filter(t => Array.isArray((t as any).days) && (t as any).days.includes(dayOfWeek))
    .map(({ days, ...rest }) => rest as DietItem);

  const special = s.specialDiet.filter(t => (t as any).specialDate === dateStr);

  return [...weekly, ...special];
}

export async function isDietCompleted(itemId: string, date: Date): Promise<boolean> {
  const dateStr = date.toISOString().split('T')[0];
  const completions = await getDietCompletions();
  return completions.some(c => c.itemId === itemId && c.date === dateStr && c.completed);
}

export async function toggleDietCompletion(itemId: string, date: Date) {
  const dateStr = date.toISOString().split('T')[0];
  const s = await getState();
  const completions = [...s.dietCompletions];
  const existing = completions.findIndex(c => c.itemId === itemId && c.date === dateStr);

  if (existing >= 0) {
    completions[existing] = { ...completions[existing], completed: !completions[existing].completed };
  } else {
    completions.push({ itemId, date: dateStr, completed: true });
  }

  await persistState({ ...s, dietCompletions: completions });
}

// --- Analysis ---
export async function getCompletionRate(startDate: Date, endDate: Date): Promise<number> {
  let total = 0;
  let completed = 0;

  const current = new Date(startDate);
  while (current <= endDate) {
    const tasks = await getTasksForDate(current);
    total += tasks.length;
    const checks = await Promise.all(tasks.map(t => isTaskCompleted(t.id, current)));
    completed += checks.filter(Boolean).length;
    current.setDate(current.getDate() + 1);
  }

  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

export async function getDailyCompletionData(startDate: Date, days: number) {
  const data = [];
  const current = new Date(startDate);
  current.setDate(current.getDate() - days + 1);

  for (let i = 0; i < days; i++) {
    const tasks = await getTasksForDate(current);
    const checks = await Promise.all(tasks.map(t => isTaskCompleted(t.id, current)));
    const completedCount = checks.filter(Boolean).length;
    data.push({
      date: current.toISOString().split('T')[0],
      day: current.toLocaleDateString('en', { weekday: 'short' }),
      total: tasks.length,
      completed: completedCount,
      rate: tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100),
    });
    current.setDate(current.getDate() + 1);
  }
  return data;
}

export async function getDietCompletionRate(startDate: Date, endDate: Date): Promise<number> {
  let total = 0;
  let completed = 0;

  const current = new Date(startDate);
  while (current <= endDate) {
    const items = await getDietForDate(current);
    total += items.length;
    const checks = await Promise.all(items.map(item => isDietCompleted(item.id, current)));
    completed += checks.filter(Boolean).length;
    current.setDate(current.getDate() + 1);
  }

  return total === 0 ? 0 : Math.round((completed / total) * 100);
}

// ─── getDailyDietData (used by AnalysisPage) ─────────────────────────────────
export async function getDailyDietData(startDate: Date, days: number) {
  const data = [];
  const current = new Date(startDate);
  current.setDate(current.getDate() - days + 1);

  for (let i = 0; i < days; i++) {
    const items = await getDietForDate(current);
    const completedItems = await Promise.all(
      items.map(async item => (await isDietCompleted(item.id, current)) ? item : null)
    ).then(results => items.filter((_, idx) => results[idx] !== null));
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
