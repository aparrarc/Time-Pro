import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    CalendarDays,
    BarChart3,
    Settings,
    Users,
    Receipt,
    MessageSquare,
    Building2,
    Contact,
    Shield,
    LogOut,
    ChevronRight,
    Timer
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';
import { Avatar } from '../ui';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const navSections = [
    {
        label: 'General',
        items: [
            { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
            { path: '/directory', icon: Contact, label: 'Directorio' },
        ]
    },
    {
        label: 'Tiempo',
        items: [
            { path: '/history', icon: Clock, label: 'Historial fichajes' },
            { path: '/absences', icon: CalendarDays, label: 'Ausencias' },
            { path: '/reports', icon: BarChart3, label: 'Reportes' },
        ]
    },
    {
        label: 'RRHH',
        items: [
            { path: '/payroll', icon: Receipt, label: 'Nóminas', badge: 'Nuevo' },
            { path: '/hr-inbox', icon: MessageSquare, label: 'Comunicación RRHH', badge: 'Nuevo' },
        ]
    },
    {
        label: 'Empresa',
        items: [
            { path: '/committee', icon: Building2, label: 'Comité de Empresa', badge: 'Nuevo' },
        ]
    },
];

const adminSection = {
    label: 'Administración',
    items: [
        { path: '/users', icon: Users, label: 'Gestión Usuarios' },
    ]
};

const roleLabels: Record<string, string> = {
    admin: 'Administrador',
    supervisor: 'Supervisor',
    hr: 'RRHH',
    employee: 'Empleado',
};

export function Sidebar({ isOpen, onClose }: SidebarProps) {
    const { user, currentStatus, logout } = useAppStore();
    const location = useLocation();
    const isAdmin = user?.role === 'admin';

    const allSections = isAdmin ? [...navSections, adminSection] : navSections;

    const statusLabels: Record<string, string> = {
        working: 'Trabajando',
        on_break: 'En pausa',
        not_working: 'Sin fichar',
    };

    return (
        <>
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay ${isOpen ? 'open' : ''}`}
                onClick={onClose}
            />

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Header */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <Timer size={20} color="white" />
                    </div>
                    <span className="sidebar-brand-name">TimeTrack Pro</span>
                </div>

                {/* Navigation */}
                <nav className="sidebar-nav">
                    {allSections.map((section) => (
                        <div key={section.label} className="sidebar-section">
                            <div className="sidebar-section-label">{section.label}</div>
                            {section.items.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.path === '/'}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        `sidebar-item ${isActive ? 'active' : ''}`
                                    }
                                >
                                    <item.icon size={20} className="sidebar-item-icon" />
                                    <span>{item.label}</span>
                                    {'badge' in item && item.badge && (
                                        <span className="sidebar-item-badge">{item.badge}</span>
                                    )}
                                </NavLink>
                            ))}
                        </div>
                    ))}

                    {/* Privacy & RGPD */}
                    <div className="sidebar-section">
                        <div className="sidebar-section-label">Legal</div>
                        <NavLink
                            to="/privacy"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <Shield size={20} className="sidebar-item-icon" />
                            <span>Privacidad RGPD</span>
                        </NavLink>
                        <NavLink
                            to="/settings"
                            onClick={onClose}
                            className={({ isActive }) =>
                                `sidebar-item ${isActive ? 'active' : ''}`
                            }
                        >
                            <Settings size={20} className="sidebar-item-icon" />
                            <span>Configuración</span>
                        </NavLink>
                    </div>
                </nav>

                {/* Footer - User info */}
                <div className="sidebar-footer">
                    <div className="sidebar-user" onClick={() => { onClose(); }}>
                        <Avatar
                            name={user?.full_name || 'Usuario'}
                            src={user?.avatar_url}
                            size="sm"
                        />
                        <div className="sidebar-user-info">
                            <div className="sidebar-user-name">{user?.full_name || 'Usuario'}</div>
                            <div className="sidebar-user-role">
                                {roleLabels[user?.role || 'employee'] || 'Empleado'}
                            </div>
                        </div>
                        <span className={`sidebar-status-dot ${currentStatus.replace('_', '-')}`} title={statusLabels[currentStatus]} />
                    </div>
                    <button
                        onClick={logout}
                        className="sidebar-item"
                        style={{ marginTop: '0.5rem', color: '#ef4444' }}
                    >
                        <LogOut size={18} className="sidebar-item-icon" />
                        <span>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
