import { format } from 'date-fns';
import { Edit2 } from 'lucide-react';
import type { TimeEntry } from '../../types';

interface TimeEntryCardProps {
    entry: TimeEntry;
    showEdit?: boolean;
    onEdit?: (entry: TimeEntry) => void;
}

export function TimeEntryCard({ entry, showEdit = false, onEdit }: TimeEntryCardProps) {
    const clockInTime = format(new Date(entry.clock_in), 'HH:mm');
    const clockOutTime = entry.clock_out
        ? format(new Date(entry.clock_out), 'HH:mm')
        : '--:--';

    const isActive = !entry.clock_out;

    // Calculate hours worked
    const hoursWorked = entry.clock_out
        ? ((new Date(entry.clock_out).getTime() - new Date(entry.clock_in).getTime()) / (1000 * 60 * 60)).toFixed(1)
        : null;

    return (
        <div className="card-premium py-4 px-5 flex items-center justify-between group">
            <div className="flex items-center gap-6">
                {/* Time range */}
                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Entrada</span>
                    <span className="text-lg font-black">{clockInTime}</span>
                </div>

                {/* Arrow indicator */}
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-text-muted)]/30" />
                    <div className="w-8 h-px bg-gradient-to-r from-[var(--color-text-muted)]/30 to-transparent" />
                </div>

                <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest">Salida</span>
                    <span className={`text-lg font-black ${isActive ? 'text-[var(--color-primary)] animate-pulse' : ''}`}>{clockOutTime}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {hoursWorked && (
                    <div className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-black uppercase tracking-wider">
                        {hoursWorked}h
                    </div>
                )}

                {isActive ? (
                    <div className="px-3 py-1.5 rounded-xl bg-[var(--color-primary)] text-black text-[10px] font-black uppercase tracking-wider shadow-[0_0_10px_rgba(186,255,41,0.3)]">
                        ACTIVO
                    </div>
                ) : (
                    showEdit && (
                        <button
                            onClick={() => onEdit?.(entry)}
                            className="p-2.5 rounded-xl glass hover:bg-[var(--color-surface-lighter)] transition-all group/edit"
                        >
                            <Edit2 size={14} className="text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)] transition-colors" />
                        </button>
                    )
                )}
            </div>
        </div>
    );
}

