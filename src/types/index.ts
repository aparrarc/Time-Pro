// TimeTrack Pro - Type Definitions

// User roles
export type UserRole = 'employee' | 'supervisor' | 'hr' | 'admin';

// User profile extending Supabase auth user
export interface User {
    id: string;
    email: string;
    full_name: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    avatar_url?: string;
    role: UserRole;
    department_id?: string;
    supervisor_id?: string;
    hire_date: string;
    vacation_days: number;
    is_active: boolean;
    created_at: string;
}

// Department
export interface Department {
    id: string;
    name: string;
    manager_id?: string;
    created_at: string;
}

// Time Entry (clock in/out record)
export interface TimeEntry {
    id: string;
    user_id: string;
    clock_in: string;
    clock_out?: string;
    notes?: string;
    is_modified: boolean;
    created_at: string;
    // Computed
    total_hours?: number;
    breaks?: Break[];
}

// Break types
export type BreakType = 'lunch' | 'coffee' | 'medical' | 'other';

// Break record
export interface Break {
    id: string;
    time_entry_id: string;
    break_type: BreakType;
    start_time: string;
    end_time?: string;
    duration_minutes?: number;
}

// Absence types
export type AbsenceType = 'vacation' | 'sick' | 'personal' | 'other';

// Absence request status
export type AbsenceStatus = 'pending' | 'approved' | 'rejected';

// Absence request
export interface AbsenceRequest {
    id: string;
    user_id: string;
    absence_type: AbsenceType;
    start_date: string;
    end_date: string;
    total_days?: number;
    status: AbsenceStatus;
    reason?: string;
    reviewed_by?: string;
    reviewed_at?: string;
    attachment_url?: string;
    created_at: string;
}

// Employee work status
export type WorkStatus = 'not_working' | 'working' | 'on_break';

// Dashboard state
export interface DashboardState {
    currentStatus: WorkStatus;
    activeTimeEntry?: TimeEntry;
    activeBreak?: Break;
    todayHours: number;
    weekHours: number;
}

// Report filters
export interface ReportFilters {
    startDate: string;
    endDate: string;
    userId?: string;
    departmentId?: string;
}

// Report data
export interface WorkReport {
    date: string;
    hoursWorked: number;
    breakMinutes: number;
    netHours: number;
}

// Navigation item
export interface NavItem {
    label: string;
    icon: string;
    path: string;
    roles?: UserRole[];
}
