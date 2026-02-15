import { useState } from 'react';
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Plus, User, Tag } from 'lucide-react';

type MessageStatus = 'open' | 'in_progress' | 'resolved';
type Category = 'general' | 'nomina' | 'vacaciones' | 'contrato' | 'formacion' | 'otro';

interface Message {
    id: string;
    subject: string;
    category: Category;
    status: MessageStatus;
    lastMessage: string;
    date: string;
    unread: boolean;
}

const categoryLabels: Record<Category, string> = {
    general: 'General',
    nomina: 'Nómina',
    vacaciones: 'Vacaciones',
    contrato: 'Contrato',
    formacion: 'Formación',
    otro: 'Otro',
};

const statusLabels: Record<MessageStatus, { label: string; badge: string }> = {
    open: { label: 'Abierto', badge: 'badge-warning' },
    in_progress: { label: 'En curso', badge: 'badge-primary' },
    resolved: { label: 'Resuelto', badge: 'badge-success' },
};

const demoMessages: Message[] = [
    {
        id: '1',
        subject: 'Consulta sobre días de asuntos propios',
        category: 'vacaciones',
        status: 'in_progress',
        lastMessage: 'Hemos revisado tu solicitud, nos pondremos en contacto contigo en breve.',
        date: '2026-02-14',
        unread: true,
    },
    {
        id: '2',
        subject: 'Error en nómina de diciembre',
        category: 'nomina',
        status: 'resolved',
        lastMessage: 'Se ha corregido el error y se aplicará el ajuste en la próxima nómina.',
        date: '2026-01-28',
        unread: false,
    },
    {
        id: '3',
        subject: 'Solicitud de certificado laboral',
        category: 'contrato',
        status: 'open',
        lastMessage: 'He solicitado un certificado laboral para presentar en el banco.',
        date: '2026-02-10',
        unread: false,
    },
];

export function HRInboxPage() {
    const [showNewMessage, setShowNewMessage] = useState(false);

    return (
        <div className="animate-fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-header-title">Comunicación con RRHH</h1>
                    <p className="page-header-subtitle">Envía consultas y gestiona tus comunicaciones con Recursos Humanos</p>
                </div>
                <button className="btn btn-primary btn-md" onClick={() => setShowNewMessage(!showNewMessage)}>
                    <Plus size={18} />
                    Nueva consulta
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
                            <select className="input">
                                {Object.entries(categoryLabels).map(([key, label]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                Asunto
                            </label>
                            <input className="input" placeholder="Escribe un asunto descriptivo..." />
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                Mensaje
                            </label>
                            <textarea className="input" rows={4} placeholder="Describe tu consulta con el mayor detalle posible..." style={{ resize: 'vertical' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowNewMessage(false)}>Cancelar</button>
                            <button className="btn btn-primary btn-sm">
                                <Send size={16} />
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
                        <div className="stat-card-value">{demoMessages.filter(m => m.status === 'open').length}</div>
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
                        <div className="stat-card-value">{demoMessages.filter(m => m.status === 'in_progress').length}</div>
                        <div className="stat-card-label">En curso</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-card-header">
                        <div className="stat-card-icon" style={{ background: 'var(--color-success-light)', color: 'var(--color-success)' }}>
                            <CheckCircle size={20} />
                        </div>
                    </div>
                    <div>
                        <div className="stat-card-value">{demoMessages.filter(m => m.status === 'resolved').length}</div>
                        <div className="stat-card-label">Resueltas</div>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="card" style={{ overflow: 'hidden' }}>
                <div className="section-title">Mis consultas</div>
                {demoMessages.map((msg) => (
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
                            <span className={`badge ${statusLabels[msg.status].badge}`}>
                                {statusLabels[msg.status].label}
                            </span>
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                            {msg.lastMessage}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Tag size={12} />
                                {categoryLabels[msg.category]}
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Clock size={12} />
                                {new Date(msg.date).toLocaleDateString('es-ES')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
