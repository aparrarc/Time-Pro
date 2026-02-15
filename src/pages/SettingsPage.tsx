import { Bell, Globe, Shield, LogOut, ChevronRight, Camera, Mail, Phone, Building, Briefcase } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Avatar } from '../components/ui';
import { useAppStore } from '../store/appStore';

export function SettingsPage() {
    const navigate = useNavigate();
    const { user, language, logout } = useAppStore();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

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
                            style={{ background: 'var(--color-primary)', border: '2px solid white' }}
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
                            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--color-bg-secondary)' }}>
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
                    {/* Language */}
                    <button
                        className="w-full flex items-center gap-4 py-4 px-5 transition-colors"
                        style={{ borderBottom: '1px solid var(--color-border)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#eef2ff' }}>
                            <Globe size={18} style={{ color: '#6366f1' }} />
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
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#fef2f2' }}>
                            <Bell size={18} style={{ color: '#ef4444' }} />
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
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#ecfdf5' }}>
                            <Shield size={18} style={{ color: '#10b981' }} />
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
                style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
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
