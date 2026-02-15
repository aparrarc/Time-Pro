import { Shield, FileText, Download, CheckCircle, Eye, Trash2, UserCheck, Globe, Lock, Database, Clock } from 'lucide-react';

export function PrivacyPage() {
    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Privacidad y RGPD</h1>
                <p className="page-header-subtitle">
                    Información sobre el tratamiento de tus datos personales conforme al Reglamento General de Protección de Datos
                </p>
            </div>

            {/* RGPD Rights Cards */}
            <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserCheck size={16} />
                Tus derechos ARCO
            </div>
            <div className="grid-stats" style={{ marginBottom: '2rem' }}>
                <div className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-brand-50)', color: 'var(--color-brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Eye size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Acceso</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Solicita una copia de todos tus datos personales</div>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                        <Download size={14} />
                        Solicitar datos
                    </button>
                </div>

                <div className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-success-light)', color: 'var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <FileText size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Rectificación</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Modifica datos incorrectos o incompletos</div>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                        Solicitar corrección
                    </button>
                </div>

                <div className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-error-light)', color: 'var(--color-error)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Trash2 size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Supresión</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Derecho al olvido — elimina tus datos</div>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem', color: 'var(--color-error)', borderColor: 'var(--color-error-light)' }}>
                        Solicitar eliminación
                    </button>
                </div>

                <div className="card card-interactive" style={{ cursor: 'pointer', textAlign: 'center', padding: '1.5rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-lg)', background: 'var(--color-warning-light)', color: 'var(--color-warning)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                        <Shield size={24} />
                    </div>
                    <div style={{ fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Oposición</div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Oponte al tratamiento de tus datos</div>
                    <button className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
                        Presentar oposición
                    </button>
                </div>
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
                {[
                    { label: 'Geolocalización durante el fichaje', description: 'Permite registrar tu ubicación al fichar entrada/salida', enabled: false },
                    { label: 'Notificaciones por email', description: 'Recibir avisos sobre fichajes, ausencias y nóminas', enabled: true },
                    { label: 'Cookies analíticas', description: 'Permiten mejorar la plataforma analizando el uso', enabled: false },
                ].map((consent, i) => (
                    <div key={i} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '1rem 0',
                        borderBottom: i < 2 ? '1px solid var(--color-border-light)' : 'none',
                    }}>
                        <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{consent.label}</div>
                            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>{consent.description}</div>
                        </div>
                        <label style={{ position: 'relative', width: 44, height: 24, flexShrink: 0, cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked={consent.enabled} style={{ display: 'none' }} />
                            <div style={{
                                width: 44,
                                height: 24,
                                borderRadius: 12,
                                background: consent.enabled ? 'var(--color-brand)' : 'var(--color-border)',
                                transition: 'background var(--transition-fast)',
                                position: 'relative',
                            }}>
                                <div style={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: '50%',
                                    background: 'white',
                                    position: 'absolute',
                                    top: 3,
                                    left: consent.enabled ? 23 : 3,
                                    transition: 'left var(--transition-fast)',
                                    boxShadow: 'var(--shadow-sm)',
                                }} />
                            </div>
                        </label>
                    </div>
                ))}
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
