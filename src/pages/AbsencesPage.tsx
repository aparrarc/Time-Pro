import { useEffect, useState } from 'react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Palmtree, Thermometer, User, CalendarDays, X, Send, CheckCircle } from 'lucide-react';
import { useAppStore } from '../store/appStore';

const absenceTypeConfig = {
    vacation: { label: 'Vacaciones', icon: Palmtree, color: '#10b981', bg: '#ecfdf5' },
    sick: { label: 'Baja médica', icon: Thermometer, color: '#ef4444', bg: '#fef2f2' },
    personal: { label: 'Personal', icon: User, color: '#6366f1', bg: '#eef2ff' },
    other: { label: 'Otro', icon: CalendarDays, color: '#6b7280', bg: '#f9fafb' }
};

const statusConfig = {
    pending: { label: 'Pendiente', color: '#d97706', bg: '#fffbeb' },
    approved: { label: 'Aprobada', color: '#10b981', bg: '#ecfdf5' },
    rejected: { label: 'Rechazada', color: '#ef4444', bg: '#fef2f2' }
};

export function AbsencesPage() {
    const { user, absenceRequests, fetchAbsences, requestAbsence } = useAppStore();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [showForm, setShowForm] = useState(false);
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        absenceType: 'vacation' as keyof typeof absenceTypeConfig,
        startDate: '',
        endDate: '',
        reason: '',
    });

    useEffect(() => {
        fetchAbsences();
    }, [fetchAbsences]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (requestAbsence) {
                await requestAbsence({
                    absence_type: formData.absenceType,
                    start_date: formData.startDate,
                    end_date: formData.endDate || formData.startDate,
                    reason: formData.reason,
                });
            }
            setFormSubmitted(true);
            setTimeout(() => {
                setShowForm(false);
                setFormSubmitted(false);
                setFormData({ absenceType: 'vacation', startDate: '', endDate: '', reason: '' });
            }, 2000);
        } catch {
            // handle errors
        }
        setIsSubmitting(false);
    };

    const days = eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    });

    const firstDayOfWeek = startOfMonth(currentMonth).getDay();
    const paddingDays = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    const hasAbsence = (date: Date) => {
        return absenceRequests.find(absence => {
            const start = new Date(absence.start_date);
            const end = new Date(absence.end_date);
            return date >= start && date <= end && absence.status === 'approved';
        });
    };

    const usedDays = absenceRequests
        .filter(a => a.absence_type === 'vacation' && a.status === 'approved')
        .length;

    const totalVacation = user?.vacation_days || 22;
    const availableDays = totalVacation - usedDays;
    const pendingCount = absenceRequests.filter(a => a.status === 'pending').length;

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Ausencias y vacaciones</h1>
                    <p className="page-subtitle">Gestiona tus solicitudes y consulta el calendario</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`btn ${showForm ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    {showForm ? <X size={16} /> : <Plus size={16} />}
                    {showForm ? 'Cancelar' : 'Nueva solicitud'}
                </button>
            </div>

            {/* New absence request form */}
            {showForm && (
                <div className="card" style={{ padding: '1.5rem', border: '2px solid var(--color-primary-light)' }}>
                    {formSubmitted ? (
                        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                            <CheckCircle size={48} style={{ color: '#10b981', marginBottom: '1rem', margin: '0 auto 1rem' }} />
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                ¡Solicitud enviada!
                            </h3>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                                Tu solicitud ha sido registrada y está pendiente de aprobación.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Plus size={18} style={{ color: 'var(--color-primary)' }} />
                                Nueva solicitud de ausencia
                            </h3>

                            {/* Absence type selector */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.5rem' }}>
                                    Tipo de ausencia
                                </label>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.5rem' }}>
                                    {Object.entries(absenceTypeConfig).map(([key, config]) => {
                                        const Icon = config.icon;
                                        const isSelected = formData.absenceType === key;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                onClick={() => setFormData({ ...formData, absenceType: key as any })}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                                                    padding: '0.75rem',
                                                    border: `2px solid ${isSelected ? config.color : 'var(--color-border-light)'}`,
                                                    borderRadius: 'var(--radius-lg)',
                                                    background: isSelected ? config.bg : 'transparent',
                                                    cursor: 'pointer',
                                                    transition: 'all 0.15s',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: isSelected ? 600 : 400,
                                                    color: isSelected ? config.color : 'var(--color-text-secondary)',
                                                }}
                                            >
                                                <Icon size={18} />
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Dates */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                        Fecha inicio *
                                    </label>
                                    <input
                                        className="input"
                                        type="date"
                                        required
                                        value={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                        Fecha fin
                                    </label>
                                    <input
                                        className="input"
                                        type="date"
                                        value={formData.endDate}
                                        min={formData.startDate}
                                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                    />
                                    <p style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                        Déjalo vacío para un solo día
                                    </p>
                                </div>
                            </div>

                            {/* Reason */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                    Motivo (opcional)
                                </label>
                                <textarea
                                    className="input"
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                    placeholder="Describe brevemente el motivo de la ausencia..."
                                    rows={3}
                                    style={{ resize: 'vertical', minHeight: '80px' }}
                                />
                            </div>

                            {/* Submit */}
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="btn btn-secondary btn-md"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-md"
                                    disabled={!formData.startDate || isSubmitting}
                                    style={{ minWidth: '160px' }}
                                >
                                    {isSubmitting ? (
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                width: 16, height: 16,
                                                border: '2px solid rgba(255,255,255,0.3)',
                                                borderTop: '2px solid white',
                                                borderRadius: '50%',
                                                animation: 'spin 0.6s linear infinite',
                                                display: 'inline-block',
                                            }} />
                                            Enviando...
                                        </span>
                                    ) : (
                                        <>
                                            <Send size={16} />
                                            Enviar solicitud
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            {/* Vacation balance */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#ecfdf5' }}>
                        <Palmtree size={18} style={{ color: '#10b981' }} />
                    </div>
                    <div className="stat-card-value">{availableDays}</div>
                    <div className="stat-card-label">Días disponibles</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#eef2ff' }}>
                        <CalendarDays size={18} style={{ color: '#6366f1' }} />
                    </div>
                    <div className="stat-card-value">{usedDays}</div>
                    <div className="stat-card-label">Días usados</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#f0f4ff' }}>
                        <CalendarDays size={18} style={{ color: 'var(--color-primary)' }} />
                    </div>
                    <div className="stat-card-value">{totalVacation}</div>
                    <div className="stat-card-label">Total anual</div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-icon" style={{ background: '#fffbeb' }}>
                        <CalendarDays size={18} style={{ color: '#d97706' }} />
                    </div>
                    <div className="stat-card-value">{pendingCount}</div>
                    <div className="stat-card-label">Pendientes</div>
                </div>
            </div>

            {/* Calendar */}
            <div className="card" style={{ padding: '1.5rem' }}>
                {/* Month navigation */}
                <div className="flex items-center justify-between mb-6">
                    <button
                        onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold capitalize" style={{ color: 'var(--color-text-primary)' }}>
                        {format(currentMonth, 'MMMM yyyy', { locale: es })}
                    </h2>
                    <button
                        onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Week days header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((day) => (
                        <div key={day} className="text-center text-xs font-semibold py-2" style={{ color: 'var(--color-text-muted)' }}>
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                    {/* Padding */}
                    {Array.from({ length: paddingDays }).map((_, i) => (
                        <div key={`pad-${i}`} className="min-h-[44px]" />
                    ))}

                    {/* Days */}
                    {days.map((day) => {
                        const isCurrentDay = isToday(day);
                        const absence = hasAbsence(day);
                        const config = absence ? absenceTypeConfig[absence.absence_type as keyof typeof absenceTypeConfig] : null;

                        return (
                            <button
                                key={day.toISOString()}
                                className="min-h-[44px] rounded-lg flex flex-col items-center justify-center text-sm transition-all relative"
                                style={{
                                    background: isCurrentDay ? 'var(--color-primary)' : absence ? config?.bg : 'transparent',
                                    color: isCurrentDay ? 'white' : absence ? config?.color : 'var(--color-text-primary)',
                                    fontWeight: isCurrentDay || absence ? 600 : 400,
                                }}
                            >
                                {format(day, 'd')}
                                {absence && !isCurrentDay && (
                                    <div className="absolute bottom-1 w-1 h-1 rounded-full" style={{ background: config?.color }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Absence requests */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider px-1" style={{ color: 'var(--color-text-secondary)' }}>
                    Mis solicitudes
                </h2>
                {absenceRequests.length === 0 ? (
                    <div className="empty-state">
                        <CalendarDays size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                        <h3 className="empty-state-title">Sin solicitudes</h3>
                        <p className="empty-state-text">No tienes solicitudes de ausencia registradas</p>
                    </div>
                ) : (
                    absenceRequests.map((absence) => {
                        const config = absenceTypeConfig[absence.absence_type as keyof typeof absenceTypeConfig];
                        const status = statusConfig[absence.status as keyof typeof statusConfig];
                        const Icon = config.icon;

                        return (
                            <div key={absence.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: config.bg }}>
                                        <Icon size={20} style={{ color: config.color }} />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                                            {config.label}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            {format(new Date(absence.start_date), 'd MMM', { locale: es })}
                                            {absence.start_date !== absence.end_date &&
                                                ` — ${format(new Date(absence.end_date), 'd MMM', { locale: es })}`
                                            }
                                        </p>
                                    </div>
                                    <span
                                        className="px-3 py-1 rounded-full text-xs font-semibold"
                                        style={{ background: status.bg, color: status.color }}
                                    >
                                        {status.label}
                                    </span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
