-- ============================================================
-- TimeTrack Pro — Migración 003: Tablas Sprint 4
-- Instancia: api.hdlma.com (Supabase self-hosted)
-- Fecha: 2026-02-15
-- ============================================================

-- ============================================================
-- 1. GEOLOCALIZACIÓN EN FICHAJES
-- ============================================================

ALTER TABLE timetrack.time_entries
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

-- ============================================================
-- 2. FIRMA DIGITAL DE NÓMINAS
-- ============================================================

CREATE TABLE IF NOT EXISTS timetrack.payroll_signatures (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payroll_id UUID NOT NULL REFERENCES timetrack.payrolls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    signature_data TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    signed_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(payroll_id, user_id)
);

ALTER TABLE timetrack.payroll_signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tt_signatures_select_own" ON timetrack.payroll_signatures
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tt_signatures_insert_own" ON timetrack.payroll_signatures
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tt_signatures_admin" ON timetrack.payroll_signatures
    FOR ALL USING (timetrack.is_admin());

CREATE INDEX IF NOT EXISTS idx_tt_signatures_payroll ON timetrack.payroll_signatures(payroll_id);
CREATE INDEX IF NOT EXISTS idx_tt_signatures_user ON timetrack.payroll_signatures(user_id);

-- ============================================================
-- 3. AUDIT LOG — Registro inmutable (RDL 8/2019)
-- ============================================================

CREATE TABLE IF NOT EXISTS timetrack.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES timetrack.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE timetrack.audit_logs ENABLE ROW LEVEL SECURITY;

-- Solo INSERT — nunca UPDATE/DELETE (inmutabilidad)
CREATE POLICY "tt_audit_insert" ON timetrack.audit_logs
    FOR INSERT WITH CHECK (true);
CREATE POLICY "tt_audit_select_admin" ON timetrack.audit_logs
    FOR SELECT USING (timetrack.is_admin());
-- Empleados pueden ver sus propios logs
CREATE POLICY "tt_audit_select_own" ON timetrack.audit_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tt_audit_user ON timetrack.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_audit_action ON timetrack.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_tt_audit_created ON timetrack.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tt_audit_entity ON timetrack.audit_logs(entity_type, entity_id);

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
