import { useState, useEffect } from 'react';
import { Building2, FileText, Calendar, Megaphone, Download, Users, Clock } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

interface CommitteeDoc {
    id: string;
    title: string;
    doc_type: 'announcement' | 'minutes' | 'document';
    content: string | null;
    file_url: string | null;
    file_size: string | null;
    pinned: boolean;
    attendees: number | null;
    published_at: string;
}

// Demo data
const demoAnnouncements: CommitteeDoc[] = [
    {
        id: '1', title: 'Acuerdo sobre flexibilidad horaria 2026', doc_type: 'announcement',
        content: 'Se ha alcanzado un acuerdo para la implementación de horario flexible a partir del 1 de marzo de 2026. Todos los empleados podrán elegir su franja de entrada entre las 7:00 y las 10:00.',
        file_url: null, file_size: null, pinned: true, attendees: null, published_at: '2026-02-12',
    },
    {
        id: '2', title: 'Convocatoria de elecciones sindicales', doc_type: 'announcement',
        content: 'Se convoca a todos los trabajadores a participar en las elecciones sindicales que se celebrarán el próximo 15 de marzo de 2026.',
        file_url: null, file_size: null, pinned: false, attendees: null, published_at: '2026-02-08',
    },
    {
        id: '3', title: 'Resultado negociación convenio colectivo', doc_type: 'announcement',
        content: 'Se informa a todos los empleados que la negociación del convenio colectivo ha finalizado con un incremento salarial del 3,5% para el año 2026.',
        file_url: null, file_size: null, pinned: false, attendees: null, published_at: '2026-01-30',
    },
];

const demoMinutes: CommitteeDoc[] = [
    { id: 'm1', title: 'Acta reunión ordinaria - Febrero 2026', doc_type: 'minutes', content: null, file_url: null, file_size: null, pinned: false, attendees: 8, published_at: '2026-02-05' },
    { id: 'm2', title: 'Acta reunión extraordinaria - Enero 2026', doc_type: 'minutes', content: null, file_url: null, file_size: null, pinned: false, attendees: 12, published_at: '2026-01-22' },
    { id: 'm3', title: 'Acta reunión ordinaria - Enero 2026', doc_type: 'minutes', content: null, file_url: null, file_size: null, pinned: false, attendees: 7, published_at: '2026-01-08' },
];

const demoDocuments: CommitteeDoc[] = [
    { id: 'd1', title: 'Convenio colectivo 2026', doc_type: 'document', content: null, file_url: null, file_size: '2.4 MB', pinned: false, attendees: null, published_at: '2026-01-15' },
    { id: 'd2', title: 'Reglamento interno de trabajo', doc_type: 'document', content: null, file_url: null, file_size: '1.8 MB', pinned: false, attendees: null, published_at: '2025-12-01' },
    { id: 'd3', title: 'Plan de igualdad', doc_type: 'document', content: null, file_url: null, file_size: '3.1 MB', pinned: false, attendees: null, published_at: '2025-11-20' },
    { id: 'd4', title: 'Protocolo de acoso laboral', doc_type: 'document', content: null, file_url: null, file_size: '1.2 MB', pinned: false, attendees: null, published_at: '2025-10-15' },
];

export function CommitteePage() {
    const { addToast } = useAppStore();
    const [announcements, setAnnouncements] = useState<CommitteeDoc[]>([]);
    const [minutes, setMinutes] = useState<CommitteeDoc[]>([]);
    const [documents, setDocuments] = useState<CommitteeDoc[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        setLoading(true);
        if (!isSupabaseConfigured()) {
            setAnnouncements(demoAnnouncements);
            setMinutes(demoMinutes);
            setDocuments(demoDocuments);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('committee_documents')
                .select('*')
                .order('pinned', { ascending: false })
                .order('published_at', { ascending: false });

            if (error) throw error;

            const all = (data as CommitteeDoc[]) || [];
            setAnnouncements(all.filter(d => d.doc_type === 'announcement'));
            setMinutes(all.filter(d => d.doc_type === 'minutes'));
            setDocuments(all.filter(d => d.doc_type === 'document'));
        } catch {
            setAnnouncements(demoAnnouncements);
            setMinutes(demoMinutes);
            setDocuments(demoDocuments);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = (doc: CommitteeDoc) => {
        if (doc.file_url && isSupabaseConfigured()) {
            window.open(doc.file_url, '_blank');
        } else {
            addToast('info', 'Descarga no disponible en modo demo');
        }
    };

    const badgeType = (type: string) => {
        if (type === 'acuerdo') return 'badge-success';
        if (type === 'convocatoria') return 'badge-warning';
        return 'badge-neutral';
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="page-header">
                    <h1 className="page-header-title">Comité de Empresa</h1>
                    <p className="page-header-subtitle">Cargando documentos...</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <div className="spinner-sm" />
                </div>
            </div>
        );
    }

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
                        {announcements.length === 0 ? (
                            <div className="card empty-state">
                                <div className="empty-state-icon"><Megaphone size={28} /></div>
                                <div className="empty-state-title">Sin anuncios</div>
                            </div>
                        ) : announcements.map((ann) => (
                            <div key={ann.id} className="card" style={{
                                borderLeft: ann.pinned ? '3px solid var(--color-brand)' : undefined,
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{ann.title}</span>
                                </div>
                                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '0.5rem' }}>
                                    {ann.content}
                                </p>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} />
                                    {new Date(ann.published_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
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
                        {minutes.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-title">Sin actas</div>
                            </div>
                        ) : minutes.map((min, i) => (
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
                                            {new Date(min.published_at).toLocaleDateString('es-ES')}
                                        </span>
                                        {min.attendees && (
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                                <Users size={12} />
                                                {min.attendees} asistentes
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-xs" onClick={() => handleDownload(min)}>
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
                        {documents.length === 0 ? (
                            <div className="empty-state">
                                <div className="empty-state-title">Sin documentos</div>
                            </div>
                        ) : documents.map((doc, i) => (
                            <div key={doc.id} style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.75rem 0',
                                borderBottom: i < documents.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <div style={{
                                        width: 36, height: 36,
                                        borderRadius: 'var(--radius-md)',
                                        background: 'var(--color-error-light)',
                                        color: 'var(--color-error)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '0.625rem', fontWeight: 700, flexShrink: 0,
                                    }}>
                                        PDF
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.8125rem' }}>{doc.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                            {doc.file_size || '—'} · {new Date(doc.published_at).toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                </div>
                                <button className="btn btn-ghost btn-xs" onClick={() => handleDownload(doc)}>
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
