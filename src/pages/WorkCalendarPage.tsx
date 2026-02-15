import { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, MapPin, Globe, Building, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { isDemoMode } from '../lib/demoData';
import type { WorkCalendarEntry, CalendarScope } from '../types';

const DEMO_HOLIDAYS: WorkCalendarEntry[] = [
    { id: '1', name: 'Año Nuevo', date: '2026-01-01', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '2', name: 'Epifanía del Señor', date: '2026-01-06', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '3', name: 'Viernes Santo', date: '2026-04-03', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '4', name: 'Día del Trabajo', date: '2026-05-01', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '5', name: 'Asunción de la Virgen', date: '2026-08-15', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '6', name: 'Fiesta Nacional', date: '2026-10-12', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '7', name: 'Todos los Santos', date: '2026-11-01', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '8', name: 'Día de la Constitución', date: '2026-12-06', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '9', name: 'Inmaculada Concepción', date: '2026-12-08', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '10', name: 'Navidad', date: '2026-12-25', scope: 'national', is_active: true, created_at: '2026-01-01' },
    { id: '11', name: 'Sant Jordi', date: '2026-04-23', scope: 'regional', region: 'Cataluña', is_active: true, created_at: '2026-01-01' },
    { id: '12', name: 'San Isidro', date: '2026-05-15', scope: 'local', region: 'Madrid', is_active: true, created_at: '2026-01-01' },
];

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DAYS_SHORT = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const SCOPE_CONFIG: Record<CalendarScope, { label: string; color: string; bg: string; icon: typeof Globe }> = {
    national: { label: 'Nacional', color: '#dc2626', bg: '#fef2f2', icon: Globe },
    regional: { label: 'Autonómico', color: '#ea580c', bg: '#fff7ed', icon: MapPin },
    local: { label: 'Local', color: '#16a34a', bg: '#f0fdf4', icon: Building },
};

function getCalendarDays(year: number, month: number) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPad = (firstDay.getDay() + 6) % 7; // Monday = 0
    const days: (number | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d);
    while (days.length % 7 !== 0) days.push(null);
    return days;
}

export function WorkCalendarPage() {
    const user = useAppStore(s => s.user);
    const isAdmin = user?.role === 'admin';
    const [holidays, setHolidays] = useState<WorkCalendarEntry[]>([]);
    const [year, setYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newHoliday, setNewHoliday] = useState({ name: '', date: '', scope: 'local' as CalendarScope, region: '' });

    useEffect(() => {
        if (isDemoMode) setHolidays(DEMO_HOLIDAYS);
    }, []);

    const holidaysForDate = (dateStr: string) => holidays.filter(h => h.date === dateStr);
    const holidaysForMonth = (m: number) => holidays.filter(h => {
        const d = new Date(h.date);
        return d.getFullYear() === year && d.getMonth() === m;
    });

    const addHoliday = () => {
        if (!newHoliday.name || !newHoliday.date) return;
        setHolidays(prev => [...prev, { ...newHoliday, id: crypto.randomUUID(), is_active: true, created_at: new Date().toISOString() }]);
        setNewHoliday({ name: '', date: '', scope: 'local', region: '' });
        setShowAddModal(false);
    };

    const deleteHoliday = (id: string) => {
        setHolidays(prev => prev.filter(h => h.id !== id));
    };

    const totalByScope = (scope: CalendarScope) => holidays.filter(h => h.scope === scope && new Date(h.date).getFullYear() === year).length;

    return (
        <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Calendario Laboral</h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Festivos nacionales, autonómicos y locales · {year}</p>
                </div>
                {isAdmin && (
                    <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px', background: 'var(--color-brand)', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                        <Plus size={16} /> Añadir festivo
                    </button>
                )}
            </div>

            {/* Year nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                <button onClick={() => setYear(y => y - 1)} style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}><ChevronLeft size={18} /></button>
                <span style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)' }}>{year}</span>
                <button onClick={() => setYear(y => y + 1)} style={{ width: 36, height: 36, border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text)' }}><ChevronRight size={18} /></button>
            </div>

            {/* Scope summary */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                {(Object.entries(SCOPE_CONFIG) as [CalendarScope, typeof SCOPE_CONFIG['national']][]).map(([scope, cfg]) => (
                    <div key={scope} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: cfg.bg, borderRadius: 20, border: `1px solid ${cfg.color}22` }}>
                        <cfg.icon size={14} style={{ color: cfg.color }} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: cfg.color }}>{cfg.label}: {totalByScope(scope)}</span>
                    </div>
                ))}
            </div>

            {/* Calendar grid */}
            {selectedMonth === null ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                    {MONTHS.map((mName, mi) => {
                        const days = getCalendarDays(year, mi);
                        const mHolidays = holidaysForMonth(mi);
                        return (
                            <div key={mi} onClick={() => setSelectedMonth(mi)} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 16, cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', margin: 0 }}>{mName}</h3>
                                    {mHolidays.length > 0 && (
                                        <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#6366f114', color: '#6366f1', fontWeight: 600 }}>{mHolidays.length}</span>
                                    )}
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, fontSize: 11 }}>
                                    {DAYS_SHORT.map(d => (
                                        <div key={d} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', fontWeight: 600, padding: '2px 0' }}>{d}</div>
                                    ))}
                                    {days.map((d, i) => {
                                        if (d === null) return <div key={i} />;
                                        const dateStr = `${year}-${String(mi + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                        const isHoliday = holidaysForDate(dateStr);
                                        const today = new Date();
                                        const isToday = d === today.getDate() && mi === today.getMonth() && year === today.getFullYear();
                                        const isWeekend = (i % 7) >= 5;
                                        return (
                                            <div key={i} style={{
                                                textAlign: 'center', padding: '3px 0', borderRadius: 4, fontSize: 11, fontWeight: isToday ? 700 : 400,
                                                background: isHoliday.length > 0 ? SCOPE_CONFIG[isHoliday[0].scope].bg : isToday ? '#6366f1' : 'transparent',
                                                color: isHoliday.length > 0 ? SCOPE_CONFIG[isHoliday[0].scope].color : isToday ? '#fff' : isWeekend ? 'var(--color-text-secondary)' : 'var(--color-text)',
                                            }}>{d}</div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Expanded month view */
                <div>
                    <button onClick={() => setSelectedMonth(null)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', border: '1px solid var(--color-border)', borderRadius: 8, background: 'var(--color-surface)', cursor: 'pointer', color: 'var(--color-text)', fontSize: 14, marginBottom: 20 }}>
                        <ChevronLeft size={16} /> Volver al año
                    </button>
                    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 24 }}>
                        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text)', margin: '0 0 20px' }}>{MONTHS[selectedMonth]} {year}</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 20 }}>
                            {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(d => (
                                <div key={d} style={{ textAlign: 'center', padding: 8, fontWeight: 600, fontSize: 12, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d}</div>
                            ))}
                            {getCalendarDays(year, selectedMonth).map((d, i) => {
                                if (d === null) return <div key={i} />;
                                const dateStr = `${year}-${String(selectedMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                                const dayHols = holidaysForDate(dateStr);
                                const today = new Date();
                                const isToday = d === today.getDate() && selectedMonth === today.getMonth() && year === today.getFullYear();
                                const isWeekend = (i % 7) >= 5;
                                return (
                                    <div key={i} style={{
                                        padding: 8, border: '1px solid var(--color-border)', borderRadius: 8, minHeight: 70,
                                        background: dayHols.length > 0 ? SCOPE_CONFIG[dayHols[0].scope].bg : isToday ? '#6366f108' : 'transparent',
                                    }}>
                                        <div style={{ fontWeight: isToday ? 700 : 400, fontSize: 14, color: isWeekend ? 'var(--color-text-secondary)' : 'var(--color-text)', marginBottom: 4 }}>
                                            {isToday && <span style={{ display: 'inline-block', width: 24, height: 24, lineHeight: '24px', textAlign: 'center', borderRadius: '50%', background: '#6366f1', color: '#fff' }}>{d}</span>}
                                            {!isToday && d}
                                        </div>
                                        {dayHols.map(h => (
                                            <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600, color: SCOPE_CONFIG[h.scope].color, background: `${SCOPE_CONFIG[h.scope].color}14` }}>
                                                {(() => { const Icon = SCOPE_CONFIG[h.scope].icon; return <Icon size={10} />; })()}
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Holiday list for month */}
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 12 }}>Festivos del mes ({holidaysForMonth(selectedMonth).length})</h3>
                        {holidaysForMonth(selectedMonth).length === 0 ? (
                            <p style={{ color: 'var(--color-text-secondary)', fontSize: 14 }}>No hay festivos este mes</p>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {holidaysForMonth(selectedMonth).map(h => (
                                    <div key={h.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: 'var(--color-bg)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <CalendarDays size={16} style={{ color: SCOPE_CONFIG[h.scope].color }} />
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{h.name}</div>
                                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                                                    {new Date(h.date).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} · <span style={{ color: SCOPE_CONFIG[h.scope].color, fontWeight: 600 }}>{SCOPE_CONFIG[h.scope].label}</span>
                                                    {h.region && ` · ${h.region}`}
                                                </div>
                                            </div>
                                        </div>
                                        {isAdmin && (
                                            <button onClick={() => deleteHoliday(h.id)} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444' }}>
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add Modal */}
            {showAddModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{ background: 'var(--color-surface)', borderRadius: 16, padding: 28, width: '100%', maxWidth: 440, boxShadow: 'var(--shadow-lg)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>Añadir Festivo</h2>
                            <button onClick={() => setShowAddModal(false)} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--color-text-secondary)' }}><X size={16} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Nombre</label>
                                <input value={newHoliday.name} onChange={e => setNewHoliday(p => ({ ...p, name: e.target.value }))} placeholder="Ej: San Isidro" style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Fecha</label>
                                <input type="date" value={newHoliday.date} onChange={e => setNewHoliday(p => ({ ...p, date: e.target.value }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', boxSizing: 'border-box' }} />
                            </div>
                            <div>
                                <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Ámbito</label>
                                <select value={newHoliday.scope} onChange={e => setNewHoliday(p => ({ ...p, scope: e.target.value as CalendarScope }))} style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', boxSizing: 'border-box' }}>
                                    <option value="national">🔴 Nacional</option>
                                    <option value="regional">🟠 Autonómico</option>
                                    <option value="local">🟢 Local</option>
                                </select>
                            </div>
                            {newHoliday.scope !== 'national' && (
                                <div>
                                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text)', display: 'block', marginBottom: 6 }}>Comunidad / Ciudad</label>
                                    <input value={newHoliday.region} onChange={e => setNewHoliday(p => ({ ...p, region: e.target.value }))} placeholder="Ej: Madrid, Cataluña..." style={{ width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: 14, color: 'var(--color-text)', background: 'var(--color-bg)', outline: 'none', boxSizing: 'border-box' }} />
                                </div>
                            )}
                            <button onClick={addHoliday} disabled={!newHoliday.name || !newHoliday.date} style={{ padding: '12px', background: newHoliday.name && newHoliday.date ? 'var(--color-brand)' : '#94a3b8', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: newHoliday.name && newHoliday.date ? 'pointer' : 'not-allowed', marginTop: 8 }}>
                                Guardar festivo
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
