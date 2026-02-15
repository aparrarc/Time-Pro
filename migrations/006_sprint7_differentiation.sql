-- ============================================================
-- Sprint 7: Diferenciación
-- Tablas: onboarding_progress, surveys, survey_questions,
--         survey_responses, expenses, siltra_exports
-- ============================================================

-- ── 1. Progreso Onboarding ─────────────────────────────

CREATE TABLE IF NOT EXISTS timetrack.onboarding_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    step_welcome BOOLEAN NOT NULL DEFAULT false,
    step_profile BOOLEAN NOT NULL DEFAULT false,
    step_preferences BOOLEAN NOT NULL DEFAULT false,
    step_ready BOOLEAN NOT NULL DEFAULT false,
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 2. Encuestas de Clima Laboral ──────────────────────

CREATE TABLE IF NOT EXISTS timetrack.surveys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'closed', 'archived')),
    is_anonymous BOOLEAN NOT NULL DEFAULT true,
    start_date DATE,
    end_date DATE,
    created_by UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timetrack.survey_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES timetrack.surveys(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL DEFAULT 'rating' CHECK (question_type IN ('rating', 'text', 'multiple_choice', 'yes_no')),
    options JSONB,  -- for multiple_choice: ["option1","option2",...]
    sort_order INT NOT NULL DEFAULT 0,
    is_required BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS timetrack.survey_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    survey_id UUID NOT NULL REFERENCES timetrack.surveys(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES timetrack.survey_questions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,  -- NULL if anonymous
    rating_value INT CHECK (rating_value BETWEEN 1 AND 5),
    text_value TEXT,
    choice_value TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 3. Gestión de Gastos ───────────────────────────────

CREATE TABLE IF NOT EXISTS timetrack.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('transport', 'meals', 'accommodation', 'supplies', 'training', 'other')),
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    currency TEXT NOT NULL DEFAULT 'EUR',
    description TEXT NOT NULL,
    expense_date DATE NOT NULL,
    receipt_url TEXT,
    receipt_name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'reimbursed')),
    approved_by UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── 4. Exportaciones SILTRA ────────────────────────────

CREATE TABLE IF NOT EXISTS timetrack.siltra_exports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    export_type TEXT NOT NULL CHECK (export_type IN ('AFI', 'FDI', 'FAN')),
    period_month INT CHECK (period_month BETWEEN 1 AND 12),
    period_year INT NOT NULL CHECK (period_year >= 2020),
    file_name TEXT NOT NULL,
    records_count INT NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'accepted', 'rejected')),
    generated_by UUID REFERENCES timetrack.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ────────────────────────────────────────────────

ALTER TABLE timetrack.onboarding_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.survey_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.survey_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.siltra_exports ENABLE ROW LEVEL SECURITY;

-- onboarding_progress: cada usuario ve/edita el suyo
CREATE POLICY "onboarding_own" ON timetrack.onboarding_progress FOR ALL USING (user_id = auth.uid());
CREATE POLICY "onboarding_admin" ON timetrack.onboarding_progress FOR SELECT USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- surveys: todos leen las activas, admin gestiona todas
CREATE POLICY "surveys_select_active" ON timetrack.surveys FOR SELECT USING (status = 'active' OR
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "surveys_admin" ON timetrack.surveys FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- survey_questions: todos leen preguntas de encuestas activas
CREATE POLICY "questions_select" ON timetrack.survey_questions FOR SELECT USING (
    EXISTS (SELECT 1 FROM timetrack.surveys WHERE id = survey_id AND (status = 'active' OR
        EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')))
);
CREATE POLICY "questions_admin" ON timetrack.survey_questions FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- survey_responses: empleado inserta las suyas, admin lee todas
CREATE POLICY "responses_insert" ON timetrack.survey_responses FOR INSERT WITH CHECK (
    user_id = auth.uid() OR user_id IS NULL
);
CREATE POLICY "responses_admin" ON timetrack.survey_responses FOR SELECT USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- expenses: empleado ve las suyas, admin gestiona todas
CREATE POLICY "expenses_own" ON timetrack.expenses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "expenses_insert" ON timetrack.expenses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "expenses_admin" ON timetrack.expenses FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- siltra_exports: solo admin
CREATE POLICY "siltra_admin" ON timetrack.siltra_exports FOR ALL USING (
    EXISTS (SELECT 1 FROM timetrack.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ── Índices ────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_onboarding_user ON timetrack.onboarding_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_surveys_status ON timetrack.surveys(status);
CREATE INDEX IF NOT EXISTS idx_survey_questions_survey ON timetrack.survey_questions(survey_id);
CREATE INDEX IF NOT EXISTS idx_survey_responses_survey ON timetrack.survey_responses(survey_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user ON timetrack.expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_status ON timetrack.expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON timetrack.expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_siltra_exports_type ON timetrack.siltra_exports(export_type);
