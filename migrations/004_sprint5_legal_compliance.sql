-- ============================================================
-- TimeTrack Pro — Migración 004: Sprint 5 — Cumplimiento Legal
-- Instancia: api.hdlma.com (Supabase self-hosted)
-- Fecha: 2026-02-15
-- ============================================================

-- ============================================================
-- TABLAS
-- ============================================================

-- 1. Configuración de horas extra por empresa/departamento
CREATE TABLE IF NOT EXISTS timetrack.overtime_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID REFERENCES timetrack.departments(id) ON DELETE SET NULL,
    max_daily_hours NUMERIC(4,2) DEFAULT 8.00,
    max_weekly_hours NUMERIC(4,2) DEFAULT 40.00,
    max_annual_overtime_hours NUMERIC(5,2) DEFAULT 80.00,
    overtime_threshold_daily NUMERIC(4,2) DEFAULT 8.00,
    overtime_threshold_weekly NUMERIC(4,2) DEFAULT 40.00,
    auto_detect BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Registros de horas extra
CREATE TABLE IF NOT EXISTS timetrack.overtime_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    time_entry_id UUID REFERENCES timetrack.time_entries(id) ON DELETE SET NULL,
    scheduled_hours NUMERIC(4,2) DEFAULT 8.00,
    actual_hours NUMERIC(4,2) NOT NULL,
    overtime_hours NUMERIC(4,2) NOT NULL,
    overtime_type TEXT DEFAULT 'pending' CHECK (overtime_type IN ('paid', 'compensated', 'pending')),
    approved_by UUID REFERENCES timetrack.profiles(id),
    approved_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, date)
);

-- 3. Calendario laboral — Festivos
CREATE TABLE IF NOT EXISTS timetrack.work_calendar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    date DATE NOT NULL,
    scope TEXT NOT NULL CHECK (scope IN ('national', 'regional', 'local')),
    region TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES timetrack.profiles(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Horarios de trabajo tipo
CREATE TABLE IF NOT EXISTS timetrack.work_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    department_id UUID REFERENCES timetrack.departments(id) ON DELETE SET NULL,
    monday_start TIME,
    monday_end TIME,
    tuesday_start TIME,
    tuesday_end TIME,
    wednesday_start TIME,
    wednesday_end TIME,
    thursday_start TIME,
    thursday_end TIME,
    friday_start TIME,
    friday_end TIME,
    saturday_start TIME,
    saturday_end TIME,
    sunday_start TIME,
    sunday_end TIME,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Alertas de cumplimiento
CREATE TABLE IF NOT EXISTS timetrack.compliance_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    alert_type TEXT NOT NULL CHECK (alert_type IN (
        'missed_clock_in',
        'missed_clock_out',
        'overtime_excess',
        'anomalous_entry',
        'late_arrival',
        'max_daily_exceeded',
        'max_weekly_exceeded'
    )),
    alert_date DATE NOT NULL,
    severity TEXT NOT NULL DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
    message TEXT,
    details JSONB,
    resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES timetrack.profiles(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE timetrack.overtime_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.overtime_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.work_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.work_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.compliance_alerts ENABLE ROW LEVEL SECURITY;

-- overtime_settings: todos leen, solo admin escribe
DO $$ BEGIN
CREATE POLICY "tt_overtime_settings_select" ON timetrack.overtime_settings
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "tt_overtime_settings_admin" ON timetrack.overtime_settings
    FOR ALL USING (timetrack.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- overtime_records: usuario ve los suyos, admin ve todos
DO $$ BEGIN
CREATE POLICY "tt_overtime_records_select_own" ON timetrack.overtime_records
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "tt_overtime_records_admin" ON timetrack.overtime_records
    FOR ALL USING (timetrack.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- work_calendar: todos leen, solo admin escribe
DO $$ BEGIN
CREATE POLICY "tt_work_calendar_select" ON timetrack.work_calendar
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "tt_work_calendar_admin" ON timetrack.work_calendar
    FOR ALL USING (timetrack.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- work_schedules: todos leen, solo admin escribe
DO $$ BEGIN
CREATE POLICY "tt_work_schedules_select" ON timetrack.work_schedules
    FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "tt_work_schedules_admin" ON timetrack.work_schedules
    FOR ALL USING (timetrack.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- compliance_alerts: usuario ve las suyas, admin ve todas
DO $$ BEGIN
CREATE POLICY "tt_compliance_alerts_select_own" ON timetrack.compliance_alerts
    FOR SELECT USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
CREATE POLICY "tt_compliance_alerts_admin" ON timetrack.compliance_alerts
    FOR ALL USING (timetrack.is_admin());
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tt_overtime_records_user ON timetrack.overtime_records(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_overtime_records_date ON timetrack.overtime_records(date);
CREATE INDEX IF NOT EXISTS idx_tt_work_calendar_date ON timetrack.work_calendar(date);
CREATE INDEX IF NOT EXISTS idx_tt_work_calendar_scope ON timetrack.work_calendar(scope);
CREATE INDEX IF NOT EXISTS idx_tt_compliance_alerts_user ON timetrack.compliance_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_compliance_alerts_type ON timetrack.compliance_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_tt_compliance_alerts_resolved ON timetrack.compliance_alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_tt_compliance_alerts_date ON timetrack.compliance_alerts(alert_date);

-- ============================================================
-- Datos iniciales — Festivos nacionales España 2026
-- ============================================================

INSERT INTO timetrack.work_calendar (name, date, scope, region, description) VALUES
    ('Año Nuevo', '2026-01-01', 'national', NULL, 'Día de Año Nuevo'),
    ('Epifanía del Señor', '2026-01-06', 'national', NULL, 'Día de Reyes'),
    ('Viernes Santo', '2026-04-03', 'national', NULL, 'Viernes Santo'),
    ('Día del Trabajo', '2026-05-01', 'national', NULL, 'Fiesta del Trabajo'),
    ('Asunción de la Virgen', '2026-08-15', 'national', NULL, 'Asunción de la Virgen María'),
    ('Fiesta Nacional de España', '2026-10-12', 'national', NULL, 'Día de la Hispanidad'),
    ('Todos los Santos', '2026-11-01', 'national', NULL, 'Día de Todos los Santos'),
    ('Día de la Constitución', '2026-12-06', 'national', NULL, 'Día de la Constitución Española'),
    ('Inmaculada Concepción', '2026-12-08', 'national', NULL, 'Inmaculada Concepción'),
    ('Navidad', '2026-12-25', 'national', NULL, 'Natividad del Señor')
ON CONFLICT DO NOTHING;

-- Horario por defecto
INSERT INTO timetrack.work_schedules (name, monday_start, monday_end, tuesday_start, tuesday_end, wednesday_start, wednesday_end, thursday_start, thursday_end, friday_start, friday_end, is_default) VALUES
    ('Jornada estándar L-V', '09:00', '18:00', '09:00', '18:00', '09:00', '18:00', '09:00', '18:00', '09:00', '15:00', true)
ON CONFLICT DO NOTHING;

-- Configuración por defecto de horas extra
INSERT INTO timetrack.overtime_settings (max_daily_hours, max_weekly_hours, max_annual_overtime_hours, overtime_threshold_daily, overtime_threshold_weekly, auto_detect) VALUES
    (10.00, 40.00, 80.00, 8.00, 40.00, true)
ON CONFLICT DO NOTHING;

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
