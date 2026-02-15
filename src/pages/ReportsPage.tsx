import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Download, TrendingUp, Clock, Briefcase, Coffee } from 'lucide-react';
import { useAppStore } from '../store/appStore';

export function ReportsPage() {
    const { reports, fetchReports } = useAppStore();
    const [period, setPeriod] = useState<'week' | 'month' | 'year'>('week');

    useEffect(() => {
        fetchReports(period);
    }, [period, fetchReports]);

    if (!reports) {
        return (
            <div className="flex items-center justify-center py-20 animate-fade-in">
                <div className="w-8 h-8 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }}></div>
            </div>
        );
    }

    const { weeklyHours, breakdown, stats } = reports;

    const statIcons = [TrendingUp, Clock, Briefcase, Coffee];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Reportes</h1>
                    <p className="page-subtitle">Análisis y exportación de datos de tiempo</p>
                </div>
                <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Download size={16} />
                    Exportar
                </button>
            </div>

            {/* Period selector */}
            <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
                {(['week', 'month', 'year'] as const).map((p) => (
                    <button
                        key={p}
                        onClick={() => setPeriod(p)}
                        className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: period === p ? 'white' : 'transparent',
                            color: period === p ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            boxShadow: period === p ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Año'}
                    </button>
                ))}
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {stats.map(({ label, value, change }: any, i: number) => {
                    const Icon = statIcons[i % statIcons.length];
                    return (
                        <div key={label} className="stat-card">
                            <div className="stat-card-icon" style={{ background: 'var(--color-primary-light)' }}>
                                <Icon size={18} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <div className="stat-card-value">{value}</div>
                            <div className="stat-card-label">{label}</div>
                            {change && (
                                <p className="text-xs font-medium mt-1" style={{ color: change.startsWith('+') ? '#10b981' : '#ef4444' }}>
                                    {change} vs anterior
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Weekly hours chart */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                    Horas por día
                </h3>
                <div style={{ height: '280px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyHours} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                            <XAxis
                                dataKey="name"
                                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                axisLine={{ stroke: 'var(--color-border)' }}
                            />
                            <YAxis
                                tick={{ fill: 'var(--color-text-muted)', fontSize: 12 }}
                                axisLine={{ stroke: 'var(--color-border)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    background: 'white',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '12px',
                                    padding: '10px 14px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    fontSize: '13px',
                                    color: 'var(--color-text-primary)',
                                }}
                            />
                            <Bar
                                dataKey="hours"
                                fill="var(--color-primary)"
                                radius={[6, 6, 0, 0]}
                                opacity={0.85}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Time breakdown */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                    Distribución del tiempo
                </h3>
                <div className="flex flex-col sm:flex-row items-center gap-8">
                    <div style={{ height: '200px', width: '200px', flexShrink: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={breakdown}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={80}
                                    paddingAngle={4}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {breakdown.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex-1 space-y-3 w-full">
                        {breakdown.map(({ name, value, color }: any) => (
                            <div key={name} className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                                <div className="flex-1 flex items-center justify-between">
                                    <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>{name}</span>
                                    <span className="text-sm font-bold" style={{ color: 'var(--color-text-secondary)' }}>{value}h</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
