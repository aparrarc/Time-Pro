import { useState, useEffect } from 'react';
import { Play, Square, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useAppStore } from '../../store/appStore';
import { formatDurationSeconds } from '../../lib/utils';

export function ClockButton() {
    const {
        currentStatus,
        activeTimeEntry,
        activeBreak,
        clockIn,
        clockOut,
        endBreak
    } = useAppStore();

    const [elapsedTime, setElapsedTime] = useState(0);

    // Update elapsed time every second
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        const calculateSeconds = (startDate: string | Date) => {
            const start = new Date(startDate);
            const now = new Date();
            return Math.floor((now.getTime() - start.getTime()) / 1000);
        };

        if (currentStatus === 'working' && activeTimeEntry) {
            const updateTime = () => {
                setElapsedTime(calculateSeconds(activeTimeEntry.clock_in));
            };

            updateTime();
            interval = setInterval(updateTime, 1000);
        } else if (currentStatus === 'on_break' && activeBreak) {
            const updateTime = () => {
                setElapsedTime(calculateSeconds(activeBreak.start_time));
            };

            updateTime();
            interval = setInterval(updateTime, 1000);
        } else {
            setElapsedTime(0);
        }

        return () => clearInterval(interval);
    }, [currentStatus, activeTimeEntry, activeBreak]);

    const handleMainAction = () => {
        switch (currentStatus) {
            case 'not_working':
                clockIn();
                break;
            case 'working':
                clockOut();
                break;
            case 'on_break':
                endBreak();
                break;
        }
    };

    const isWorking = currentStatus === 'working';
    const isOnBreak = currentStatus === 'on_break';

    return (
        <div className="w-full h-full animate-slide-up">
            <div className="card-premium h-full flex flex-col p-10 relative overflow-hidden bg-[var(--color-surface)] border border-white/[0.03] rounded-[40px]">
                {/* Content Layer: Side Columns and Central Action Area */}
                <div className="flex-1 flex items-center justify-between z-10 px-16 relative">
                    {/* Left Column: Fichaje Info */}
                    <div className="flex flex-col gap-10 max-w-[220px]">
                        <div className="space-y-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] opacity-50">
                                {isWorking ? 'SESIÓN ACTIVA' : isOnBreak ? 'EN PAUSA' : 'PRÓXIMO FICHAJE'}
                            </span>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest opacity-50">ENTRADA</span>
                            <div className="flex items-center gap-4">
                                <div className={`w-3 h-3 rounded-full border-2 transition-all duration-700 ${activeTimeEntry ? 'bg-[var(--color-primary)] border-[var(--color-primary)] shadow-[0_0_20px_rgba(186,255,41,0.5)]' : 'border-white/10 bg-transparent'}`} />
                                <p className="text-4xl font-black tracking-tighter tabular-nums">{activeTimeEntry ? format(new Date(activeTimeEntry.clock_in), 'HH:mm') : '--:--'}</p>
                            </div>
                        </div>
                    </div>

                    {/* CENTRAL GROUP: Clock, Timer, Button */}
                    <div className="flex flex-col items-center justify-center gap-8 z-20 pointer-events-auto">
                        <div className="flex flex-col items-center gap-2">
                            <Clock size={80} strokeWidth={1.5} className={`transition-all duration-700 ${isWorking ? 'text-[var(--color-primary)] icon-neon animate-pulse' : 'text-[var(--color-text-muted)] opacity-50'}`} />
                            <h2 className="text-8xl font-black tracking-tighter leading-none text-[var(--color-text-primary)] tabular-nums">
                                {isWorking || isOnBreak ? formatDurationSeconds(elapsedTime) : '00:00:00'}
                            </h2>
                        </div>

                        <button
                            onClick={handleMainAction}
                            className={`
                                flex items-center justify-center gap-4 px-16 py-8 rounded-full font-black text-lg uppercase tracking-[0.4em] transition-all duration-500
                                ${!activeTimeEntry
                                    ? 'bg-[var(--color-primary)] text-black shadow-[0_0_60px_rgba(186,255,41,0.4)] hover:bg-[var(--color-primary-light)] hover:scale-105 active:scale-95'
                                    : isWorking
                                        ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white hover:shadow-[0_0_60px_rgba(239,68,68,0.4)]'
                                        : 'bg-[var(--color-primary)] text-black shadow-[0_0_60px_rgba(186,255,41,0.4)]'
                                }
                            `}
                        >
                            {isWorking ? <Square size={28} /> : <Play size={28} className="fill-current" />}
                            <span>{isWorking ? 'Parar' : isOnBreak ? 'Continuar' : 'Fichar Entrada'}</span>
                        </button>
                    </div>

                    {/* Right Column: Status & Ubicación */}
                    <div className="flex flex-col gap-10 text-right max-w-[220px]">
                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] opacity-50">JORNADA</span>
                            <p className="text-4xl font-black text-[var(--color-text-primary)] tracking-tighter">
                                {format(new Date(), 'd MMM', { locale: es }).replace('.', '').toUpperCase()}
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <span className="text-[10px] font-black uppercase text-[var(--color-text-muted)] tracking-widest opacity-50">UBICACIÓN</span>
                            <p className="text-xl font-black tracking-tight uppercase leading-none opacity-90">OFICINA CENTRAL</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
