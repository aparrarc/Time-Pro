import { Building2, FileText, Calendar, Megaphone, Download, Users, Clock } from 'lucide-react';

const announcements = [
    {
        id: '1',
        title: 'Acuerdo sobre flexibilidad horaria 2026',
        content: 'Se ha alcanzado un acuerdo para la implementación de horario flexible a partir del 1 de marzo de 2026. Todos los empleados podrán elegir su franja de entrada entre las 7:00 y las 10:00.',
        date: '2026-02-12',
        type: 'acuerdo',
        pinned: true,
    },
    {
        id: '2',
        title: 'Convocatoria de elecciones sindicales',
        content: 'Se convoca a todos los trabajadores a participar en las elecciones sindicales que se celebrarán el próximo 15 de marzo de 2026.',
        date: '2026-02-08',
        type: 'convocatoria',
        pinned: false,
    },
    {
        id: '3',
        title: 'Resultado negociación convenio colectivo',
        content: 'Se informa a todos los empleados que la negociación del convenio colectivo ha finalizado con un incremento salarial del 3,5% para el año 2026.',
        date: '2026-01-30',
        type: 'información',
        pinned: false,
    },
];

const minutes = [
    { id: '1', title: 'Acta reunión ordinaria - Febrero 2026', date: '2026-02-05', attendees: 8 },
    { id: '2', title: 'Acta reunión extraordinaria - Enero 2026', date: '2026-01-22', attendees: 12 },
    { id: '3', title: 'Acta reunión ordinaria - Enero 2026', date: '2026-01-08', attendees: 7 },
];

const documents = [
    { id: '1', title: 'Convenio colectivo 2026', type: 'PDF', size: '2.4 MB', date: '2026-01-15' },
    { id: '2', title: 'Reglamento interno de trabajo', type: 'PDF', size: '1.8 MB', date: '2025-12-01' },
    { id: '3', title: 'Plan de igualdad', type: 'PDF', size: '3.1 MB', date: '2025-11-20' },
    { id: '4', title: 'Protocolo de acoso laboral', type: 'PDF', size: '1.2 MB', date: '2025-10-15' },
];

export function CommitteePage() {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Comité de Empresa</h1>
                <p className="page-header-subtitle">Tablón de anuncios, actas de reuniones y documentos del comité</p>
            </div>

            {/* Stats */}
            <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: '#ECFDF5', color: '#059669' }}>
                            <Building2 size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">5</div>
                        <div className="stat-card-label">Miembros del comité</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
                            <Megaphone size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{announcements.length}</div>
                        <div className="stat-card-label">Anuncios activos</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">15 Mar</div>
                        <div className="stat-card-label">Próxima reunión</div>
                    </div>
                </div>
            </div>

            <div className="grid-2">
                {/* Announcements */}
                <div>
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Megaphone size={16} />
                        Tablón de anuncios
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {announcements.map((ann) => (
                            <div key={ann.id} className="card" style={{
                                borderLeft: ann.pinned ? '3px solid var(--color-brand)' : undefined,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ann.title}</span>
                                    <span className={`badge ${ann.type === 'acuerdo' ? 'badge-success' : ann.type === 'convocatoria' ? 'badge-warning' : 'badge-neutral'}`}>
                                        {ann.type}
                                    </span>
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                                    {ann.content}
                                </p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} />
                                    {new Date(ann.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right column: Minutes + Documents */}
                <div>
                    {/* Meeting Minutes */}
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} />
                        Actas de reuniones
                    </div>
                    <div className="card" style={{ marginBottom: '1.5rem' }}>
                        {minutes.map((min, i) => (
                            <div key={min.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 0',
                                borderBottom: i < minutes.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                            }}>
                                <div>
                                    <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{min.title}</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Calendar size={12} />
                                            {new Date(min.date).toLocaleDateString('es-ES')}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Users size={12} />
                                            {min.attendees} asistentes
                                        </span>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-xs">
                                    <Download size={14} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Documents */}
                    <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FileText size={16} />
                        Documentos
                    </div>
                    <div className="card">
                        {documents.map((doc, i) => (
                            <div key={doc.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 0',
                                borderBottom: i < documents.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 36,
                                        height: 36,
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--color-error-light)',
                                        color: 'var(--color-error)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.625rem',
                                        fontWeight: 700,
                                        flexShrink: 0,
                                    }}>
                                        {doc.type}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{doc.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {doc.size} · {new Date(doc.date).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-xs">
                                    <Download size={14} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
