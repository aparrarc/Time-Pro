import { useState, useEffect } from 'react';
import { Search, Mail, Phone, MapPin, Building2 } from 'lucide-react';
import { Avatar } from '../components/ui';
import { useAppStore } from '../store/appStore';
import { isDemoMode, DEMO_USERS } from '../lib/demoData';

const departmentLabels: Record<string, string> = {
    'dept-001': 'Desarrollo',
    'dept-002': 'Ventas',
    'dept-003': 'Marketing',
    'dept-004': 'Administración',
    'dept-005': 'RRHH',
    'dept-006': 'Soporte',
    'dept-007': 'Diseño',
    'dept-008': 'Operaciones',
};

export function DirectoryPage() {
    const { allUsers, fetchAllUsers } = useAppStore();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedDept, setSelectedDept] = useState('all');

    // Use demo users or real users
    const users = isDemoMode ? DEMO_USERS : allUsers;

    // Fetch on mount (not in render!)
    useEffect(() => {
        if (!isDemoMode && allUsers.length === 0) {
            fetchAllUsers();
        }
    }, []);

    const getDeptName = (deptId: string | null | undefined) =>
        deptId ? (departmentLabels[deptId] || deptId) : 'Sin departamento';

    const departments = ['all', ...new Set(users.map(u => u.department_id || 'Sin departamento'))];

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDept = selectedDept === 'all' || u.department_id === selectedDept;
        return matchesSearch && matchesDept && u.is_active;
    });

    const roleLabels: Record<string, string> = {
        admin: 'Administrador',
        supervisor: 'Supervisor',
        hr: 'RRHH',
        employee: 'Empleado',
    };

    const roleBadges: Record<string, string> = {
        admin: 'badge-error',
        supervisor: 'badge-warning',
        hr: 'badge-primary',
        employee: 'badge-neutral',
    };

    return (
        <div className="animate-fade-in">
            <div className="page-header">
                <h1 className="page-header-title">Directorio de empleados</h1>
                <p className="page-header-subtitle">Encuentra y contacta con compañeros de la organización</p>
            </div>

            {/* Search and Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', position: 'relative' }}>
                    <Search size={18} style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--color-text-muted)',
                    }} />
                    <input
                        className="input"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="Buscar por nombre o email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                    {filteredUsers.length} empleado{filteredUsers.length !== 1 ? 's' : ''}
                </div>
            </div>

            {/* Employee Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1rem',
            }}>
                {filteredUsers.map((user) => (
                    <div key={user.id} className="card card-interactive" style={{ cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                            <Avatar name={user.full_name} src={user.avatar_url} size="lg" />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontWeight: 600, fontSize: '0.9375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {user.full_name}
                                </div>
                                <span className={`badge ${roleBadges[user.role] || 'badge-neutral'}`}>
                                    {roleLabels[user.role] || user.role}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                                <Mail size={14} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</span>
                            </div>
                            {user.phone && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                                    <Phone size={14} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
                                    <span>{user.phone}</span>
                                </div>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                                <Building2 size={14} style={{ flexShrink: 0, color: 'var(--color-text-muted)' }} />
                                <span>{getDeptName(user.department_id)}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="empty-state" style={{ marginTop: '2rem' }}>
                    <div className="empty-state-icon">
                        <Search size={28} />
                    </div>
                    <div className="empty-state-title">Sin resultados</div>
                    <div className="empty-state-text">No se encontraron empleados que coincidan con tu búsqueda.</div>
                </div>
            )}
        </div>
    );
}
