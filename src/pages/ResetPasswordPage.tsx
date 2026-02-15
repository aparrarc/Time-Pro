import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, KeyRound, Clock, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function ResetPasswordPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Supabase sends the recovery token in the URL hash
    useEffect(() => {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const type = hashParams.get('type');

        if (accessToken && type === 'recovery') {
            supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: hashParams.get('refresh_token') || '',
            });
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }
        if (password !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        setIsLoading(true);
        try {
            const { error: updateError } = await supabase.auth.updateUser({
                password: password,
            });
            if (updateError) throw updateError;
            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err: any) {
            setError(err.message || 'Error al actualizar la contraseña');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--color-bg)',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
            padding: '2rem',
        }}>
            <div style={{ width: '100%', maxWidth: '440px' }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'center', marginBottom: '2rem' }}>
                    <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #4F46E5, #6366F1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Clock size={22} color="white" />
                    </div>
                    <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}>
                        TimeTrack Pro
                    </span>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--color-surface)',
                    borderRadius: '20px',
                    padding: '2.5rem',
                    boxShadow: 'var(--shadow-lg)',
                    border: '1px solid var(--color-border)',
                }}>
                    {success ? (
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 56,
                                height: 56,
                                borderRadius: '50%',
                                background: 'var(--color-icon-bg-success)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem',
                            }}>
                                <CheckCircle size={28} color="#16a34a" />
                            </div>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                ¡Contraseña actualizada!
                            </h2>
                            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginBottom: '1.5rem' }}>
                                Tu contraseña se ha restablecido correctamente. Serás redirigido al login en 3 segundos…
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '10px',
                                    border: 'none',
                                    background: 'var(--color-brand-light)',
                                    color: 'white',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}
                            >
                                Ir al login
                            </button>
                        </div>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                <div style={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    background: 'var(--color-icon-bg-brand)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 1rem',
                                }}>
                                    <KeyRound size={28} color="#6366f1" />
                                </div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '0.25rem' }}>
                                    Nueva contraseña
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    Introduce tu nueva contraseña para restablecer el acceso
                                </p>
                            </div>

                            <form onSubmit={handleSubmit}>
                                {/* New Password */}
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                        Nueva contraseña
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Mínimo 6 caracteres"
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
                                                border: '1.5px solid var(--color-border)',
                                                background: 'var(--color-surface-muted)',
                                                fontSize: '0.875rem',
                                                color: 'var(--color-text-primary)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                fontFamily: 'inherit',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand-light)'; e.target.style.boxShadow = '0 0 0 3px var(--color-brand-100)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex' }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                                        Confirmar contraseña
                                    </label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', pointerEvents: 'none' }} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="Repite la contraseña"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            style={{
                                                width: '100%',
                                                paddingLeft: '2.75rem',
                                                paddingRight: '1rem',
                                                paddingTop: '0.75rem',
                                                paddingBottom: '0.75rem',
                                                borderRadius: '12px',
                                                border: `1.5px solid ${confirmPassword && confirmPassword !== password ? '#f87171' : 'var(--color-border)'}`,
                                                background: 'var(--color-surface-muted)',
                                                fontSize: '0.875rem',
                                                color: 'var(--color-text-primary)',
                                                outline: 'none',
                                                boxSizing: 'border-box',
                                                fontFamily: 'inherit',
                                            }}
                                            onFocus={(e) => { e.target.style.borderColor = 'var(--color-brand-light)'; e.target.style.boxShadow = '0 0 0 3px var(--color-brand-100)'; }}
                                            onBlur={(e) => { e.target.style.borderColor = confirmPassword && confirmPassword !== password ? '#f87171' : 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
                                        />
                                    </div>
                                    {confirmPassword && confirmPassword !== password && (
                                        <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '0.375rem' }}>Las contraseñas no coinciden</p>
                                    )}
                                </div>

                                {/* Error */}
                                {error && (
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem',
                                        padding: '0.75rem 1rem',
                                        borderRadius: '12px',
                                        background: 'var(--color-error-light)',
                                        color: 'var(--color-error)',
                                        border: '1px solid var(--color-error-light)',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        marginBottom: '1rem',
                                    }}>
                                        <AlertCircle size={16} />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading || !password || !confirmPassword}
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
                                        opacity: isLoading || !password || !confirmPassword ? 0.6 : 1,
                                        fontFamily: 'inherit',
                                    }}
                                >
                                    {isLoading ? (
                                        <div className="spinner-sm" style={{ width: '20px', height: '20px' }} />
                                    ) : (
                                        <>
                                            <KeyRound size={18} />
                                            <span>Restablecer contraseña</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Back to login */}
                <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                    <button
                        onClick={() => navigate('/login')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--color-brand-light)',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            fontFamily: 'inherit',
                        }}
                    >
                        ← Volver al inicio de sesión
                    </button>
                </div>
            </div>
        </div>
    );
}
