export type Period = 'morning' | 'afternoon' | 'evening' | 'night';

export interface Task {
  id: string;
  name: string;
  duration: number | null; // minutes
  period: Period;
  specificTime?: string; // HH:MM format for exact time scheduling
  isSpecial?: boolean;
  specialDate?: string; // ISO date for one-time events
}

export interface DaySchedule {
  [key: string]: Task[]; // day name -> tasks
}

export interface WeeklyTask extends Task {
  days: number[]; // 0=Sun, 1=Mon...6=Sat
}

export interface CompletionRecord {
  taskId: string;
  date: string; // ISO date
  completed: boolean;
}

// Diet types
export interface DietItem {
  id: string;
  name: string;
  calories: number;
  protein: number; // grams
  period: Period;
  specificTime?: string;
}

export interface WeeklyDietItem extends DietItem {
  days: number[];
}

export interface DietCompletionRecord {
  itemId: string;
  date: string;
  completed: boolean;
}

export const PERIODS: { key: Period; label: string; timeRange: string }[] = [
  { key: 'morning', label: 'MORNING', timeRange: '6:00 – 12:00' },
  { key: 'afternoon', label: 'AFTERNOON', timeRange: '12:00 – 17:00' },
  { key: 'evening', label: 'EVENING', timeRange: '17:00 – 21:00' },
  { key: 'night', label: 'NIGHT', timeRange: '21:00 – 00:00' },
];

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
