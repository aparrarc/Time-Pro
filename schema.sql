--
-- TABLAS PRINCIPALES
--

-- 1. Departamentos
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    manager_id UUID,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Perfiles de usuario (extendiendo auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'employee' CHECK (role IN ('employee', 'supervisor', 'hr', 'admin')),
    department_id UUID REFERENCES public.departments(id),
    supervisor_id UUID REFERENCES public.profiles(id),
    hire_date DATE DEFAULT CURRENT_DATE,
    vacation_days INTEGER DEFAULT 22,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Registros de tiempo (entradas/salidas)
CREATE TABLE IF NOT EXISTS public.time_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    clock_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    clock_out TIMESTAMPTZ,
    notes TEXT,
    is_modified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Descansos (vinculados a un registro de tiempo)
CREATE TABLE IF NOT EXISTS public.breaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    time_entry_id UUID NOT NULL REFERENCES public.time_entries(id) ON DELETE CASCADE,
    break_type TEXT NOT NULL CHECK (break_type IN ('lunch', 'coffee', 'medical', 'other')),
    start_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    end_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Solicitudes de ausencia
CREATE TABLE IF NOT EXISTS public.absence_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    absence_type TEXT NOT NULL CHECK (absence_type IN ('vacation', 'sick', 'personal', 'other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reason TEXT,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewed_at TIMESTAMPTZ,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

--
-- FUNCIONES DE SEGURIDAD
--

-- Función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT role = 'admin'
    FROM public.profiles
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

--
-- SEGURIDAD (RLS)
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absence_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de perfiles
CREATE POLICY "Profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles." ON public.profiles FOR ALL USING (public.is_admin());

-- Políticas de departamentos
CREATE POLICY "Departments are viewable by everyone." ON public.departments FOR SELECT USING (true);
CREATE POLICY "Admins can manage departments." ON public.departments FOR ALL USING (public.is_admin());

-- Políticas de registros
CREATE POLICY "Users can view own time entries." ON public.time_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own time entries." ON public.time_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own time entries." ON public.time_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all time entries." ON public.time_entries FOR SELECT USING (public.is_admin());

-- Políticas de descansos
CREATE POLICY "Users can view own breaks." ON public.breaks FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.time_entries WHERE id = time_entry_id AND user_id = auth.uid())
);
CREATE POLICY "Users can insert own breaks." ON public.breaks FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.time_entries WHERE id = time_entry_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can view all breaks." ON public.breaks FOR SELECT USING (public.is_admin());

--
-- FUNCIONES Y TRIGGERS (Auto-perfil)
--

-- Función para manejar la creación de un perfil cuando se registra un usuario en Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, full_name, phone, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'first_name', 
    new.raw_user_meta_data->>'last_name',
    COALESCE(new.raw_user_meta_data->>'full_name', (new.raw_user_meta_data->>'first_name' || ' ' || new.raw_user_meta_data->>'last_name')),
    new.raw_user_meta_data->>'phone',
    'employee'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función al insertar en auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
