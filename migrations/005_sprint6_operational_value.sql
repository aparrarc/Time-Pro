-- ============================================================
-- Sprint 6: Valor Operativo
-- Tablas: shift_templates, shift_assignments, payroll_details, documents
-- ============================================================

-- ── 1. Plantillas de turno ─────────────────────────────

CREATE TABLE IF NOT EXISTS timetrack.shift_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_minutes INT NOT NULL DEFAULT 60,
    color TEXT NOT NULL DEFAULT '#6366f1',
    is_night_shift BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Asignación de turnos ────────────────────────────

CREATE TABLE IF NOT EXISTS timetrack.shift_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    shift_template_id UUID NOT NULL REFERENCES timetrack.shift_templates(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('assigned', 'swap_requested', 'swapped', 'completed', 'absent')),
    swap_with_user_id UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,
    swap_approved_by UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, date)
);

-- ── 3. Detalle de nóminas ──────────────────────────────

CREATE TABLE IF NOT EXISTS timetrack.payroll_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    month INT NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INT NOT NULL CHECK (year >= 2020),
    -- Importes
    base_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
    seniority_bonus NUMERIC(10,2) NOT NULL DEFAULT 0,
    transport_allowance NUMERIC(10,2) NOT NULL DEFAULT 0,
    meal_allowance NUMERIC(10,2) NOT NULL DEFAULT 0,
    overtime_pay NUMERIC(10,2) NOT NULL DEFAULT 0,
    other_bonuses NUMERIC(10,2) NOT NULL DEFAULT 0,
    -- Deducciones
    irpf_percent NUMERIC(5,2) NOT NULL DEFAULT 15.00,
    irpf_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    ss_employee_percent NUMERIC(5,2) NOT NULL DEFAULT 6.35,
    ss_employee_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    ss_company_percent NUMERIC(5,2) NOT NULL DEFAULT 29.90,
    ss_company_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    other_deductions NUMERIC(10,2) NOT NULL DEFAULT 0,
    -- Totales
    gross_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    net_total NUMERIC(10,2) NOT NULL DEFAULT 0,
    company_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
    -- Estado
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid', 'error')),
    approved_by UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    payment_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, month, year)
);

-- ── 4. Documentos RRHH ────────────────────────────────

CREATE TABLE IF NOT EXISTS timetrack.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('contract', 'payslip', 'certificate', 'training', 'disciplinary', 'other')),
    description TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size_bytes BIGINT,
    mime_type TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'pending_signature', 'archived')),
    expiry_date DATE,
    uploaded_by UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ────────────────────────────────────────────────

ALTER TABLE timetrack.shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.payroll_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.documents ENABLE ROW LEVEL SECURITY;

-- shift_templates: todos leen, admin escribe
CREATE POLICY "shift_templates_select" ON timetrack.shift_templates FOR SELECT USING (true);
CREATE POLICY "shift_templates_admin" ON timetrack.shift_templates FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- shift_assignments: empleado ve los suyos, admin ve todos
CREATE POLICY "shift_assignments_own" ON timetrack.shift_assignments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "shift_assignments_admin" ON timetrack.shift_assignments FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- payroll_details: empleado ve los suyos, admin gestiona todos
CREATE POLICY "payroll_details_own" ON timetrack.payroll_details FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "payroll_details_admin" ON timetrack.payroll_details FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- documents: empleado ve los suyos, admin gestiona todos
CREATE POLICY "documents_own" ON timetrack.documents FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "documents_admin" ON timetrack.documents FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── Índices ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_shift_assignments_user_date ON timetrack.shift_assignments(user_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_date ON timetrack.shift_assignments(date);
CREATE INDEX IF NOT EXISTS idx_payroll_details_user_period ON timetrack.payroll_details(user_id, year, month);
CREATE INDEX IF NOT EXISTS idx_documents_user ON timetrack.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON timetrack.documents(category);

-- ── Seed: Plantillas de turno ──────────────────────────

INSERT INTO timetrack.shift_templates (name, code, start_time, end_time, break_minutes, color, is_night_shift) VALUES
    ('Mañana', 'M', '06:00', '14:00', 30, '#22c55e', false),
    ('Tarde', 'T', '14:00', '22:00', 30, '#f59e0b', false),
    ('Noche', 'N', '22:00', '06:00', 30, '#6366f1', true),
    ('Jornada Partida', 'P', '09:00', '18:00', 60, '#3b82f6', false),
    ('Jornada Intensiva', 'I', '07:00', '15:00', 30, '#8b5cf6', false),
    ('Libre', 'L', '00:00', '00:00', 0, '#94a3b8', false)
ON CONFLICT DO NOTHING;
