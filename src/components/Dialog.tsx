import React from "react";
import { X } from "lucide-react";

export type DialogType = "alert" | "confirm";

interface DialogProps {
    isOpen: boolean;
    type: DialogType;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

const Dialog: React.FC<DialogProps> = ({
    isOpen,
    type,
    title,
    message,
    confirmText = "OK",
    cancelText = "Cancel",
    onConfirm,
    onCancel,
}) => {
    if (!isOpen) return null;

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Escape") {
            onCancel();
        } else if (e.key === "Enter" && type === "alert") {
            onConfirm();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-fadeIn"
            onClick={onCancel}
            onKeyDown={handleKeyDown}
        >
            <div
                className="content-surface max-w-md w-full p-6 space-y-4 animate-scaleIn"
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
            >
                <div className="flex items-start justify-between">
                    <h2
                        id="dialog-title"
                        className="text-xl font-bold text-[var(--text-main)] flex-1"
                    >
                        {title || (type === "confirm" ? "Confirm" : "Alert")}
                    </h2>
                    <button
                        onClick={onCancel}
                        className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors p-1 rounded-lg hover:bg-[var(--card-hover)]"
                        aria-label="Close"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="text-[var(--text-main)] whitespace-pre-wrap">
                    {message}
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    {type === "confirm" && (
                        <button onClick={onCancel} className="button button-secondary">
                            {cancelText}
                        </button>
                    )}
                    <button
                        onClick={onConfirm}
                        className="button button-primary"
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Dialog;
