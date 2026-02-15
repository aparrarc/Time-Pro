import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Filter, Download, Clock, Coffee, ArrowRight, CalendarDays } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { TimeEntry } from '../types';

export function HistoryPage() {
    const { todayEntries, fetchHistory } = useAppStore();
    const [filter, setFilter] = useState<'week' | 'month' | 'all'>('week');

    useEffect(() => {
        fetchHistory(filter);
    }, [filter, fetchHistory]);

    // Group by date
    const groupedEntries = todayEntries.reduce((acc, entry) => {
        const date = format(new Date(entry.clock_in), 'yyyy-MM-dd');
        if (!acc[date]) acc[date] = [];
        acc[date].push(entry);
        return acc;
    }, {} as Record<string, TimeEntry[]>);

    const sortedDates = Object.keys(groupedEntries).sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
    );

    const formatDuration = (entry: TimeEntry) => {
        if (!entry.clock_out) return 'En curso...';
        const ms = new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime();
        const h = Math.floor(ms / 3600000);
        const m = Math.floor((ms % 3600000) / 60000);
        return `${h}h ${m}m`;
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Historial de fichajes</h1>
                    <p className="page-subtitle">Consulta y exporta tus registros de entrada y salida</p>
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} />
                    Exportar
                </button>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
                {(['week', 'month', 'all'] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: filter === f ? 'white' : 'transparent',
                            color: filter === f ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        {f === 'week' ? 'Esta semana' : f === 'month' ? 'Este mes' : 'Todo'}
                    </button>
                ))}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total horas', value: sortedDates.reduce((acc, dateStr) => {
                            return acc + groupedEntries[dateStr].reduce((sum, e) => {
                                if (e.clock_out) return sum + (new Date(e.clock_out).getTime() - new Date(e.clock_in).getTime()) / 3600000;
                                return sum;
                            }, 0);
                        }, 0).toFixed(1) + 'h', icon: Clock
                    },
                    { label: 'Fichajes', value: todayEntries.length.toString(), icon: CalendarDays },
                ].map(({ label, value, icon: Icon }) => (
                    <div key={label} className="stat-card">
                        <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)' }}>
                            <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                        </div>
                        <div className="stat-card-value">{value}</div>
                        <div className="stat-card-label">{label}</div>
                    </div>
                ))}
            </div>

            {/* Entries grouped by date */}
            <div className="space-y-6">
                {sortedDates.length === 0 ? (
                    <div className="empty-state">
                        <CalendarDays size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                        <h3 className="empty-state-title">Sin registros</h3>
                        <p className="empty-state-text">No hay fichajes para el período seleccionado</p>
                    </div>
                ) : (
                    sortedDates.map((dateStr) => {
                        const entries = groupedEntries[dateStr];
                        const dateLabel = format(new Date(dateStr), "EEEE, d 'de' MMMM", { locale: es });

                        const totalMinutes = entries.reduce((acc, entry) => {
                            if (entry.clock_out) {
                                const start = new Date(entry.clock_in);
                                const end = new Date(entry.clock_out);
                                return acc + (end.getTime() - start.getTime()) / (1000 * 60);
                            }
                            return acc;
                        }, 0);

                        const totalHours = (totalMinutes / 60).toFixed(1);

                        return (
                            <div key={dateStr} className="space-y-3">
                                <div className="flex items-center justify-between px-1">
                                    <h3 className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-secondary)' }}>
                                        {dateLabel}
                                    </h3>
                                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                                        {totalHours}h
                                    </span>
                                </div>
                                {entries.map((entry) => (
                                    <div key={entry.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: entry.clock_out ? 'var(--color-success-bg)' : 'var(--color-primary-light)' }}>
                                                    <Clock size={18} style={{ color: entry.clock_out ? 'var(--color-success)' : 'var(--color-primary)' }} />
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                                        <span>{format(new Date(entry.clock_in), 'HH:mm')}</span>
                                                        <ArrowRight size={14} style={{ color: 'var(--color-text-muted)' }} />
                                                        <span>{entry.clock_out ? format(new Date(entry.clock_out), 'HH:mm') : '—'}</span>
                                                    </div>
                                                    {entry.breaks && entry.breaks.length > 0 && (
                                                        <div className="flex items-center gap-1 mt-1">
                                                            <Coffee size={12} style={{ color: 'var(--color-text-muted)' }} />
                                                            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                                {entry.breaks.length} pausa{entry.breaks.length > 1 ? 's' : ''}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-sm font-bold" style={{ color: entry.clock_out ? 'var(--color-text-primary)' : 'var(--color-primary)' }}>
                                                    {formatDuration(entry)}
                                                </span>
                                                {!entry.clock_out && (
                                                    <div className="flex items-center gap-1 justify-end mt-0.5">
                                                        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: 'var(--color-primary)' }} />
                                                        <span className="text-xs" style={{ color: 'var(--color-primary)' }}>Activo</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
