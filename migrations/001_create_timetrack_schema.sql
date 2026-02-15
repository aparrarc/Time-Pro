-- ============================================================
-- TimeTrack Pro — Migración 001: Schema timetrack
-- Instancia: api.hdlma.com (Supabase self-hosted)
-- Fecha: 2026-02-15
-- ============================================================

-- 1. Crear schema
CREATE SCHEMA IF NOT EXISTS timetrack;

-- 2. Permisos para roles de Supabase
GRANT USAGE ON SCHEMA timetrack TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA timetrack TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA timetrack TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA timetrack TO anon, authenticated, service_role;

-- Permisos por defecto para futuras tablas
ALTER DEFAULT PRIVILEGES IN SCHEMA timetrack
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA timetrack
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA timetrack
  GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- ============================================================
-- TABLAS
-- ============================================================

-- 1. Departamentos
CREATE TABLE IF NOT EXISTS timetrack.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    manager_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Perfiles de usuario (extendiendo auth.users)
CREATE TABLE IF NOT EXISTS timetrack.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'supervisor', 'hr', 'admin')),
    department_id UUID REFERENCES timetrack.departments(id),
    supervisor_id UUID REFERENCES timetrack.profiles(id),
    hire_date DATE DEFAULT CURRENT_DATE,
    vacation_days INTEGER DEFAULT 22,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Registros de tiempo (entradas/salidas)
CREATE TABLE IF NOT EXISTS timetrack.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out TIMESTAMPTZ,
    notes TEXT,
    is_modified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Descansos (vinculados a un registro de tiempo)
CREATE TABLE IF NOT EXISTS timetrack.breaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_entry_id UUID NOT NULL REFERENCES timetrack.time_entries(id) ON DELETE CASCADE,
    break_type TEXT NOT NULL CHECK (break_type IN ('lunch', 'coffee', 'medical', 'other')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Solicitudes de ausencia
CREATE TABLE IF NOT EXISTS timetrack.absence_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES timetrack.profiles(id) ON DELETE CASCADE,
    absence_type TEXT NOT NULL CHECK (absence_type IN ('vacation', 'sick', 'personal', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    reviewed_by UUID REFERENCES timetrack.profiles(id),
    reviewed_at TIMESTAMPTZ,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- FUNCIONES DE SEGURIDAD
-- ============================================================

-- Función para verificar si un usuario es admin en TimeTrack
CREATE OR REPLACE FUNCTION timetrack.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM timetrack.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = timetrack;

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE timetrack.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetrack.absence_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de departments
CREATE POLICY "tt_departments_select" ON timetrack.departments
  FOR SELECT USING (true);
CREATE POLICY "tt_departments_admin" ON timetrack.departments
  FOR ALL USING (timetrack.is_admin());

-- Políticas de profiles
CREATE POLICY "tt_profiles_select" ON timetrack.profiles
  FOR SELECT USING (true);
CREATE POLICY "tt_profiles_update_own" ON timetrack.profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "tt_profiles_admin" ON timetrack.profiles
  FOR ALL USING (timetrack.is_admin());

-- Políticas de time_entries
CREATE POLICY "tt_time_entries_select_own" ON timetrack.time_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tt_time_entries_insert_own" ON timetrack.time_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tt_time_entries_update_own" ON timetrack.time_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tt_time_entries_admin" ON timetrack.time_entries
  FOR SELECT USING (timetrack.is_admin());

-- Políticas de breaks
CREATE POLICY "tt_breaks_select_own" ON timetrack.breaks
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM timetrack.time_entries WHERE id = time_entry_id AND user_id = auth.uid())
  );
CREATE POLICY "tt_breaks_insert_own" ON timetrack.breaks
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM timetrack.time_entries WHERE id = time_entry_id AND user_id = auth.uid())
  );
CREATE POLICY "tt_breaks_update_own" ON timetrack.breaks
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM timetrack.time_entries WHERE id = time_entry_id AND user_id = auth.uid())
  );
CREATE POLICY "tt_breaks_admin" ON timetrack.breaks
  FOR SELECT USING (timetrack.is_admin());

-- Políticas de absence_requests
CREATE POLICY "tt_absence_select_own" ON timetrack.absence_requests
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tt_absence_insert_own" ON timetrack.absence_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tt_absence_update_own" ON timetrack.absence_requests
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tt_absence_admin" ON timetrack.absence_requests
  FOR ALL USING (timetrack.is_admin());

-- ============================================================
-- TRIGGER: Auto-crear perfil en timetrack al registrar usuario
-- ============================================================

-- Función específica para TimeTrack (NO sobreescribe la de public)
CREATE OR REPLACE FUNCTION timetrack.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO timetrack.profiles (id, email, first_name, last_name, full_name, phone, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      CONCAT_WS(' ', NEW.raw_user_meta_data->>'first_name', NEW.raw_user_meta_data->>'last_name')
    ),
    NEW.raw_user_meta_data->>'phone',
    'employee'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER
   SET search_path = timetrack;

-- Trigger separado (nombre único para no pisar el de public)
DROP TRIGGER IF EXISTS on_auth_user_created_timetrack ON auth.users;
CREATE TRIGGER on_auth_user_created_timetrack
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION timetrack.handle_new_user();

-- ============================================================
-- ÍNDICES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_tt_profiles_email ON timetrack.profiles(email);
CREATE INDEX IF NOT EXISTS idx_tt_profiles_department ON timetrack.profiles(department_id);
CREATE INDEX IF NOT EXISTS idx_tt_time_entries_user ON timetrack.time_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_time_entries_clock_in ON timetrack.time_entries(clock_in);
CREATE INDEX IF NOT EXISTS idx_tt_breaks_entry ON timetrack.breaks(time_entry_id);
CREATE INDEX IF NOT EXISTS idx_tt_absence_user ON timetrack.absence_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_tt_absence_status ON timetrack.absence_requests(status);

-- ============================================================
-- FIN DE MIGRACIÓN
-- ============================================================
