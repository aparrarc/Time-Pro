import { useEffect, useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Palmtree, Thermometer, User, CalendarDays, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const absenceTypeConfig = {
    vacation: { label: 'Vacaciones', icon: Palmtree, color: '#10b981', bg: '#ecfdf5' },
    sick: { label: 'Baja médica', icon: Thermometer, color: '#ef4444', bg: '#fef2f2' },
    personal: { label: 'Personal', icon: User, color: '#6366f1', bg: '#eef2ff' },
    other: { label: 'Otro', icon: CalendarDays, color: '#6b7280', bg: '#f9fafb' }
};

const statusConfig = {
    pending: { label: 'Pendiente', color: '#d97706', bg: '#fffbeb' },
    approved: { label: 'Aprobada', color: '#10b981', bg: '#ecfdf5' },
    rejected: { label: 'Rechazada', color: '#ef4444', bg: '#fef2f2' }
};

export function AbsencesPage() {
    const { user, absenceRequests, fetchAbsences } = useAppStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        fetchAbsences();
    }, [fetchAbsences]);

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const firstDayOfWeek = startOfMonth(currentMonth).getDay();
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const hasAbsence = (date: Date) => {
        return absenceRequests.find(absence => {
            const start = new Date(absence.start_date);
            const end = new Date(absence.end_date);
            return date >= start && date <= end && absence.status === 'approved';
        });
    };

    const usedDays = absenceRequests
        .filter(a => a.absence_type === 'vacation' && a.status === 'approved')
        .length;

    const totalVacation = user?.vacation_days || 22;
    const availableDays = totalVacation - usedDays;
    const pendingCount = absenceRequests.filter(a => a.status === 'pending').length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ausencias y vacaciones</h1>
                    <p className="page-subtitle">Gestiona tus solicitudes y consulta el calendario</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <Plus size={16} />
                    Nueva solicitud
                </button>
            </div>

            {/* Vacation balance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#ecfdf5' }}>
                        <Palmtree size={18} style={{ color: '#10b981' }} />
                    </div>
                    <div className="stat-card-value">{availableDays}</div>
                    <div className="stat-card-label">Días disponibles</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#eef2ff' }}>
                        <CalendarDays size={18} style={{ color: '#6366f1' }} />
                    </div>
                    <div className="stat-card-value">{usedDays}</div>
                    <div className="stat-card-label">Días usados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#f0f4ff' }}>
                        <CalendarDays size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="stat-card-value">{totalVacation}</div>
                    <div className="stat-card-label">Total anual</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#fffbeb' }}>
                        <CalendarDays size={18} style={{ color: '#d97706' }} />
                    </div>
                    <div className="stat-card-value">{pendingCount}</div>
                    <div className="stat-card-label">Pendientes</div>
                </div>
            </div>

            {/* Calendar */}
            <div className="card" style={{ padding: '1.5rem' }}>
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold capitalize" style={{ color: 'var(--color-text-primary)' }}>
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Week days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                        <div key={day} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--color-text-muted)' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Padding */}
                    {Array.from({ length: paddingDays }).map((_, i) => (
                        <div key={`pad-${i}`} className="min-h-[44px]" />
                    ))}

                    {/* Days */}
                    {days.map((day) => {
                        const isCurrentDay = isToday(day);
                        const absence = hasAbsence(day);
                        const config = absence ? absenceTypeConfig[absence.absence_type as keyof typeof absenceTypeConfig] : null;

                        return (
                            <button
                                key={day.toISOString()}
                                className="min-h-[44px] rounded-lg flex flex-col items-center justify-center text-sm transition-all relative"
                                style={{
                                    background: isCurrentDay ? 'var(--color-primary)' : absence ? config?.bg : 'transparent',
                                    color: isCurrentDay ? 'white' : absence ? config?.color : 'var(--color-text-primary)',
                                    fontWeight: isCurrentDay || absence ? 600 : 400,
                                }}
                            >
                                {format(day, 'd')}
                                {absence && !isCurrentDay && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: config?.color }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Absence requests */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Mis solicitudes
                </h2>
                {absenceRequests.length === 0 ? (
                    <div className="empty-state">
                        <CalendarDays size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                        <h3 className="empty-state-title">Sin solicitudes</h3>
                        <p className="empty-state-text">No tienes solicitudes de ausencia registradas</p>
                    </div>
                ) : (
                    absenceRequests.map((absence) => {
                        const config = absenceTypeConfig[absence.absence_type as keyof typeof absenceTypeConfig];
                        const status = statusConfig[absence.status as keyof typeof statusConfig];
                        const Icon = config.icon;

                        return (
                            <div key={absence.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.bg }}>
                                        <Icon size={20} style={{ color: config.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                            {config.label}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            {format(new Date(absence.start_date), 'd MMM', { locale: es })}
                                            {absence.start_date !== absence.end_date &&
                                                ` — ${format(new Date(absence.end_date), 'd MMM', { locale: es })}`
                                            }
                                        </p>
                                    </div>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: status.bg, color: status.color }}
                                    >
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
