import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        // Check if already dismissed
        if (localStorage.getItem('timetrack-install-dismissed') === 'true') {
            setDismissed(true);
            return;
        }

        // Check if already installed (standalone mode)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowBanner(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;
        await deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowBanner(false);
        setDismissed(true);
        localStorage.setItem('timetrack-install-dismissed', 'true');
    };

    if (!showBanner || dismissed) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1100,
            width: '90%',
            maxWidth: '440px',
            borderRadius: 'var(--radius-2xl)',
            background: 'var(--color-surface)',
            boxShadow: '0 20px 40px -12px rgba(0,0,0,0.3)',
            border: '1px solid var(--color-border)',
            overflow: 'hidden',
            animation: 'slideUp 0.4s cubic-bezier(0.4,0,0.2,1)',
        }}>
            <div style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
            }}>
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: 'var(--radius-xl)',
                    background: 'linear-gradient(135deg, var(--color-brand), #8b5cf6)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                }}>
                    <Smartphone size={22} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                        Instalar TimeTrack Pro
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.125rem' }}>
                        Accede más rápido sin abrir el navegador
                    </div>
                </div>
                <button
                    onClick={handleDismiss}
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        flexShrink: 0,
                    }}
                >
                    <X size={16} style={{ color: 'var(--color-text-muted)' }} />
                </button>
            </div>
            <div style={{
                padding: '0 1.5rem 1.25rem',
                display: 'flex',
                gap: '0.75rem',
            }}>
                <button
                    onClick={handleDismiss}
                    style={{
                        flex: 1,
                        padding: '0.625rem',
                        borderRadius: 'var(--radius-lg)',
                        border: '1px solid var(--color-border)',
                        background: 'transparent',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: 'var(--color-text-secondary)',
                        fontFamily: 'inherit',
                    }}
                >
                    Ahora no
                </button>
                <button
                    onClick={handleInstall}
                    style={{
                        flex: 1,
                        padding: '0.625rem',
                        borderRadius: 'var(--radius-lg)',
                        border: 'none',
                        background: 'linear-gradient(135deg, var(--color-brand), #8b5cf6)',
                        color: '#fff',
                        fontSize: '0.8125rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.375rem',
                        fontFamily: 'inherit',
                    }}
                >
                    <Download size={14} /> Instalar
                </button>
            </div>
        </div>
    );
}
