import { useState, useEffect, useMemo } from 'react';
import { CalendarClock, Plus, ChevronLeft, ChevronRight, Users, Sun, Moon, Sunset, Coffee, ArrowLeftRight, X, Check } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { isDemoMode, DEMO_USERS } from '../lib/demoData';
import type { ShiftTemplate, ShiftAssignment } from '../types';

// ── Demo data ────────────────────────────────────────

const DEMO_SHIFTS: ShiftTemplate[] = [
    { id: 's1', name: 'Mañana', code: 'M', start_time: '06:00', end_time: '14:00', break_minutes: 30, color: '#22c55e', is_night_shift: false, is_active: true, created_at: '' },
    { id: 's2', name: 'Tarde', code: 'T', start_time: '14:00', end_time: '22:00', break_minutes: 30, color: '#f59e0b', is_night_shift: false, is_active: true, created_at: '' },
    { id: 's3', name: 'Noche', code: 'N', start_time: '22:00', end_time: '06:00', break_minutes: 30, color: '#6366f1', is_night_shift: true, is_active: true, created_at: '' },
    { id: 's4', name: 'Jornada Partida', code: 'P', start_time: '09:00', end_time: '18:00', break_minutes: 60, color: '#3b82f6', is_night_shift: false, is_active: true, created_at: '' },
    { id: 's5', name: 'Libre', code: 'L', start_time: '00:00', end_time: '00:00', break_minutes: 0, color: '#94a3b8', is_night_shift: false, is_active: true, created_at: '' },
];

const SHIFT_ICONS: Record<string, typeof Sun> = { M: Sun, T: Sunset, N: Moon, P: Coffee, L: Coffee };

function generateDemoAssignments(weekStart: Date): ShiftAssignment[] {
    const employees = DEMO_USERS.filter(u => u.role !== 'admin').slice(0, 4);
    const shiftCodes = ['s1', 's2', 's3', 's4'];
    const assignments: ShiftAssignment[] = [];

    employees.forEach((emp, empIdx) => {
        for (let d = 0; d < 7; d++) {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + d);
            if (d >= 5) {
                if (Math.random() > 0.3) continue;
            }
            const shiftIdx = (empIdx + d) % shiftCodes.length;
            const shift = DEMO_SHIFTS.find(s => s.id === shiftCodes[shiftIdx])!;
            assignments.push({
                id: `sa-${emp.id}-${d}`,
                user_id: emp.id,
                shift_template_id: shiftCodes[shiftIdx],
                date: date.toISOString().split('T')[0],
                status: d < new Date().getDay() ? 'completed' : 'assigned',
                created_at: '',
                user_name: emp.full_name,
                shift_name: shift.name,
                shift_code: shift.code,
                shift_color: shift.color,
            });
        }
    });
    return assignments;
}

function getWeekStart(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

const DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

// ── Component ────────────────────────────────────────

export function ShiftsPage() {
    const user = useAppStore(s => s.user);
    const isAdmin = user?.role === 'admin';
    const [shifts] = useState<ShiftTemplate[]>(DEMO_SHIFTS);
    const [weekStart, setWeekStart] = useState(() => getWeekStart(new Date()));
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [showAssignModal, setShowAssignModal] = useState<{ userId: string; date: string } | null>(null);
    const [selectedShift, setSelectedShift] = useState<string>('');

    useEffect(() => {
        if (isDemoMode) {
            setAssignments(generateDemoAssignments(weekStart));
        }
    }, [weekStart]);

    const weekDates = useMemo(() => {
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date(weekStart);
            d.setDate(d.getDate() + i);
            return d;
        });
    }, [weekStart]);

    const employees = useMemo(() => {
        if (isDemoMode) return DEMO_USERS.filter(u => u.role !== 'admin').slice(0, 4);
        return [];
    }, []);

    const prevWeek = () => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() - 7);
        setWeekStart(d);
    };
    const nextWeek = () => {
        const d = new Date(weekStart);
        d.setDate(d.getDate() + 7);
        setWeekStart(d);
    };
    const goToday = () => setWeekStart(getWeekStart(new Date()));

    const getAssignment = (userId: string, dateStr: string) =>
        assignments.find(a => a.user_id === userId && a.date === dateStr);

    const shiftStats = useMemo(() => {
        const stats: Record<string, number> = {};
        shifts.filter(s => s.code !== 'L').forEach(s => { stats[s.code] = 0; });
        assignments.forEach(a => {
            const s = shifts.find(sh => sh.id === a.shift_template_id);
            if (s && s.code !== 'L') stats[s.code] = (stats[s.code] || 0) + 1;
        });
        return Object.entries(stats).map(([code, count]) => {
            const s = shifts.find(sh => sh.code === code)!;
            return { ...s, count };
        });
    }, [assignments, shifts]);

    const handleAssign = () => {
        if (!showAssignModal || !selectedShift) return;
        const shift = shifts.find(s => s.id === selectedShift)!;
        const emp = employees.find(e => e.id === showAssignModal.userId);
        setAssignments(prev => {
            const filtered = prev.filter(a => !(a.user_id === showAssignModal.userId && a.date === showAssignModal.date));
            return [...filtered, {
                id: `new-${Date.now()}`,
                user_id: showAssignModal.userId,
                shift_template_id: selectedShift,
                date: showAssignModal.date,
                status: 'assigned',
                created_at: new Date().toISOString(),
                user_name: emp?.full_name,
                shift_name: shift.name,
                shift_code: shift.code,
                shift_color: shift.color,
            }];
        });
        setShowAssignModal(null);
        setSelectedShift('');
    };

    const weekLabel = `${weekDates[0].toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })} — ${weekDates[6].toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}`;

    return (
        <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <CalendarClock size={24} style={{ color: 'var(--color-brand)' }} /> Gestión de Turnos
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Planificación semanal de turnos rotativos</p>
                </div>
            </div>

            {/* Week navigator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <button onClick={prevWeek} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}>
                    <ChevronLeft size={18} />
                </button>
                <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text)', minWidth: 220, textAlign: 'center' }}>{weekLabel}</span>
                <button onClick={nextWeek} style={{ width: 36, height: 36, borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}>
                    <ChevronRight size={18} />
                </button>
                <button onClick={goToday} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--color-brand)', background: 'transparent', color: 'var(--color-brand)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Hoy</button>
            </div>

            {/* Shift stats */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {shiftStats.map(s => {
                    const Icon = SHIFT_ICONS[s.code] || Coffee;
                    return (
                        <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10, borderLeft: `4px solid ${s.color}` }}>
                            <Icon size={16} style={{ color: s.color }} />
                            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)' }}>{s.name}</span>
                            <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.count}</span>
                        </div>
                    );
                })}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 10 }}>
                    <Users size={16} style={{ color: 'var(--color-text-secondary)' }} />
                    <span style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>{employees.length} empleados</span>
                </div>
            </div>

            {/* Schedule grid */}
            <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
                        <thead>
                            <tr>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)', width: 180 }}>
                                    Empleado
                                </th>
                                {weekDates.map((date, i) => {
                                    const isToday = date.toDateString() === new Date().toDateString();
                                    return (
                                        <th key={i} style={{ padding: '12px 8px', textAlign: 'center', fontSize: 12, fontWeight: 600, borderBottom: '2px solid var(--color-border)', background: isToday ? 'var(--color-brand)' : 'var(--color-bg)', color: isToday ? '#fff' : 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                            <div>{DAY_NAMES[i]}</div>
                                            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2 }}>{date.getDate()}</div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id}>
                                    <td style={{ padding: '10px 16px', borderBottom: '1px solid var(--color-border)', fontSize: 14, fontWeight: 500, color: 'var(--color-text)', whiteSpace: 'nowrap' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                                                {emp.full_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600 }}>{emp.full_name}</div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{emp.role === 'supervisor' ? 'Supervisor' : 'Empleado'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    {weekDates.map((date, i) => {
                                        const dateStr = date.toISOString().split('T')[0];
                                        const assignment = getAssignment(emp.id, dateStr);
                                        const isToday = date.toDateString() === new Date().toDateString();
                                        const ShiftIcon = assignment?.shift_code ? (SHIFT_ICONS[assignment.shift_code] || Coffee) : Plus;

                                        return (
                                            <td key={i} style={{ padding: '6px', borderBottom: '1px solid var(--color-border)', textAlign: 'center', background: isToday ? 'rgba(99, 102, 241, 0.04)' : undefined, cursor: isAdmin ? 'pointer' : undefined }} onClick={() => isAdmin && setShowAssignModal({ userId: emp.id, date: dateStr })}>
                                                {assignment ? (
                                                    <div style={{ padding: '8px 4px', borderRadius: 8, background: assignment.shift_color + '18', border: `1px solid ${assignment.shift_color}30`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minHeight: 52 }}>
                                                        <ShiftIcon size={16} style={{ color: assignment.shift_color }} />
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: assignment.shift_color }}>{assignment.shift_code}</span>
                                                        <span style={{ fontSize: 10, color: 'var(--color-text-secondary)' }}>
                                                            {shifts.find(s => s.id === assignment.shift_template_id)?.start_time?.slice(0, 5)}
                                                        </span>
                                                    </div>
                                                ) : (
                                                    isAdmin && (
                                                        <div style={{ padding: '8px', borderRadius: 8, border: '1px dashed var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 52, opacity: 0.4 }}>
                                                            <Plus size={16} style={{ color: 'var(--color-text-secondary)' }} />
                                                        </div>
                                                    )
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                {shifts.filter(s => s.code !== 'L').map(s => {
                    const Icon = SHIFT_ICONS[s.code] || Coffee;
                    return (
                        <div key={s.code} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-secondary)' }}>
                            <div style={{ width: 12, height: 12, borderRadius: 3, background: s.color }} />
                            <Icon size={12} style={{ color: s.color }} />
                            <span>{s.code} = {s.name} ({s.start_time.slice(0, 5)}–{s.end_time.slice(0, 5)})</span>
                        </div>
                    );
                })}
            </div>

            {/* Assign Modal */}
            {showAssignModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 400, boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ArrowLeftRight size={18} /> Asignar Turno
                            </h2>
                            <button onClick={() => setShowAssignModal(null)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={16} /></button>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Empleado</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                                {employees.find(e => e.id === showAssignModal.userId)?.full_name}
                            </div>
                        </div>
                        <div style={{ marginBottom: 16 }}>
                            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 4 }}>Fecha</div>
                            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text)' }}>
                                {new Date(showAssignModal.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                            </div>
                        </div>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 8 }}>Selecciona turno</label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {shifts.map(s => {
                                    const Icon = SHIFT_ICONS[s.code] || Coffee;
                                    return (
                                        <button key={s.id} onClick={() => setSelectedShift(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, border: selectedShift === s.id ? `2px solid ${s.color}` : '1px solid var(--color-border)', background: selectedShift === s.id ? s.color + '12' : 'var(--color-bg)', cursor: 'pointer', textAlign: 'left' }}>
                                            <Icon size={18} style={{ color: s.color }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)' }}>{s.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}</div>
                                            </div>
                                            {selectedShift === s.id && <Check size={18} style={{ color: s.color }} />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <button onClick={handleAssign} disabled={!selectedShift} style={{ width: '100%', padding: 12, background: selectedShift ? 'var(--color-brand)' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: selectedShift ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            <Check size={16} /> Asignar turno
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
