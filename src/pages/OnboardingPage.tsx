import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Sparkles,
    User,
    Palette,
    Rocket,
    ChevronRight,
    ChevronLeft,
    Check,
    Clock,
    Shield,
    BarChart3,
    Bell,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';

const STEPS = [
    { id: 'welcome', label: 'Bienvenida', icon: Sparkles },
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'preferences', label: 'Preferencias', icon: Palette },
    { id: 'ready', label: '¡Listo!', icon: Rocket },
];

const FEATURES = [
    { icon: Clock, title: 'Fichaje digital', desc: 'Registra tu jornada con un solo clic' },
    { icon: Shield, title: 'Cumplimiento legal', desc: 'RD 8/2019 y RGPD integrados' },
    { icon: BarChart3, title: 'Reportes avanzados', desc: 'Analítica en tiempo real' },
    { icon: Bell, title: 'Alertas inteligentes', desc: 'Notificaciones proactivas' },
];

export function OnboardingPage() {
    const navigate = useNavigate();
    const { user } = useAppStore();
    const [currentStep, setCurrentStep] = useState(0);
    const [completedSteps, setCompletedSteps] = useState<boolean[]>([false, false, false, false]);

    const completeStep = (idx: number) => {
        setCompletedSteps(prev => {
            const next = [...prev];
            next[idx] = true;
            return next;
        });
    };

    const goNext = () => {
        completeStep(currentStep);
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const goPrev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const finishOnboarding = () => {
        completeStep(3);
        navigate('/');
    };

    const progress = ((currentStep + 1) / STEPS.length) * 100;

    return (
        <div className="animate-fade-in" style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            background: 'linear-gradient(135deg, var(--color-brand) 0%, #7c3aed 50%, #4f46e5 100%)',
        }}>
            <div style={{
                width: '100%',
                maxWidth: '680px',
                borderRadius: 'var(--radius-2xl)',
                background: 'var(--color-surface)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                overflow: 'hidden',
            }}>
                {/* Progress bar */}
                <div style={{ height: '4px', background: 'var(--color-border)' }}>
                    <div style={{
                        height: '100%',
                        width: `${progress}%`,
                        background: 'linear-gradient(90deg, var(--color-brand), #8b5cf6)',
                        transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1)',
                        borderRadius: '0 2px 2px 0',
                    }} />
                </div>

                {/* Step indicators */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '2rem',
                    padding: '1.5rem 2rem 0',
                }}>
                    {STEPS.map((step, i) => {
                        const StepIcon = step.icon;
                        const isActive = i === currentStep;
                        const isDone = completedSteps[i];
                        return (
                            <div key={step.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '0.5rem',
                                opacity: isActive ? 1 : 0.5,
                                transition: 'opacity 0.3s',
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: isDone ? 'var(--color-success)' : isActive ? 'var(--color-brand)' : 'var(--color-surface-hover)',
                                    color: isDone || isActive ? '#fff' : 'var(--color-text-muted)',
                                    transition: 'all 0.3s',
                                }}>
                                    {isDone ? <Check size={18} /> : <StepIcon size={18} />}
                                </div>
                                <span style={{
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                                }}>{step.label}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Step content */}
                <div style={{ padding: '2rem 2.5rem 2.5rem' }}>
                    {/* Step 0: Welcome */}
                    {currentStep === 0 && (
                        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, var(--color-brand), #8b5cf6)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                            }}>
                                <Sparkles size={36} color="#fff" />
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                                ¡Bienvenido a TimeTrack Pro!
                            </h1>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                Hola <strong>{user?.full_name || 'Usuario'}</strong>, tu plataforma de control horario profesional está lista.
                                Vamos a configurar tu experiencia en solo unos pasos.
                            </p>
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, 1fr)',
                                gap: '1rem',
                            }}>
                                {FEATURES.map(f => (
                                    <div key={f.title} style={{
                                        padding: '1rem',
                                        borderRadius: 'var(--radius-xl)',
                                        background: 'var(--color-surface-hover)',
                                        textAlign: 'left',
                                    }}>
                                        <f.icon size={20} style={{ color: 'var(--color-brand)', marginBottom: '0.5rem' }} />
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{f.title}</div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>{f.desc}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 1: Profile */}
                    {currentStep === 1 && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                                Completa tu perfil
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                Estos datos ayudan a tu equipo a identificarte y comunicarse contigo.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { label: 'Nombre completo', value: user?.full_name || '', placeholder: 'Tu nombre completo', type: 'text' },
                                    { label: 'Teléfono', value: user?.phone || '', placeholder: '+34 600 000 000', type: 'tel' },
                                    { label: 'Email', value: user?.email || '', placeholder: 'tu@empresa.com', type: 'email' },
                                ].map(field => (
                                    <div key={field.label}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.8125rem',
                                            fontWeight: 600,
                                            marginBottom: '0.375rem',
                                            color: 'var(--color-text-primary)',
                                        }}>{field.label}</label>
                                        <input
                                            type={field.type}
                                            defaultValue={field.value}
                                            placeholder={field.placeholder}
                                            className="input"
                                            style={{
                                                width: '100%',
                                                padding: '0.75rem 1rem',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '1px solid var(--color-border)',
                                                background: 'var(--color-surface)',
                                                fontSize: '0.875rem',
                                                color: 'var(--color-text-primary)',
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Preferences */}
                    {currentStep === 2 && (
                        <div className="animate-fade-in">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                                Tus preferencias
                            </h2>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                                Personaliza la aplicación a tu gusto. Podrás cambiar esto después en Configuración.
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                                {/* Theme preference */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                                        <Palette size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                        Tema de la interfaz
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        {[
                                            { label: '☀️ Claro', value: 'light' },
                                            { label: '🌙 Oscuro', value: 'dark' },
                                            { label: '💻 Sistema', value: 'system' },
                                        ].map(opt => (
                                            <button key={opt.value} style={{
                                                flex: 1,
                                                padding: '0.625rem',
                                                borderRadius: 'var(--radius-lg)',
                                                border: '2px solid var(--color-border)',
                                                background: 'var(--color-surface)',
                                                fontSize: '0.8125rem',
                                                fontWeight: 600,
                                                cursor: 'pointer',
                                                color: 'var(--color-text-primary)',
                                                fontFamily: 'inherit',
                                            }}>{opt.label}</button>
                                        ))}
                                    </div>
                                </div>

                                {/* Notification preference */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '1px solid var(--color-border)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}>
                                    <div>
                                        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                            <Bell size={16} style={{ display: 'inline', marginRight: '0.5rem', verticalAlign: 'middle' }} />
                                            Notificaciones
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                                            Recibe alertas de fichaje y aprobaciones
                                        </div>
                                    </div>
                                    <div style={{
                                        width: '44px',
                                        height: '24px',
                                        borderRadius: '12px',
                                        background: 'var(--color-brand)',
                                        position: 'relative',
                                        cursor: 'pointer',
                                    }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            position: 'absolute',
                                            top: '2px',
                                            right: '2px',
                                            transition: 'all 0.2s',
                                        }} />
                                    </div>
                                </div>

                                {/* Language preference */}
                                <div style={{
                                    padding: '1rem 1.25rem',
                                    borderRadius: 'var(--radius-xl)',
                                    border: '1px solid var(--color-border)',
                                }}>
                                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.75rem' }}>
                                        🌐 Idioma
                                    </div>
                                    <select style={{
                                        width: '100%',
                                        padding: '0.625rem 1rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-surface)',
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-primary)',
                                        fontFamily: 'inherit',
                                    }}>
                                        <option value="es">Español</option>
                                        <option value="ca">Català</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Ready */}
                    {currentStep === 3 && (
                        <div className="animate-fade-in" style={{ textAlign: 'center' }}>
                            <div style={{
                                width: '80px',
                                height: '80px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1.5rem',
                            }}>
                                <Rocket size={36} color="#fff" />
                            </div>
                            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
                                ¡Todo configurado!
                            </h1>
                            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
                                Tu cuenta está lista para usar. Puedes empezar a fichar, gestionar ausencias
                                y explorar todas las funcionalidades de TimeTrack Pro.
                            </p>
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                padding: '1.25rem',
                                borderRadius: 'var(--radius-xl)',
                                background: 'var(--color-surface-hover)',
                                textAlign: 'left',
                                marginBottom: '0.5rem',
                            }}>
                                {[
                                    { emoji: '⏱️', text: 'Ficha tu entrada desde el Dashboard' },
                                    { emoji: '📅', text: 'Solicita vacaciones en Ausencias' },
                                    { emoji: '📊', text: 'Revisa tus horas en Reportes' },
                                    { emoji: '🔔', text: 'Mantente al día con las alertas' },
                                ].map(tip => (
                                    <div key={tip.text} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-primary)' }}>
                                        <span style={{ fontSize: '1.25rem' }}>{tip.emoji}</span>
                                        {tip.text}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: '2rem',
                        gap: '1rem',
                    }}>
                        {currentStep > 0 ? (
                            <button onClick={goPrev} className="btn btn-outline" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.75rem 1.25rem',
                            }}>
                                <ChevronLeft size={18} /> Anterior
                            </button>
                        ) : <div />}

                        {currentStep < STEPS.length - 1 ? (
                            <button onClick={goNext} className="btn btn-primary" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, var(--color-brand), #8b5cf6)',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}>
                                Siguiente <ChevronRight size={18} />
                            </button>
                        ) : (
                            <button onClick={finishOnboarding} className="btn btn-primary" style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.75rem 1.5rem',
                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                border: 'none',
                                borderRadius: 'var(--radius-lg)',
                                color: '#fff',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                            }}>
                                <Rocket size={18} /> Empezar a usar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
