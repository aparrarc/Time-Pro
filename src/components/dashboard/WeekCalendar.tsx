import { useMemo } from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';

interface WeekCalendarProps {
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
}

export function WeekCalendar({ selectedDate = new Date(), onDateSelect }: WeekCalendarProps) {
    const weekDays = useMemo(() => {
        const start = startOfWeek(new Date(), { weekStartsOn: 1 });
        return Array.from({ length: 7 }, (_, i) => addDays(start, i));
    }, []);


    return (
        <div className="grid grid-cols-7 gap-1 py-10">
            {weekDays.map((day) => {
                const isSelected = isSameDay(day, selectedDate);
                const dayName = format(day, 'EEE', { locale: es }).toUpperCase().slice(0, 3);
                const dayNumber = format(day, 'd');

                return (
                    <div key={day.toISOString()} className="flex flex-col items-center">
                        <span className={`
                            text-[10px] font-black tracking-[0.1em] mb-3 transition-colors duration-300
                            ${isSelected ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}
                        `}>
                            {dayName}
                        </span>

                        <button
                            onClick={() => onDateSelect?.(day)}
                            className={`
                                w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300 relative group
                                ${isSelected
                                    ? 'bg-[var(--color-primary)] text-black shadow-[0_0_20px_rgba(186,255,41,0.6)] scale-110 z-10'
                                    : 'text-[var(--color-text-primary)] hover:bg-white/5'
                                }
                            `}
                        >
                            <span className="text-lg font-black leading-none">
                                {dayNumber}
                            </span>

                            {/* Hover effect for non-selected items */}
                            {!isSelected && (
                                <div className="absolute inset-0 rounded-full border-2 border-transparent group-hover:border-white/10 transition-all duration-300"></div>
                            )}
                        </button>
                    </div>
                );
            })}
        </div>
    );
}



