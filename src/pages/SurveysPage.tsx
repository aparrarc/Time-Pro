import { useState } from 'react';
import {
    BarChart3,
    Plus,
    Star,
    Send,
    Eye,
    ChevronDown,
    MessageSquarePlus,
    ClipboardList,
    Users,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Clock,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import type { Survey, SurveyQuestion } from '../types';

// ── Mock data ────────────────────────────────────────
const MOCK_SURVEYS: (Survey & { questions?: SurveyQuestion[] })[] = [
    {
        id: '1',
        title: 'Clima Laboral Q1 2026',
        description: 'Encuesta trimestral de satisfacción y bienestar en el trabajo',
        status: 'active',
        is_anonymous: true,
        start_date: '2026-01-15',
        end_date: '2026-02-28',
        created_at: '2026-01-10',
        questions_count: 5,
        responses_count: 23,
        questions: [
            { id: 'q1', survey_id: '1', question_text: '¿Cómo valorarías el ambiente de trabajo?', question_type: 'rating', sort_order: 0, is_required: true, created_at: '' },
            { id: 'q2', survey_id: '1', question_text: '¿Te sientes valorado/a por tu equipo?', question_type: 'rating', sort_order: 1, is_required: true, created_at: '' },
            { id: 'q3', survey_id: '1', question_text: '¿La comunicación interna es efectiva?', question_type: 'rating', sort_order: 2, is_required: true, created_at: '' },
            { id: 'q4', survey_id: '1', question_text: '¿Tienes las herramientas necesarias para tu trabajo?', question_type: 'yes_no', sort_order: 3, is_required: true, created_at: '' },
            { id: 'q5', survey_id: '1', question_text: '¿Qué mejorarías?', question_type: 'text', sort_order: 4, is_required: false, created_at: '' },
        ],
    },
    {
        id: '2',
        title: 'Evaluación de Formaciones 2025',
        description: 'Tu opinión sobre los cursos y sesiones realizadas',
        status: 'closed',
        is_anonymous: true,
        start_date: '2025-12-01',
        end_date: '2025-12-31',
        created_at: '2025-11-28',
        questions_count: 4,
        responses_count: 41,
    },
    {
        id: '3',
        title: 'Bienestar y Conciliación',
        description: 'Encuesta sobre equilibrio vida laboral-personal',
        status: 'draft',
        is_anonymous: true,
        created_at: '2026-02-10',
        questions_count: 6,
        responses_count: 0,
    },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: typeof CheckCircle2 }> = {
    active: { label: 'Activa', color: 'var(--color-success)', bg: 'var(--color-success-light)', icon: CheckCircle2 },
    closed: { label: 'Cerrada', color: 'var(--color-text-muted)', bg: 'var(--color-surface-hover)', icon: XCircle },
    draft: { label: 'Borrador', color: 'var(--color-warning)', bg: 'var(--color-warning-light)', icon: Clock },
    archived: { label: 'Archivada', color: 'var(--color-text-muted)', bg: 'var(--color-surface-hover)', icon: XCircle },
};

const MOCK_RESULTS = [
    { question: '¿Cómo valorarías el ambiente de trabajo?', avg: 4.2, total: 23 },
    { question: '¿Te sientes valorado/a por tu equipo?', avg: 3.8, total: 23 },
    { question: '¿La comunicación interna es efectiva?', avg: 3.5, total: 23 },
];

export function SurveysPage() {
    const { user } = useAppStore();
    const isAdmin = user?.role === 'admin';
    const [activeTab, setActiveTab] = useState<'respond' | 'manage'>('respond');
    const [selectedSurvey, setSelectedSurvey] = useState<string | null>(null);
    const [ratings, setRatings] = useState<Record<string, number>>({});
    const [showResults, setShowResults] = useState<string | null>(null);

    const activeSurveys = MOCK_SURVEYS.filter(s => s.status === 'active');
    const allSurveys = MOCK_SURVEYS;

    const handleRate = (questionId: string, value: number) => {
        setRatings(prev => ({ ...prev, [questionId]: value }));
    };

    const selectedSurveyData = MOCK_SURVEYS.find(s => s.id === selectedSurvey);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Encuestas de Clima</h1>
                    <p className="page-subtitle">Participa en las encuestas y ayuda a mejorar el entorno laboral</p>
                </div>
                {isAdmin && (
                    <button className="btn btn-primary" style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                    }}>
                        <Plus size={18} /> Nueva encuesta
                    </button>
                )}
            </div>

            {/* Admin tabs */}
            {isAdmin && (
                <div style={{
                    display: 'flex',
                    gap: '0.25rem',
                    padding: '0.25rem',
                    background: 'var(--color-surface-hover)',
                    borderRadius: 'var(--radius-lg)',
                    width: 'fit-content',
                }}>
                    {[
                        { id: 'respond' as const, label: 'Responder', icon: MessageSquarePlus },
                        { id: 'manage' as const, label: 'Gestionar', icon: ClipboardList },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.5rem 1rem',
                                borderRadius: 'var(--radius-md)',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                background: activeTab === tab.id ? 'var(--color-surface)' : 'transparent',
                                color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                boxShadow: activeTab === tab.id ? 'var(--shadow-xs)' : 'none',
                            }}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>
            )}

            {/* Respond tab */}
            {activeTab === 'respond' && (
                <>
                    {/* Stats cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {[
                            { icon: ClipboardList, label: 'Encuestas activas', value: activeSurveys.length, color: 'var(--color-brand)' },
                            { icon: Users, label: 'Participantes', value: 23, color: 'var(--color-success)' },
                            { icon: TrendingUp, label: 'Satisfacción media', value: '3.8/5', color: 'var(--color-warning)' },
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

                    {/* Active surveys list */}
                    <div className="space-y-4">
                        {activeSurveys.map(survey => (
                            <div key={survey.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                                <button
                                    onClick={() => setSelectedSurvey(selectedSurvey === survey.id ? null : survey.id)}
                                    style={{
                                        width: '100%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '1.25rem 1.5rem',
                                        border: 'none',
                                        background: 'transparent',
                                        cursor: 'pointer',
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    <div style={{ textAlign: 'left' }}>
                                        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                            {survey.title}
                                        </div>
                                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                            {survey.description} · {survey.questions_count} preguntas
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: 'var(--radius-full)',
                                            fontSize: '0.6875rem',
                                            fontWeight: 700,
                                            background: STATUS_CONFIG[survey.status].bg,
                                            color: STATUS_CONFIG[survey.status].color,
                                        }}>
                                            {STATUS_CONFIG[survey.status].label}
                                        </span>
                                        <ChevronDown
                                            size={18}
                                            style={{
                                                color: 'var(--color-text-muted)',
                                                transform: selectedSurvey === survey.id ? 'rotate(180deg)' : 'rotate(0)',
                                                transition: 'transform 0.2s',
                                            }}
                                        />
                                    </div>
                                </button>

                                {/* Expanded questions */}
                                {selectedSurvey === survey.id && selectedSurveyData?.questions && (
                                    <div style={{
                                        padding: '0 1.5rem 1.5rem',
                                        borderTop: '1px solid var(--color-border)',
                                    }}>
                                        <div className="space-y-4" style={{ marginTop: '1.25rem' }}>
                                            {selectedSurveyData.questions.map(q => (
                                                <div key={q.id} style={{
                                                    padding: '1rem',
                                                    borderRadius: 'var(--radius-xl)',
                                                    background: 'var(--color-surface-hover)',
                                                }}>
                                                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                                                        {q.question_text}
                                                        {q.is_required && <span style={{ color: 'var(--color-error)', marginLeft: '0.25rem' }}>*</span>}
                                                    </div>

                                                    {q.question_type === 'rating' && (
                                                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button
                                                                    key={star}
                                                                    onClick={() => handleRate(q.id, star)}
                                                                    style={{
                                                                        border: 'none',
                                                                        background: 'transparent',
                                                                        cursor: 'pointer',
                                                                        padding: '0.25rem',
                                                                    }}
                                                                >
                                                                    <Star
                                                                        size={28}
                                                                        fill={(ratings[q.id] || 0) >= star ? '#f59e0b' : 'transparent'}
                                                                        stroke={(ratings[q.id] || 0) >= star ? '#f59e0b' : 'var(--color-text-muted)'}
                                                                    />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {q.question_type === 'yes_no' && (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            {['Sí', 'No'].map(opt => (
                                                                <button key={opt} style={{
                                                                    padding: '0.5rem 1.5rem',
                                                                    borderRadius: 'var(--radius-lg)',
                                                                    border: '2px solid var(--color-border)',
                                                                    background: 'var(--color-surface)',
                                                                    fontSize: '0.8125rem',
                                                                    fontWeight: 600,
                                                                    cursor: 'pointer',
                                                                    color: 'var(--color-text-primary)',
                                                                    fontFamily: 'inherit',
                                                                }}>
                                                                    {opt}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {q.question_type === 'text' && (
                                                        <textarea
                                                            placeholder="Escribe tu respuesta..."
                                                            rows={3}
                                                            style={{
                                                                width: '100%',
                                                                padding: '0.75rem',
                                                                borderRadius: 'var(--radius-lg)',
                                                                border: '1px solid var(--color-border)',
                                                                background: 'var(--color-surface)',
                                                                fontSize: '0.875rem',
                                                                resize: 'vertical',
                                                                fontFamily: 'inherit',
                                                                color: 'var(--color-text-primary)',
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        <button style={{
                                            marginTop: '1.25rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.75rem 1.5rem',
                                            borderRadius: 'var(--radius-lg)',
                                            background: 'linear-gradient(135deg, var(--color-brand), #8b5cf6)',
                                            color: '#fff',
                                            fontWeight: 700,
                                            fontSize: '0.875rem',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontFamily: 'inherit',
                                        }}>
                                            <Send size={16} /> Enviar respuestas
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Manage tab (admin) */}
            {activeTab === 'manage' && isAdmin && (
                <div className="space-y-4">
                    {/* All surveys table */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--color-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                Todas las encuestas
                            </h3>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        {['Título', 'Estado', 'Preguntas', 'Respuestas', 'Periodo', 'Acciones'].map(h => (
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
                                    {allSurveys.map(s => (
                                        <tr key={s.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{s.title}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{s.description}</div>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.625rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    fontSize: '0.6875rem',
                                                    fontWeight: 700,
                                                    background: STATUS_CONFIG[s.status].bg,
                                                    color: STATUS_CONFIG[s.status].color,
                                                }}>{STATUS_CONFIG[s.status].label}</span>
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>{s.questions_count}</td>
                                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: 'var(--color-text-primary)', fontWeight: 600 }}>{s.responses_count}</td>
                                            <td style={{ padding: '0.875rem 1rem', fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                                                {s.start_date ? `${s.start_date} → ${s.end_date || '...'}` : '—'}
                                            </td>
                                            <td style={{ padding: '0.875rem 1rem' }}>
                                                <button
                                                    onClick={() => setShowResults(showResults === s.id ? null : s.id)}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.375rem',
                                                        padding: '0.375rem 0.75rem',
                                                        borderRadius: 'var(--radius-md)',
                                                        border: '1px solid var(--color-border)',
                                                        background: 'transparent',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        cursor: 'pointer',
                                                        color: 'var(--color-text-primary)',
                                                        fontFamily: 'inherit',
                                                    }}>
                                                    <Eye size={14} /> Resultados
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Results panel */}
                    {showResults && (
                        <div className="card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <BarChart3 size={18} style={{ color: 'var(--color-brand)' }} />
                                Resultados agregados
                            </h3>
                            <div className="space-y-4">
                                {MOCK_RESULTS.map((r, i) => (
                                    <div key={i}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{r.question}</span>
                                            <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-brand)' }}>{r.avg}/5</span>
                                        </div>
                                        <div style={{
                                            height: '8px',
                                            borderRadius: '4px',
                                            background: 'var(--color-surface-hover)',
                                            overflow: 'hidden',
                                        }}>
                                            <div style={{
                                                height: '100%',
                                                width: `${(r.avg / 5) * 100}%`,
                                                borderRadius: '4px',
                                                background: 'linear-gradient(90deg, var(--color-brand), #8b5cf6)',
                                                transition: 'width 0.5s ease',
                                            }} />
                                        </div>
                                        <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                            {r.total} respuestas
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
