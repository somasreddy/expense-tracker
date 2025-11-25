import React from 'react';
import { ErrorMessage } from './ErrorMessage';

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    htmlFor?: string;
    children: React.ReactNode;
    className?: string;
}

/**
 * Wrapper component for form inputs with built-in label and error display
 */
export const FormField: React.FC<FormFieldProps> = ({
    label,
    error,
    required = false,
    htmlFor,
    children,
    className = '',
}) => {
    return (
        <div className={`form-field ${className}`}>
            <label
                htmlFor={htmlFor}
                className="label-base"
            >
                {label}
                {required && <span className="text-red-500 ml-1" aria-label="required">*</span>}
            </label>

            <div className={error ? 'form-field-error' : ''}>
                {children}
            </div>

            <ErrorMessage message={error} show={!!error} />
        </div>
    );
};
