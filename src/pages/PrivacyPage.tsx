import { useState, useEffect } from 'react';
import { Shield, FileText, Download, CheckCircle, Eye, Trash2, UserCheck, Globe, Lock, Database, Clock, Send, Loader } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAppStore } from '../store/appStore';

type ConsentType = 'geolocation' | 'biometric' | 'communication' | 'analytics';
type ArcoRight = 'access' | 'rectification' | 'erasure' | 'objection';

interface ConsentItem {
    type: ConsentType;
    label: string;
    description: string;
    granted: boolean;
}

const defaultConsents: ConsentItem[] = [
    { type: 'geolocation', label: 'Geolocalización durante el fichaje', description: 'Permite registrar tu ubicación al fichar entrada/salida', granted: false },
    { type: 'communication', label: 'Notificaciones por email', description: 'Recibir avisos sobre fichajes, ausencias y nóminas', granted: true },
    { type: 'analytics', label: 'Cookies analíticas', description: 'Permiten mejorar la plataforma analizando el uso', granted: false },
    { type: 'biometric', label: 'Datos biométricos', description: 'Verificación mediante huella dactilar o reconocimiento facial', granted: false },
];

const arcoRightsConfig: { type: ArcoRight; icon: React.ReactNode; label: string; description: string; color: string; bg: string; btnLabel: string; btnStyle?: React.CSSProperties }[] = [
    { type: 'access', icon: <Eye size={24} />, label: 'Acceso', description: 'Solicita una copia de todos tus datos personales', color: 'var(--color-brand)', bg: 'var(--color-brand-50)', btnLabel: 'Solicitar datos' },
    { type: 'rectification', icon: <FileText size={24} />, label: 'Rectificación', description: 'Modifica datos incorrectos o incompletos', color: 'var(--color-success)', bg: 'var(--color-success-light)', btnLabel: 'Solicitar corrección' },
    { type: 'erasure', icon: <Trash2 size={24} />, label: 'Supresión', description: 'Derecho al olvido — elimina tus datos', color: 'var(--color-error)', bg: 'var(--color-error-light)', btnLabel: 'Solicitar eliminación', btnStyle: { color: 'var(--color-error)', borderColor: 'var(--color-error-light)' } },
    { type: 'objection', icon: <Shield size={24} />, label: 'Oposición', description: 'Oponte al tratamiento de tus datos', color: 'var(--color-warning)', bg: 'var(--color-warning-light)', btnLabel: 'Presentar oposición' },
];

export function PrivacyPage() {
    const { user, addToast } = useAppStore();
    const [consents, setConsents] = useState<ConsentItem[]>(defaultConsents);
    const [loadingConsents, setLoadingConsents] = useState(true);
    const [submittingArco, setSubmittingArco] = useState<ArcoRight | null>(null);
    const [savingConsent, setSavingConsent] = useState<ConsentType | null>(null);

    useEffect(() => {
        loadConsents();
    }, []);

    const loadConsents = async () => {
        setLoadingConsents(true);
        if (!isSupabaseConfigured()) {
            setLoadingConsents(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('consents')
                .select('consent_type, granted');

            if (error) throw error;

            if (data && data.length > 0) {
                setConsents(prev => prev.map(c => {
                    const found = data.find((d: any) => d.consent_type === c.type);
                    return found ? { ...c, granted: found.granted } : c;
                }));
            }
        } catch {
            // Stay with defaults
        } finally {
            setLoadingConsents(false);
        }
    };

    const handleToggleConsent = async (type: ConsentType) => {
        const consent = consents.find(c => c.type === type);
        if (!consent) return;

        const newValue = !consent.granted;

        // Optimistic update
        setConsents(prev => prev.map(c => c.type === type ? { ...c, granted: newValue } : c));

        if (!isSupabaseConfigured()) {
            addToast('success', newValue ? '✅ Consentimiento activado' : '❌ Consentimiento revocado');
            return;
        }

        setSavingConsent(type);
        try {
            const { error } = await supabase
                .from('consents')
                .upsert({
                    user_id: user?.id,
                    consent_type: type,
                    granted: newValue,
                    granted_at: newValue ? new Date().toISOString() : null,
                    revoked_at: newValue ? null : new Date().toISOString(),
                }, { onConflict: 'user_id,consent_type' });

            if (error) throw error;
            addToast('success', newValue ? '✅ Consentimiento activado' : '❌ Consentimiento revocado');
        } catch {
            // Revert on error
            setConsents(prev => prev.map(c => c.type === type ? { ...c, granted: !newValue } : c));
            addToast('error', 'Error al guardar el consentimiento');
        } finally {
            setSavingConsent(null);
        }
    };

    const handleArcoRequest = async (rightType: ArcoRight) => {
        setSubmittingArco(rightType);

        if (!isSupabaseConfigured()) {
            setTimeout(() => {
                addToast('success', `📋 Solicitud de ${arcoRightsConfig.find(r => r.type === rightType)?.label} registrada. Te contactaremos en 30 días.`);
                setSubmittingArco(null);
            }, 800);
            return;
        }

        try {
            const { error } = await supabase
                .from('arco_requests')
                .insert({
                    user_id: user?.id,
                    right_type: rightType,
                    reason: `Solicitud de derecho de ${rightType} desde la plataforma.`,
                });

            if (error) throw error;
            addToast('success', `📋 Solicitud de ${arcoRightsConfig.find(r => r.type === rightType)?.label} registrada. Te contactaremos en un plazo máximo de 30 días.`);
        } catch {
            addToast('error', 'Error al enviar la solicitud ARCO');
        } finally {
            setSubmittingArco(null);
        }
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Privacidad y RGPD</h1>
                <p className="page-header-subtitle">
                    Información sobre el tratamiento de tus datos personales conforme al Reglamento General de Protección de Datos
                </p>
            </div>

            {/* ARCO Rights Cards */}
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={16} />
                Tus derechos ARCO
            </div>
            <div className="grid-stats" style={{ marginBottom: '2rem' }}>
                {arcoRightsConfig.map(right => (
                    <div key={right.type} className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: right.bg, color: right.color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                            {right.icon}
                        </div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>{right.label}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{right.description}</div>
                        <button
                            className="btn btn-outline btn-sm"
                            style={{ marginTop: '0.75rem', ...right.btnStyle }}
                            onClick={() => handleArcoRequest(right.type)}
                            disabled={submittingArco === right.type}
                        >
                            {submittingArco === right.type ? (
                                <div className="spinner-sm" style={{ width: 14, height: 14 }} />
                            ) : right.type === 'access' ? (
                                <Download size={14} />
                            ) : (
                                <Send size={14} />
                            )}
                            {right.btnLabel}
                        </button>
                    </div>
                ))}
            </div>

            {/* Data Processing Record */}
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={16} />
                Registro de actividades de tratamiento
            </div>
            <div className="card" style={{ marginBottom: '2rem', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Actividad</th>
                                <th>Finalidad</th>
                                <th>Base legal</th>
                                <th>Conservación</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Registro de jornada</td>
                                <td>Cumplimiento RDL 8/2019 de registro horario obligatorio</td>
                                <td><span className="badge badge-success">Obligación legal</span></td>
                                <td>4 años</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Gestión de nóminas</td>
                                <td>Cumplimiento de obligaciones contractuales y fiscales</td>
                                <td><span className="badge badge-success">Obligación legal</span></td>
                                <td>5 años</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Control de ausencias</td>
                                <td>Gestión de vacaciones, permisos y bajas laborales</td>
                                <td><span className="badge badge-primary">Interés legítimo</span></td>
                                <td>4 años</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Comunicación interna</td>
                                <td>Facilitar la comunicación entre empleados y RRHH</td>
                                <td><span className="badge badge-primary">Interés legítimo</span></td>
                                <td>2 años</td>
                            </tr>
                            <tr>
                                <td style={{ fontWeight: 600 }}>Geolocalización</td>
                                <td>Verificación de ubicación durante el fichaje (opcional)</td>
                                <td><span className="badge badge-warning">Consentimiento</span></td>
                                <td>1 año</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Consents */}
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={16} />
                Gestión de consentimientos
            </div>
            <div className="card" style={{ marginBottom: '2rem' }}>
                {loadingConsents ? (
                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                        <div className="spinner-sm" />
                    </div>
                ) : (
                    consents.map((consent, i) => (
                        <div key={consent.type} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 0',
                            borderBottom: i < consents.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                        }}>
                            <div>
                                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{consent.label}</div>
                                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{consent.description}</div>
                            </div>
                            <label
                                style={{ position: 'relative', width: 44, height: 24, flexShrink: 0, cursor: savingConsent === consent.type ? 'wait' : 'pointer' }}
                                onClick={() => handleToggleConsent(consent.type)}
                            >
                                <div style={{
                                    width: 44,
                                    height: 24,
                                    borderRadius: 12,
                                    background: consent.granted ? 'var(--color-brand)' : 'var(--color-border)',
                                    transition: 'background var(--transition-fast)',
                                    position: 'relative',
                                    opacity: savingConsent === consent.type ? 0.5 : 1,
                                }}>
                                    <div style={{
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        background: 'white',
                                        position: 'absolute',
                                        top: 3,
                                        left: consent.granted ? 23 : 3,
                                        transition: 'left var(--transition-fast)',
                                        boxShadow: 'var(--shadow-sm)',
                                    }} />
                                </div>
                            </label>
                        </div>
                    ))
                )}
            </div>

            {/* Security Info */}
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={16} />
                Medidas de seguridad
            </div>
            <div className="grid-2" style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Lock size={20} style={{ color: 'var(--color-success)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Cifrado TLS 1.3</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Todas las comunicaciones están cifradas de extremo a extremo</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Database size={20} style={{ color: 'var(--color-brand)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Row Level Security</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Aislamiento de datos por usuario con políticas RLS en Supabase</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Clock size={20} style={{ color: 'var(--color-warning)', flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Auditoría inmutable</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Registro de todas las acciones críticas con retención de 4 años</div>
                    </div>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <Globe size={20} style={{ color: '#7C3AED', flexShrink: 0, marginTop: 2 }} />
                    <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Datos en la UE</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Todos los datos se almacenan en servidores dentro de la Unión Europea</div>
                    </div>
                </div>
            </div>

            {/* Footer notice */}
            <div className="card" style={{ background: 'var(--color-surface-muted)', textAlign: 'center', padding: '1.5rem' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', maxWidth: 600, margin: '0 auto' }}>
                    Para ejercer cualquiera de tus derechos o si tienes dudas sobre el tratamiento de tus datos,
                    contacta con nuestro Delegado de Protección de Datos en <strong>dpo@empresa.com</strong>.
                    También puedes presentar una reclamación ante la <strong>Agencia Española de Protección de Datos (AEPD)</strong>.
                </p>
            </div>
        </div>
    );
}
