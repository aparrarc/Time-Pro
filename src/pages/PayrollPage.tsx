import { useState, useEffect } from 'react';
import { Receipt, Download, Calendar, FileText, TrendingUp, Euro, Clock, AlertCircle, PenTool, CheckCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../store/appStore';
import { SignaturePad } from '../components/SignaturePad';
import { logAuditEvent } from '../lib/auditLog';

interface Payroll {
    id: string;
    month: number;
    year: number;
    gross: number;
    net: number;
    status: 'pending' | 'paid' | 'error';
    pdf_url: string | null;
    payment_date: string | null;
}

const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const demoPayrolls: Payroll[] = [
    { id: '1', month: 1, year: 2026, gross: 2850.00, net: 2180.50, status: 'paid', pdf_url: null, payment_date: '2026-01-31' },
    { id: '2', month: 12, year: 2025, gross: 2850.00, net: 2180.50, status: 'paid', pdf_url: null, payment_date: '2025-12-31' },
    { id: '3', month: 11, year: 2025, gross: 2850.00, net: 2180.50, status: 'paid', pdf_url: null, payment_date: '2025-11-30' },
    { id: '4', month: 10, year: 2025, gross: 2850.00, net: 2180.50, status: 'paid', pdf_url: null, payment_date: '2025-10-31' },
    { id: '5', month: 9, year: 2025, gross: 2850.00, net: 2180.50, status: 'paid', pdf_url: null, payment_date: '2025-09-30' },
    { id: '6', month: 8, year: 2025, gross: 3350.00, net: 2520.75, status: 'paid', pdf_url: null, payment_date: '2025-08-31' },
];

export function PayrollPage() {
    const { user, addToast } = useAppStore();
    const [payrolls, setPayrolls] = useState<Payroll[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState<string | null>(null);
    const [signingPayrollId, setSigningPayrollId] = useState<string | null>(null);
    const [signedPayrolls, setSignedPayrolls] = useState<Set<string>>(new Set());

    useEffect(() => {
        loadPayrolls();
        loadSignatures();
    }, []);

    const loadPayrolls = async () => {
        setLoading(true);
        if (!isSupabaseConfigured()) {
            setPayrolls(demoPayrolls);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('payrolls')
                .select('*')
                .order('year', { ascending: false })
                .order('month', { ascending: false });

            if (error) throw error;
            setPayrolls((data as Payroll[]) || []);
        } catch {
            setPayrolls(demoPayrolls);
        } finally {
            setLoading(false);
        }
    };

    const loadSignatures = async () => {
        if (!isSupabaseConfigured() || !user) return;
        const { data } = await supabase
            .from('payroll_signatures')
            .select('payroll_id')
            .eq('user_id', user.id);
        if (data) {
            setSignedPayrolls(new Set(data.map((s: any) => s.payroll_id)));
        }
    };

    const handleSign = async (signatureDataUrl: string) => {
        if (!signingPayrollId || !user) return;
        try {
            if (isSupabaseConfigured()) {
                const { error } = await supabase
                    .from('payroll_signatures')
                    .insert({
                        payroll_id: signingPayrollId,
                        user_id: user.id,
                        signature_data: signatureDataUrl,
                        user_agent: navigator.userAgent,
                    });
                if (error) throw error;
            }
            setSignedPayrolls(prev => new Set([...prev, signingPayrollId]));
            addToast('success', '✅ Nómina firmada correctamente');
            logAuditEvent({ action: 'payroll_signed', entityType: 'payroll', entityId: signingPayrollId });
        } catch {
            addToast('error', 'Error al guardar la firma');
        } finally {
            setSigningPayrollId(null);
        }
    };

    const handleDownloadPdf = async (payroll: Payroll) => {
        if (!payroll.pdf_url) {
            addToast('info', 'Nómina en formato digital no disponible aún');
            return;
        }

        setDownloading(payroll.id);
        try {
            if (isSupabaseConfigured()) {
                const { data, error } = await supabase.storage
                    .from('payrolls')
                    .download(payroll.pdf_url);
                if (error) throw error;

                const url = URL.createObjectURL(data);
                const a = document.createElement('a');
                a.href = url;
                a.download = `nomina_${monthNames[payroll.month - 1]}_${payroll.year}.pdf`;
                a.click();
                URL.revokeObjectURL(url);
                addToast('success', '📄 Nómina descargada');
            } else {
                addToast('info', '📄 Descarga no disponible en modo demo');
            }
        } catch {
            addToast('error', 'Error al descargar la nómina');
        } finally {
            setDownloading(null);
        }
    };

    // Compute summary stats
    const latestPayroll = payrolls[0];
    const totalGrossYear = payrolls
        .filter(p => p.year === (latestPayroll?.year || 2026))
        .reduce((sum, p) => sum + p.gross, 0);

    const statusBadge = (status: string) => {
        const map: Record<string, { cls: string; label: string }> = {
            paid: { cls: 'badge-success', label: 'Pagado' },
            pending: { cls: 'badge-warning', label: 'Pendiente' },
            error: { cls: 'badge-error', label: 'Error' },
        };
        const s = map[status] || map.paid;
        return <span className={`badge ${s.cls}`}>{s.label}</span>;
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Nóminas</h1>
                <p className="page-header-subtitle">Consulta y descarga tus nóminas mensuales</p>
            </div>

            {/* Summary Cards */}
            <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-icon-bg-success)', color: '#059669' }}>
                            <Euro size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">
                            {latestPayroll ? latestPayroll.net.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '—'}
                        </div>
                        <div className="stat-card-label">Salario neto último mes</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">
                            {latestPayroll ? latestPayroll.gross.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '—'}
                        </div>
                        <div className="stat-card-label">Salario bruto mensual</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">14</div>
                        <div className="stat-card-label">Pagas anuales</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-icon-bg-brand)', color: '#7C3AED' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">
                            {totalGrossYear.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </div>
                        <div className="stat-card-label">Acumulado bruto anual</div>
                    </div>
                </div>
            </div>

            {/* Payroll Table */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div className="section-title" style={{ marginBottom: 0 }}>Historial de nóminas</div>
                    <button className="btn btn-outline btn-sm">
                        <FileText size={16} />
                        Resumen anual
                    </button>
                </div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div className="spinner-sm" />
                    </div>
                ) : payrolls.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><Receipt size={28} /></div>
                        <div className="empty-state-title">Sin nóminas</div>
                        <div className="empty-state-text">Aún no hay nóminas registradas.</div>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Período</th>
                                    <th>Bruto</th>
                                    <th>Neto</th>
                                    <th>Estado</th>
                                    <th>Fecha pago</th>
                                    <th></th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {payrolls.map((payroll) => (
                                    <tr key={payroll.id}>
                                        <td style={{ fontWeight: 600 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Receipt size={16} style={{ color: 'var(--color-text-muted)' }} />
                                                {monthNames[payroll.month - 1]} {payroll.year}
                                            </div>
                                        </td>
                                        <td>{payroll.gross.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                        <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                            {payroll.net.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                        </td>
                                        <td>{statusBadge(payroll.status)}</td>
                                        <td style={{ color: 'var(--color-text-secondary)' }}>
                                            {payroll.payment_date
                                                ? new Date(payroll.payment_date).toLocaleDateString('es-ES')
                                                : '—'}
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-ghost btn-xs"
                                                onClick={() => handleDownloadPdf(payroll)}
                                                disabled={downloading === payroll.id}
                                            >
                                                {downloading === payroll.id ? (
                                                    <div className="spinner-sm" style={{ width: 16, height: 16 }} />
                                                ) : (
                                                    <Download size={16} />
                                                )}
                                                PDF
                                            </button>
                                        </td>
                                        <td>
                                            {signedPayrolls.has(payroll.id) ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: '#16a34a', fontSize: '0.8125rem', fontWeight: 600 }}>
                                                    <CheckCircle size={14} /> Firmada
                                                </span>
                                            ) : payroll.status === 'paid' ? (
                                                <button
                                                    className="btn btn-ghost btn-xs"
                                                    onClick={() => setSigningPayrollId(payroll.id)}
                                                    style={{ color: '#6366f1' }}
                                                >
                                                    <PenTool size={14} />
                                                    Firmar
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Incidents section */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="section-title">Incidencias de nómina</div>
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <Receipt size={28} />
                    </div>
                    <div className="empty-state-title">Sin incidencias</div>
                    <div className="empty-state-text">No tienes incidencias de nómina pendientes. Si detectas algún error, puedes contactar con RRHH.</div>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '1rem' }}>
                        Reportar incidencia
                    </button>
                </div>
            </div>

            {/* Signature Modal */}
            {signingPayrollId && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '1rem',
                }}>
                    <SignaturePad
                        onConfirm={handleSign}
                        onCancel={() => setSigningPayrollId(null)}
                    />
                </div>
            )}
        </div>
    );
}
