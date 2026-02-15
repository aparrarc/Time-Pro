import { useState, useMemo } from 'react';
import {
    FolderOpen, FileText, Upload, Search, Filter, Grid, List,
    FileCheck, FileClock, FileWarning, File, Download, Eye, Trash2,
    Briefcase, GraduationCap, Award, Scale, MoreHorizontal,
} from 'lucide-react';
import { useAppStore } from '../store/appStore';
import { isDemoMode, DEMO_USERS } from '../lib/demoData';
import type { DocumentCategory, DocumentStatus, HRDocument } from '../types';

// ── Config ───────────────────────────────────────────

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; icon: typeof FileText; color: string; bg: string }> = {
    contract: { label: 'Contratos', icon: Briefcase, color: '#6366f1', bg: '#eef2ff' },
    payslip: { label: 'Nóminas', icon: FileText, color: '#16a34a', bg: '#f0fdf4' },
    certificate: { label: 'Certificados', icon: Award, color: '#f59e0b', bg: '#fffbeb' },
    training: { label: 'Formación', icon: GraduationCap, color: '#8b5cf6', bg: '#f5f3ff' },
    disciplinary: { label: 'Disciplinario', icon: Scale, color: '#dc2626', bg: '#fef2f2' },
    other: { label: 'Otros', icon: File, color: '#64748b', bg: '#f8fafc' },
};

const STATUS_CONFIG: Record<DocumentStatus, { label: string; icon: typeof FileCheck; color: string; bg: string }> = {
    active: { label: 'Vigente', icon: FileCheck, color: '#16a34a', bg: '#f0fdf4' },
    expired: { label: 'Caducado', icon: FileWarning, color: '#dc2626', bg: '#fef2f2' },
    pending_signature: { label: 'Pendiente firma', icon: FileClock, color: '#f59e0b', bg: '#fffbeb' },
    archived: { label: 'Archivado', icon: FolderOpen, color: '#64748b', bg: '#f8fafc' },
};

// ── Demo data ────────────────────────────────────────

function generateDemoDocs(): HRDocument[] {
    const employees = DEMO_USERS.filter(u => u.role !== 'admin');
    const docs: HRDocument[] = [];

    const templates: Array<{ title: string; category: DocumentCategory; status: DocumentStatus; mime: string; size: number }> = [
        { title: 'Contrato indefinido', category: 'contract', status: 'active', mime: 'application/pdf', size: 245000 },
        { title: 'Anexo modificación jornada', category: 'contract', status: 'pending_signature', mime: 'application/pdf', size: 123000 },
        { title: 'Nómina Enero 2026', category: 'payslip', status: 'active', mime: 'application/pdf', size: 89000 },
        { title: 'Nómina Diciembre 2025', category: 'payslip', status: 'active', mime: 'application/pdf', size: 91000 },
        { title: 'Certificado PRL', category: 'certificate', status: 'active', mime: 'application/pdf', size: 156000 },
        { title: 'Reconocimiento médico 2025', category: 'certificate', status: 'expired', mime: 'application/pdf', size: 203000 },
        { title: 'Curso RGPD 2026', category: 'training', status: 'active', mime: 'application/pdf', size: 1230000 },
        { title: 'Formación liderazgo', category: 'training', status: 'pending_signature', mime: 'application/pdf', size: 540000 },
        { title: 'Certificado idiomas B2', category: 'certificate', status: 'active', mime: 'application/pdf', size: 67000 },
        { title: 'Acta reunión comité', category: 'other', status: 'archived', mime: 'application/pdf', size: 34000 },
    ];

    employees.forEach((emp, empIdx) => {
        const n = 3 + (empIdx % 3);
        for (let i = 0; i < n; i++) {
            const t = templates[(empIdx * 3 + i) % templates.length];
            const daysAgo = Math.floor(Math.random() * 180);
            const created = new Date();
            created.setDate(created.getDate() - daysAgo);
            docs.push({
                id: `doc-${emp.id}-${i}`,
                user_id: emp.id,
                title: t.title,
                category: t.category,
                description: `${t.title} de ${emp.full_name}`,
                file_name: `${t.title.toLowerCase().replace(/ /g, '_')}_${emp.last_name?.toLowerCase()}.pdf`,
                file_size_bytes: t.size,
                mime_type: t.mime,
                status: t.status,
                expiry_date: t.status === 'expired' ? '2025-12-31' : t.status === 'active' ? '2027-12-31' : undefined,
                uploaded_by: 'demo-admin-001',
                created_at: created.toISOString(),
                user_name: emp.full_name,
            });
        }
    });
    return docs;
}

const formatFileSize = (bytes?: number) => {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
};

// ── Component ────────────────────────────────────────

export function DocumentsPage() {
    const user = useAppStore(s => s.user);
    const isAdmin = user?.role === 'admin';
    const [documents] = useState<HRDocument[]>(() => isDemoMode ? generateDemoDocs() : []);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | 'all'>('all');
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const filtered = useMemo(() => {
        return documents.filter(d => {
            if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
            if (statusFilter !== 'all' && d.status !== statusFilter) return false;
            if (search) {
                const q = search.toLowerCase();
                return d.title.toLowerCase().includes(q) || d.user_name?.toLowerCase().includes(q) || d.file_name?.toLowerCase().includes(q);
            }
            return true;
        });
    }, [documents, categoryFilter, statusFilter, search]);

    const categoryStats = useMemo(() => {
        return (Object.keys(CATEGORY_CONFIG) as DocumentCategory[]).map(cat => ({
            ...CATEGORY_CONFIG[cat],
            category: cat,
            count: documents.filter(d => d.category === cat).length,
        }));
    }, [documents]);

    const statusStats = useMemo(() => ({
        active: documents.filter(d => d.status === 'active').length,
        expired: documents.filter(d => d.status === 'expired').length,
        pending_signature: documents.filter(d => d.status === 'pending_signature').length,
        archived: documents.filter(d => d.status === 'archived').length,
    }), [documents]);

    return (
        <div style={{ padding: '32px', maxWidth: 1400, margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-text)', margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        <FolderOpen size={24} style={{ color: 'var(--color-brand)' }} /> Gestión Documental
                    </h1>
                    <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginTop: 4 }}>Repositorio centralizado de documentos laborales</p>
                </div>
                {isAdmin && (
                    <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--color-brand)', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                        <Upload size={16} /> Subir documento
                    </button>
                )}
            </div>

            {/* Status overview */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                {(Object.entries(STATUS_CONFIG) as [DocumentStatus, typeof STATUS_CONFIG.active][]).map(([key, cfg]) => {
                    const Icon = cfg.icon;
                    return (
                        <button key={key} onClick={() => setStatusFilter(statusFilter === key ? 'all' : key)} style={{
                            padding: '14px 16px', borderRadius: 12, border: statusFilter === key ? `2px solid ${cfg.color}` : '1px solid var(--color-border)',
                            background: statusFilter === key ? cfg.bg : 'var(--color-surface)', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                        }}>
                            <Icon size={20} style={{ color: cfg.color }} />
                            <div>
                                <div style={{ fontSize: 18, fontWeight: 700, color: cfg.color }}>{statusStats[key]}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{cfg.label}</div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Search + Filters bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
                    <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por título, empleado..." style={{ width: '100%', padding: '10px 10px 10px 36px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)', fontSize: 14 }} />
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    <Filter size={14} style={{ color: 'var(--color-text-secondary)' }} />
                    {categoryStats.map(c => (
                        <button key={c.category} onClick={() => setCategoryFilter(categoryFilter === c.category ? 'all' : c.category)} style={{
                            padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                            border: categoryFilter === c.category ? 'none' : '1px solid var(--color-border)',
                            background: categoryFilter === c.category ? c.color : 'var(--color-surface)',
                            color: categoryFilter === c.category ? '#fff' : 'var(--color-text)',
                        }}>
                            {c.label} ({c.count})
                        </button>
                    ))}
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => setViewMode('grid')} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)', background: viewMode === 'grid' ? 'var(--color-brand)' : 'var(--color-surface)', color: viewMode === 'grid' ? '#fff' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Grid size={16} />
                    </button>
                    <button onClick={() => setViewMode('list')} style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--color-border)', background: viewMode === 'list' ? 'var(--color-brand)' : 'var(--color-surface)', color: viewMode === 'list' ? '#fff' : 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <List size={16} />
                    </button>
                </div>
            </div>

            {/* Document count */}
            <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: 12 }}>
                {filtered.length} documento{filtered.length !== 1 ? 's' : ''}
            </div>

            {/* Grid view */}
            {viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
                    {filtered.map(doc => {
                        const cat = CATEGORY_CONFIG[doc.category];
                        const stat = STATUS_CONFIG[doc.status];
                        const CatIcon = cat.icon;
                        const StatIcon = stat.icon;
                        return (
                            <div key={doc.id} style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, padding: 18, borderTop: `3px solid ${cat.color}`, transition: 'box-shadow 0.2s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: cat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <CatIcon size={20} style={{ color: cat.color }} />
                                    </div>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: stat.bg, color: stat.color }}>
                                        <StatIcon size={10} /> {stat.label}
                                    </span>
                                </div>
                                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-text)', marginBottom: 4, lineHeight: 1.3 }}>{doc.title}</div>
                                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 8 }}>{doc.user_name}</div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--color-text-secondary)' }}>
                                    <span>{formatFileSize(doc.file_size_bytes)}</span>
                                    <span>{new Date(doc.created_at).toLocaleDateString('es-ES')}</span>
                                </div>
                                <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                                    <button style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, color: 'var(--color-text)', cursor: 'pointer' }}>
                                        <Eye size={12} /> Ver
                                    </button>
                                    <button style={{ flex: 1, padding: '6px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 12, color: 'var(--color-text)', cursor: 'pointer' }}>
                                        <Download size={12} /> Descargar
                                    </button>
                                    {isAdmin && (
                                        <button style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', cursor: 'pointer' }}>
                                            <Trash2 size={12} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* List view */
                <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Documento', 'Categoría', 'Empleado', 'Tamaño', 'Estado', 'Fecha', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '2px solid var(--color-border)', background: 'var(--color-bg)' }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map(doc => {
                                const cat = CATEGORY_CONFIG[doc.category];
                                const stat = STATUS_CONFIG[doc.status];
                                const CatIcon = cat.icon;
                                const StatIcon = stat.icon;
                                return (
                                    <tr key={doc.id}>
                                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <CatIcon size={16} style={{ color: cat.color, flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--color-text)' }}>{doc.title}</div>
                                                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>{doc.file_name}</div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                                            <span style={{ padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 500, background: cat.bg, color: cat.color }}>{cat.label}</span>
                                        </td>
                                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 13, color: 'var(--color-text)' }}>{doc.user_name}</td>
                                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-secondary)' }}>{formatFileSize(doc.file_size_bytes)}</td>
                                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600, background: stat.bg, color: stat.color }}>
                                                <StatIcon size={10} /> {stat.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)', fontSize: 12, color: 'var(--color-text-secondary)' }}>{new Date(doc.created_at).toLocaleDateString('es-ES')}</td>
                                        <td style={{ padding: '10px 14px', borderBottom: '1px solid var(--color-border)' }}>
                                            <button style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                                                <MoreHorizontal size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
