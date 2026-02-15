import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, BarChart3, ShieldCheck, Users } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export function QuickAccess() {
    const navigate = useNavigate();

    const { user } = useAppStore();
    const isAdmin = user?.role === 'admin';

    const tools = [
        {
            title: 'Historial',
            desc: 'Ver registros pasados',
            icon: Clock,
            path: '/history',
            color: 'text-blue-500',
            bg: 'bg-blue-500/5'
        },
        {
            title: 'Ausencias',
            desc: 'Gestionar permisos',
            icon: Calendar,
            path: '/absences',
            color: 'text-amber-500',
            bg: 'bg-amber-500/5'
        },
        isAdmin && {
            title: 'Gestión',
            desc: 'Panel de control',
            icon: Users,
            path: '/users',
            color: 'text-purple-500',
            bg: 'bg-purple-500/5'
        },
        {
            title: 'Reportes',
            desc: 'Análisis de jornada',
            icon: BarChart3,
            path: '/reports',
            color: 'text-[var(--color-primary)]',
            bg: 'bg-[var(--color-primary)]/5'
        },
        {
            title: 'Seguridad',
            desc: 'Claves y accesos',
            icon: ShieldCheck,
            path: '/settings',
            color: 'text-emerald-500',
            bg: 'bg-emerald-500/5'
        }
    ].filter(Boolean) as any[];

    return (
        <div className={`grid gap-2 h-full ${isAdmin ? 'grid-cols-2 lg:grid-cols-5' : 'grid-cols-2 md:grid-cols-4'}`}>
            {tools.map((tool) => (
                <button
                    key={tool.title}
                    onClick={() => navigate(tool.path)}
                    className="flex flex-col items-center justify-center gap-4 p-8 rounded-[40px] bg-[var(--color-surface)] border border-white/[0.03] hover:bg-[var(--color-surface-hover)] transition-all duration-300 group text-center h-full shadow-sm relative overflow-hidden"
                >
                    {/* Background Glow */}
                    <div className={`absolute -right-4 -top-4 w-40 h-40 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${tool.bg.replace('/5', '/10')}`}></div>

                    <div className={`w-28 h-28 rounded-[25px] ${tool.bg} flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                        <tool.icon size={56} className={tool.color} />
                    </div>

                    <div className="flex flex-col items-center gap-2">
                        <h3 className="text-3xl font-black uppercase tracking-[0.2em] text-[var(--color-text-primary)]">
                            {tool.title}
                        </h3>
                        <p className="text-lg font-bold text-[var(--color-text-muted)] uppercase tracking-wider line-clamp-1">
                            {tool.desc}
                        </p>
                    </div>
                </button>
            ))}
        </div>
    );
}


