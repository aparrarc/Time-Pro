import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus, Shield, Power, CheckCircle, XCircle, Clock, Calendar, Users as UsersIcon, ChevronLeft, ChevronRight, FileText, Search, Mail, Phone } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

export function UsersPage() {
    const navigate = useNavigate();
    const {
        user: currentUser,
        allUsers,
        fetchAllUsers,
        updateUserRole,
        toggleUserStatus,
        liveAttendance,
        fetchLiveAttendance,
        allAbsenceRequests,
        fetchAllAbsences,
        updateAbsenceStatus,
        dailyAttendance,
        fetchDailyAttendance,
        employeeHistory,
        fetchEmployeeHistory
    } = useAppStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'staff' | 'absences' | 'attendance'>('staff');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [viewingUserHistory, setViewingUserHistory] = useState<string | null>(null);

    useEffect(() => {
        fetchAllUsers();
        fetchLiveAttendance();
        fetchAllAbsences();
    }, [fetchAllUsers, fetchLiveAttendance, fetchAllAbsences]);

    useEffect(() => {
        if (activeTab === 'attendance') {
            fetchDailyAttendance(selectedDate);
        }
    }, [activeTab, selectedDate, fetchDailyAttendance]);

    const filteredUsers = allUsers.filter(user =>
        user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pendingAbsences = allAbsenceRequests.filter(a => a.status === 'pending');

    const handleViewHistory = (userId: string) => {
        fetchEmployeeHistory(userId);
        setViewingUserHistory(userId);
    };

    const calculateHours = (start: string, end?: string | null) => {
        if (!end) return 'En curso...';
        const duration = new Date(end).getTime() - new Date(start).getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    const roleLabels: Record<string, string> = {
        admin: 'Admin',
        supervisor: 'Supervisor',
        hr: 'RRHH',
        employee: 'Empleado',
    };

    const roleBadgeColors: Record<string, { bg: string; color: string }> = {
        admin: { bg: '#eef2ff', color: '#4f46e5' },
        supervisor: { bg: '#fef3c7', color: '#d97706' },
        hr: { bg: '#ecfdf5', color: '#10b981' },
        employee: { bg: '#f3f4f6', color: '#6b7280' },
    };

    // Employee history view
    if (viewingUserHistory) {
        const user = allUsers.find(u => u.id === viewingUserHistory);
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewingUserHistory(null)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--color-text-secondary)' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: 'var(--color-text-primary)' }}>
                            Historial: {user?.full_name}
                        </h1>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
                    </div>
                </div>

                <div className="space-y-3">
                    {employeeHistory.length === 0 ? (
                        <div className="empty-state">
                            <FileText size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                            <h3 className="empty-state-title">Sin registros</h3>
                            <p className="empty-state-text">No hay registros para este empleado</p>
                        </div>
                    ) : (
                        employeeHistory.map(entry => (
                            <div key={entry.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold capitalize" style={{ color: 'var(--color-text-primary)' }}>
                                            {format(new Date(entry.clock_in), 'EEEE, d MMMM', { locale: es })}
                                        </p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                            {format(new Date(entry.clock_in), 'HH:mm')} — {entry.clock_out ? format(new Date(entry.clock_out), 'HH:mm') : 'Activo'}
                                        </p>
                                    </div>
                                    <span className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                                        {calculateHours(entry.clock_in, entry.clock_out)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Gestión de usuarios</h1>
                    <p className="page-subtitle">Administra la plantilla, ausencias y jornadas laborales</p>
                </div>
                <button
                    onClick={() => navigate('/users/create')}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                >
                    <UserPlus size={16} />
                    Nuevo empleado
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--color-bg-secondary)' }}>
                {[
                    { key: 'staff', label: 'Plantilla', icon: UsersIcon, count: allUsers.length },
                    { key: 'absences', label: 'Ausencias', icon: Calendar, count: pendingAbsences.length },
                    { key: 'attendance', label: 'Jornadas', icon: Clock },
                ].map(({ key, label, icon: Icon, count }) => (
                    <button
                        key={key}
                        onClick={() => setActiveTab(key as any)}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                        style={{
                            background: activeTab === key ? 'white' : 'transparent',
                            color: activeTab === key ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                            boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        }}
                    >
                        <Icon size={16} />
                        <span>{label}</span>
                        {count !== undefined && count > 0 && activeTab !== key && (
                            <span className="w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: key === 'absences' ? '#fef2f2' : 'var(--color-bg-tertiary)', color: key === 'absences' ? '#ef4444' : 'var(--color-text-muted)' }}>
                                {count}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* STAFF TAB */}
            {activeTab === 'staff' && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: 'var(--color-text-muted)' }} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all"
                            style={{
                                border: '1.5px solid var(--color-border)',
                                background: 'var(--color-bg)',
                                color: 'var(--color-text-primary)',
                                outline: 'none',
                            }}
                            onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                            onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
                        />
                    </div>

                    {/* Users table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Empleado</th>
                                    <th>Rol</th>
                                    <th>Estado</th>
                                    <th>En línea</th>
                                    <th style={{ textAlign: 'right' }}>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map((user) => {
                                    const badge = roleBadgeColors[user.role] || roleBadgeColors.employee;
                                    const isOnline = liveAttendance.some(a => a.user_id === user.id);

                                    return (
                                        <tr key={user.id}>
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar avatar-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                        {user.full_name?.[0] || user.email[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{user.full_name || 'Sin nombre'}</p>
                                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: badge.bg, color: badge.color }}>
                                                    {roleLabels[user.role] || user.role}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="badge" style={{ background: user.is_active ? '#ecfdf5' : '#fef2f2', color: user.is_active ? '#10b981' : '#ef4444' }}>
                                                    {user.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ background: isOnline ? '#10b981' : '#d1d5db' }} />
                                                    <span className="text-xs" style={{ color: isOnline ? '#10b981' : 'var(--color-text-muted)' }}>
                                                        {isOnline ? 'Online' : 'Offline'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1 justify-end">
                                                    <button
                                                        onClick={() => updateUserRole(user.id, user.role === 'admin' ? 'employee' : 'admin')}
                                                        className="p-2 rounded-lg transition-colors"
                                                        title="Cambiar rol"
                                                        disabled={user.id === currentUser?.id}
                                                        style={{ color: user.role === 'admin' ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Shield size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => toggleUserStatus(user.id, !user.is_active)}
                                                        className="p-2 rounded-lg transition-colors"
                                                        title={user.is_active ? 'Desactivar' : 'Activar'}
                                                        disabled={user.id === currentUser?.id}
                                                        style={{ color: user.is_active ? '#10b981' : '#ef4444' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <Power size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleViewHistory(user.id)}
                                                        className="p-2 rounded-lg transition-colors"
                                                        title="Ver historial"
                                                        style={{ color: 'var(--color-text-muted)' }}
                                                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                                    >
                                                        <FileText size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ABSENCES TAB */}
            {activeTab === 'absences' && (
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text-secondary)' }}>
                        Solicitudes pendientes ({pendingAbsences.length})
                    </h2>
                    {pendingAbsences.length === 0 ? (
                        <div className="empty-state">
                            <Calendar size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                            <h3 className="empty-state-title">Sin solicitudes</h3>
                            <p className="empty-state-text">No hay solicitudes pendientes de revisión</p>
                        </div>
                    ) : (
                        pendingAbsences.map(absence => (
                            <div key={absence.id} className="card" style={{ padding: '1.25rem' }}>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar avatar-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 600 }}>
                                            {(absence as any).profiles?.full_name?.[0] || '?'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{(absence as any).profiles?.full_name || 'Empleado'}</p>
                                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                {absence.absence_type === 'vacation' ? 'Vacaciones' : absence.absence_type === 'sick' ? 'Baja médica' : 'Permiso personal'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                                            {format(new Date(absence.start_date), 'd MMM', { locale: es })}
                                        </p>
                                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                            hasta {format(new Date(absence.end_date), 'd MMM', { locale: es })}
                                        </p>
                                    </div>
                                </div>
                                {absence.reason && (
                                    <p className="text-sm italic mb-3 px-1" style={{ color: 'var(--color-text-secondary)' }}>
                                        "{absence.reason}"
                                    </p>
                                )}
                                <div className="flex gap-2 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                                    <button
                                        onClick={() => updateAbsenceStatus(absence.id, 'approved')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                        style={{ background: '#ecfdf5', color: '#10b981' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#d1fae5'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#ecfdf5'}
                                    >
                                        <CheckCircle size={16} />
                                        Aprobar
                                    </button>
                                    <button
                                        onClick={() => updateAbsenceStatus(absence.id, 'rejected')}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                        style={{ background: '#fef2f2', color: '#ef4444' }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                                    >
                                        <XCircle size={16} />
                                        Rechazar
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* ATTENDANCE TAB */}
            {activeTab === 'attendance' && (
                <div className="space-y-4">
                    {/* Date Selector */}
                    <div className="card" style={{ padding: '1rem 1.25rem' }}>
                        <div className="flex items-center justify-between">
                            <button
                                onClick={() => setSelectedDate(subDays(selectedDate, 1))}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: 'var(--color-text-secondary)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="text-center">
                                <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
                                    Registros del día
                                </p>
                                <p className="text-sm font-bold" style={{ color: 'var(--color-primary)' }}>
                                    {isSameDay(selectedDate, new Date()) ? 'Hoy, ' : ''}
                                    {format(selectedDate, "d 'de' MMMM", { locale: es })}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                                className="p-2 rounded-lg transition-colors"
                                style={{ color: 'var(--color-text-secondary)' }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-secondary)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {dailyAttendance.length === 0 ? (
                            <div className="empty-state">
                                <Clock size={48} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                                <h3 className="empty-state-title">Sin actividad</h3>
                                <p className="empty-state-text">No hay actividad registrada este día</p>
                            </div>
                        ) : (
                            dailyAttendance.map(entry => (
                                <div key={entry.id} className="card" style={{ padding: '1rem 1.25rem' }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar avatar-sm" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', fontWeight: 600 }}>
                                                {entry.profiles?.full_name?.[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{entry.profiles?.full_name}</p>
                                                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                    {format(new Date(entry.clock_in), 'HH:mm')} — {entry.clock_out ? format(new Date(entry.clock_out), 'HH:mm') : 'Activo'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-bold" style={{ color: !entry.clock_out ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
                                                {calculateHours(entry.clock_in, entry.clock_out)}
                                            </p>
                                            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                                                {!entry.clock_out ? 'En curso' : 'Total'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
