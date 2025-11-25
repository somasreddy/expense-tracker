import { useState, useCallback } from 'react';
import { ValidationResult } from '../utils/validators';

export type FieldValidators = Record<string, (value: any) => ValidationResult>;
export type FieldErrors = Record<string, string | undefined>;

/**
 * Custom hook for managing form validation state
 */
export const useFormValidation = (validators: FieldValidators) => {
    const [errors, setErrors] = useState<FieldErrors>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});

    /**
     * Validate a single field
     */
    const validateField = useCallback((fieldName: string, value: any): boolean => {
        const validator = validators[fieldName];
        if (!validator) return true;

        const result = validator(value);

        setErrors(prev => ({
            ...prev,
            [fieldName]: result.error,
        }));

        return result.isValid;
    }, [validators]);

    /**
     * Validate all fields in the form
     */
    const validateForm = useCallback((values: Record<string, any>): boolean => {
        const newErrors: FieldErrors = {};
        let isValid = true;

        Object.keys(validators).forEach(fieldName => {
            const validator = validators[fieldName];
            const value = values[fieldName];
            const result = validator(value);

            if (!result.isValid) {
                newErrors[fieldName] = result.error;
                isValid = false;
            }
        });

        setErrors(newErrors);
        return isValid;
    }, [validators]);

    /**
     * Clear error for a specific field
     */
    const clearError = useCallback((fieldName: string) => {
        setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldName];
            return newErrors;
        });
    }, []);

    /**
     * Clear all errors
     */
    const clearAllErrors = useCallback(() => {
        setErrors({});
        setTouched({});
    }, []);

    /**
     * Mark a field as touched
     */
    const setFieldTouched = useCallback((fieldName: string, isTouched: boolean = true) => {
        setTouched(prev => ({
            ...prev,
            [fieldName]: isTouched,
        }));
    }, []);

    /**
     * Get error for a field (only if touched)
     */
    const getFieldError = useCallback((fieldName: string): string | undefined => {
        return touched[fieldName] ? errors[fieldName] : undefined;
    }, [errors, touched]);

    return {
        errors,
        touched,
        validateField,
        validateForm,
        clearError,
        clearAllErrors,
        setFieldTouched,
        getFieldError,
    };
};
