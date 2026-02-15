import {
    format,
    formatDistanceToNow,
    differenceInMinutes,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    addDays,
    isSameDay,
    parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';

// Format time as HH:mm
export const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'HH:mm');
};

// Format date as readable string
export const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, 'dd MMM yyyy', { locale: es });
};

// Format as relative time (e.g., "hace 5 minutos")
export const formatRelative = (date: Date | string): string => {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: es });
};

// Calculate duration between two dates in hours
export const calculateHours = (start: Date | string, end: Date | string): number => {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;
    const minutes = differenceInMinutes(endDate, startDate);
    return Math.round((minutes / 60) * 100) / 100;
};

// Calculate duration between two dates in minutes
export const calculateMinutes = (start: Date | string, end: Date | string): number => {
    const startDate = typeof start === 'string' ? parseISO(start) : start;
    const endDate = typeof end === 'string' ? parseISO(end) : end;
    return differenceInMinutes(endDate, startDate);
};

// Format hours as HH:MM string
export const formatHoursMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

// Format seconds as HH:MM:SS string
export const formatDurationSeconds = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Get week days starting from Monday
export const getWeekDays = (date: Date = new Date()): Date[] => {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
};

// Get day name abbreviation
export const getDayName = (date: Date): string => {
    return format(date, 'EEE', { locale: es });
};

// Check if date is today
export const isToday = (date: Date): boolean => {
    return isSameDay(date, new Date());
};

// Get current week range
export const getCurrentWeekRange = (): { start: Date; end: Date } => {
    const now = new Date();
    return {
        start: startOfWeek(now, { weekStartsOn: 1 }),
        end: endOfWeek(now, { weekStartsOn: 1 })
    };
};

// Get current month range
export const getCurrentMonthRange = (): { start: Date; end: Date } => {
    const now = new Date();
    return {
        start: startOfMonth(now),
        end: endOfMonth(now)
    };
};

// Format duration in a human readable way
export const formatDuration = (minutes: number): string => {
    if (minutes < 60) {
        return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
        return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
};
