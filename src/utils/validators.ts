// Validation utility functions for form inputs

export interface ValidationResult {
    isValid: boolean;
    error?: string;
}

/**
 * Check if a string value is not blank (after trimming whitespace)
 */
export const isNotBlank = (value: string): ValidationResult => {
    const trimmed = value?.trim() || '';
    return {
        isValid: trimmed.length > 0,
        error: trimmed.length === 0 ? 'This field cannot be empty' : undefined,
    };
};

/**
 * Check if a value is a valid positive number
 */
export const isValidAmount = (value: string | number): ValidationResult => {
    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) {
        return { isValid: false, error: 'Please enter a valid number' };
    }

    if (num <= 0) {
        return { isValid: false, error: 'Amount must be greater than 0' };
    }

    return { isValid: true };
};

/**
 * Check if a value is unique in a list (case-insensitive)
 */
export const isUnique = (value: string, list: string[], currentValue?: string): ValidationResult => {
    const trimmed = value.trim().toLowerCase();
    const current = currentValue?.trim().toLowerCase();

    // If editing and value hasn't changed, it's valid
    if (current && trimmed === current) {
        return { isValid: true };
    }

    const exists = list.some(item => item.trim().toLowerCase() === trimmed);

    return {
        isValid: !exists,
        error: exists ? 'This value already exists' : undefined,
    };
};

/**
 * Check if a string meets minimum length requirement
 */
export const meetsMinLength = (value: string, min: number): ValidationResult => {
    const trimmed = value?.trim() || '';
    return {
        isValid: trimmed.length >= min,
        error: trimmed.length < min ? `Must be at least ${min} characters` : undefined,
    };
};

/**
 * Check if an amount doesn't exceed a maximum value
 */
export const meetsMaxAmount = (value: number, max: number): ValidationResult => {
    return {
        isValid: value <= max,
        error: value > max ? `Cannot exceed ${max}` : undefined,
    };
};

/**
 * Check if a date is valid
 */
export const isValidDate = (value: string): ValidationResult => {
    if (!value) {
        return { isValid: false, error: 'Date is required' };
    }

    const date = new Date(value);
    const isValid = !isNaN(date.getTime());

    return {
        isValid,
        error: !isValid ? 'Please enter a valid date' : undefined,
    };
};

/**
 * Combine multiple validators
 */
export const validate = (value: any, validators: Array<(val: any) => ValidationResult>): ValidationResult => {
    for (const validator of validators) {
        const result = validator(value);
        if (!result.isValid) {
            return result;
        }
    }
    return { isValid: true };
};
