import React from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string | number;
    onChange: (value: string) => void;
    step?: number;
}

const AmountInput: React.FC<AmountInputProps> = ({
    value,
    onChange,
    step = 100,
    className = "",
    ...props
}) => {
    const handleIncrement = () => {
        const current = parseFloat(value.toString()) || 0;
        onChange((current + step).toString());
    };

    const handleDecrement = () => {
        const current = parseFloat(value.toString()) || 0;
        onChange(Math.max(0, current - step).toString());
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            handleIncrement();
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleDecrement();
        }

        if (props.onKeyDown) {
            props.onKeyDown(e);
        }
    };

    return (
        <div className="relative">
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`input-base pr-8 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${className}`}
                {...props}
            />
            {/* Custom Spinners */}
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                <button
                    type="button"
                    onClick={handleIncrement}
                    className="p-0.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                    tabIndex={-1}
                >
                    <ChevronUp size={14} />
                </button>
                <button
                    type="button"
                    onClick={handleDecrement}
                    className="p-0.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                    tabIndex={-1}
                >
                    <ChevronDown size={14} />
                </button>
            </div>
        </div>
    );
};

export default AmountInput;
