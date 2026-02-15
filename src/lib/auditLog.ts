import { supabase, isSupabaseConfigured } from './supabase';

export type AuditAction =
    | 'clock_in'
    | 'clock_out'
    | 'break_start'
    | 'break_end'
    | 'absence_request'
    | 'absence_approval'
    | 'payroll_viewed'
    | 'payroll_signed'
    | 'arco_request'
    | 'consent_changed'
    | 'user_login'
    | 'user_logout'
    | 'password_reset';

interface AuditEventParams {
    action: AuditAction;
    entityType?: string;
    entityId?: string;
    details?: Record<string, any>;
    userId?: string;
}

/**
 * Registra una acción en el audit log (RDL 8/2019).
 * Solo se registra si Supabase está configurado. Fallos silenciosos para no bloquear UX.
 */
export async function logAuditEvent({
    action,
    entityType,
    entityId,
    details = {},
    userId,
}: AuditEventParams): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
        const resolvedUserId = userId || (await supabase.auth.getUser()).data?.user?.id;

        await supabase.from('audit_logs').insert({
            user_id: resolvedUserId,
            action,
            entity_type: entityType,
            entity_id: entityId,
            details,
            ip_address: null, // filled server-side if needed
            user_agent: navigator.userAgent,
        });
    } catch {
        // Audit log failures must not break UX
        console.warn(`[AuditLog] Failed to log action: ${action}`);
    }
}
