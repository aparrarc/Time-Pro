-- ============================================================
-- TimeTrack Pro — Migración 002: Tablas Sprint 3
-- Instancia: api.hdlma.com (Supabase self-hosted)
-- Fecha: 2026-02-15
-- ============================================================

-- ============================================================
-- TABLAS
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
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE timetrack.payrolls ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.hr_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.committee_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.arco_requests ENABLE ROW LEVEL SECURITY;

-- Payrolls: empleado ve las suyas, admin ve todas
CREATE POLICY "tt_payrolls_select_own" ON timetrack.payrolls
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tt_payrolls_admin" ON timetrack.payrolls
  FOR ALL USING (timetrack.is_admin());

-- HR Messages: empleado ve los suyos, admin ve todos
CREATE POLICY "tt_hr_messages_select_own" ON timetrack.hr_messages
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tt_hr_messages_insert_own" ON timetrack.hr_messages
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tt_hr_messages_admin" ON timetrack.hr_messages
  FOR ALL USING (timetrack.is_admin());

-- Committee Documents: todos ven, solo admin escribe
CREATE POLICY "tt_committee_select" ON timetrack.committee_documents
  FOR SELECT USING (true);
CREATE POLICY "tt_committee_admin" ON timetrack.committee_documents
  FOR ALL USING (timetrack.is_admin());

-- Consents: cada usuario gestiona los suyos
CREATE POLICY "tt_consents_select_own" ON timetrack.consents
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tt_consents_upsert_own" ON timetrack.consents
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tt_consents_update_own" ON timetrack.consents
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tt_consents_admin" ON timetrack.consents
  FOR SELECT USING (timetrack.is_admin());

-- ARCO Requests: empleado inserta/ve las suyas, admin gestiona todas
CREATE POLICY "tt_arco_select_own" ON timetrack.arco_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tt_arco_insert_own" ON timetrack.arco_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tt_arco_admin" ON timetrack.arco_requests
  FOR ALL USING (timetrack.is_admin());

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tt_payrolls_user ON timetrack.payrolls(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_payrolls_period ON timetrack.payrolls(year, month);
CREATE INDEX IF NOT EXISTS idx_tt_hr_messages_user ON timetrack.hr_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_hr_messages_status ON timetrack.hr_messages(status);
CREATE INDEX IF NOT EXISTS idx_tt_committee_type ON timetrack.committee_documents(doc_type);
CREATE INDEX IF NOT EXISTS idx_tt_consents_user ON timetrack.consents(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_arco_user ON timetrack.arco_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_arco_status ON timetrack.arco_requests(status);

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
