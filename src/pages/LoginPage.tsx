import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, LogIn, Zap, Clock, Shield, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

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
        <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8eeff 50%, #f5f0ff 100%)' }}>
            {/* Left side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12" style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' }}>
                <div>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Clock size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">TimeTrack Pro</span>
                    </div>
                </div>

                <div className="max-w-lg">
                    <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-6">
                        Control horario inteligente para tu equipo
                    </h1>
                    <p className="text-lg text-white/80 leading-relaxed mb-10">
                        Gestiona fichajes, ausencias, nóminas y cumplimiento RGPD en una sola plataforma profesional.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { icon: Clock, label: 'Fichajes', desc: 'Control de entrada y salida' },
                            { icon: Users, label: 'Directorio', desc: 'Gestión de empleados' },
                            { icon: Shield, label: 'RGPD', desc: 'Cumplimiento legal completo' },
                            { icon: Mail, label: 'Comunicación', desc: 'Buzón interno RRHH' },
                        ].map(({ icon: Icon, label, desc }) => (
                            <div key={label} className="flex items-start gap-3 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <Icon size={16} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{label}</p>
                                    <p className="text-xs text-white/60">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-sm text-white/40">
                    © 2026 TimeTrack Pro · Cumplimiento RGPD España
                </p>
            </div>

            {/* Right side - Login form */}
            <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-md">
                    {/* Mobile branding */}
                    <div className="lg:hidden flex items-center gap-3 mb-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--color-primary)' }}>
                            <Clock size={22} className="text-white" />
                        </div>
                        <span className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>TimeTrack Pro</span>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1e293b' }}>
                            Bienvenido de nuevo
                        </h2>
                        <p className="text-sm" style={{ color: '#64748b' }}>
                            Inicia sesión para acceder a tu panel de control
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#9ca3af' }} />
                                <input
                                    type="email"
                                    placeholder="nombre@empresa.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm transition-all"
                                    style={{
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#1e293b',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: '#374151' }}>
                                Contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: '#9ca3af' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-11 pr-11 py-3 rounded-xl text-sm transition-all"
                                    style={{
                                        border: '1.5px solid #e2e8f0',
                                        background: 'white',
                                        color: '#1e293b',
                                        outline: 'none',
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 hover:opacity-80 transition-opacity"
                                    style={{ color: '#9ca3af' }}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 p-3 rounded-xl text-sm" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                                <span>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-3 pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%)' }}
                            >
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <LogIn size={18} />
                                        <span>Iniciar sesión</span>
                                    </>
                                )}
                            </button>

                            {/* Separator */}
                            <div className="flex items-center gap-4 py-1">
                                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }}></div>
                                <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>o</span>
                                <div className="flex-1 h-px" style={{ background: '#e2e8f0' }}></div>
                            </div>

                            {/* Demo Login */}
                            <button
                                type="button"
                                onClick={handleDemoLogin}
                                className="w-full py-3 rounded-xl text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                                style={{
                                    background: 'var(--color-primary-light)',
                                    color: 'var(--color-primary)',
                                    border: '1.5px solid var(--color-primary)',
                                    borderColor: 'rgba(79, 70, 229, 0.2)',
                                }}
                            >
                                <Zap size={18} />
                                <span>Acceder en modo demo</span>
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <p className="text-center mt-8 text-xs" style={{ color: '#94a3b8' }}>
                        ¿Problemas al acceder?{' '}
                        <button className="font-medium hover:underline" style={{ color: 'var(--color-primary)' }}>
                            Contacta con soporte
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}
