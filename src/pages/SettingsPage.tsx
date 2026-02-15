import { useState, useEffect } from 'react';
import { Bell, Globe, Shield, LogOut, ChevronRight, Camera, Mail, Phone, Building, Briefcase, Sun, Moon, Monitor } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from '../components/ui';
import { useAppStore } from '../store/appStore';

type ThemeMode = 'light' | 'dark' | 'system';

function getStoredTheme(): ThemeMode {
    return (localStorage.getItem('timetrack-theme') as ThemeMode) || 'light';
}

function applyTheme(mode: ThemeMode) {
    let resolved: 'light' | 'dark' = mode === 'system'
        ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
        : mode;
    if (resolved === 'dark') {
        document.documentElement.dataset.theme = 'dark';
    } else {
        delete document.documentElement.dataset.theme;
    }
    localStorage.setItem('timetrack-theme', mode);
}

export function SettingsPage() {
    const navigate = useNavigate();
    const { user, language, logout } = useAppStore();
    const [theme, setTheme] = useState<ThemeMode>(getStoredTheme);

    useEffect(() => {
        applyTheme(theme);
    }, [theme]);

    // Listen for system theme changes when in 'system' mode
    useEffect(() => {
        if (theme !== 'system') return;
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme('system');
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
    }, [theme]);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const themeOptions: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
        { value: 'light', label: 'Claro', icon: Sun },
        { value: 'dark', label: 'Oscuro', icon: Moon },
        { value: 'system', label: 'Sistema', icon: Monitor },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Configuración</h1>
                    <p className="page-subtitle">Gestiona tu perfil y preferencias de la aplicación</p>
                </div>
            </div>

            {/* Profile Card */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div className="flex items-center gap-5">
                    <div className="relative">
                        <Avatar
                            name={user?.full_name || 'Usuario'}
                            src={user?.avatar_url}
                            size="lg"
                        />
                        <button
                            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: 'var(--color-brand)', border: '2px solid var(--color-surface)' }}
                        >
                            <Camera size={12} className="text-white" />
                        </button>
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            {user?.full_name || 'Usuario Demo'}
                        </h2>
                        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                            {user?.role === 'employee' ? 'Empleado' :
                                user?.role === 'supervisor' ? 'Supervisor' :
                                    user?.role === 'hr' ? 'Recursos Humanos' : 'Administrador'}
                        </p>
                    </div>
                    <button className="btn btn-outline" style={{ fontSize: '0.8125rem' }}>
                        Editar perfil
                    </button>
                </div>

                {/* Profile details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6" style={{ borderTop: '1px solid var(--color-border)' }}>
                    {[
                        { icon: Mail, label: 'Email', value: user?.email || 'demo@example.com' },
                        { icon: Phone, label: 'Teléfono', value: user?.phone || 'No configurado' },
                        { icon: Building, label: 'Departamento', value: user?.department_id ? 'Departamento' : 'Sin asignar' },
                        { icon: Briefcase, label: 'Fecha alta', value: user?.hire_date ? new Date(user.hire_date).toLocaleDateString('es-ES') : 'No registrada' },
                    ].map(({ icon: Icon, label, value }) => (
                        <div key={label} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-surface-hover)' }}>
                                <Icon size={16} style={{ color: 'var(--color-text-muted)' }} />
                            </div>
                            <div>
                                <p className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                                <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Preferences */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Preferencias
                </h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Theme / Appearance */}
                    <div
                        className="w-full flex items-center gap-4 py-4 px-5"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-icon-bg-brand)' }}>
                            {theme === 'dark'
                                ? <Moon size={18} style={{ color: 'var(--color-brand)' }} />
                                : <Sun size={18} style={{ color: 'var(--color-brand)' }} />
                            }
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Apariencia</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                {theme === 'light' ? 'Modo claro' : theme === 'dark' ? 'Modo oscuro' : 'Automático del sistema'}
                            </p>
                        </div>
                        <div style={{
                            display: 'flex',
                            gap: '0.25rem',
                            padding: '0.25rem',
                            background: 'var(--color-surface-hover)',
                            borderRadius: 'var(--radius-lg)',
                        }}>
                            {themeOptions.map(({ value, label, icon: ThemeIcon }) => (
                                <button
                                    key={value}
                                    onClick={() => setTheme(value)}
                                    title={label}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.375rem 0.75rem',
                                        borderRadius: 'var(--radius-md)',
                                        fontSize: '0.75rem',
                                        fontWeight: 600,
                                        border: 'none',
                                        cursor: 'pointer',
                                        transition: 'all 150ms',
                                        fontFamily: 'inherit',
                                        background: theme === value ? 'var(--color-surface)' : 'transparent',
                                        color: theme === value ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                        boxShadow: theme === value ? 'var(--shadow-xs)' : 'none',
                                    }}
                                >
                                    <ThemeIcon size={14} />
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Language */}
                    <button
                        className="w-full flex items-center gap-4 py-4 px-5 transition-colors"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-icon-bg-brand)' }}>
                            <Globe size={18} style={{ color: 'var(--color-brand)' }} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Idioma</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{language === 'es' ? 'Español' : language === 'ca' ? 'Català' : 'English'}</p>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                    </button>

                    {/* Notifications */}
                    <button
                        className="w-full flex items-center gap-4 py-4 px-5 transition-colors"
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-icon-bg-error)' }}>
                            <Bell size={18} style={{ color: 'var(--color-error)' }} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Notificaciones</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Activadas</p>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                    </button>
                </div>
            </div>

            {/* Security */}
            <div className="space-y-3">
                <h3 className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Seguridad y privacidad
                </h3>
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <Link
                        to="/privacy"
                        className="w-full flex items-center gap-4 py-4 px-5 transition-colors"
                        style={{ display: 'flex', borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-icon-bg-success)' }}>
                            <Shield size={18} style={{ color: 'var(--color-success)' }} />
                        </div>
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>Privacidad RGPD</p>
                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Gestiona tus datos y consentimientos</p>
                        </div>
                        <ChevronRight size={18} style={{ color: 'var(--color-text-muted)' }} />
                    </Link>
                </div>
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                style={{
                    background: 'var(--color-error-light)',
                    color: 'var(--color-error)',
                    border: '1px solid var(--color-error-light)',
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
            >
                <LogOut size={18} />
                Cerrar sesión
            </button>

            {/* Version */}
            <p className="text-center text-xs pb-4" style={{ color: 'var(--color-text-muted)' }}>
                TimeTrack Pro v2.0.0 · Cumplimiento RGPD España
            </p>
        </div>
    );
}
