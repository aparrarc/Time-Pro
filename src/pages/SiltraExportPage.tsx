import { useState } from 'react';
import {
    FileUp,
    Download,
    Calendar,
    FileText,
    CheckCircle2,
    XCircle,
    Clock,
    Send,
    AlertTriangle,
    Info,
    Users,
    Building2,
    FileCode2,
} from 'lucide-react';
import type { SiltraExport, SiltraExportType, SiltraExportStatus } from '../types';

const EXPORT_TYPES: { value: SiltraExportType; label: string; desc: string; icon: typeof FileText }[] = [
    { value: 'AFI', label: 'AFI — Afiliación', desc: 'Altas, bajas y variaciones de datos de trabajadores', icon: Users },
    { value: 'FDI', label: 'FDI — Fichero Diario', desc: 'Bases de cotización y jornadas reales', icon: Calendar },
    { value: 'FAN', label: 'FAN — Fichero Anual', desc: 'Resumen anual de cotizaciones', icon: Building2 },
];

const STATUS_CONFIG: Record<SiltraExportStatus, { label: string; color: string; bg: string; icon: typeof Clock }> = {
    generated: { label: 'Generado', color: 'var(--color-brand)', bg: 'var(--color-icon-bg-brand)', icon: FileCode2 },
    sent: { label: 'Enviado', color: 'var(--color-warning)', bg: 'var(--color-warning-light)', icon: Send },
    accepted: { label: 'Aceptado', color: 'var(--color-success)', bg: 'var(--color-success-light)', icon: CheckCircle2 },
    rejected: { label: 'Rechazado', color: 'var(--color-error)', bg: 'var(--color-error-light)', icon: XCircle },
};

const MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const MOCK_EXPORTS: SiltraExport[] = [
    { id: '1', export_type: 'FDI', period_month: 1, period_year: 2026, file_name: 'FDI_012026_001.xml', records_count: 45, status: 'accepted', generated_by: 'admin', created_at: '2026-02-01T10:30:00' },
    { id: '2', export_type: 'AFI', period_month: 1, period_year: 2026, file_name: 'AFI_012026_003.xml', records_count: 3, status: 'sent', generated_by: 'admin', created_at: '2026-02-01T11:00:00' },
    { id: '3', export_type: 'FDI', period_month: 12, period_year: 2025, file_name: 'FDI_122025_001.xml', records_count: 42, status: 'accepted', generated_by: 'admin', created_at: '2026-01-03T09:15:00' },
    { id: '4', export_type: 'FAN', period_year: 2025, file_name: 'FAN_2025_001.xml', records_count: 48, status: 'accepted', generated_by: 'admin', created_at: '2026-01-15T14:00:00' },
    { id: '5', export_type: 'AFI', period_month: 12, period_year: 2025, file_name: 'AFI_122025_001.xml', records_count: 2, status: 'rejected', generated_by: 'admin', notes: 'Error en NSS del trabajador 28XXXXXX12', created_at: '2025-12-28T16:30:00' },
];

const MOCK_PREVIEW = [
    { nss: '28/12345678/01', nombre: 'García López, María', tipo: 'Base CC', valor: '1.800,00 €' },
    { nss: '28/87654321/02', nombre: 'Martínez Ruiz, Carlos', tipo: 'Base CC', valor: '2.100,00 €' },
    { nss: '08/11223344/03', nombre: 'Fernández Gil, Ana', tipo: 'Base CC', valor: '1.650,00 €' },
    { nss: '28/55667788/04', nombre: 'López Torres, David', tipo: 'Base CC', valor: '1.950,00 €' },
];

export function SiltraExportPage() {
    const [selectedType, setSelectedType] = useState<SiltraExportType>('FDI');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [showPreview, setShowPreview] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerate = () => {
        setIsGenerating(true);
        setTimeout(() => {
            setIsGenerating(false);
            setShowPreview(true);
        }, 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="page-header">
                <div>
                    <h1 className="page-title">Exportación SILTRA</h1>
                    <p className="page-subtitle">Genera ficheros XML para el Sistema de Liquidación Directa (SILTRA)</p>
                </div>
            </div>

            {/* Info banner */}
            <div className="card" style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem',
                background: 'var(--color-icon-bg-brand)',
                borderLeft: '4px solid var(--color-brand)',
            }}>
                <Info size={20} style={{ color: 'var(--color-brand)', flexShrink: 0, marginTop: '2px' }} />
                <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                        Sistema de Liquidación Directa
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                        SILTRA es el sistema de la TGSS para la gestión de cotizaciones y afiliación.
                        Los ficheros generados deben importarse en la aplicación SILTRA de la Seguridad Social.
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Left: Generator */}
                <div className="space-y-4">
                    {/* Export type selector */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
                            Tipo de exportación
                        </h3>
                        <div className="space-y-3">
                            {EXPORT_TYPES.map(type => {
                                const TypeIcon = type.icon;
                                const isSelected = selectedType === type.value;
                                return (
                                    <button
                                        key={type.value}
                                        onClick={() => setSelectedType(type.value)}
                                        style={{
                                            width: '100%',
                                            padding: '1rem 1.25rem',
                                            borderRadius: 'var(--radius-xl)',
                                            border: `2px solid ${isSelected ? 'var(--color-brand)' : 'var(--color-border)'}`,
                                            background: isSelected ? 'var(--color-icon-bg-brand)' : 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            fontFamily: 'inherit',
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        <div style={{
                                            width: '40px',
                                            height: '40px',
                                            borderRadius: 'var(--radius-lg)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            background: isSelected ? 'var(--color-brand)' : 'var(--color-surface-hover)',
                                        }}>
                                            <TypeIcon size={18} style={{ color: isSelected ? '#fff' : 'var(--color-text-muted)' }} />
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{type.label}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>{type.desc}</div>
                                        </div>
                                        {isSelected && (
                                            <div style={{
                                                width: '24px',
                                                height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--color-brand)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}>
                                                <CheckCircle2 size={14} color="#fff" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Period selector */}
                    <div className="card" style={{ padding: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '1rem' }}>
                            Periodo
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: selectedType === 'FAN' ? '1fr' : '1fr 1fr', gap: '0.75rem' }}>
                            {selectedType !== 'FAN' && (
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
                                        Mes
                                    </label>
                                    <select
                                        value={selectedMonth}
                                        onChange={e => setSelectedMonth(Number(e.target.value))}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            borderRadius: 'var(--radius-lg)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-surface)',
                                            fontSize: '0.875rem',
                                            fontFamily: 'inherit',
                                            color: 'var(--color-text-primary)',
                                        }}
                                    >
                                        {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                    </select>
                                </div>
                            )}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: 'var(--color-text-primary)' }}>
                                    Año
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={e => setSelectedYear(Number(e.target.value))}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--color-border)',
                                        background: 'var(--color-surface)',
                                        fontSize: '0.875rem',
                                        fontFamily: 'inherit',
                                        color: 'var(--color-text-primary)',
                                    }}
                                >
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            style={{
                                width: '100%',
                                marginTop: '1.25rem',
                                padding: '0.875rem',
                                borderRadius: 'var(--radius-lg)',
                                background: isGenerating ? 'var(--color-surface-hover)' : 'linear-gradient(135deg, var(--color-brand), #8b5cf6)',
                                color: isGenerating ? 'var(--color-text-muted)' : '#fff',
                                fontWeight: 700,
                                fontSize: '0.875rem',
                                border: 'none',
                                cursor: isGenerating ? 'not-allowed' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                fontFamily: 'inherit',
                            }}
                        >
                            {isGenerating ? (
                                <>
                                    <div style={{
                                        width: '16px',
                                        height: '16px',
                                        border: '2px solid var(--color-text-muted)',
                                        borderTopColor: 'transparent',
                                        borderRadius: '50%',
                                        animation: 'spin 0.8s linear infinite',
                                    }} />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <FileUp size={18} /> Generar fichero SILTRA
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Right: Preview or history */}
                <div className="space-y-4">
                    {/* Preview panel */}
                    {showPreview && (
                        <div className="card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--color-success)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <CheckCircle2 size={18} style={{ color: 'var(--color-success)' }} />
                                    Fichero generado
                                </h3>
                                <button style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.5rem 1rem',
                                    borderRadius: 'var(--radius-lg)',
                                    background: 'var(--color-brand)',
                                    color: '#fff',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontFamily: 'inherit',
                                }}>
                                    <Download size={14} /> Descargar XML
                                </button>
                            </div>
                            <div style={{
                                padding: '1rem',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--color-surface-hover)',
                                fontSize: '0.8125rem',
                            }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <div><span style={{ color: 'var(--color-text-muted)' }}>Tipo:</span> <strong style={{ color: 'var(--color-text-primary)' }}>{selectedType}</strong></div>
                                    <div><span style={{ color: 'var(--color-text-muted)' }}>Periodo:</span> <strong style={{ color: 'var(--color-text-primary)' }}>{selectedType !== 'FAN' ? `${MONTHS[selectedMonth]} ` : ''}{selectedYear}</strong></div>
                                    <div><span style={{ color: 'var(--color-text-muted)' }}>Registros:</span> <strong style={{ color: 'var(--color-text-primary)' }}>{MOCK_PREVIEW.length}</strong></div>
                                    <div><span style={{ color: 'var(--color-text-muted)' }}>Archivo:</span> <strong style={{ color: 'var(--color-text-primary)' }}>{selectedType}_{String(selectedMonth + 1).padStart(2, '0')}{selectedYear}.xml</strong></div>
                                </div>
                            </div>

                            {/* Preview data */}
                            <div style={{ marginTop: '1rem', overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                                            {['NSS', 'Trabajador', 'Concepto', 'Valor'].map(h => (
                                                <th key={h} style={{
                                                    padding: '0.5rem',
                                                    fontWeight: 700,
                                                    fontSize: '0.6875rem',
                                                    textTransform: 'uppercase' as const,
                                                    color: 'var(--color-text-muted)',
                                                    textAlign: 'left',
                                                }}>{h}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {MOCK_PREVIEW.map((row, i) => (
                                            <tr key={i} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <td style={{ padding: '0.5rem', fontFamily: 'monospace', color: 'var(--color-text-primary)' }}>{row.nss}</td>
                                                <td style={{ padding: '0.5rem', color: 'var(--color-text-primary)' }}>{row.nombre}</td>
                                                <td style={{ padding: '0.5rem', color: 'var(--color-text-muted)' }}>{row.tipo}</td>
                                                <td style={{ padding: '0.5rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>{row.valor}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Export history */}
                    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                        <div style={{
                            padding: '1.25rem 1.5rem',
                            borderBottom: '1px solid var(--color-border)',
                        }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                                Historial de exportaciones
                            </h3>
                        </div>
                        <div className="space-y-0">
                            {MOCK_EXPORTS.map(exp => {
                                const status = STATUS_CONFIG[exp.status];
                                const StatusIcon = status.icon;
                                return (
                                    <div
                                        key={exp.id}
                                        style={{
                                            padding: '1rem 1.5rem',
                                            borderBottom: '1px solid var(--color-border)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{
                                                width: '36px',
                                                height: '36px',
                                                borderRadius: 'var(--radius-lg)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: status.bg,
                                            }}>
                                                <StatusIcon size={16} style={{ color: status.color }} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    {exp.file_name}
                                                    {exp.status === 'rejected' && <AlertTriangle size={14} style={{ color: 'var(--color-error)' }} />}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                                                    {exp.export_type} · {exp.period_month ? `${MONTHS[exp.period_month - 1]} ` : ''}{exp.period_year} · {exp.records_count} registros
                                                </div>
                                                {exp.notes && (
                                                    <div style={{ fontSize: '0.6875rem', color: 'var(--color-error)', marginTop: '0.25rem' }}>
                                                        {exp.notes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.625rem',
                                                borderRadius: 'var(--radius-full)',
                                                fontSize: '0.6875rem',
                                                fontWeight: 700,
                                                background: status.bg,
                                                color: status.color,
                                            }}>{status.label}</span>
                                            <button title="Descargar" style={{
                                                width: '32px',
                                                height: '32px',
                                                borderRadius: 'var(--radius-md)',
                                                border: '1px solid var(--color-border)',
                                                background: 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                            }}>
                                                <Download size={14} style={{ color: 'var(--color-text-muted)' }} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
