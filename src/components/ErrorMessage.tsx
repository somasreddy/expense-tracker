import React from 'react';
import { Icon } from './Icon';

interface ErrorMessageProps {
    message?: string;
    show?: boolean;
    className?: string;
}

/**
 * Reusable component for displaying inline error messages
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
    message,
    show = true,
    className = ''
}) => {
    if (!show || !message) {
        return null;
    }

    return (
        <div
            className={`flex items-center gap-2 mt-1 text-sm text-red-500 ${className}`}
            role="alert"
            aria-live="polite"
        >
            <Icon name="alert-circle" className="w-4 h-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
};
