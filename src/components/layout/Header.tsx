import { Bell, Menu, Search, Play, Square } from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../ui';
import { useLocation } from 'react-router-dom';

interface HeaderProps {
    onMenuToggle: () => void;
}

const pageTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/history': 'Historial de fichajes',
    '/absences': 'Ausencias y Vacaciones',
    '/reports': 'Reportes',
    '/settings': 'Configuración',
    '/users': 'Gestión de Usuarios',
    '/users/create': 'Crear Usuario',
    '/payroll': 'Nóminas',
    '/hr-inbox': 'Comunicación RRHH',
    '/committee': 'Comité de Empresa',
    '/directory': 'Directorio',
    '/privacy': 'Privacidad y RGPD',
};

export function Header({ onMenuToggle }: HeaderProps) {
    const { user, currentStatus, clockIn, clockOut } = useAppStore();
    const location = useLocation();

    const pageTitle = pageTitles[location.pathname] || 'TimeTrack Pro';

    const isWorking = currentStatus === 'working' || currentStatus === 'on_break';

    const handleClockToggle = () => {
        if (isWorking) {
            clockOut();
        } else {
            clockIn();
        }
    };

    return (
        <header className="main-header">
            <div className="main-header-left">
                <button className="mobile-menu-btn" onClick={onMenuToggle}>
                    <Menu size={22} />
                </button>
                <h1 style={{
                    fontSize: '1.125rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    letterSpacing: '-0.02em'
                }}>
                    {pageTitle}
                </h1>
            </div>

            <div className="main-header-right">
                {/* Quick Clock Button */}
                <button
                    className={`quick-clock-btn ${isWorking ? 'active' : 'inactive'}`}
                    onClick={handleClockToggle}
                    title={isWorking ? 'Fichar salida' : 'Fichar entrada'}
                >
                    {isWorking ? (
                        <>
                            <Square size={14} fill="currentColor" />
                            <span className="hidden sm:inline">Salida</span>
                        </>
                    ) : (
                        <>
                            <Play size={14} fill="currentColor" />
                            <span className="hidden sm:inline">Entrada</span>
                        </>
                    )}
                </button>

                {/* Notifications */}
                <button
                    className="btn btn-ghost btn-sm"
                    style={{ position: 'relative', padding: '0.5rem' }}
                >
                    <Bell size={20} />
                    <span className="notification-dot" />
                </button>

                {/* User Avatar */}
                <div style={{ marginLeft: '0.25rem' }}>
                    <Avatar
                        name={user?.full_name || 'U'}
                        src={user?.avatar_url}
                        size="sm"
                    />
                </div>
            </div>
        </header>
    );
}
