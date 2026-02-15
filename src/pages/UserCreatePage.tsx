import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Eye, EyeOff, UserPlus, User, Mail, Phone, CreditCard, Lock, AlertCircle, CheckCircle } from 'lucide-react';
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
    const [createSuccess, setCreateSuccess] = useState(false);

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
            setCreateSuccess(true);
            setTimeout(() => navigate('/users'), 1500);
        } else {
            setCreateError(result.error || 'Error al crear usuario');
        }
        setIsCreating(false);
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = formData.firstName && formData.lastName && formData.email && formData.password.length >= 6;

    return (
        <div className="animate-fade-in">
            {/* Page Header */}
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div style={{ marginBottom: '0.75rem' }}>
                        <button
                            onClick={() => navigate('/users')}
                            className="btn btn-ghost btn-sm"
                            style={{ gap: '0.25rem', padding: '0.375rem 0.75rem' }}
                        >
                            <ChevronLeft size={16} />
                            Volver a usuarios
                        </button>
                    </div>
                    <h1 className="page-header-title">Nuevo empleado</h1>
                    <p className="page-header-subtitle">Completa los datos para dar de alta a un nuevo empleado</p>
                </div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--color-brand-50)',
                    color: 'var(--color-brand)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                }}>
                    <UserPlus size={16} />
                    Alta de empleado
                </div>
            </div>

            {/* Success Banner */}
            {createSuccess && (
                <div className="card" style={{
                    marginBottom: '1.5rem',
                    background: 'var(--color-success-light)',
                    border: '1px solid var(--color-success)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                }}>
                    <CheckCircle size={20} style={{ color: 'var(--color-success)', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-success)' }}>
                            ¡Empleado creado correctamente!
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                            Redirigiendo a la lista de usuarios...
                        </div>
                    </div>
                </div>
            )}

            {/* Error Banner */}
            {createError && (
                <div className="card" style={{
                    marginBottom: '1.5rem',
                    background: 'var(--color-error-light)',
                    border: '1px solid var(--color-error)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '1rem 1.25rem',
                }}>
                    <AlertCircle size={20} style={{ color: 'var(--color-error)', flexShrink: 0 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-error)' }}>
                            Error al crear empleado
                        </div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                            {createError}
                        </div>
                    </div>
                </div>
            )}

            <form onSubmit={handleCreateUser}>
                <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
                    {/* Panel 1: Datos personales */}
                    <div className="card">
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <User size={16} />
                            Datos personales
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                    Nombre *
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    required
                                    placeholder="Ej: Alejandro"
                                    value={formData.firstName}
                                    onChange={(e) => updateField('firstName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                    Apellidos *
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    required
                                    placeholder="Ej: García Martínez"
                                    value={formData.lastName}
                                    onChange={(e) => updateField('lastName', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        <CreditCard size={14} style={{ color: 'var(--color-text-muted)' }} />
                                        DNI / NIE *
                                    </span>
                                </label>
                                <input
                                    className="input"
                                    type="text"
                                    required
                                    placeholder="Ej: 12345678X"
                                    value={formData.dni}
                                    onChange={(e) => updateField('dni', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        <Phone size={14} style={{ color: 'var(--color-text-muted)' }} />
                                        Teléfono
                                    </span>
                                </label>
                                <input
                                    className="input"
                                    type="tel"
                                    placeholder="Ej: +34 600 123 456"
                                    value={formData.phone}
                                    onChange={(e) => updateField('phone', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Panel 2: Credenciales de acceso */}
                    <div className="card">
                        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Lock size={16} />
                            Credenciales de acceso
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                                        <Mail size={14} style={{ color: 'var(--color-text-muted)' }} />
                                        Email corporativo *
                                    </span>
                                </label>
                                <input
                                    className="input"
                                    type="email"
                                    required
                                    placeholder="Ej: empleado@empresa.com"
                                    value={formData.email}
                                    onChange={(e) => updateField('email', e.target.value)}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'block', marginBottom: '0.375rem' }}>
                                    Contraseña *
                                </label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        className="input"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        placeholder="Mínimo 6 caracteres"
                                        value={formData.password}
                                        onChange={(e) => updateField('password', e.target.value)}
                                        style={{ paddingRight: '2.75rem' }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        style={{
                                            position: 'absolute',
                                            right: '0.75rem',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: 'var(--color-text-muted)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: '0.25rem',
                                        }}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {formData.password && formData.password.length < 6 && (
                                    <p style={{ fontSize: '0.75rem', color: 'var(--color-error)', marginTop: '0.375rem' }}>
                                        La contraseña debe tener al menos 6 caracteres
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Info card inside */}
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            background: 'var(--color-surface-muted)',
                            border: '1px solid var(--color-border-light)',
                        }}>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>
                                ℹ️ Información sobre el alta
                            </div>
                            <ul style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', lineHeight: 1.7, paddingLeft: '1rem', margin: 0 }}>
                                <li>El empleado recibirá sus credenciales por el canal que indiques</li>
                                <li>Se asignará el rol de <strong>Empleado</strong> por defecto</li>
                                <li>Los permisos pueden modificarse desde la gestión de usuarios</li>
                                <li>La contraseña puede cambiarse en el primer acceso</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: '0.75rem',
                    paddingTop: '0.5rem',
                }}>
                    <button
                        type="button"
                        onClick={() => navigate('/users')}
                        className="btn btn-secondary btn-md"
                        disabled={isCreating}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary btn-md"
                        disabled={isCreating || !isFormValid}
                        style={{ minWidth: '160px' }}
                    >
                        {isCreating ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span className="spinner" style={{
                                    width: 16,
                                    height: 16,
                                    border: '2px solid rgba(255,255,255,0.3)',
                                    borderTop: '2px solid white',
                                    borderRadius: '50%',
                                    animation: 'spin 0.6s linear infinite',
                                }} />
                                Creando...
                            </span>
                        ) : (
                            <>
                                <UserPlus size={18} />
                                Dar de alta
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
