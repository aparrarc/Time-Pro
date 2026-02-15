import { useState, useEffect } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus, Tag, X } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

type Category = 'general' | 'nomina' | 'vacaciones' | 'contrato' | 'formacion' | 'otro';
type MsgStatus = 'open' | 'replied' | 'closed';

interface HRMessage {
    id: string;
    subject: string;
    category: Category;
    status: MsgStatus;
    body: string;
    reply_body: string | null;
    unread: boolean;
    created_at: string;
}

const categoryLabels: Record<Category, string> = {
    general: 'General',
    nomina: 'Nómina',
    vacaciones: 'Vacaciones',
    contrato: 'Contrato',
    formacion: 'Formación',
    otro: 'Otro',
};

const statusConfig: Record<MsgStatus, { label: string; badge: string }> = {
    open: { label: 'Abierto', badge: 'badge-warning' },
    replied: { label: 'Respondido', badge: 'badge-primary' },
    closed: { label: 'Cerrado', badge: 'badge-success' },
};

const demoMessages: HRMessage[] = [
    {
        id: '1',
        subject: 'Consulta sobre días de asuntos propios',
        category: 'vacaciones',
        status: 'replied',
        body: '¿Cuántos días de asuntos propios me quedan este año?',
        reply_body: 'Hemos revisado tu solicitud, te quedan 3 días de asuntos propios.',
        unread: true,
        created_at: '2026-02-14',
    },
    {
        id: '2',
        subject: 'Error en nómina de diciembre',
        category: 'nomina',
        status: 'closed',
        body: 'He detectado un error en el cálculo de horas extra de diciembre.',
        reply_body: 'Se ha corregido el error y se aplicará el ajuste en la próxima nómina.',
        unread: false,
        created_at: '2026-01-28',
    },
    {
        id: '3',
        subject: 'Solicitud de certificado laboral',
        category: 'contrato',
        status: 'open',
        body: 'Necesito un certificado laboral para presentar en el banco.',
        reply_body: null,
        unread: false,
        created_at: '2026-02-10',
    },
];

export function HRInboxPage() {
    const { user, addToast } = useAppStore();
    const [messages, setMessages] = useState<HRMessage[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewMessage, setShowNewMessage] = useState(false);
    const [sending, setSending] = useState(false);

    // Form state
    const [newCategory, setNewCategory] = useState<Category>('general');
    const [newSubject, setNewSubject] = useState('');
    const [newBody, setNewBody] = useState('');

    useEffect(() => {
        loadMessages();
    }, []);

    const loadMessages = async () => {
        setLoading(true);
        if (!isSupabaseConfigured()) {
            setMessages(demoMessages);
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('hr_messages')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setMessages((data as HRMessage[]) || []);
        } catch {
            setMessages(demoMessages);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!newSubject.trim() || !newBody.trim()) {
            addToast('warning', 'Rellena el asunto y mensaje');
            return;
        }

        setSending(true);

        if (!isSupabaseConfigured()) {
            // Demo mode: add locally
            const newMsg: HRMessage = {
                id: Date.now().toString(),
                subject: newSubject,
                category: newCategory,
                status: 'open',
                body: newBody,
                reply_body: null,
                unread: false,
                created_at: new Date().toISOString(),
            };
            setMessages(prev => [newMsg, ...prev]);
            addToast('success', '📩 Consulta enviada a RRHH');
            resetForm();
            setSending(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('hr_messages')
                .insert({
                    user_id: user?.id,
                    subject: newSubject,
                    category: newCategory,
                    body: newBody,
                })
                .select()
                .single();

            if (error) throw error;
            setMessages(prev => [(data as HRMessage), ...prev]);
            addToast('success', '📩 Consulta enviada a RRHH');
            resetForm();
        } catch {
            addToast('error', 'Error al enviar la consulta');
        } finally {
            setSending(false);
        }
    };

    const resetForm = () => {
        setNewSubject('');
        setNewBody('');
        setNewCategory('general');
        setShowNewMessage(false);
    };

    const counts = {
        open: messages.filter(m => m.status === 'open').length,
        replied: messages.filter(m => m.status === 'replied').length,
        closed: messages.filter(m => m.status === 'closed').length,
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-header-title">Comunicación con RRHH</h1>
                    <p className="page-header-subtitle">Envía consultas y gestiona tus comunicaciones con Recursos Humanos</p>
                </div>
                <button className="btn btn-primary btn-md" onClick={() => setShowNewMessage(!showNewMessage)}>
                    {showNewMessage ? <X size={18} /> : <Plus size={18} />}
                    {showNewMessage ? 'Cerrar' : 'Nueva consulta'}
                </button>
            </div>

            {/* New Message Form */}
            {showNewMessage && (
                <div className="card" style={{ marginBottom: '1.5rem', animation: 'slideUp var(--transition-normal) ease-out' }}>
                    <div className="section-title">Nueva consulta</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                Categoría
                            </label>
                            <select
                                className="input"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value as Category)}
                            >
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                Asunto
                            </label>
                            <input
                                className="input"
                                placeholder="Escribe un asunto descriptivo..."
                                value={newSubject}
                                onChange={(e) => setNewSubject(e.target.value)}
                            />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                Mensaje
                            </label>
                            <textarea
                                className="input"
                                rows={4}
                                placeholder="Describe tu consulta con el mayor detalle posible..."
                                style={{ resize: 'vertical' }}
                                value={newBody}
                                onChange={(e) => setNewBody(e.target.value)}
                            />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Cancelar</button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={handleSend}
                                disabled={sending}
                            >
                                {sending ? (
                                    <div className="spinner-sm" style={{ width: 16, height: 16 }} />
                                ) : (
                                    <Send size={16} />
                                )}
                                Enviar consulta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid-stats" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
                            <Clock size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{counts.open}</div>
                        <div className="stat-card-label">Abiertas</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-brand-50)', color: 'var(--color-brand)' }}>
                            <MessageSquare size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{counts.replied}</div>
                        <div className="stat-card-label">Respondidas</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{counts.closed}</div>
                        <div className="stat-card-label">Cerradas</div>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="section-title">Mis consultas</div>

                {loading ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                        <div className="spinner-sm" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-state-icon"><MessageSquare size={28} /></div>
                        <div className="empty-state-title">Sin consultas</div>
                        <div className="empty-state-text">Aún no has enviado ninguna consulta a RRHH.</div>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className="card-interactive"
                            style={{
                                padding: '1rem',
                                marginBottom: '0.5rem',
                                border: '1px solid var(--color-border-light)',
                                borderRadius: 'var(--radius-lg)',
                                cursor: 'pointer',
                                background: msg.unread ? 'var(--color-brand-50)' : 'transparent',
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{msg.subject}</span>
                                    {msg.unread && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--color-brand)', flexShrink: 0 }} />}
                                </div>
                                <span className={`badge ${statusConfig[msg.status].badge}`}>
                                    {statusConfig[msg.status].label}
                                </span>
                            </div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                {msg.reply_body || msg.body}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Tag size={12} />
                                    {categoryLabels[msg.category]}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                    <Clock size={12} />
                                    {new Date(msg.created_at).toLocaleDateString('es-ES')}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
