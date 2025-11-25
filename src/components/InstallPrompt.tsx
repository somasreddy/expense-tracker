import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPrompt: React.FC = () => {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isInstalled, setIsInstalled] = useState(false);

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true);
            return;
        }

        // Listen for beforeinstallprompt event
        const handleBeforeInstall = (e: Event) => {
            e.preventDefault();
            const installEvent = e as BeforeInstallPromptEvent;
            setDeferredPrompt(installEvent);

            // Show prompt after 30 seconds (not immediately, to avoid being annoying)
            setTimeout(() => setShowPrompt(true), 30000);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Detect if app was installed
        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setShowPrompt(false);
        });

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show install prompt
        deferredPrompt.prompt();

        // Wait for user choice
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('User accepted install');
        } else {
            console.log('User dismissed install');
        }

        // Clear deferred prompt
        setDeferredPrompt(null);
        setShowPrompt(false);
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        // Show again after 24 hours
        localStorage.setItem('installPromptDismissed', Date.now().toString());
    };

    // Don't show if already installed or no prompt available
    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto"
            >
                <div className="card-surface p-4 shadow-2xl border border-[var(--border-subtle)]">
                    <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 text-3xl">📱</div>
                        <div className="flex-1">
                            <h3 className="font-bold text-[var(--text-main)] mb-1">
                                Install Expense Tracker
                            </h3>
                            <p className="text-sm text-[var(--text-muted)] mb-3">
                                Add to your home screen for quick access and offline use!
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleInstallClick}
                                    className="flex-1 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-semibold rounded-lg transition-colors"
                                >
                                    Install
                                </button>
                                <button
                                    onClick={handleDismiss}
                                    className="px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                                >
                                    Not now
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default InstallPrompt;
