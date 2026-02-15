import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Clock,
    Calendar,
    BarChart3,
    Settings,
    Users
} from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export function BottomNav() {
    const { user } = useAppStore();
    const isAdmin = user?.role === 'admin';

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Inicio' },
        { path: '/history', icon: Clock, label: 'Historial' },
        { path: '/absences', icon: Calendar, label: 'Ausencias' },
        isAdmin && { path: '/users', icon: Users, label: 'Gestión' },
        { path: '/reports', icon: BarChart3, label: 'Reportes' },
        { path: '/settings', icon: Settings, label: 'Config' },
    ].filter(Boolean) as { path: string; icon: any; label: string }[];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-1rem)] max-w-lg z-50">
            <div className="glass bg-black/80 border border-white/10 rounded-full px-6 py-3 flex items-center justify-between shadow-2xl backdrop-blur-xl">
                {navItems.map(({ path, icon: Icon, label }) => (
                    <NavLink
                        key={path}
                        to={path}
                        className={({ isActive }) => `
              relative flex flex-col items-center gap-1 group
              transition-all duration-300
              ${isActive
                                ? 'text-[var(--color-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }
            `}
                    >
                        <Icon size={20} className={`transition-transform duration-300 group-hover:scale-110 ${label === 'Inicio' ? 'icon-neon' : ''}`} />
                        <span className="text-[10px] uppercase tracking-widest font-bold opacity-70">{label}</span>
                        <div className={`absolute -bottom-1 w-1 h-1 rounded-full bg-[var(--color-primary)] transition-all duration-300 scale-0 opacity-0 active-item-dot`}></div>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}

