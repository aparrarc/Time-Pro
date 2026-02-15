import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Zap, Clock, Users, Shield, BarChart3, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

const features = [
    { icon: Clock, label: 'Fichajes automáticos', desc: 'Entrada, salida y pausas en un click' },
    { icon: Users, label: 'Directorio de equipo', desc: 'Perfiles, roles y departamentos' },
    { icon: Shield, label: 'Cumplimiento RGPD', desc: 'Privacidad y normativa española' },
    { icon: BarChart3, label: 'Reportes avanzados', desc: 'Estadísticas y exportación PDF/CSV' },
];

export function LoginPage() {
    const navigate = useNavigate();
    const { demoLogin } = useAppStore();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) throw authError;

            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = () => {
        demoLogin();
        navigate('/');
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}>
            {/* ============= LEFT PANEL — Hero branding ============= */}
            <div style={{
                flex: '1 1 55%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2.5rem 3rem',
                position: 'relative',
                overflow: 'hidden',
                background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
            }}
                className="login-hero-panel"
            >
                {/* Animated gradient orbs */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '600px',
                    height: '600px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(129,140,248,0.3) 0%, transparent 70%)',
                    animation: 'loginOrb1 8s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-5%',
                    width: '500px',
                    height: '500px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(167,139,250,0.25) 0%, transparent 70%)',
                    animation: 'loginOrb2 10s ease-in-out infinite',
                    pointerEvents: 'none',
                }} />

                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'rgba(255,255,255,0.15)',
                        backdropFilter: 'blur(12px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(255,255,255,0.1)',
                    }}>
                        <Clock size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', letterSpacing: '-0.02em' }}>
                        TimeTrack Pro
                    </span>
                </div>

                {/* Main copy */}
                <div style={{ position: 'relative', zIndex: 1, maxWidth: '520px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.375rem 0.875rem',
                        borderRadius: '100px',
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(8px)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        marginBottom: '1.5rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.9)',
                        letterSpacing: '0.02em',
                    }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                        Plataforma operativa · v2.0
                    </div>

                    <h1 style={{
                        fontSize: 'clamp(2rem, 3.5vw, 3rem)',
                        fontWeight: 800,
                        color: 'white',
                        lineHeight: 1.1,
                        letterSpacing: '-0.03em',
                        marginBottom: '1.25rem',
                    }}>
                        Control horario
                        <br />
                        <span style={{
                            background: 'linear-gradient(135deg, #a5b4fc, #c4b5fd, #f0abfc)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            inteligente
                        </span>{' '}
                        para tu equipo
                    </h1>

                    <p style={{
                        fontSize: '1.0625rem',
                        color: 'rgba(255,255,255,0.65)',
                        lineHeight: 1.6,
                        marginBottom: '2.5rem',
                        maxWidth: '440px',
                    }}>
                        Gestiona fichajes, ausencias, nóminas y cumplimiento RGPD desde una sola plataforma profesional.
                    </p>

                    {/* Feature grid */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, 1fr)',
                        gap: '0.75rem',
                    }}>
                        {features.map(({ icon: Icon, label, desc }) => (
                            <div key={label} style={{
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '0.75rem',
                                padding: '1rem',
                                borderRadius: '14px',
                                background: 'rgba(255,255,255,0.06)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                transition: 'all 0.25s ease',
                                cursor: 'default',
                            }}
                                className="login-feature-card"
                            >
                                <div style={{
                                    width: '36px',
                                    height: '36px',
                                    borderRadius: '10px',
                                    background: 'rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}>
                                    <Icon size={18} color="rgba(255,255,255,0.85)" />
                                </div>
                                <div>
                                    <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'white', marginBottom: '0.125rem' }}>
                                        {label}
                                    </p>
                                    <p style={{ fontSize: '0.6875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.3 }}>
                                        {desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <p style={{
                    fontSize: '0.75rem',
                    color: 'rgba(255,255,255,0.3)',
                    position: 'relative',
                    zIndex: 1,
                }}>
                    © 2026 TimeTrack Pro · Cumplimiento RGPD España
                </p>
            </div>

            {/* ============= RIGHT PANEL — Login Form ============= */}
            <div style={{
                flex: '1 1 45%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                background: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
                position: 'relative',
            }}>
                {/* Subtle decorative pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,0.035) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    pointerEvents: 'none',
                }} />

                <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>
                    {/* Mobile logo (shown only on small screens via CSS) */}
                    <div className="login-mobile-logo" style={{
                        display: 'none',
                        alignItems: 'center',
                        gap: '0.75rem',
                        marginBottom: '2rem',
                    }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '10px',
                            background: '#4F46E5',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            <Clock size={20} color="white" />
                        </div>
                        <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1e293b' }}>TimeTrack Pro</span>
                    </div>

                    {/* Welcome header */}
                    <div style={{ marginBottom: '2rem' }}>
                        <h2 style={{
                            fontSize: '1.75rem',
                            fontWeight: 800,
                            color: '#0f172a',
                            letterSpacing: '-0.02em',
                            marginBottom: '0.5rem',
                        }}>
                            Bienvenido de nuevo
                        </h2>
                        <p style={{ fontSize: '0.9375rem', color: '#64748b', lineHeight: 1.5 }}>
                            Inicia sesión para acceder a tu panel de control
                        </p>
                    </div>

                    {/* Form card */}
                    <div style={{
                        background: 'white',
                        borderRadius: '20px',
                        padding: '2rem',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 8px 32px rgba(0,0,0,0.06)',
                        border: '1px solid rgba(226,232,240,0.8)',
                    }}>
                        <form onSubmit={handleSubmit}>
                            {/* Email */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem',
                                }}>
                                    Correo electrónico
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af',
                                        pointerEvents: 'none',
                                    }} />
                                    <input
                                        type="email"
                                        placeholder="nombre@empresa.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            paddingLeft: '2.75rem',
                                            paddingRight: '1rem',
                                            paddingTop: '0.75rem',
                                            paddingBottom: '0.75rem',
                                            borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '0.875rem',
                                            color: '#1e293b',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#6366f1';
                                            e.target.style.background = 'white';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.background = '#f8fafc';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.8125rem',
                                    fontWeight: 600,
                                    color: '#374151',
                                    marginBottom: '0.5rem',
                                }}>
                                    Contraseña
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{
                                        position: 'absolute',
                                        left: '14px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: '#9ca3af',
                                        pointerEvents: 'none',
                                    }} />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        style={{
                                            width: '100%',
                                            paddingLeft: '2.75rem',
                                            paddingRight: '3rem',
                                            paddingTop: '0.75rem',
                                            paddingBottom: '0.75rem',
                                            borderRadius: '12px',
                                            border: '1.5px solid #e2e8f0',
                                            background: '#f8fafc',
                                            fontSize: '0.875rem',
                                            color: '#1e293b',
                                            outline: 'none',
                                            transition: 'all 0.2s ease',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#6366f1';
                                            e.target.style.background = 'white';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.background = '#f8fafc';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '14px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: '#9ca3af',
                                            background: 'transparent',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '2px',
                                            display: 'flex',
                                            transition: 'color 0.2s',
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.color = '#6366f1')}
                                        onMouseLeave={(e) => (e.currentTarget.style.color = '#9ca3af')}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '12px',
                                    background: '#fef2f2',
                                    color: '#dc2626',
                                    border: '1px solid #fecaca',
                                    fontSize: '0.8125rem',
                                    fontWeight: 500,
                                    marginBottom: '1.25rem',
                                }}>
                                    <span>⚠️</span>
                                    <span>{error}</span>
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    borderRadius: '12px',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #4F46E5 0%, #6366F1 50%, #7C3AED 100%)',
                                    color: 'white',
                                    fontSize: '0.9375rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'all 0.25s ease',
                                    boxShadow: '0 4px 14px rgba(79,70,229,0.35)',
                                    opacity: isLoading ? 0.6 : 1,
                                    fontFamily: 'inherit',
                                    letterSpacing: '-0.01em',
                                }}
                                onMouseEnter={(e) => {
                                    if (!isLoading) {
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(79,70,229,0.45)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 4px 14px rgba(79,70,229,0.35)';
                                }}
                            >
                                {isLoading ? (
                                    <div className="spinner-sm" style={{ width: '20px', height: '20px' }} />
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        <span>Iniciar sesión</span>
                                        <ArrowRight size={16} style={{ opacity: 0.7 }} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>

                    {/* Divider */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        margin: '1.5rem 0',
                    }}>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #cbd5e1, transparent)' }} />
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            o
                        </span>
                        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, transparent, #cbd5e1, transparent)' }} />
                    </div>

                    {/* Demo mode */}
                    <button
                        type="button"
                        onClick={handleDemoLogin}
                        style={{
                            width: '100%',
                            padding: '0.875rem',
                            borderRadius: '12px',
                            border: '1.5px solid rgba(99,102,241,0.2)',
                            background: 'rgba(238,242,255,0.8)',
                            color: '#4F46E5',
                            fontSize: '0.9375rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.25s ease',
                            fontFamily: 'inherit',
                            backdropFilter: 'blur(8px)',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(238,242,255,1)';
                            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                            e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(238,242,255,0.8)';
                            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <Zap size={18} />
                        <span>Acceder en modo demo</span>
                    </button>

                    {/* Support footer */}
                    <p style={{
                        textAlign: 'center',
                        marginTop: '1.5rem',
                        fontSize: '0.8125rem',
                        color: '#94a3b8',
                    }}>
                        ¿Problemas al acceder?{' '}
                        <button
                            style={{
                                fontWeight: 600,
                                color: '#6366f1',
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                fontFamily: 'inherit',
                                fontSize: 'inherit',
                                textDecoration: 'none',
                                transition: 'color 0.2s',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                            onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        >
                            Contacta con soporte
                        </button>
                    </p>
                </div>
            </div>

            {/* ============= LOGIN PAGE CSS ============= */}
            <style>{`
                @keyframes loginOrb1 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(-30px, 40px) scale(1.1); }
                    66% { transform: translate(20px, -20px) scale(0.95); }
                }
                @keyframes loginOrb2 {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    50% { transform: translate(40px, -30px) scale(1.08); }
                }

                .login-feature-card:hover {
                    background: rgba(255,255,255,0.12) !important;
                    border-color: rgba(255,255,255,0.15) !important;
                    transform: translateY(-2px);
                }

                /* Hide left panel on mobile */
                @media (max-width: 900px) {
                    .login-hero-panel {
                        display: none !important;
                    }
                    .login-mobile-logo {
                        display: flex !important;
                    }
                }
            `}</style>
        </div>
    );
}
