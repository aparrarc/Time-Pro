import { useState, useEffect } from 'react';
import {
    Play,
    Square,
    Coffee,
    Clock,
    CalendarDays,
    TrendingUp,
    Users,
    Timer,
    ArrowRight,
    Pause,
    BarChart3,
    Receipt,
    MessageSquare,
    Building2,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/appStore';

export function DashboardPage() {
    const {
        user,
        currentStatus,
        todayHours,
        activeTimeEntry,
        activeBreak,
        clockIn,
        clockOut,
        startBreak,
        endBreak,
        todayEntries,
        absenceRequests,
        liveAttendance,
        fetchLiveAttendance,
    } = useAppStore();

    const [now, setNow] = useState(new Date());
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (isAdmin) fetchLiveAttendance();
    }, [isAdmin, fetchLiveAttendance]);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    };

    const getElapsed = () => {
        if (!activeTimeEntry) return '00:00:00';
        const start = new Date(activeTimeEntry.clock_in);
        const diff = now.getTime() - start.getTime();
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const statusTexts: Record<string, string> = {
        working: 'Trabajando',
        on_break: 'En pausa',
        not_working: 'Sin fichar',
    };

    const pendingAbsences = absenceRequests.filter(a => a.status === 'pending').length;

    return (
        <div className="animate-fade-in">
            {/* Welcome header */}
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.25rem' }}>
                    {formatDate(now)}
                </div>
                <h1 className="page-header-title" style={{ fontSize: '1.75rem' }}>
                    ¡Hola, {user?.full_name?.split(' ')[0] || 'Usuario'}! 👋
                </h1>
            </div>

            {/* Clock Widget */}
            <div className="clock-widget" style={{ marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                        <div className="clock-widget-time">{formatTime(now)}</div>
                        {activeTimeEntry && (
                            <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 600, opacity: 0.9 }}>
                                <Timer size={18} />
                                <span>{getElapsed()}</span>
                            </div>
                        )}
                        <div className="clock-widget-status">
                            <span
                                className={`sidebar-status-dot ${currentStatus.replace('_', '-')}`}
                                style={{ width: 10, height: 10 }}
                            />
                            {statusTexts[currentStatus]}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        {currentStatus === 'not_working' && (
                            <button className="clock-btn clock-btn-start" onClick={clockIn}>
                                <Play size={18} fill="currentColor" />
                                Fichar entrada
                            </button>
                        )}
                        {currentStatus === 'working' && (
                            <>
                                <button
                                    className="clock-btn clock-btn-stop"
                                    onClick={() => startBreak('coffee')}
                                >
                                    <Coffee size={18} />
                                    Pausa
                                </button>
                                <button className="clock-btn clock-btn-stop" onClick={clockOut}>
                                    <Square size={18} fill="currentColor" />
                                    Fichar salida
                                </button>
                            </>
                        )}
                        {currentStatus === 'on_break' && (
                            <button className="clock-btn clock-btn-start" onClick={endBreak}>
                                <Play size={18} fill="currentColor" />
                                Retomar trabajo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{todayHours.toFixed(1)}h</div>
                        <div className="stat-card-label">Horas hoy</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{todayEntries.length}</div>
                        <div className="stat-card-label">Fichajes hoy</div>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                            <CalendarDays size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{user?.vacation_days || 22}</div>
                        <div className="stat-card-label">Días vacaciones</div>
                    </div>
                </div>

                {isAdmin && (
                    <div className="stat-card">
                        <div className="stat-card-header">
                            <div className="stat-card-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
                                <Users size={20} />
                            </div>
                        </div>
                        <div>
                            <div className="stat-card-value">{liveAttendance.length}</div>
                            <div className="stat-card-label">En activo ahora</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modules & Quick Access */}
            <div className="section-title">Acceso rápido</div>
            <div className="grid-modules" style={{ marginBottom: '1.5rem' }}>
                <Link to="/history" className="module-card">
                    <div className="module-card-icon" style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
                        <Clock size={24} />
                    </div>
                    <div className="module-card-content">
                        <div className="module-card-title">Historial fichajes</div>
                        <div className="module-card-description">Consulta tus registros de entrada y salida</div>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </Link>

                <Link to="/absences" className="module-card">
                    <div className="module-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                        <CalendarDays size={24} />
                    </div>
                    <div className="module-card-content">
                        <div className="module-card-title">Ausencias y vacaciones</div>
                        <div className="module-card-description">
                            Solicita permisos y consulta el calendario
                            {pendingAbsences > 0 && (
                                <span className="badge badge-warning" style={{ marginLeft: '0.5rem' }}>
                                    {pendingAbsences} pendiente{pendingAbsences > 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </Link>

                <Link to="/reports" className="module-card">
                    <div className="module-card-icon" style={{ background: 'var(--color-info-light)', color: 'var(--color-info)' }}>
                        <BarChart3 size={24} />
                    </div>
                    <div className="module-card-content">
                        <div className="module-card-title">Reportes</div>
                        <div className="module-card-description">Análisis y exportación de datos de tiempo</div>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </Link>

                <Link to="/payroll" className="module-card">
                    <div className="module-card-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
                        <Receipt size={24} />
                    </div>
                    <div className="module-card-content">
                        <div className="module-card-title">
                            Nóminas
                            <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Nuevo</span>
                        </div>
                        <div className="module-card-description">Consulta y descarga tus nóminas mensuales</div>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </Link>

                <Link to="/hr-inbox" className="module-card">
                    <div className="module-card-icon" style={{ background: '#FCE7F3', color: '#DB2777' }}>
                        <MessageSquare size={24} />
                    </div>
                    <div className="module-card-content">
                        <div className="module-card-title">
                            Comunicación RRHH
                            <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Nuevo</span>
                        </div>
                        <div className="module-card-description">Contacta directamente con Recursos Humanos</div>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </Link>

                <Link to="/committee" className="module-card">
                    <div className="module-card-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                        <Building2 size={24} />
                    </div>
                    <div className="module-card-content">
                        <div className="module-card-title">
                            Comité de Empresa
                            <span className="badge badge-primary" style={{ marginLeft: '0.5rem' }}>Nuevo</span>
                        </div>
                        <div className="module-card-description">Actas, documentos y tablón del comité</div>
                    </div>
                    <ArrowRight size={18} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
                </Link>
            </div>

            {/* RGPD Notice */}
            <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', background: 'var(--color-brand-50)', border: '1px solid var(--color-brand-200)' }}>
                <AlertCircle size={20} style={{ color: 'var(--color-brand)', flexShrink: 0, marginTop: 2 }} />
                <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                        Cumplimiento RGPD
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                        Todos tus datos están protegidos conforme al Reglamento General de Protección de Datos.
                        <Link to="/privacy" style={{ color: 'var(--color-brand)', marginLeft: '0.25rem', textDecoration: 'none', fontWeight: 600 }}>
                            Más información →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
