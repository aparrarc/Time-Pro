import { useState, useMemo } from 'react';
import { Receipt, Download, ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Euro, TrendingDown, Building, Filter } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { isDemoMode, DEMO_USERS } from '../lib/demoData';
import { exportToCsv, exportToPdf } from '../lib/exportUtils';
import type { PayrollDetail, PayrollStatus } from '../types';

// ── Demo data ────────────────────────────────────────

const STATUS_CONFIG: Record<PayrollStatus, { label: string; color: string; bg: string; icon: typeof CheckCircle }> = {
    draft: { label: 'Borrador', color: '#64748b', bg: '#f1f5f9', icon: AlertCircle },
    approved: { label: 'Aprobada', color: '#2563eb', bg: '#eff6ff', icon: CheckCircle },
    paid: { label: 'Pagada', color: '#16a34a', bg: '#f0fdf4', icon: CheckCircle },
    error: { label: 'Error', color: '#dc2626', bg: '#fef2f2', icon: AlertCircle },
};

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

function generateDemoPayrolls(month: number, year: number): PayrollDetail[] {
    const employees = DEMO_USERS.filter(u => u.role !== 'admin');
    const bases = [2400, 2100, 2800, 1950, 2200];
    const irpfs = [18, 15, 21, 14, 16];

    return employees.map((emp, i) => {
        const base = bases[i % bases.length];
        const seniority = Math.floor(Math.random() * 200);
        const transport = 100;
        const meal = 150;
        const overtime = Math.floor(Math.random() * 300);
        const bonuses = Math.floor(Math.random() * 100);
        const gross = base + seniority + transport + meal + overtime + bonuses;
        const irpfPct = irpfs[i % irpfs.length];
        const irpf = +(gross * irpfPct / 100).toFixed(2);
        const ssPct = 6.35;
        const ssEmp = +(gross * ssPct / 100).toFixed(2);
        const ssCompPct = 29.90;
        const ssComp = +(gross * ssCompPct / 100).toFixed(2);
        const net = +(gross - irpf - ssEmp).toFixed(2);
        const companyCost = +(gross + ssComp).toFixed(2);

        return {
            id: `pd-${emp.id}-${month}-${year}`,
            user_id: emp.id,
            month,
            year,
            base_salary: base,
            seniority_bonus: seniority,
            transport_allowance: transport,
            meal_allowance: meal,
            overtime_pay: overtime,
            other_bonuses: bonuses,
            irpf_percent: irpfPct,
            irpf_amount: irpf,
            ss_employee_percent: ssPct,
            ss_employee_amount: ssEmp,
            ss_company_percent: ssCompPct,
            ss_company_amount: ssComp,
            other_deductions: 0,
            gross_total: gross,
            net_total: net,
            company_cost: companyCost,
            status: month < new Date().getMonth() + 1 ? 'paid' : 'draft' as PayrollStatus,
            created_at: new Date().toISOString(),
            user_name: emp.full_name,
        };
    });
}

const fmt = (n: number) => n.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });

// ── Component ────────────────────────────────────────

export function PayrollDetailPage() {
    const user = useAppStore(s => s.user);
    const isAdmin = user?.role === 'admin';
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [filter, setFilter] = useState<PayrollStatus | 'all'>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const payrolls = useMemo(() => {
        if (isDemoMode) return generateDemoPayrolls(month, year);
        return [];
    }, [month, year]);

    const filtered = useMemo(() => {
        if (filter === 'all') return payrolls;
        return payrolls.filter(p => p.status === filter);
    }, [payrolls, filter]);

    const totals = useMemo(() => {
        return payrolls.reduce((acc, p) => ({
            gross: acc.gross + p.gross_total,
            net: acc.net + p.net_total,
            irpf: acc.irpf + p.irpf_amount,
            ssEmp: acc.ssEmp + p.ss_employee_amount,
            ssComp: acc.ssComp + p.ss_company_amount,
            companyCost: acc.companyCost + p.company_cost,
        }), { gross: 0, net: 0, irpf: 0, ssEmp: 0, ssComp: 0, companyCost: 0 });
    }, [payrolls]);

    const prevMonth = () => {
        if (month === 1) { setMonth(12); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (month === 12) { setMonth(1); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const handleExportCsv = () => {
        exportToCsv({
            filename: `nominas_${year}_${String(month).padStart(2, '0')}`,
            headers: ['Empleado', 'Bruto', 'IRPF', 'SS Empleado', 'SS Empresa', 'Neto', 'Coste empresa', 'Estado'],
            rows: filtered.map(p => [
                p.user_name || '', fmt(p.gross_total), fmt(p.irpf_amount), fmt(p.ss_employee_amount),
                fmt(p.ss_company_amount), fmt(p.net_total), fmt(p.company_cost), STATUS_CONFIG[p.status].label
            ]),
        });
    };

    const handleExportPdf = () => {
        exportToPdf({
            title: 'Resumen de Nóminas',
            subtitle: `${MONTH_NAMES[month - 1]} ${year} · ${filtered.length} empleados`,
            headers: ['Empleado', 'Bruto', 'IRPF', 'SS Emp.', 'SS Empresa', 'Neto', 'Coste Empresa'],
            rows: filtered.map(p => [
                p.user_name || '', fmt(p.gross_total), fmt(p.irpf_amount), fmt(p.ss_employee_amount),
                fmt(p.ss_company_amount), fmt(p.net_total), fmt(p.company_cost),
            ]),
        });
    };

    const STAT_CARDS = [
        { label: 'Bruto Total', value: fmt(totals.gross), icon: <Euro size={20} />, color: '#6366f1' },
        { label: 'IRPF Total', value: fmt(totals.irpf), icon: <TrendingDown size={20} />, color: '#dc2626' },
        { label: 'SS Empresa', value: fmt(totals.ssComp), icon: <Building size={20} />, color: '#f59e0b' },
        { label: 'Coste Empresa', value: fmt(totals.companyCost), icon: <Receipt size={20} />, color: '#16a34a' },
    ];

    return (
        <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Receipt size={24} style={{ color: 'var(--color-brand)' }} /> Nóminas Detalladas
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Desglose completo con IRPF, Seguridad Social y complementos</p>
                </div>
                {isAdmin && (
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={handleExportCsv} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}>
                            <Download size={14} /> CSV
                        </button>
                        <button onClick={handleExportPdf} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: 'none', background: 'var(--color-brand)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                            <Download size={14} /> PDF
                        </button>
                    </div>
                )}
            </div>

            {/* Month navigator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button onClick={prevMonth} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}>
                    <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', minWidth: 200, textAlign: 'center' }}>
                    {MONTH_NAMES[month - 1]} {year}
                </span>
                <button onClick={nextMonth} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}>
                    <ChevronRight size={18} />
                </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
                {STAT_CARDS.map(s => (
                    <div key={s.label} style={{ padding: '16px 20px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>{s.icon}</div>
                        <div>
                            <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 500 }}>{s.label}</div>
                            <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)' }}>{s.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Status filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                <Filter size={14} style={{ color: 'var(--color-text-secondary)' }} />
                {(['all', 'draft', 'approved', 'paid', 'error'] as const).map(f => (
                    <button key={f} onClick={() => setFilter(f)} style={{
                        padding: '6px 14px', borderRadius: 20, border: filter === f ? 'none' : '1px solid var(--color-border)',
                        background: filter === f ? 'var(--color-brand)' : 'var(--color-surface)',
                        color: filter === f ? '#fff' : 'var(--color-text)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    }}>
                        {f === 'all' ? 'Todos' : STATUS_CONFIG[f].label} {f !== 'all' && `(${payrolls.filter(p => p.status === f).length})`}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 900 }}>
                        <thead>
                            <tr>
                                {['Empleado', 'Base', 'Complementos', 'Bruto', 'IRPF', 'SS Empl.', 'Neto', 'Estado', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: h === '' ? 'center' : 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(p => {
                                const cfg = STATUS_CONFIG[p.status];
                                const StatusIcon = cfg.icon;
                                const isExpanded = expandedId === p.id;
                                const complements = p.seniority_bonus + p.transport_allowance + p.meal_allowance + p.overtime_pay + p.other_bonuses;

                                return (
                                    <>
                                        <tr key={p.id} onClick={() => setExpandedId(isExpanded ? null : p.id)} style={{ cursor: 'pointer', transition: 'background 0.15s' }}>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{p.user_name}</td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-text)' }}>{fmt(p.base_salary)}</td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 13, color: '#16a34a', fontWeight: 500 }}>+{fmt(complements)}</td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 14, fontWeight: 700, color: 'var(--color-text)' }}>{fmt(p.gross_total)}</td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 13, color: '#dc2626' }}>-{fmt(p.irpf_amount)} <span style={{ fontSize: 11, opacity: 0.7 }}>({p.irpf_percent}%)</span></td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 13, color: '#ea580c' }}>-{fmt(p.ss_employee_amount)} <span style={{ fontSize: 11, opacity: 0.7 }}>({p.ss_employee_percent}%)</span></td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 15, fontWeight: 700, color: '#16a34a' }}>{fmt(p.net_total)}</td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)' }}>
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: cfg.bg, color: cfg.color }}>
                                                    <StatusIcon size={12} /> {cfg.label}
                                                </span>
                                            </td>
                                            <td style={{ padding: '12px 14px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                                {isExpanded ? '▲' : '▼'}
                                            </td>
                                        </tr>
                                        {isExpanded && (
                                            <tr key={`${p.id}-detail`}>
                                                <td colSpan={9} style={{ padding: '16px 20px', background: 'var(--color-bg)', borderBottom: '2px solid var(--color-brand)' }}>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Devengos</div>
                                                            <div style={{ fontSize: 13, color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                <span>Salario base: <strong>{fmt(p.base_salary)}</strong></span>
                                                                <span>Antigüedad: <strong>{fmt(p.seniority_bonus)}</strong></span>
                                                                <span>Transporte: <strong>{fmt(p.transport_allowance)}</strong></span>
                                                                <span>Comida: <strong>{fmt(p.meal_allowance)}</strong></span>
                                                                <span>Horas extra: <strong style={{ color: '#16a34a' }}>{fmt(p.overtime_pay)}</strong></span>
                                                                <span>Otros: <strong>{fmt(p.other_bonuses)}</strong></span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Deducciones</div>
                                                            <div style={{ fontSize: 13, color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                <span>IRPF ({p.irpf_percent}%): <strong style={{ color: '#dc2626' }}>-{fmt(p.irpf_amount)}</strong></span>
                                                                <span>SS Empleado ({p.ss_employee_percent}%): <strong style={{ color: '#ea580c' }}>-{fmt(p.ss_employee_amount)}</strong></span>
                                                                <span>Otras deducciones: <strong>-{fmt(p.other_deductions)}</strong></span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>Coste Empresa</div>
                                                            <div style={{ fontSize: 13, color: 'var(--color-text)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                <span>SS Empresa ({p.ss_company_percent}%): <strong style={{ color: '#f59e0b' }}>{fmt(p.ss_company_amount)}</strong></span>
                                                                <span style={{ marginTop: 8, fontSize: 15, fontWeight: 700, color: 'var(--color-brand)' }}>Total: {fmt(p.company_cost)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Totals row */}
            <div style={{ marginTop: 16, padding: '16px 20px', background: 'var(--color-surface)', border: '2px solid var(--color-brand)', borderRadius: 12, display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>
                    Totales — {MONTH_NAMES[month - 1]} {year} · {payrolls.length} empleados
                </div>
                <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, color: 'var(--color-text)' }}>Bruto: <strong>{fmt(totals.gross)}</strong></span>
                    <span style={{ fontSize: 13, color: '#dc2626' }}>IRPF: <strong>-{fmt(totals.irpf)}</strong></span>
                    <span style={{ fontSize: 13, color: '#ea580c' }}>SS Emp.: <strong>-{fmt(totals.ssEmp)}</strong></span>
                    <span style={{ fontSize: 13, color: '#16a34a', fontWeight: 700 }}>Neto: {fmt(totals.net)}</span>
                    <span style={{ fontSize: 14, color: 'var(--color-brand)', fontWeight: 700 }}>Coste: {fmt(totals.companyCost)}</span>
                </div>
            </div>
        </div>
    );
}
