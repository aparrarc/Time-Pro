import { Receipt, Download, Calendar, FileText, TrendingUp, Euro, Clock } from 'lucide-react';

const demoPayrolls = [
    { id: '1', month: 'Enero 2026', gross: 2850.00, net: 2180.50, status: 'paid', date: '2026-01-31' },
    { id: '2', month: 'Diciembre 2025', gross: 2850.00, net: 2180.50, status: 'paid', date: '2025-12-31' },
    { id: '3', month: 'Noviembre 2025', gross: 2850.00, net: 2180.50, status: 'paid', date: '2025-11-30' },
    { id: '4', month: 'Octubre 2025', gross: 2850.00, net: 2180.50, status: 'paid', date: '2025-10-31' },
    { id: '5', month: 'Septiembre 2025', gross: 2850.00, net: 2180.50, status: 'paid', date: '2025-09-30' },
    { id: '6', month: 'Agosto 2025', gross: 3350.00, net: 2520.75, status: 'paid', date: '2025-08-31' },
];

export function PayrollPage() {
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
                        <div className="stat-card-value">2.180,50 €</div>
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
                        <div className="stat-card-value">2.850,00 €</div>
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
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">0h</div>
                        <div className="stat-card-label">Horas extra este mes</div>
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
                            {demoPayrolls.map((payroll) => (
                                <tr key={payroll.id}>
                                    <td style={{ fontWeight: 600 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Receipt size={16} style={{ color: 'var(--color-text-muted)' }} />
                                            {payroll.month}
                                        </div>
                                    </td>
                                    <td>{payroll.gross.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--color-success)' }}>
                                        {payroll.net.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                                    </td>
                                    <td>
                                        <span className="badge badge-success">Pagado</span>
                                    </td>
                                    <td style={{ color: 'var(--color-text-secondary)' }}>
                                        {new Date(payroll.date).toLocaleDateString('es-ES')}
                                    </td>
                                    <td>
                                        <button className="btn btn-ghost btn-xs">
                                            <Download size={16} />
                                            PDF
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
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
