// Demo Mode - Mock data for offline development
import type { User, TimeEntry, AbsenceRequest } from '../types';

// Flag to check if we're in demo mode
export let isDemoMode = false;
export const setDemoMode = (val: boolean) => { isDemoMode = val; };

// Demo admin user
export const DEMO_USER: User = {
    id: 'demo-admin-001',
    email: 'admin@timetrack.demo',
    full_name: 'Admin Demo',
    first_name: 'Admin',
    last_name: 'Demo',
    phone: '+34 600 000 000',
    avatar_url: undefined,
    role: 'admin',
    department_id: 'dept-001',
    hire_date: '2024-01-15',
    vacation_days: 22,
    is_active: true,
    created_at: '2024-01-15T09:00:00Z',
};

// Demo employees
export const DEMO_USERS: User[] = [
    DEMO_USER,
    {
        id: 'demo-emp-001',
        email: 'carlos@timetrack.demo',
        full_name: 'Carlos García',
        first_name: 'Carlos',
        last_name: 'García',
        phone: '+34 611 111 111',
        role: 'employee',
        department_id: 'dept-001',
        hire_date: '2024-03-01',
        vacation_days: 22,
        is_active: true,
        created_at: '2024-03-01T09:00:00Z',
    },
    {
        id: 'demo-emp-002',
        email: 'maria@timetrack.demo',
        full_name: 'María López',
        first_name: 'María',
        last_name: 'López',
        phone: '+34 622 222 222',
        role: 'employee',
        department_id: 'dept-001',
        hire_date: '2024-02-15',
        vacation_days: 22,
        is_active: true,
        created_at: '2024-02-15T09:00:00Z',
    },
    {
        id: 'demo-emp-003',
        email: 'jorge@timetrack.demo',
        full_name: 'Jorge Martínez',
        first_name: 'Jorge',
        last_name: 'Martínez',
        phone: '+34 633 333 333',
        role: 'supervisor',
        department_id: 'dept-002',
        hire_date: '2023-11-01',
        vacation_days: 25,
        is_active: true,
        created_at: '2023-11-01T09:00:00Z',
    },
    {
        id: 'demo-emp-004',
        email: 'ana@timetrack.demo',
        full_name: 'Ana Rodríguez',
        first_name: 'Ana',
        last_name: 'Rodríguez',
        phone: '+34 644 444 444',
        role: 'hr',
        department_id: 'dept-001',
        hire_date: '2024-06-01',
        vacation_days: 22,
        is_active: true,
        created_at: '2024-06-01T09:00:00Z',
    },
    {
        id: 'demo-emp-005',
        email: 'pedro@timetrack.demo',
        full_name: 'Pedro Fernández',
        first_name: 'Pedro',
        last_name: 'Fernández',
        role: 'employee',
        department_id: 'dept-002',
        hire_date: '2025-01-10',
        vacation_days: 22,
        is_active: false,
        created_at: '2025-01-10T09:00:00Z',
    },
];

// Helper to generate dates relative to today
const today = new Date();
const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d;
};

const setTime = (date: Date, h: number, m: number) => {
    const d = new Date(date);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
};

// Demo time entries for the past week
export const DEMO_TIME_ENTRIES: TimeEntry[] = [
    // Today - active entry (no clock_out)
    {
        id: 'te-today',
        user_id: DEMO_USER.id,
        clock_in: setTime(today, 9, 0),
        clock_out: undefined,
        is_modified: false,
        created_at: setTime(today, 9, 0),
        breaks: [],
    },
    // Yesterday
    {
        id: 'te-1',
        user_id: DEMO_USER.id,
        clock_in: setTime(daysAgo(1), 8, 45),
        clock_out: setTime(daysAgo(1), 17, 30),
        is_modified: false,
        created_at: setTime(daysAgo(1), 8, 45),
        breaks: [
            { id: 'b-1a', time_entry_id: 'te-1', break_type: 'lunch', start_time: setTime(daysAgo(1), 13, 0), end_time: setTime(daysAgo(1), 14, 0) },
            { id: 'b-1b', time_entry_id: 'te-1', break_type: 'coffee', start_time: setTime(daysAgo(1), 11, 0), end_time: setTime(daysAgo(1), 11, 15) },
        ]
    },
    // 2 days ago
    {
        id: 'te-2',
        user_id: DEMO_USER.id,
        clock_in: setTime(daysAgo(2), 9, 10),
        clock_out: setTime(daysAgo(2), 18, 0),
        is_modified: false,
        created_at: setTime(daysAgo(2), 9, 10),
        breaks: [
            { id: 'b-2a', time_entry_id: 'te-2', break_type: 'lunch', start_time: setTime(daysAgo(2), 13, 30), end_time: setTime(daysAgo(2), 14, 15) },
        ]
    },
    // 3 days ago
    {
        id: 'te-3',
        user_id: DEMO_USER.id,
        clock_in: setTime(daysAgo(3), 8, 30),
        clock_out: setTime(daysAgo(3), 17, 0),
        is_modified: false,
        created_at: setTime(daysAgo(3), 8, 30),
        breaks: [
            { id: 'b-3a', time_entry_id: 'te-3', break_type: 'lunch', start_time: setTime(daysAgo(3), 13, 0), end_time: setTime(daysAgo(3), 13, 45) },
        ]
    },
    // 4 days ago
    {
        id: 'te-4',
        user_id: DEMO_USER.id,
        clock_in: setTime(daysAgo(4), 9, 0),
        clock_out: setTime(daysAgo(4), 17, 45),
        is_modified: false,
        created_at: setTime(daysAgo(4), 9, 0),
        breaks: [
            { id: 'b-4a', time_entry_id: 'te-4', break_type: 'lunch', start_time: setTime(daysAgo(4), 13, 0), end_time: setTime(daysAgo(4), 14, 0) },
            { id: 'b-4b', time_entry_id: 'te-4', break_type: 'coffee', start_time: setTime(daysAgo(4), 16, 0), end_time: setTime(daysAgo(4), 16, 10) },
        ]
    },
];

// Demo absence requests
export const DEMO_ABSENCES: AbsenceRequest[] = [
    {
        id: 'abs-1',
        user_id: DEMO_USER.id,
        absence_type: 'vacation',
        start_date: '2026-03-15',
        end_date: '2026-03-22',
        status: 'approved',
        reason: 'Vacaciones de Semana Santa',
        created_at: '2026-02-01T10:00:00Z',
    },
    {
        id: 'abs-2',
        user_id: DEMO_USER.id,
        absence_type: 'personal',
        start_date: '2026-02-20',
        end_date: '2026-02-20',
        status: 'pending',
        reason: 'Asunto personal',
        created_at: '2026-02-05T14:00:00Z',
    },
    {
        id: 'abs-3',
        user_id: 'demo-emp-001',
        absence_type: 'sick',
        start_date: '2026-02-06',
        end_date: '2026-02-07',
        status: 'approved',
        reason: 'Gripe',
        created_at: '2026-02-06T08:00:00Z',
    },
];

// Demo live attendance
export const DEMO_LIVE_ATTENDANCE = [
    { user_id: 'demo-emp-001', full_name: 'Carlos García', clock_in: setTime(today, 8, 30) },
    { user_id: 'demo-emp-002', full_name: 'María López', clock_in: setTime(today, 9, 15) },
    { user_id: 'demo-emp-003', full_name: 'Jorge Martínez', clock_in: setTime(today, 8, 0) },
];
