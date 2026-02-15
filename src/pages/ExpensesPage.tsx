import { useState } from 'react';
import {
    Receipt,
    Plus,
    Filter,
    Search,
    CheckCircle2,
    XCircle,
    Clock,
    CreditCard,
    TrendingUp,
    Download,
    Car,
    UtensilsCrossed,
    Hotel,
    Package,
    GraduationCap,
    MoreHorizontal,
    Calendar,
    X,
    Upload,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Expense, ExpenseCategory, ExpenseStatus } from '../types';

const CATEGORY_CONFIG: Record<ExpenseCategory, { label: string; icon: typeof Car; color: string }> = {
    transport: { label: 'Transporte', icon: Car, color: '#3b82f6' },
    meals: { label: 'Comidas', icon: UtensilsCrossed, color: '#f59e0b' },
    accommodation: { label: 'Alojamiento', icon: Hotel, color: '#8b5cf6' },
    supplies: { label: 'Material', icon: Package, color: '#06b6d4' },
    training: { label: 'Formación', icon: GraduationCap, color: '#22c55e' },
    other: { label: 'Otros', icon: MoreHorizontal, color: '#64748b' },
};

const STATUS_CONFIG: Record<ExpenseStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
    pending: { label: 'Pendiente', color: 'var(--color-warning)', bg: 'var(--color-warning-light)', icon: Clock },
    approved: { label: 'Aprobado', color: 'var(--color-success)', bg: 'var(--color-success-light)', icon: CheckCircle2 },
    rejected: { label: 'Rechazado', color: 'var(--color-error)', bg: 'var(--color-error-light)', icon: XCircle },
    reimbursed: { label: 'Reembolsado', color: '#3b82f6', bg: '#eff6ff', icon: CreditCard },
};

const MOCK_EXPENSES: Expense[] = [
    { id: '1', user_id: 'u1', category: 'transport', amount: 45.50, currency: 'EUR', description: 'Taxi a cliente Madrid', expense_date: '2026-02-14', status: 'pending', created_at: '2026-02-14', user_name: 'María García' },
    { id: '2', user_id: 'u1', category: 'meals', amount: 28.00, currency: 'EUR', description: 'Comida de trabajo con proveedor', expense_date: '2026-02-13', status: 'approved', approved_by: 'admin', approved_at: '2026-02-13', created_at: '2026-02-13', user_name: 'María García' },
    { id: '3', user_id: 'u2', category: 'accommodation', amount: 120.00, currency: 'EUR', description: 'Hotel Barcelona (1 noche)', expense_date: '2026-02-10', status: 'approved', approved_by: 'admin', approved_at: '2026-02-11', created_at: '2026-02-10', user_name: 'Carlos López' },
    { id: '4', user_id: 'u1', category: 'supplies', amount: 35.90, currency: 'EUR', description: 'Material de oficina', expense_date: '2026-02-08', status: 'reimbursed', approved_by: 'admin', approved_at: '2026-02-09', created_at: '2026-02-08', user_name: 'María García' },
    { id: '5', user_id: 'u3', category: 'training', amount: 250.00, currency: 'EUR', description: 'Curso certificación AWS', expense_date: '2026-02-05', status: 'pending', created_at: '2026-02-05', user_name: 'Ana Martínez' },
    { id: '6', user_id: 'u1', category: 'transport', amount: 18.75, currency: 'EUR', description: 'Metro + autobús visita cliente', expense_date: '2026-02-03', status: 'rejected', rejection_reason: 'Sin justificante', created_at: '2026-02-03', user_name: 'María García' },
];

export function ExpensesPage() {
    const { user } = useAppStore();
    const isAdmin = user?.role === 'admin';
    const [showModal, setShowModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [filterCategory, setFilterCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filtered = MOCK_EXPENSES.filter(e => {
        if (filterStatus !== 'all' && e.status !== filterStatus) return false;
        if (filterCategory !== 'all' && e.category !== filterCategory) return false;
        if (searchQuery && !e.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const totalPending = MOCK_EXPENSES.filter(e => e.status === 'pending').reduce((s, e) => s + e.amount, 0);
    const totalApproved = MOCK_EXPENSES.filter(e => e.status === 'approved' || e.status === 'reimbursed').reduce((s, e) => s + e.amount, 0);
    const totalThisMonth = MOCK_EXPENSES.reduce((s, e) => s + e.amount, 0);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de Gastos</h1>
                    <p className="page-subtitle">Registra y gestiona los gastos profesionales</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Download size={16} /> Exportar
                    </button>
                    <button onClick={() => setShowModal(true)} className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Plus size={18} /> Nuevo gasto
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                    { icon: Receipt, label: 'Gastos este mes', value: `${totalThisMonth.toFixed(2)} €`, color: 'var(--color-brand)' },
                    { icon: Clock, label: 'Pendientes', value: `${totalPending.toFixed(2)} €`, color: 'var(--color-warning)' },
                    { icon: CheckCircle2, label: 'Aprobados', value: `${totalApproved.toFixed(2)} €`, color: 'var(--color-success)' },
                    { icon: TrendingUp, label: 'Nº registros', value: MOCK_EXPENSES.length, color: '#8b5cf6' },
                ].map(stat => (
                    <div key={stat.label} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: 'var(--radius-xl)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `${stat.color}15`,
                        }}>
                            <stat.icon size={20} style={{ color: stat.color }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-primary)' }}>{stat.value}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: '1 1 200px' }}>
                    <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                        type="text"
                        placeholder="Buscar gastos..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 0.75rem 0.625rem 2.25rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            fontSize: '0.8125rem',
                            fontFamily: 'inherit',
                            color: 'var(--color-text-primary)',
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Filter size={14} style={{ color: 'var(--color-text-muted)' }} />
                    <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={{
                            padding: '0.625rem 0.75rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            fontSize: '0.8125rem',
                            fontFamily: 'inherit',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="approved">Aprobado</option>
                        <option value="rejected">Rechazado</option>
                        <option value="reimbursed">Reembolsado</option>
                    </select>
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        style={{
                            padding: '0.625rem 0.75rem',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid var(--color-border)',
                            background: 'var(--color-surface)',
                            fontSize: '0.8125rem',
                            fontFamily: 'inherit',
                            color: 'var(--color-text-primary)',
                        }}
                    >
                        <option value="all">Todas las categorías</option>
                        {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                            <option key={key} value={key}>{val.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Expenses table */}
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                {['Categoría', 'Descripción', ...(isAdmin ? ['Empleado'] : []), 'Fecha', 'Importe', 'Estado', ...(isAdmin ? ['Acciones'] : [])].map(h => (
                                    <th key={h} style={{
                                        padding: '0.75rem 1rem',
                                        fontSize: '0.6875rem',
                                        fontWeight: 700,
                                        textTransform: 'uppercase' as const,
                                        letterSpacing: '0.05em',
                                        color: 'var(--color-text-muted)',
                                        textAlign: 'left',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(expense => {
                                const cat = CATEGORY_CONFIG[expense.category];
                                const status = STATUS_CONFIG[expense.status];
                                const CatIcon = cat.icon;
                                return (
                                    <tr key={expense.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={{
                                                    width: '36px',
                                                    height: '36px',
                                                    borderRadius: 'var(--radius-lg)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    background: `${cat.color}15`,
                                                }}>
                                                    <CatIcon size={16} style={{ color: cat.color }} />
                                                </div>
                                                <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{cat.label}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{expense.description}</td>
                                        {isAdmin && <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{expense.user_name}</td>}
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                            {new Date(expense.expense_date).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem', fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                            {expense.amount.toFixed(2)} €
                                        </td>
                                        <td style={{ padding: '0.875rem 1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.625rem',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.6875rem',
                                                fontWeight: 700,
                                                background: status.bg,
                                                color: status.color,
                                            }}>{status.label}</span>
                                        </td>
                                        {isAdmin && (
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                {expense.status === 'pending' && (
                                                    <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                        <button title="Aprobar" style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: '1px solid var(--color-success)',
                                                            background: 'var(--color-success-light)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                        }}>
                                                            <CheckCircle2 size={14} style={{ color: 'var(--color-success)' }} />
                                                        </button>
                                                        <button title="Rechazar" style={{
                                                            width: '32px',
                                                            height: '32px',
                                                            borderRadius: 'var(--radius-md)',
                                                            border: '1px solid var(--color-error)',
                                                            background: 'var(--color-error-light)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                        }}>
                                                            <XCircle size={14} style={{ color: 'var(--color-error)' }} />
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {filtered.length === 0 && (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        <Receipt size={40} style={{ marginBottom: '1rem', opacity: 0.4 }} />
                        <p style={{ fontSize: '0.875rem' }}>No se encontraron gastos con los filtros actuales</p>
                    </div>
                )}
            </div>

            {/* New Expense Modal */}
            {showModal && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '1rem',
                }}>
                    <div
                        onClick={() => setShowModal(false)}
                        style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
                    />
                    <div style={{
                        position: 'relative',
                        width: '100%',
                        maxWidth: '520px',
                        borderRadius: 'var(--radius-2xl)',
                        background: 'var(--color-surface)',
                        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                        overflow: 'hidden',
                    }}>
                        {/* Modal header */}
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                Nuevo gasto
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: 'var(--radius-lg)',
                                border: 'none',
                                background: 'var(--color-surface-hover)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                            }}>
                                <X size={16} style={{ color: 'var(--color-text-muted)' }} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {/* Category */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
                                    Categoría *
                                </label>
                                <select style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: 'var(--radius-lg)',
                                    border: '1px solid var(--color-border)',
                                    background: 'var(--color-surface)',
                                    fontSize: '0.875rem',
                                    fontFamily: 'inherit',
                                    color: 'var(--color-text-primary)',
                                }}>
                                    {Object.entries(CATEGORY_CONFIG).map(([key, val]) => (
                                        <option key={key} value={key}>{val.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Amount + Date */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
                                        Importe (€) *
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-surface)',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
                                        Fecha *
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Calendar size={16} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                                        <input
                                            type="date"
                                            defaultValue={new Date().toISOString().split('T')[0]}
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--color-border)',
                                                background: 'var(--color-surface)',
                                                fontSize: '0.875rem',
                                                fontFamily: 'inherit',
                                                color: 'var(--color-text-primary)',
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
                                    Descripción *
                                </label>
                                <textarea
                                    placeholder="Ej: Taxi al aeropuerto para reunión con cliente"
                                    rows={3}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-surface)',
                                        fontSize: '0.875rem',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        color: 'var(--color-text-primary)',
                                    }}
                                />
                            </div>

                            {/* File upload */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
                                    Justificante
                                </label>
                                <div style={{
                                    padding: '1.5rem',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '2px dashed var(--color-border)',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                }}>
                                    <Upload size={24} style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }} />
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                                        Arrastra o haz clic para subir
                                    </p>
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                        PDF, JPG, PNG · Máx. 5 MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Modal footer */}
                        <div style={{
                            padding: '1rem 1.5rem',
                            borderTop: '1px solid var(--color-border)',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '0.75rem',
                        }}>
                            <button onClick={() => setShowModal(false)} className="btn btn-outline">
                                Cancelar
                            </button>
                            <button className="btn btn-primary" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                            }}>
                                <Receipt size={16} /> Registrar gasto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
