import { useRef, useState, useEffect, useCallback } from 'react';
import { Eraser, Check, X } from 'lucide-react';

interface SignaturePadProps {
    onConfirm: (signatureDataUrl: string) => void;
    onCancel: () => void;
}

export function SignaturePad({ onConfirm, onCancel }: SignaturePadProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasDrawn, setHasDrawn] = useState(false);

    const getCtx = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return null;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        return ctx;
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Set canvas dimensions
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * 2;
        canvas.height = rect.height * 2;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.scale(2, 2);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
        }
    }, []);

    const getPos = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return {
                x: e.touches[0].clientX - rect.left,
                y: e.touches[0].clientY - rect.top,
            };
        }
        return {
            x: (e as React.MouseEvent).clientX - rect.left,
            y: (e as React.MouseEvent).clientY - rect.top,
        };
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const ctx = getCtx();
        if (!ctx) return;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        setIsDrawing(true);
        setHasDrawn(true);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        e.preventDefault();
        const ctx = getCtx();
        if (!ctx) return;
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setHasDrawn(false);
    };

    const handleConfirm = () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) return;
        const dataUrl = canvas.toDataURL('image/png');
        onConfirm(dataUrl);
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            width: '100%',
            maxWidth: '480px',
        }}>
            <h3 style={{
                fontSize: '1.125rem',
                fontWeight: 700,
                color: '#0f172a',
                marginBottom: '0.25rem',
            }}>
                Firma digital
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
                Dibuja tu firma en el recuadro para confirmar la recepción de la nómina
            </p>

            {/* Canvas area */}
            <div style={{
                border: '2px dashed #cbd5e1',
                borderRadius: '12px',
                background: 'var(--color-surface-muted)',
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '1rem',
            }}>
                <canvas
                    ref={canvasRef}
                    style={{
                        width: '100%',
                        height: '200px',
                        cursor: 'crosshair',
                        touchAction: 'none',
                        display: 'block',
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                />
                {!hasDrawn && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#94a3b8',
                        fontSize: '0.875rem',
                        pointerEvents: 'none',
                        textAlign: 'center',
                    }}>
                        ✍️ Firma aquí
                    </div>
                )}
            </div>

            {/* Timestamp */}
            <p style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                marginBottom: '1rem',
                textAlign: 'center',
            }}>
                {new Date().toLocaleString('es-ES', { dateStyle: 'full', timeStyle: 'medium' })}
            </p>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                    type="button"
                    onClick={clearCanvas}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1.5px solid #e2e8f0',
                        background: 'white',
                        color: '#64748b',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontFamily: 'inherit',
                    }}
                >
                    <Eraser size={16} />
                    Limpiar
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    style={{
                        flex: 1,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: '1.5px solid #fecaca',
                        background: 'var(--color-error-light)',
                        color: '#dc2626',
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontFamily: 'inherit',
                    }}
                >
                    <X size={16} />
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!hasDrawn}
                    style={{
                        flex: 1.5,
                        padding: '0.75rem',
                        borderRadius: '10px',
                        border: 'none',
                        background: hasDrawn ? 'linear-gradient(135deg, #16a34a, #22c55e)' : '#e2e8f0',
                        color: hasDrawn ? 'white' : '#94a3b8',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: hasDrawn ? 'pointer' : 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                        boxShadow: hasDrawn ? '0 4px 12px rgba(22,163,74,0.3)' : 'none',
                    }}
                >
                    <Check size={16} />
                    Confirmar firma
                </button>
            </div>
        </div>
    );
}
