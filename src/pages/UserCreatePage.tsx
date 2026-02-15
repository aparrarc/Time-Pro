import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, CheckCircle, Mail, Lock, User as UserIcon, Phone, ChevronLeft, XCircle, Eye, EyeOff, FileText, Fingerprint } from 'lucide-react';
import { Button } from '../components/ui';
import { useAppStore } from '../store/appStore';

export function UserCreatePage() {
    const navigate = useNavigate();
    const { adminCreateUser } = useAppStore();

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        dni: '',
        email: '',
        phone: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createError, setCreateError] = useState('');

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        setCreateError('');

        const result = await adminCreateUser({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            dni: formData.dni
        });

        if (result.success) {
            navigate('/users');
        } else {
            setCreateError(result.error || 'Error al crear usuario');
        }
        setIsCreating(false);
    };

    return (
        <div className="h-full flex flex-col animate-fade-in relative bg-[var(--color-bg)] overflow-hidden">
            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden text-white/5">
                <div className="absolute top-[-300px] left-1/4 w-[1000px] h-[1000px] bg-[var(--color-primary)]/5 blur-[200px] rounded-full"></div>
                <div className="absolute bottom-[-300px] right-1/4 w-[1000px] h-[1000px] bg-purple-500/5 blur-[200px] rounded-full"></div>
            </div>

            {/* Top Navigation - Floating */}
            <div className="absolute top-0 left-0 w-full px-16 py-8 md:py-12 flex items-center justify-between z-50">
                <button
                    onClick={() => navigate('/users')}
                    className="flex items-center gap-4 px-8 py-5 rounded-[32px] bg-white/5 hover:bg-white/10 border border-white/10 transition-all active:scale-95 group backdrop-blur-2xl shadow-2xl"
                >
                    <ChevronLeft size={28} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[12px] font-black uppercase tracking-[0.4em] text-white/40 group-hover:text-white transition-colors">Volver</span>
                </button>
                <div className="flex items-center gap-4 px-8 py-4 rounded-full bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/20 backdrop-blur-xl shadow-lg">
                    <Shield size={20} className="text-[var(--color-primary)]" />
                    <span className="text-[12px] font-black uppercase text-[var(--color-primary)] tracking-widest leading-none">Control Maestro</span>
                </div>
            </div>

            {/* Main Content Area - Strategic Spacing */}
            <div className="flex-1 flex flex-col items-center pt-28 md:pt-32 pb-24 overflow-y-auto px-8 custom-scrollbar relative">
                <div className="w-full max-w-7xl">

                    {/* Hero Heading Section */}
                    <div className="text-center mb-16 md:mb-20 animate-slide-up">
                        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white uppercase tracking-tighter leading-[0.85] mb-8">
                            NUEVO <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--color-primary)] to-emerald-400">EMPLEADO</span>
                        </h1>
                        <div className="flex items-center justify-center gap-8 opacity-40">
                            <div className="h-[2px] w-32 bg-gradient-to-r from-transparent to-white"></div>
                            <p className="text-[13px] text-white font-black uppercase tracking-[1.5em] whitespace-nowrap leading-none">
                                Registro de Alta Fidelidad
                            </p>
                            <div className="h-[2px] w-32 bg-gradient-to-l from-transparent to-white"></div>
                        </div>
                    </div>

                    {/* Massive Form Architecture */}
                    <form onSubmit={handleCreateUser} className="space-y-16 animate-slide-up" style={{ animationDelay: '100ms' }}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                            {/* Panel 01: Identidad Perimetral */}
                            <div className="bg-white/[0.03] border border-white/5 px-12 md:px-16 py-12 min-h-[750px] rounded-[60px] backdrop-blur-md group/card hover:border-[var(--color-primary)]/30 transition-all duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center">

                                {/* Título ARRIBA y CENTRADO en la ventana */}
                                <div className="w-full flex justify-center mb-8 mt-4">
                                    <h3 className="text-[15px] font-black text-[var(--color-primary)] uppercase tracking-[0.6em] flex items-center justify-center gap-6 border-b border-[var(--color-primary)]/30 pb-4 px-10">
                                        01. Identidad
                                    </h3>
                                </div>

                                {/* Contenido Centrado - 3 Campos */}
                                <div className="space-y-10 w-full flex-1 flex flex-col justify-center">
                                    <div className="space-y-5">
                                        <label className="text-[13px] font-black text-white/30 uppercase tracking-[0.5em] ml-10">Nombre</label>
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                required
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-[40px] py-10 pl-10 pr-10 text-3xl focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/5 tracking-wide"
                                                placeholder="ALEJANDRO"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <label className="text-[13px] font-black text-white/30 uppercase tracking-[0.5em] ml-10">Apellidos</label>
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                required
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-[40px] py-10 pl-10 pr-10 text-3xl focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/5 tracking-wide"
                                                placeholder="GARCÍA MARTÍNEZ"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <label className="text-[13px] font-black text-white/30 uppercase tracking-[0.5em] ml-10">DNI</label>
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                required
                                                value={formData.dni}
                                                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-[40px] py-10 pl-10 pr-10 text-3xl focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/5 tracking-wide"
                                                placeholder="12345678X"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Panel 02: Acceso y Enlace */}
                            <div className="bg-white/[0.03] border border-white/5 px-12 md:px-16 py-12 min-h-[750px] rounded-[60px] backdrop-blur-md group/card hover:border-[var(--color-primary)]/30 transition-all duration-700 shadow-[0_50px_100px_rgba(0,0,0,0.5)] flex flex-col items-center">

                                {/* Título ARRIBA y CENTRADO en la ventana */}
                                <div className="w-full flex justify-center mb-8 mt-4">
                                    <h3 className="text-[15px] font-black text-[var(--color-primary)] uppercase tracking-[0.6em] flex items-center justify-center gap-6 border-b border-[var(--color-primary)]/30 pb-4 px-10">
                                        02. Acceso
                                    </h3>
                                </div>

                                {/* Contenido Centrado */}
                                <div className="space-y-10 w-full flex-1 flex flex-col justify-center">
                                    <div className="space-y-5">
                                        <label className="text-[13px] font-black text-white/30 uppercase tracking-[0.5em] ml-10">Email</label>
                                        <div className="relative group/input">
                                            <input
                                                type="email"
                                                required
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-[40px] py-10 pl-10 pr-10 text-3xl focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/5 tracking-wide"
                                                placeholder="email@empresa.com"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <label className="text-[13px] font-black text-white/30 uppercase tracking-[0.5em] ml-10">Teléfono</label>
                                        <div className="relative group/input">
                                            <input
                                                type="tel"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-[40px] py-10 pl-10 pr-10 text-3xl focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/5 tracking-wide"
                                                placeholder="+34 600..."
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-5">
                                        <label className="text-[13px] font-black text-white/30 uppercase tracking-[0.5em] ml-10">Contraseña</label>
                                        <div className="relative group/input">
                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                required
                                                value={formData.password}
                                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                                className="w-full bg-white/[0.04] border border-white/10 rounded-[40px] py-10 pl-10 pr-20 text-3xl focus:outline-none focus:border-[var(--color-primary)]/50 focus:bg-white/[0.08] transition-all font-bold placeholder:text-white/5 tracking-wide"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 hover:text-[var(--color-primary)] transition-all p-3 rounded-full hover:bg-white/10 shadow-lg"
                                            >
                                                {showPassword ? <EyeOff size={28} /> : <Eye size={28} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {createError && (
                            <div className="p-10 rounded-[50px] bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center gap-6 animate-shake shadow-xl">
                                <XCircle size={32} />
                                <p className="text-xl font-black uppercase tracking-[0.3em]">{createError}</p>
                            </div>
                        )}

                        {/* Gigantic Action Area */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-10 pt-10">
                            <button
                                type="button"
                                onClick={() => navigate('/users')}
                                className="w-full sm:w-auto px-24 py-10 text-[13px] font-black uppercase tracking-[0.6em] bg-white/5 hover:bg-white/10 rounded-[40px] border border-white/10 transition-all hover:-translate-y-2 active:scale-95 shadow-xl"
                                disabled={isCreating}
                            >
                                DESCARTAR
                            </button>
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full sm:w-auto px-32 py-10 text-[13px] font-black uppercase tracking-[0.8em] italic shadow-[0_30px_80px_rgba(186,255,41,0.3)] rounded-[40px] hover:-translate-y-3 active:scale-95 transition-all"
                                disabled={isCreating}
                            >
                                {isCreating ? (
                                    <div className="w-8 h-8 border-[5px] border-black/30 border-t-black rounded-full animate-spin"></div>
                                ) : (
                                    'ALTA EMPLEADO'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Cinematic Background Elements */}
            <div className="absolute bottom-12 w-full flex justify-center pointer-events-none opacity-20">
                <div className="flex items-center gap-16">
                    <div className="h-[1px] w-64 bg-gradient-to-r from-transparent via-white/50 to-white"></div>
                    <p className="text-[10px] font-black tracking-[2.5em] uppercase text-white whitespace-nowrap leading-none">TIMETRACK PRO • ADMIN DEEP CORE</p>
                    <div className="h-[1px] w-64 bg-gradient-to-l from-transparent via-white/50 to-white"></div>
                </div>
            </div>
        </div>
    );
}
