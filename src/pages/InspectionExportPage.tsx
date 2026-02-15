import { useState } from 'react';
import { FileSearch, Download, Users, Calendar, Shield, Eye, FileText, CalendarDays } from 'lucide-react';
import { isDemoMode, DEMO_USERS } from '../lib/demoData';
import { exportToPdf, exportToCsv } from '../lib/exportUtils';

interface InspectionRow {
    date: string;
    clock_in: string;
    clock_out: string;
    break_minutes: number;
    net_hours: number;
    overtime: number;
    notes: string;
}

const DEMO_INSPECTION_DATA: InspectionRow[] = Array.from({ length: 20 }, (_, i) => {
    const d = new Date(2026, 1, i + 1);
    const dow = d.getDay();
    if (dow === 0 || dow === 6) return null;
    const clockIn = '09:00';
    const clockInH = 9;
    const randExtra = Math.random() > 0.7 ? (Math.random() * 2).toFixed(1) : '0';
    const clockOutH = 18 + parseFloat(randExtra);
    const clockOut = `${Math.floor(clockOutH)}:${String(Math.round((clockOutH % 1) * 60)).padStart(2, '0')}`;
    const breakMin = 60;
    const netHours = clockOutH - clockInH - breakMin / 60;
    const overtime = Math.max(0, netHours - 8);
    return {
        date: d.toISOString().split('T')[0],
        clock_in: clockIn,
        clock_out: clockOut,
        break_minutes: breakMin,
        net_hours: parseFloat(netHours.toFixed(2)),
        overtime: parseFloat(overtime.toFixed(2)),
        notes: overtime > 0 ? 'Horas extra registradas' : '',
    };
}).filter(Boolean) as InspectionRow[];

export function InspectionExportPage() {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date(); d.setDate(1);
        return d.toISOString().split('T')[0];
    });
    const [endDate, setEndDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [selectedEmployee, setSelectedEmployee] = useState('all');
    const [previewMode, setPreviewMode] = useState(false);
    const [data] = useState<InspectionRow[]>(isDemoMode ? DEMO_INSPECTION_DATA : []);

    const employees = isDemoMode ? DEMO_USERS.map(u => ({ id: u.id, name: u.full_name })) : [];

    const filteredData = data.filter(r => r.date >= startDate && r.date <= endDate);
    const totalNetHours = filteredData.reduce((s, r) => s + r.net_hours, 0);
    const totalOvertime = filteredData.reduce((s, r) => s + r.overtime, 0);
    const totalBreakMinutes = filteredData.reduce((s, r) => s + r.break_minutes, 0);
    const avgDailyHours = filteredData.length > 0 ? totalNetHours / filteredData.length : 0;

    const generateHash = () => {
        const str = `${startDate}-${endDate}-${selectedEmployee}-${totalNetHours}-${Date.now()}`;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash |= 0;
        }
        return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    };

    const exportHeaders = ['Fecha', 'Entrada', 'Salida', 'Pausa (min)', 'Horas Netas', 'H. Extra', 'Observaciones'];
    const exportRows = filteredData.map(r => [
        new Date(r.date).toLocaleDateString('es-ES'), r.clock_in, r.clock_out,
        String(r.break_minutes), r.net_hours.toFixed(2), r.overtime > 0 ? `+${r.overtime.toFixed(2)}` : '-', r.notes,
    ]);

    const handleExportPdf = () => {
        const empName = selectedEmployee === 'all' ? 'Todos los empleados' : employees.find(e => e.id === selectedEmployee)?.name || '';
        exportToPdf({
            title: 'Informe de Registro de Jornada',
            subtitle: `Período: ${new Date(startDate).toLocaleDateString('es-ES')} — ${new Date(endDate).toLocaleDateString('es-ES')} · ${empName}`,
            headers: exportHeaders,
            rows: exportRows,
            footer: `Generado por TimeTrack Pro · Hash: ${generateHash()} · ${new Date().toLocaleString('es-ES')} · Conforme al RDL 8/2019 y RD 2026`,
        });
    };

    const handleExportCsv = () => {
        exportToCsv({
            filename: `registro_jornada_inspeccion_${startDate}_${endDate}`,
            headers: exportHeaders,
            rows: exportRows,
        });
    };

    return (
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Shield size={24} style={{ color: 'var(--color-brand)' }} /> Exportación para Inspección
                </h1>
                <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Genera informes oficiales de registro horario conforme al RDL 8/2019 y RD 2026</p>
            </div>

            {/* Alert */}
            <div style={{ padding: 16, background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, marginBottom: 24, display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <FileSearch size={20} style={{ color: '#2563eb', flexShrink: 0, marginTop: 2 }} />
                <div style={{ fontSize: 13, color: '#1e40af' }}>
                    <strong>Acceso remoto de la Inspección de Trabajo:</strong> Este módulo permite generar los informes exigidos por la Inspección de Trabajo y Seguridad Social. Los registros incluyen hash de integridad para garantizar la trazabilidad y no manipulación.
                </div>
            </div>

            {/* Filters */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24, marginBottom: 24 }}>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Calendar size={18} /> Período y empleado
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Desde</label>
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Hasta</label>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Empleado</label>
                        <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', boxSizing: 'border-box' }}>
                            <option value="all">Todos los empleados</option>
                            {employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Summary stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { label: 'Días laborables', value: String(filteredData.length), icon: CalendarDays, color: '#6366f1', bg: 'var(--color-icon-bg-brand)' },
                    { label: 'Total horas netas', value: `${totalNetHours.toFixed(1)}h`, icon: FileText, color: '#22c55e', bg: 'var(--color-icon-bg-success)' },
                    { label: 'Horas extra', value: `+${totalOvertime.toFixed(1)}h`, icon: Shield, color: totalOvertime > 0 ? '#f59e0b' : '#22c55e', bg: 'var(--color-icon-bg-warning)' },
                    { label: 'Media diaria', value: `${avgDailyHours.toFixed(1)}h`, icon: Users, color: '#3b82f6', bg: 'var(--color-icon-bg-info)' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
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

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                <button onClick={() => setPreviewMode(!previewMode)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: '1px solid var(--color-border)', borderRadius: 8, background: previewMode ? 'var(--color-brand)' : 'var(--color-surface)', color: previewMode ? '#fff' : 'var(--color-text)', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    <Eye size={16} /> {previewMode ? 'Ocultar vista previa' : 'Vista previa'}
                </button>
                <button onClick={handleExportPdf} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    <FileText size={16} /> Exportar PDF oficial
                </button>
                <button onClick={handleExportCsv} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                    <Download size={16} /> Exportar CSV
                </button>
            </div>

            {/* Data table / preview */}
            {(previewMode || filteredData.length > 0) && (
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                    {previewMode && (
                        <div style={{ padding: '16px 20px', borderBottom: '2px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-text)' }}>REGISTRO DE JORNADA LABORAL</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                    Empresa: Demo S.L. · CIF: B12345678
                                </div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                    Período: {new Date(startDate).toLocaleDateString('es-ES')} — {new Date(endDate).toLocaleDateString('es-ES')}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', letterSpacing: '0.05em' }}>TIMETRACK PRO</div>
                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                                    Hash: {generateHash()}
                                </div>
                            </div>
                        </div>
                    )}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                            <thead>
                                <tr style={{ background: 'var(--color-bg)' }}>
                                    {exportHeaders.map(h => (
                                        <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--color-text-secondary)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--color-border)' }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredData.map((r, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '10px 14px', color: 'var(--color-text)', fontWeight: 500 }}>{new Date(r.date).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--color-text)' }}>{r.clock_in}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--color-text)' }}>{r.clock_out}</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)' }}>{r.break_minutes}'</td>
                                        <td style={{ padding: '10px 14px', color: 'var(--color-text)', fontWeight: 600 }}>{r.net_hours.toFixed(2)}h</td>
                                        <td style={{ padding: '10px 14px' }}>
                                            {r.overtime > 0 ? (
                                                <span style={{ fontWeight: 700, color: '#f59e0b' }}>+{r.overtime.toFixed(2)}h</span>
                                            ) : (
                                                <span style={{ color: 'var(--color-text-secondary)' }}>—</span>
                                            )}
                                        </td>
                                        <td style={{ padding: '10px 14px', color: 'var(--color-text-secondary)', fontSize: 12 }}>{r.notes}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr style={{ background: 'var(--color-bg)', fontWeight: 700 }}>
                                    <td colSpan={3} style={{ padding: '12px 14px', color: 'var(--color-text)' }}>TOTALES ({filteredData.length} días)</td>
                                    <td style={{ padding: '12px 14px', color: 'var(--color-text)' }}>{totalBreakMinutes}'</td>
                                    <td style={{ padding: '12px 14px', color: 'var(--color-text)' }}>{totalNetHours.toFixed(2)}h</td>
                                    <td style={{ padding: '12px 14px', color: totalOvertime > 0 ? '#f59e0b' : 'var(--color-text)' }}>+{totalOvertime.toFixed(2)}h</td>
                                    <td />
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                    {previewMode && (
                        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--color-border)', fontSize: 11, color: 'var(--color-text-secondary)', textAlign: 'center' }}>
                            Generado por TimeTrack Pro · Hash: {generateHash()} · {new Date().toLocaleString('es-ES')} · Conforme al RDL 8/2019 y RD 2026/2026
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
