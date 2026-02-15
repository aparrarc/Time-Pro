import { useState, useEffect, useRef } from 'react';
import { Clock, AlertTriangle, CheckCircle, DollarSign, RefreshCw, Download, FileSpreadsheet, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { exportToCsv, exportToPdf } from '../lib/exportUtils';
import { isDemoMode } from '../lib/demoData';
import type { OvertimeRecord } from '../types';

const DEMO_OVERTIME: OvertimeRecord[] = [
    { id: '1', user_id: 'demo-1', date: '2026-02-02', scheduled_hours: 8, actual_hours: 9.5, overtime_hours: 1.5, overtime_type: 'pending', created_at: '2026-02-02', user_name: 'Carlos García' },
    { id: '2', user_id: 'demo-1', date: '2026-02-04', scheduled_hours: 8, actual_hours: 10, overtime_hours: 2, overtime_type: 'paid', approved_by: 'admin-1', approved_at: '2026-02-05', created_at: '2026-02-04', user_name: 'Carlos García' },
    { id: '3', user_id: 'demo-2', date: '2026-02-05', scheduled_hours: 8, actual_hours: 9, overtime_hours: 1, overtime_type: 'compensated', approved_by: 'admin-1', approved_at: '2026-02-06', created_at: '2026-02-05', user_name: 'Ana Martínez' },
    { id: '4', user_id: 'demo-3', date: '2026-02-06', scheduled_hours: 8, actual_hours: 8.75, overtime_hours: 0.75, overtime_type: 'pending', created_at: '2026-02-06', user_name: 'Luis Fernández' },
    { id: '5', user_id: 'demo-2', date: '2026-02-09', scheduled_hours: 8, actual_hours: 10.5, overtime_hours: 2.5, overtime_type: 'pending', created_at: '2026-02-09', user_name: 'Ana Martínez' },
    { id: '6', user_id: 'demo-1', date: '2026-02-10', scheduled_hours: 8, actual_hours: 9.25, overtime_hours: 1.25, overtime_type: 'paid', approved_by: 'admin-1', approved_at: '2026-02-11', created_at: '2026-02-10', user_name: 'Carlos García' },
    { id: '7', user_id: 'demo-4', date: '2026-02-11', scheduled_hours: 8, actual_hours: 11, overtime_hours: 3, overtime_type: 'pending', created_at: '2026-02-11', user_name: 'María López' },
    { id: '8', user_id: 'demo-3', date: '2026-02-12', scheduled_hours: 8, actual_hours: 9.5, overtime_hours: 1.5, overtime_type: 'compensated', approved_by: 'admin-1', approved_at: '2026-02-13', created_at: '2026-02-12', user_name: 'Luis Fernández' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export function OvertimePage() {
    const user = useAppStore(s => s.user);
    const isAdmin = user?.role === 'admin';
    const [records, setRecords] = useState<OvertimeRecord[]>([]);
    const [month, setMonth] = useState(new Date().getMonth());
    const [year, setYear] = useState(new Date().getFullYear());
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'compensated'>('all');
    const [showExport, setShowExport] = useState(false);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isDemoMode) {
            setRecords(DEMO_OVERTIME);
        }
    }, [month, year]);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (exportRef.current && !exportRef.current.contains(e.target as Node)) setShowExport(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    const filtered = records.filter(r => filter === 'all' || r.overtime_type === filter);
    const totalHours = records.reduce((acc, r) => acc + r.overtime_hours, 0);
    const pendingHours = records.filter(r => r.overtime_type === 'pending').reduce((acc, r) => acc + r.overtime_hours, 0);
    const paidHours = records.filter(r => r.overtime_type === 'paid').reduce((acc, r) => acc + r.overtime_hours, 0);
    const compHours = records.filter(r => r.overtime_type === 'compensated').reduce((acc, r) => acc + r.overtime_hours, 0);

    const handleTypeChange = (id: string, newType: 'paid' | 'compensated') => {
        setRecords(prev => prev.map(r => r.id === id ? { ...r, overtime_type: newType, approved_at: new Date().toISOString() } : r));
    };

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const getExportRows = () => filtered.map(r => [
        r.date, r.user_name || '', r.scheduled_hours.toFixed(1), r.actual_hours.toFixed(1),
        r.overtime_hours.toFixed(1), r.overtime_type === 'paid' ? 'Pagada' : r.overtime_type === 'compensated' ? 'Compensada' : 'Pendiente',
    ]);

    const exportHeaders = ['Fecha', 'Empleado', 'Jornada Prev.', 'Jornada Real', 'Horas Extra', 'Estado'];

    return (
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Horas Extra</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Gestión y control de horas extraordinarias · RDL 8/2019</p>
                </div>
                <div style={{ position: 'relative' }} ref={exportRef}>
                    <button onClick={() => setShowExport(!showExport)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--color-brand)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                        <Download size={16} /> Exportar
                    </button>
                    {showExport && (
                        <div style={{ position: 'absolute', right: 0, top: '100%', marginTop: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, boxShadow: 'var(--shadow-lg)', overflow: 'hidden', zIndex: 10, minWidth: 180 }}>
                            <button onClick={() => { exportToCsv({ filename: `horas_extra_${MONTHS[month]}_${year}`, headers: exportHeaders, rows: getExportRows() }); setShowExport(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--color-text)' }}>
                                <FileSpreadsheet size={16} style={{ color: '#22c55e' }} /> CSV
                            </button>
                            <button onClick={() => { exportToPdf({ title: `Horas Extra — ${MONTHS[month]} ${year}`, headers: exportHeaders, rows: getExportRows() }); setShowExport(false); }} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--color-text)' }}>
                                <FileText size={16} style={{ color: '#ef4444' }} /> PDF
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Month selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <button onClick={prevMonth} style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}><ChevronLeft size={18} /></button>
                <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text)', minWidth: 180, textAlign: 'center' }}>{MONTHS[month]} {year}</span>
                <button onClick={nextMonth} style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}><ChevronRight size={18} /></button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Total Horas Extra', value: `${totalHours.toFixed(1)}h`, icon: Clock, color: '#6366f1', bg: 'var(--color-icon-bg-brand)' },
                    { label: 'Pendientes', value: `${pendingHours.toFixed(1)}h`, icon: AlertTriangle, color: '#f59e0b', bg: 'var(--color-icon-bg-warning)' },
                    { label: 'Pagadas', value: `${paidHours.toFixed(1)}h`, icon: DollarSign, color: '#22c55e', bg: 'var(--color-icon-bg-success)' },
                    { label: 'Compensadas', value: `${compHours.toFixed(1)}h`, icon: RefreshCw, color: '#3b82f6', bg: 'var(--color-icon-bg-info)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 16 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={20} style={{ color: s.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-text)' }}>{s.value}</div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
                {(['all', 'pending', 'paid', 'compensated'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '8px 16px', borderRadius: 8, border: filter === f ? '2px solid var(--color-brand)' : '1px solid var(--color-border)', background: filter === f ? 'var(--color-brand)' : 'var(--color-surface)', color: filter === f ? '#fff' : 'var(--color-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                        {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'paid' ? 'Pagadas' : 'Compensadas'}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: 'var(--color-bg)' }}>
                                {['Fecha', 'Empleado', 'Prevista', 'Real', 'Extra', 'Estado', ...(isAdmin ? ['Acciones'] : [])].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-text-secondary)' }}>No hay registros de horas extra para este período</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                    <td style={{ padding: '12px 16px', color: 'var(--color-text)' }}>{new Date(r.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--color-text)', fontWeight: 500 }}>{r.user_name}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>{r.scheduled_hours}h</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--color-text)', fontWeight: 600 }}>{r.actual_hours}h</td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{ fontWeight: 700, color: r.overtime_hours >= 2 ? '#ef4444' : '#f59e0b' }}>+{r.overtime_hours}h</span>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                                            background: r.overtime_type === 'paid' ? '#dcfce7' : r.overtime_type === 'compensated' ? '#dbeafe' : '#fef3c7',
                                            color: r.overtime_type === 'paid' ? '#166534' : r.overtime_type === 'compensated' ? '#1e40af' : '#92400e',
                                        }}>
                                            {r.overtime_type === 'paid' && <><DollarSign size={12} /> Pagada</>}
                                            {r.overtime_type === 'compensated' && <><RefreshCw size={12} /> Compensada</>}
                                            {r.overtime_type === 'pending' && <><AlertTriangle size={12} /> Pendiente</>}
                                        </span>
                                    </td>
                                    {isAdmin && (
                                        <td style={{ padding: '12px 16px' }}>
                                            {r.overtime_type === 'pending' && (
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button onClick={() => handleTypeChange(r.id, 'paid')} title="Marcar como pagada" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #22c55e', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <DollarSign size={14} style={{ color: '#22c55e' }} />
                                                    </button>
                                                    <button onClick={() => handleTypeChange(r.id, 'compensated')} title="Marcar como compensada" style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #3b82f6', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                                        <RefreshCw size={14} style={{ color: '#3b82f6' }} />
                                                    </button>
                                                </div>
                                            )}
                                            {r.overtime_type !== 'pending' && (
                                                <CheckCircle size={16} style={{ color: '#22c55e' }} />
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legal note */}
            <div style={{ marginTop: 20, padding: 16, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 8 }}>
                <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: 0 }}>
                    📋 <strong>Art. 35 ET:</strong> Las horas extraordinarias no podrán superar las 80 horas anuales. Deben ser compensadas mediante descanso o retribución según convenio colectivo.
                </p>
            </div>
        </div>
    );
}
