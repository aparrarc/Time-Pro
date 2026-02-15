import { useState, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Bell, Filter, Clock, UserX, Zap, X, MessageSquare } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { isDemoMode } from '../lib/demoData';
import type { ComplianceAlert, AlertSeverity, AlertType } from '../types';

const ALERT_TYPE_CONFIG: Record<AlertType, { label: string; icon: typeof Clock; color: string }> = {
    missed_clock_in: { label: 'Olvido de entrada', icon: Clock, color: '#ef4444' },
    missed_clock_out: { label: 'Olvido de salida', icon: Clock, color: '#f97316' },
    overtime_excess: { label: 'Exceso horas extra', icon: AlertTriangle, color: '#f59e0b' },
    anomalous_entry: { label: 'Fichaje anómalo', icon: Zap, color: '#8b5cf6' },
    late_arrival: { label: 'Llegada tardía', icon: UserX, color: '#3b82f6' },
    max_daily_exceeded: { label: 'Jornada máxima superada', icon: AlertCircle, color: '#dc2626' },
    max_weekly_exceeded: { label: 'Máx. semanal superada', icon: AlertCircle, color: '#dc2626' },
};

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; icon: typeof Info; color: string; bg: string; borderColor: string }> = {
    info: { label: 'Informativa', icon: Info, color: '#3b82f6', bg: '#eff6ff', borderColor: '#bfdbfe' },
    warning: { label: 'Advertencia', icon: AlertTriangle, color: '#f59e0b', bg: '#fffbeb', borderColor: '#fde68a' },
    critical: { label: 'Crítica', icon: AlertCircle, color: '#dc2626', bg: '#fef2f2', borderColor: '#fecaca' },
};

const DEMO_ALERTS: ComplianceAlert[] = [
    { id: '1', user_id: 'demo-1', alert_type: 'missed_clock_out', alert_date: '2026-02-14', severity: 'warning', message: 'Carlos García no registró salida el viernes 14 de febrero', resolved: false, created_at: '2026-02-15T08:00:00Z', user_name: 'Carlos García' },
    { id: '2', user_id: 'demo-2', alert_type: 'overtime_excess', alert_date: '2026-02-13', severity: 'critical', message: 'Ana Martínez acumula 12.5h extra este mes (máx. recomendado: 10h/mes)', resolved: false, created_at: '2026-02-14T08:00:00Z', user_name: 'Ana Martínez' },
    { id: '3', user_id: 'demo-3', alert_type: 'late_arrival', alert_date: '2026-02-12', severity: 'info', message: 'Luis Fernández fichó entrada a las 09:47 (15 min tarde)', resolved: false, created_at: '2026-02-12T10:00:00Z', user_name: 'Luis Fernández' },
    { id: '4', user_id: 'demo-4', alert_type: 'max_daily_exceeded', alert_date: '2026-02-11', severity: 'critical', message: 'María López registró 11h de jornada (máx. legal: 10h)', resolved: false, created_at: '2026-02-12T08:00:00Z', user_name: 'María López' },
    { id: '5', user_id: 'demo-1', alert_type: 'anomalous_entry', alert_date: '2026-02-10', severity: 'warning', message: 'Carlos García: fichaje de entrada fuera de horario habitual (06:12)', resolved: true, resolved_by: 'admin-1', resolved_at: '2026-02-10T10:00:00Z', resolution_notes: 'Turno especial aprobado por RRHH', created_at: '2026-02-10T08:00:00Z', user_name: 'Carlos García' },
    { id: '6', user_id: 'demo-2', alert_type: 'missed_clock_in', alert_date: '2026-02-07', severity: 'warning', message: 'Ana Martínez no registró entrada el viernes 7 de febrero', resolved: true, resolved_by: 'admin-1', resolved_at: '2026-02-08T09:00:00Z', resolution_notes: 'Teletrabajo, fichaje corregido manualmente', created_at: '2026-02-08T08:00:00Z', user_name: 'Ana Martínez' },
    { id: '7', user_id: 'demo-3', alert_type: 'max_weekly_exceeded', alert_date: '2026-02-06', severity: 'critical', message: 'Luis Fernández acumuló 43h esta semana (máx: 40h)', resolved: true, resolved_by: 'admin-1', resolved_at: '2026-02-09T08:00:00Z', resolution_notes: 'Se compensarán 3h la próxima semana', created_at: '2026-02-07T08:00:00Z', user_name: 'Luis Fernández' },
];

export function AlertsPage() {
    const user = useAppStore(s => s.user);
    const isAdmin = user?.role === 'admin';
    const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
    const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('active');
    const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
    const [resolveModal, setResolveModal] = useState<ComplianceAlert | null>(null);
    const [resolveNotes, setResolveNotes] = useState('');

    useEffect(() => {
        if (isDemoMode) setAlerts(DEMO_ALERTS);
    }, []);

    const filtered = alerts.filter(a => {
        if (filter === 'active' && a.resolved) return false;
        if (filter === 'resolved' && !a.resolved) return false;
        if (severityFilter !== 'all' && a.severity !== severityFilter) return false;
        return true;
    });

    const activeCount = alerts.filter(a => !a.resolved).length;
    const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;
    const warningCount = alerts.filter(a => !a.resolved && a.severity === 'warning').length;
    const infoCount = alerts.filter(a => !a.resolved && a.severity === 'info').length;

    const handleResolve = () => {
        if (!resolveModal) return;
        setAlerts(prev => prev.map(a =>
            a.id === resolveModal.id ? { ...a, resolved: true, resolved_at: new Date().toISOString(), resolution_notes: resolveNotes } : a
        ));
        setResolveModal(null);
        setResolveNotes('');
    };

    return (
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Bell size={24} style={{ color: 'var(--color-brand)' }} /> Alertas de Cumplimiento
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Detecta incumplimientos en el registro horario · RDL 8/2019</p>
                </div>
                {activeCount > 0 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 20 }}>
                        <AlertCircle size={16} style={{ color: '#dc2626' }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#dc2626' }}>{activeCount} activa{activeCount !== 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 24 }}>
                {[
                    { ...SEVERITY_CONFIG.critical, label: 'Críticas', value: criticalCount, icon: AlertCircle },
                    { ...SEVERITY_CONFIG.warning, label: 'Advertencias', value: warningCount, icon: AlertTriangle },
                    { ...SEVERITY_CONFIG.info, label: 'Informativas', value: infoCount, icon: Info },
                    { label: 'Resueltas', value: alerts.filter(a => a.resolved).length, icon: CheckCircle, color: '#22c55e', bg: '#f0fdf4', borderColor: '#bbf7d0' },
                ].map((s, i) => (
                    <div key={i} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <s.icon size={20} style={{ color: s.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text)' }}>{s.value}</div>
                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <Filter size={16} style={{ color: 'var(--color-text-secondary)' }} />
                {(['active', 'all', 'resolved'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{ padding: '6px 14px', borderRadius: 8, border: filter === f ? '2px solid var(--color-brand)' : '1px solid var(--color-border)', background: filter === f ? 'var(--color-brand)' : 'var(--color-surface)', color: filter === f ? '#fff' : 'var(--color-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                        {f === 'active' ? '🔔 Activas' : f === 'all' ? 'Todas' : '✅ Resueltas'}
                    </button>
                ))}
                <div style={{ width: 1, height: 24, background: 'var(--color-border)', margin: '0 4px' }} />
                {(['all', 'critical', 'warning', 'info'] as const).map(s => (
                    <button key={s} onClick={() => setSeverityFilter(s)} style={{ padding: '6px 14px', borderRadius: 8, border: severityFilter === s ? `2px solid ${s === 'all' ? 'var(--color-brand)' : SEVERITY_CONFIG[s as AlertSeverity]?.color || 'var(--color-brand)'}` : '1px solid var(--color-border)', background: severityFilter === s && s !== 'all' ? SEVERITY_CONFIG[s as AlertSeverity]?.bg : 'var(--color-surface)', color: severityFilter === s && s !== 'all' ? SEVERITY_CONFIG[s as AlertSeverity]?.color : 'var(--color-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                        {s === 'all' ? 'Todas' : SEVERITY_CONFIG[s as AlertSeverity]?.label}
                    </button>
                ))}
            </div>

            {/* Alert list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filtered.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 60, background: 'var(--color-surface)', borderRadius: 12, border: '1px solid var(--color-border)' }}>
                        <CheckCircle size={48} style={{ color: '#22c55e', margin: '0 auto 16px' }} />
                        <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-text)', margin: '0 0 8px' }}>Sin alertas</h3>
                        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>No hay alertas que coincidan con los filtros seleccionados</p>
                    </div>
                ) : filtered.map(alert => {
                    const typeConf = ALERT_TYPE_CONFIG[alert.alert_type];
                    const sevConf = SEVERITY_CONFIG[alert.severity];
                    const TypeIcon = typeConf.icon;
                    return (
                        <div key={alert.id} style={{
                            background: 'var(--color-surface)', border: `1px solid ${alert.resolved ? 'var(--color-border)' : sevConf.borderColor}`,
                            borderRadius: 12, padding: 20, display: 'flex', alignItems: 'flex-start', gap: 16,
                            opacity: alert.resolved ? 0.7 : 1, borderLeft: `4px solid ${alert.resolved ? '#94a3b8' : sevConf.color}`,
                        }}>
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: sevConf.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <TypeIcon size={20} style={{ color: typeConf.color }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{typeConf.label}</span>
                                    <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: sevConf.bg, color: sevConf.color, border: `1px solid ${sevConf.borderColor}` }}>{sevConf.label}</span>
                                    {alert.resolved && (
                                        <span style={{ padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' }}>✓ Resuelta</span>
                                    )}
                                </div>
                                <p style={{ fontSize: 14, color: 'var(--color-text)', margin: '4px 0' }}>{alert.message}</p>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                                    <span>👤 {alert.user_name}</span>
                                    <span>📅 {new Date(alert.alert_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                </div>
                                {alert.resolved && alert.resolution_notes && (
                                    <div style={{ marginTop: 8, padding: '8px 12px', background: 'var(--color-bg)', borderRadius: 6, fontSize: 13, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                                        <MessageSquare size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                                        <span>{alert.resolution_notes}</span>
                                    </div>
                                )}
                            </div>
                            {isAdmin && !alert.resolved && (
                                <button onClick={() => { setResolveModal(alert); setResolveNotes(''); }} title="Resolver alerta" style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid #22c55e', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                                    <CheckCircle size={16} style={{ color: '#22c55e' }} />
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Resolve Modal */}
            {resolveModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Resolver Alerta</h2>
                            <button onClick={() => setResolveModal(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={16} /></button>
                        </div>
                        <div style={{ padding: 12, background: SEVERITY_CONFIG[resolveModal.severity].bg, borderRadius: 8, border: `1px solid ${SEVERITY_CONFIG[resolveModal.severity].borderColor}`, marginBottom: 16, fontSize: 13, color: 'var(--color-text)' }}>
                            {resolveModal.message}
                        </div>
                        <div>
                            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Notas de resolución</label>
                            <textarea value={resolveNotes} onChange={e => setResolveNotes(e.target.value)} rows={3} placeholder="Explica cómo se ha resuelto la incidencia..." style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box' }} />
                        </div>
                        <button onClick={handleResolve} style={{ width: '100%', padding: 12, background: '#22c55e', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: 'pointer', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <CheckCircle size={16} /> Marcar como resuelta
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
