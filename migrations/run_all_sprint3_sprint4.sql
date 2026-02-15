-- ============================================================
-- TimeTrack Pro — Migración combinada: Sprint 3 + Sprint 4
-- Instancia: api.hdlma.com (Supabase self-hosted)
-- Fecha: 2026-02-15
-- EJECUTAR EN: SQL Editor de Supabase
-- ============================================================
-- NOTA: Todas las sentencias usan IF NOT EXISTS / IF EXISTS
-- para ser idempotentes (se puede ejecutar varias veces sin error)
-- ============================================================

-- ============================================================
-- PARTE 1: SPRINT 3 — Nuevas tablas
-- ============================================================

-- 1. Nóminas
CREATE TABLE IF NOT EXISTS timetrack.payrolls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    gross NUMERIC(10,2) NOT NULL,
    net NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'error')),
    pdf_url TEXT,
    payment_date DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, month, year)
);

-- 2. Mensajes RRHH (buzón interno)
CREATE TABLE IF NOT EXISTS timetrack.hr_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'general'
        CHECK (category IN ('general', 'nomina', 'vacaciones', 'contrato', 'formacion', 'otro')),
    status TEXT DEFAULT 'open'
        CHECK (status IN ('open', 'replied', 'closed')),
    body TEXT NOT NULL,
    replied_by UUID REFERENCES timetrack.profiles(id),
    replied_at TIMESTAMPTZ,
    reply_body TEXT,
    unread BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Documentos del comité de empresa
CREATE TABLE IF NOT EXISTS timetrack.committee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    doc_type TEXT NOT NULL
        CHECK (doc_type IN ('announcement', 'minutes', 'document')),
    content TEXT,
    file_url TEXT,
    file_size TEXT,
    pinned BOOLEAN DEFAULT false,
    attendees INTEGER,
    published_at DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Consentimientos RGPD
CREATE TABLE IF NOT EXISTS timetrack.consents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    consent_type TEXT NOT NULL
        CHECK (consent_type IN ('geolocation', 'biometric', 'communication', 'analytics')),
    granted BOOLEAN DEFAULT false,
    granted_at TIMESTAMPTZ,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, consent_type)
);

-- 5. Solicitudes ARCO (derechos RGPD)
CREATE TABLE IF NOT EXISTS timetrack.arco_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    right_type TEXT NOT NULL
        CHECK (right_type IN ('access', 'rectification', 'erasure', 'objection')),
    status TEXT DEFAULT 'pending'
        CHECK (status IN ('pending', 'in_progress', 'completed', 'rejected')),
    reason TEXT,
    resolved_by UUID REFERENCES timetrack.profiles(id),
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- PARTE 2: SPRINT 4 — Geolocalización, Firma, Audit Log
-- ============================================================

-- 6. Geolocalización en fichajes
ALTER TABLE timetrack.time_entries
    ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7),
    ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7);

-- 7. Firma digital de nóminas
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

-- 8. Audit Log — Registro inmutable (RDL 8/2019)
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

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

-- Sprint 3 tables
ALTER TABLE timetrack.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.hr_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.committee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.arco_requests ENABLE ROW LEVEL SECURITY;

-- Sprint 4 tables
ALTER TABLE timetrack.payroll_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.audit_logs ENABLE ROW LEVEL SECURITY;

-- Payrolls
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_payrolls_select_own') THEN
        CREATE POLICY "tt_payrolls_select_own" ON timetrack.payrolls
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_payrolls_admin') THEN
        CREATE POLICY "tt_payrolls_admin" ON timetrack.payrolls
            FOR ALL USING (timetrack.is_admin());
    END IF;
END $$;

-- HR Messages
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_hr_messages_select_own') THEN
        CREATE POLICY "tt_hr_messages_select_own" ON timetrack.hr_messages
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_hr_messages_insert_own') THEN
        CREATE POLICY "tt_hr_messages_insert_own" ON timetrack.hr_messages
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_hr_messages_admin') THEN
        CREATE POLICY "tt_hr_messages_admin" ON timetrack.hr_messages
            FOR ALL USING (timetrack.is_admin());
    END IF;
END $$;

-- Committee Documents
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_committee_select') THEN
        CREATE POLICY "tt_committee_select" ON timetrack.committee_documents
            FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_committee_admin') THEN
        CREATE POLICY "tt_committee_admin" ON timetrack.committee_documents
            FOR ALL USING (timetrack.is_admin());
    END IF;
END $$;

-- Consents
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_consents_select_own') THEN
        CREATE POLICY "tt_consents_select_own" ON timetrack.consents
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_consents_upsert_own') THEN
        CREATE POLICY "tt_consents_upsert_own" ON timetrack.consents
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_consents_update_own') THEN
        CREATE POLICY "tt_consents_update_own" ON timetrack.consents
            FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_consents_admin') THEN
        CREATE POLICY "tt_consents_admin" ON timetrack.consents
            FOR SELECT USING (timetrack.is_admin());
    END IF;
END $$;

-- ARCO Requests
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_arco_select_own') THEN
        CREATE POLICY "tt_arco_select_own" ON timetrack.arco_requests
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_arco_insert_own') THEN
        CREATE POLICY "tt_arco_insert_own" ON timetrack.arco_requests
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_arco_admin') THEN
        CREATE POLICY "tt_arco_admin" ON timetrack.arco_requests
            FOR ALL USING (timetrack.is_admin());
    END IF;
END $$;

-- Payroll Signatures
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_signatures_select_own') THEN
        CREATE POLICY "tt_signatures_select_own" ON timetrack.payroll_signatures
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_signatures_insert_own') THEN
        CREATE POLICY "tt_signatures_insert_own" ON timetrack.payroll_signatures
            FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_signatures_admin') THEN
        CREATE POLICY "tt_signatures_admin" ON timetrack.payroll_signatures
            FOR ALL USING (timetrack.is_admin());
    END IF;
END $$;

-- Audit Logs (inmutable: solo INSERT, nunca UPDATE/DELETE)
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_audit_insert') THEN
        CREATE POLICY "tt_audit_insert" ON timetrack.audit_logs
            FOR INSERT WITH CHECK (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_audit_select_admin') THEN
        CREATE POLICY "tt_audit_select_admin" ON timetrack.audit_logs
            FOR SELECT USING (timetrack.is_admin());
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'tt_audit_select_own') THEN
        CREATE POLICY "tt_audit_select_own" ON timetrack.audit_logs
            FOR SELECT USING (auth.uid() = user_id);
    END IF;
END $$;

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Sprint 3
CREATE INDEX IF NOT EXISTS idx_tt_payrolls_user ON timetrack.payrolls(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_payrolls_period ON timetrack.payrolls(year, month);
CREATE INDEX IF NOT EXISTS idx_tt_hr_messages_user ON timetrack.hr_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_hr_messages_status ON timetrack.hr_messages(status);
CREATE INDEX IF NOT EXISTS idx_tt_committee_type ON timetrack.committee_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_tt_consents_user ON timetrack.consents(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_arco_user ON timetrack.arco_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_arco_status ON timetrack.arco_requests(status);

-- Sprint 4
CREATE INDEX IF NOT EXISTS idx_tt_signatures_payroll ON timetrack.payroll_signatures(payroll_id);
CREATE INDEX IF NOT EXISTS idx_tt_signatures_user ON timetrack.payroll_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_audit_user ON timetrack.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_audit_action ON timetrack.audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_tt_audit_created ON timetrack.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tt_audit_entity ON timetrack.audit_logs(entity_type, entity_id);

-- ============================================================
-- FIN DE MIGRACIÓN COMBINADA
-- ============================================================
