import { useState, useEffect } from 'react';
import { Receipt, Download, Calendar, FileText, TrendingUp, Euro, Clock, AlertCircle } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

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

    useEffect(() => {
        loadPayrolls();
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
                        <div className="stat-card-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
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
                        <div className="stat-card-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
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
        </div>
    );
}
