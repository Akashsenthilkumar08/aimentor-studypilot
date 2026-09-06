import { UserActivityLog } from '../types';

/**
 * Convert Date object or ISO timestamp string to local YYYY-MM-DD string
 */
export function toLocalDateStr(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD into human readable date e.g. "Sep 6, 2026"
 */
export function formatReadableDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  const d = new Date(year, month - 1, day);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export interface CalendarDay {
  dateStr: string;        // YYYY-MM-DD
  date: Date;
  dayOfWeek: number;      // 0 = Sun, 1 = Mon, ... 6 = Sat
  monthName: string;      // "Jan", "Feb", etc.
  dayOfMonth: number;
  activities: UserActivityLog[];
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  isToday: boolean;
  isFuture: boolean;
}

export interface HeatmapStats {
  currentStreak: number;
  longestStreak: number;
  totalActiveDays: number;
  totalActivities: number;
}

/**
 * Generate 52 weeks (364 days + rest of current week) ending on current week's Sunday/Saturday
 */
export function generateCalendarGrid(activities: UserActivityLog[]): {
  weeks: CalendarDay[][];
  monthLabels: { name: string; colIndex: number }[];
  stats: HeatmapStats;
  activityMap: Record<string, UserActivityLog[]>;
} {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = toLocalDateStr(today);

  // Group activities by local YYYY-MM-DD
  const activityMap: Record<string, UserActivityLog[]> = {};
  activities.forEach(act => {
    const dStr = act.dateStr || toLocalDateStr(act.timestamp);
    if (!activityMap[dStr]) {
      activityMap[dStr] = [];
    }
    activityMap[dStr].push(act);
  });

  // Calculate start date: 52 weeks ago, aligned to start on Monday
  // Day of week for today: 0 = Sun, 1 = Mon, ..., 6 = Sat
  const dayOfWeek = today.getDay(); // 0-6
  const offsetToMonday = (dayOfWeek + 6) % 7; // days since last Monday
  
  // Go back 51 full weeks + days to last Monday
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - offsetToMonday)); // end of current week (Sunday)

  const startDate = new Date(today);
  startDate.setDate(today.getDate() - (51 * 7 + offsetToMonday)); // start on Monday 51 weeks ago

  const weeks: CalendarDay[][] = [];
  const monthLabels: { name: string; colIndex: number }[] = [];
  let currentWeek: CalendarDay[] = [];
  let lastMonthName = '';

  const curr = new Date(startDate);
  curr.setHours(0, 0, 0, 0);

  let colIndex = 0;

  while (curr <= endDate || currentWeek.length > 0) {
    const dateStr = toLocalDateStr(curr);
    const dayActs = activityMap[dateStr] || [];
    const count = dayActs.length;

    let level: 0 | 1 | 2 | 3 | 4 = 0;
    if (count >= 8) level = 4;
    else if (count >= 5) level = 3;
    else if (count >= 3) level = 2;
    else if (count >= 1) level = 1;

    const monthName = curr.toLocaleDateString('en-US', { month: 'short' });
    const isToday = dateStr === todayStr;
    const isFuture = curr > today;

    if (currentWeek.length === 0 && monthName !== lastMonthName) {
      monthLabels.push({ name: monthName, colIndex });
      lastMonthName = monthName;
    }

    currentWeek.push({
      dateStr,
      date: new Date(curr),
      dayOfWeek: curr.getDay(),
      monthName,
      dayOfMonth: curr.getDate(),
      activities: dayActs,
      count,
      level,
      isToday,
      isFuture
    });

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
      colIndex++;
    }

    curr.setDate(curr.getDate() + 1);

    if (curr > endDate && currentWeek.length === 0) {
      break;
    }
  }

  // Calculate Streak & Totals
  const stats = calculateStreakStats(activityMap, todayStr);

  return { weeks, monthLabels, stats, activityMap };
}

/**
 * Calculate Current Streak, Longest Streak, Total Active Days, and Total Activities
 */
export function calculateStreakStats(
  activityMap: Record<string, UserActivityLog[]>,
  todayStr: string
): HeatmapStats {
  const activeDates = Object.keys(activityMap)
    .filter(dateStr => (activityMap[dateStr]?.length || 0) > 0)
    .sort(); // ascending YYYY-MM-DD

  const totalActivities = Object.values(activityMap).reduce((sum, list) => sum + list.length, 0);
  const totalActiveDays = activeDates.length;

  if (activeDates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalActiveDays: 0,
      totalActivities: 0
    };
  }

  const activeSet = new Set(activeDates);

  // 1. Longest Streak calculation
  let longestStreak = 0;
  let currentRun = 0;

  // Find min and max date in activeSet
  const firstDate = new Date(activeDates[0]);
  const lastDate = new Date(activeDates[activeDates.length - 1]);
  
  const tempCurr = new Date(firstDate);
  tempCurr.setHours(0, 0, 0, 0);

  const boundaryDate = new Date(lastDate);
  boundaryDate.setHours(0, 0, 0, 0);

  while (tempCurr <= boundaryDate) {
    const dStr = toLocalDateStr(tempCurr);
    if (activeSet.has(dStr)) {
      currentRun++;
      if (currentRun > longestStreak) {
        longestStreak = currentRun;
      }
    } else {
      currentRun = 0;
    }
    tempCurr.setDate(tempCurr.getDate() + 1);
  }

  // 2. Current Streak calculation
  const today = new Date(todayStr + 'T00:00:00');
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const yesterdayStr = toLocalDateStr(yesterday);

  let currentStreak = 0;

  // Determine starting date for current streak check
  let checkDate: Date | null = null;

  if (activeSet.has(todayStr)) {
    checkDate = new Date(today);
  } else if (activeSet.has(yesterdayStr)) {
    checkDate = new Date(yesterday);
  }

  if (checkDate) {
    let runner = new Date(checkDate);
    runner.setHours(0, 0, 0, 0);
    while (activeSet.has(toLocalDateStr(runner))) {
      currentStreak++;
      runner.setDate(runner.getDate() - 1);
    }
  }

  return {
    currentStreak,
    longestStreak,
    totalActiveDays,
    totalActivities
  };
}
