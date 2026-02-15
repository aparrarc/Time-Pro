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

// ── Sprint 5: Legal Compliance Types ───────────────────

// Overtime
export type OvertimeType = 'paid' | 'compensated' | 'pending';

export interface OvertimeRecord {
    id: string;
    user_id: string;
    date: string;
    time_entry_id?: string;
    scheduled_hours: number;
    actual_hours: number;
    overtime_hours: number;
    overtime_type: OvertimeType;
    approved_by?: string;
    approved_at?: string;
    notes?: string;
    created_at: string;
    // Joined
    user_name?: string;
}

export interface OvertimeSettings {
    id: string;
    department_id?: string;
    max_daily_hours: number;
    max_weekly_hours: number;
    max_annual_overtime_hours: number;
    overtime_threshold_daily: number;
    overtime_threshold_weekly: number;
    auto_detect: boolean;
}

// Work Calendar
export type CalendarScope = 'national' | 'regional' | 'local';

export interface WorkCalendarEntry {
    id: string;
    name: string;
    date: string;
    scope: CalendarScope;
    region?: string;
    description?: string;
    is_active: boolean;
    created_by?: string;
    created_at: string;
}

// Work Schedules
export interface WorkSchedule {
    id: string;
    name: string;
    department_id?: string;
    monday_start?: string;
    monday_end?: string;
    tuesday_start?: string;
    tuesday_end?: string;
    wednesday_start?: string;
    wednesday_end?: string;
    thursday_start?: string;
    thursday_end?: string;
    friday_start?: string;
    friday_end?: string;
    saturday_start?: string;
    saturday_end?: string;
    sunday_start?: string;
    sunday_end?: string;
    is_default: boolean;
    created_at: string;
}

// Compliance Alerts
export type AlertType =
    | 'missed_clock_in'
    | 'missed_clock_out'
    | 'overtime_excess'
    | 'anomalous_entry'
    | 'late_arrival'
    | 'max_daily_exceeded'
    | 'max_weekly_exceeded';

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface ComplianceAlert {
    id: string;
    user_id: string;
    alert_type: AlertType;
    alert_date: string;
    severity: AlertSeverity;
    message?: string;
    details?: Record<string, unknown>;
    resolved: boolean;
    resolved_by?: string;
    resolved_at?: string;
    resolution_notes?: string;
    created_at: string;
    // Joined
    user_name?: string;
}

// ── Sprint 6: Operational Value Types ──────────────────

// Shifts
export interface ShiftTemplate {
    id: string;
    name: string;
    code: string;
    start_time: string;
    end_time: string;
    break_minutes: number;
    color: string;
    is_night_shift: boolean;
    is_active: boolean;
    created_at: string;
}

export type ShiftStatus = 'assigned' | 'swap_requested' | 'swapped' | 'completed' | 'absent';

export interface ShiftAssignment {
    id: string;
    user_id: string;
    shift_template_id: string;
    date: string;
    status: ShiftStatus;
    swap_with_user_id?: string;
    swap_approved_by?: string;
    notes?: string;
    created_at: string;
    // Joined
    user_name?: string;
    shift_name?: string;
    shift_code?: string;
    shift_color?: string;
}

// Payroll Detail
export type PayrollStatus = 'draft' | 'approved' | 'paid' | 'error';

export interface PayrollDetail {
    id: string;
    user_id: string;
    month: number;
    year: number;
    base_salary: number;
    seniority_bonus: number;
    transport_allowance: number;
    meal_allowance: number;
    overtime_pay: number;
    other_bonuses: number;
    irpf_percent: number;
    irpf_amount: number;
    ss_employee_percent: number;
    ss_employee_amount: number;
    ss_company_percent: number;
    ss_company_amount: number;
    other_deductions: number;
    gross_total: number;
    net_total: number;
    company_cost: number;
    status: PayrollStatus;
    approved_by?: string;
    approved_at?: string;
    payment_date?: string;
    created_at: string;
    // Joined
    user_name?: string;
}

// Documents
export type DocumentCategory = 'contract' | 'payslip' | 'certificate' | 'training' | 'disciplinary' | 'other';
export type DocumentStatus = 'active' | 'expired' | 'pending_signature' | 'archived';

export interface HRDocument {
    id: string;
    user_id: string;
    title: string;
    category: DocumentCategory;
    description?: string;
    file_url?: string;
    file_name?: string;
    file_size_bytes?: number;
    mime_type?: string;
    status: DocumentStatus;
    expiry_date?: string;
    uploaded_by?: string;
    created_at: string;
    // Joined
    user_name?: string;
}
