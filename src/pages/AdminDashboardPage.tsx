import { useState, useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import {
    Users, Clock, TrendingUp, AlertTriangle, Calendar,
    MapPin, Activity, ChevronDown, ChevronUp, BarChart3, Euro,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

// Demo data for charts
const DEMO_WEEKLY_ATTENDANCE = [
    { day: 'Lun', present: 42, absent: 3, late: 2 },
    { day: 'Mar', present: 44, absent: 1, late: 1 },
    { day: 'Mié', present: 41, absent: 4, late: 3 },
    { day: 'Jue', present: 43, absent: 2, late: 2 },
    { day: 'Vie', present: 40, absent: 5, late: 0 },
];

const DEMO_MONTHLY_HOURS = [
    { month: 'Sep', avgHours: 7.8 },
    { month: 'Oct', avgHours: 8.1 },
    { month: 'Nov', avgHours: 7.9 },
    { month: 'Dic', avgHours: 7.6 },
    { month: 'Ene', avgHours: 8.0 },
    { month: 'Feb', avgHours: 7.7 },
];

const DEMO_DEPT_DISTRIBUTION = [
    { name: 'Ventas', value: 15, color: '#6366f1' },
    { name: 'Marketing', value: 8, color: '#8b5cf6' },
    { name: 'IT', value: 12, color: '#a855f7' },
    { name: 'RRHH', value: 5, color: '#d946ef' },
    { name: 'Operaciones', value: 10, color: '#ec4899' },
];

const DEMO_PUNCTUALITY = [
    { week: 'S1', onTime: 95, late: 5 },
    { week: 'S2', onTime: 92, late: 8 },
    { week: 'S3', onTime: 97, late: 3 },
    { week: 'S4', onTime: 94, late: 6 },
];

const DEMO_LABOR_COST = [
    { month: 'Sep', bruto: 42000, ssEmpresa: 12500, neto: 28000 },
    { month: 'Oct', bruto: 43500, ssEmpresa: 13000, neto: 29100 },
    { month: 'Nov', bruto: 41800, ssEmpresa: 12450, neto: 27900 },
    { month: 'Dic', bruto: 48000, ssEmpresa: 14300, neto: 32100 },
    { month: 'Ene', bruto: 44200, ssEmpresa: 13200, neto: 29500 },
    { month: 'Feb', bruto: 43800, ssEmpresa: 13100, neto: 29200 },
];

const DEMO_OVERTIME_DEPT = [
    { dept: 'Ventas', horas: 45, coste: 1350 },
    { dept: 'Marketing', horas: 12, coste: 360 },
    { dept: 'IT', horas: 67, coste: 2010 },
    { dept: 'RRHH', horas: 8, coste: 240 },
    { dept: 'Operaciones', horas: 38, coste: 1140 },
];

interface StatCardProps {
    icon: React.ReactNode;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    color: string;
}

function StatCard({ icon, label, value, change, changeType = 'neutral', color }: StatCardProps) {
    return (
        <div className="card" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{
                position: 'absolute', top: '-8px', right: '-8px', width: '64px', height: '64px',
                borderRadius: '50%', background: color, opacity: 0.08,
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '10px', background: color + '18',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color,
                    flexShrink: 0,
                }}>
                    {icon}
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 500, marginBottom: '0.25rem' }}>
                        {label}
                    </div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1 }}>
                        {value}
                    </div>
                    {change && (
                        <div style={{
                            fontSize: '0.75rem', fontWeight: 600, marginTop: '0.375rem',
                            display: 'flex', alignItems: 'center', gap: '0.25rem',
                            color: changeType === 'positive' ? '#16a34a' : changeType === 'negative' ? '#dc2626' : '#64748b',
                        }}>
                            {changeType === 'positive' ? <ChevronUp size={14} /> : changeType === 'negative' ? <ChevronDown size={14} /> : null}
                            {change}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function AdminDashboardPage() {
    const { allUsers, liveAttendance, isDarkMode } = useAppStore();
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter'>('week');

    const presentToday = useMemo(() => liveAttendance.filter((a: any) => a.status === 'working').length, [liveAttendance]);
    const onBreak = useMemo(() => liveAttendance.filter((a: any) => a.status === 'on_break').length, [liveAttendance]);
    const totalEmployees = allUsers.length || 45;
    const absenceRate = totalEmployees ? (((totalEmployees - presentToday - onBreak) / totalEmployees) * 100).toFixed(1) : '0';

    const textColor = isDarkMode ? '#e2e8f0' : '#374151';
    const gridColor = isDarkMode ? '#374151' : '#f0f0f0';

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">
                    <BarChart3 size={24} style={{ marginRight: '0.5rem', color: '#6366f1' }} />
                    Panel de Analítica
                </h1>
                <p className="page-header-subtitle">Métricas de asistencia, puntualidad y productividad del equipo</p>
            </div>

            {/* Date Range Selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {(['week', 'month', 'quarter'] as const).map(range => (
                    <button
                        key={range}
                        className={`btn btn-sm ${dateRange === range ? 'btn-primary' : 'btn-outline'}`}
                        onClick={() => setDateRange(range)}
                    >
                        {range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Trimestre'}
                    </button>
                ))}
            </div>

            {/* KPI Cards */}
            <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
                <StatCard icon={<Users size={20} />} label="Presentes hoy" value={presentToday || 42} change="+2 vs ayer" changeType="positive" color="#6366f1" />
                <StatCard icon={<Clock size={20} />} label="Horas medias/día" value="7.9h" change="—0.1h vs sem. ant." changeType="negative" color="#8b5cf6" />
                <StatCard icon={<TrendingUp size={20} />} label="Tasa puntualidad" value="94%" change="+2% vs mes ant." changeType="positive" color="#16a34a" />
                <StatCard icon={<AlertTriangle size={20} />} label="Tasa absentismo" value={`${absenceRate}%`} change="Estable" changeType="neutral" color="#f59e0b" />
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Weekly Attendance */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="section-title" style={{ marginBottom: '1rem' }}>
                        <Calendar size={18} style={{ marginRight: '0.5rem', color: '#6366f1' }} />
                        Asistencia semanal
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={DEMO_WEEKLY_ATTENDANCE}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="day" tick={{ fill: textColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: textColor, fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: isDarkMode ? '#1e293b' : '#fff',
                                    border: '1px solid ' + (isDarkMode ? '#334155' : '#e2e8f0'),
                                    borderRadius: '12px',
                                    fontSize: '0.8125rem',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
                            <Bar dataKey="present" name="Presentes" fill="#6366f1" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="absent" name="Ausentes" fill="#f87171" radius={[6, 6, 0, 0]} />
                            <Bar dataKey="late" name="Tarde" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Monthly Hours Trend */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="section-title" style={{ marginBottom: '1rem' }}>
                        <Activity size={18} style={{ marginRight: '0.5rem', color: '#8b5cf6' }} />
                        Evolución horas medias
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <LineChart data={DEMO_MONTHLY_HOURS}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} />
                            <YAxis domain={[7, 9]} tick={{ fill: textColor, fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: isDarkMode ? '#1e293b' : '#fff',
                                    border: '1px solid ' + (isDarkMode ? '#334155' : '#e2e8f0'),
                                    borderRadius: '12px',
                                    fontSize: '0.8125rem',
                                }}
                                formatter={(value: any) => [`${value}h`, 'Media diaria']}
                            />
                            <Line
                                type="monotone"
                                dataKey="avgHours"
                                name="Horas medias"
                                stroke="#8b5cf6"
                                strokeWidth={3}
                                dot={{ fill: '#8b5cf6', r: 5 }}
                                activeDot={{ fill: '#7c3aed', r: 7, strokeWidth: 2, stroke: '#fff' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Department Distribution */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="section-title" style={{ marginBottom: '1rem' }}>
                        <Users size={18} style={{ marginRight: '0.5rem', color: '#a855f7' }} />
                        Distribución por departamento
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                            <Pie
                                data={DEMO_DEPT_DISTRIBUTION}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey="value"
                                label={({ name, percent }: any) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                                labelLine={{ stroke: textColor }}
                            >
                                {DEMO_DEPT_DISTRIBUTION.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    background: isDarkMode ? '#1e293b' : '#fff',
                                    border: '1px solid ' + (isDarkMode ? '#334155' : '#e2e8f0'),
                                    borderRadius: '12px',
                                    fontSize: '0.8125rem',
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Punctuality Chart */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="section-title" style={{ marginBottom: '1rem' }}>
                        <MapPin size={18} style={{ marginRight: '0.5rem', color: '#16a34a' }} />
                        Puntualidad por semana (%)
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={DEMO_PUNCTUALITY}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="week" tick={{ fill: textColor, fontSize: 12 }} />
                            <YAxis domain={[0, 100]} tick={{ fill: textColor, fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: isDarkMode ? '#1e293b' : '#fff',
                                    border: '1px solid ' + (isDarkMode ? '#334155' : '#e2e8f0'),
                                    borderRadius: '12px',
                                    fontSize: '0.8125rem',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
                            <Bar dataKey="onTime" name="A tiempo" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
                            <Bar dataKey="late" name="Tarde" stackId="a" fill="#fbbf24" radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Sprint 6: Labor Cost + Overtime per Dept */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* Labor Cost */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="section-title" style={{ marginBottom: '1rem' }}>
                        <Euro size={18} style={{ marginRight: '0.5rem', color: '#16a34a' }} />
                        Coste laboral mensual
                        <span style={{ fontSize: '0.75rem', marginLeft: 8, padding: '2px 8px', borderRadius: 10, background: '#dcfce7', color: '#16a34a', fontWeight: 600 }}>S6</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <AreaChart data={DEMO_LABOR_COST}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="month" tick={{ fill: textColor, fontSize: 12 }} />
                            <YAxis tick={{ fill: textColor, fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                            <Tooltip
                                contentStyle={{
                                    background: isDarkMode ? '#1e293b' : '#fff',
                                    border: '1px solid ' + (isDarkMode ? '#334155' : '#e2e8f0'),
                                    borderRadius: '12px',
                                    fontSize: '0.8125rem',
                                }}
                                formatter={(value: any) => [`${Number(value).toLocaleString('es-ES')} €`, undefined]}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
                            <Area type="monotone" dataKey="bruto" name="Bruto total" stackId="1" stroke="#6366f1" fill="#6366f180" />
                            <Area type="monotone" dataKey="ssEmpresa" name="SS Empresa" stackId="2" stroke="#f59e0b" fill="#f59e0b60" />
                            <Area type="monotone" dataKey="neto" name="Neto pagado" stackId="3" stroke="#22c55e" fill="#22c55e60" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Overtime by Department */}
                <div className="card" style={{ padding: '1.5rem' }}>
                    <div className="section-title" style={{ marginBottom: '1rem' }}>
                        <Clock size={18} style={{ marginRight: '0.5rem', color: '#f59e0b' }} />
                        Horas extra por departamento
                        <span style={{ fontSize: '0.75rem', marginLeft: 8, padding: '2px 8px', borderRadius: 10, background: '#fef9c3', color: '#ca8a04', fontWeight: 600 }}>S6</span>
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={DEMO_OVERTIME_DEPT} layout="vertical">
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis type="number" tick={{ fill: textColor, fontSize: 12 }} />
                            <YAxis type="category" dataKey="dept" width={90} tick={{ fill: textColor, fontSize: 12 }} />
                            <Tooltip
                                contentStyle={{
                                    background: isDarkMode ? '#1e293b' : '#fff',
                                    border: '1px solid ' + (isDarkMode ? '#334155' : '#e2e8f0'),
                                    borderRadius: '12px',
                                    fontSize: '0.8125rem',
                                }}
                            />
                            <Legend wrapperStyle={{ fontSize: '0.8125rem' }} />
                            <Bar dataKey="horas" name="Horas extra" fill="#f59e0b" radius={[0, 6, 6, 0]} />
                            <Bar dataKey="coste" name="Coste (€)" fill="#6366f1" radius={[0, 6, 6, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Geo-attendance insights */}
            <div className="card" style={{ padding: '1.5rem' }}>
                <div className="section-title" style={{ marginBottom: '0.75rem' }}>
                    <MapPin size={18} style={{ marginRight: '0.5rem', color: '#6366f1' }} />
                    Fichajes con geolocalización
                </div>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>
                    Los fichajes con GPS activado se registran automáticamente. Puedes consultar las coordenadas de cada entrada en el detalle de fichajes.
                </p>
                <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div style={{
                        padding: '1rem 1.5rem', borderRadius: '12px', background: 'var(--color-icon-bg-brand)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <MapPin size={20} color="#6366f1" />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#4338ca' }}>87%</div>
                            <div style={{ fontSize: '0.75rem', color: '#6366f1' }}>Fichajes con GPS</div>
                        </div>
                    </div>
                    <div style={{
                        padding: '1rem 1.5rem', borderRadius: '12px', background: 'var(--color-icon-bg-success)',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                    }}>
                        <Activity size={20} color="#16a34a" />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: '#15803d' }}>2.3 km</div>
                            <div style={{ fontSize: '0.75rem', color: '#16a34a' }}>Radio promedio</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
