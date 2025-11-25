import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './Icon';
import { useToast, Toast as ToastType } from '../contexts/ToastContext';

const Toast: React.FC<{ toast: ToastType }> = ({ toast }) => {
    const { hideToast } = useToast();

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return 'check-circle';
            case 'error':
                return 'alert-circle';
            case 'warning':
                return 'alert-triangle';
            case 'info':
            default:
                return 'info';
        }
    };

    const getColors = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-green-500/90 text-white border-green-600';
            case 'error':
                return 'bg-red-500/90 text-white border-red-600';
            case 'warning':
                return 'bg-amber-500/90 text-white border-amber-600';
            case 'info':
            default:
                return 'bg-blue-500/90 text-white border-blue-600';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${getColors()} backdrop-blur-sm`}
            role="alert"
            aria-live="polite"
        >
            <Icon name={getIcon()} className="w-5 h-5 shrink-0" />
            <span className="font-medium text-sm">{toast.message}</span>
            <button
                onClick={() => hideToast(toast.id)}
                className="ml-auto p-1 hover:bg-white/20 rounded transition-colors"
                aria-label="Close notification"
            >
                <Icon name="x" className="w-4 h-4" />
            </button>
        </motion.div>
    );
};

export const ToastContainer: React.FC = () => {
    const { toasts } = useToast();

    return (
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
            <AnimatePresence>
                {toasts.map(toast => (
                    <div key={toast.id} className="pointer-events-auto">
                        <Toast toast={toast} />
                    </div>
                ))}
            </AnimatePresence>
        </div>
    );
};
