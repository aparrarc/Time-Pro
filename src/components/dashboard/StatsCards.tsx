import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { useAppStore } from '../../store/appStore';

export function StatsCards() {
    const { todayHours } = useAppStore();

    // Mock weekly hours for now
    const weeklyHours = todayHours + 24.5;
    const vacationDays = 18;

    const stats = [
        {
            label: 'Hoy',
            value: `${todayHours.toFixed(1)}h`,
            icon: Clock,
            isActive: true
        },
        {
            label: 'Semana',
            value: `${weeklyHours.toFixed(1)}h`,
            icon: TrendingUp,
            isActive: false
        },
        {
            label: 'Vacas',
            value: `${vacationDays}`,
            icon: Calendar,
            isActive: false
        }
    ];

    return (
        <div className="grid grid-cols-3 gap-3">
            {stats.map(({ label, value, icon: Icon, isActive }) => (
                <div
                    key={label}
                    className={`
                        flex flex-col items-center justify-center gap-1.5 py-4 px-2 rounded-[24px] transition-all duration-300
                        ${isActive
                            ? 'bg-[var(--color-primary)] text-black shadow-[0_0_15px_rgba(186,255,41,0.2)]'
                            : 'bg-[var(--color-surface)] border border-white/5 text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)]'
                        }
                    `}
                >
                    <Icon size={16} className={isActive ? 'text-black/70' : 'text-[var(--color-text-muted)]'} />
                    <div className={`text-lg font-black tracking-tighter ${isActive ? 'text-black' : 'text-[var(--color-text-primary)]'}`}>
                        {value}
                    </div>
                    <div className={`text-[9px] uppercase font-black tracking-[0.1em] ${isActive ? 'text-black/50' : 'text-[var(--color-text-muted)]'}`}>
                        {label}
                    </div>
                </div>
            ))}
        </div>
    );
}
