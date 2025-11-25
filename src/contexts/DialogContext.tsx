import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import Dialog, { DialogType } from "../components/Dialog";

interface DialogState {
    isOpen: boolean;
    type: DialogType;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
}

interface DialogContextType {
    showAlert: (message: string, title?: string) => Promise<void>;
    showConfirm: (message: string, title?: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error("useDialog must be used within DialogProvider");
    }
    return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [dialogState, setDialogState] = useState<DialogState>({
        isOpen: false,
        type: "alert",
        message: "",
        onConfirm: () => { },
        onCancel: () => { },
    });

    const showAlert = useCallback((message: string, title?: string): Promise<void> => {
        return new Promise((resolve) => {
            setDialogState({
                isOpen: true,
                type: "alert",
                title,
                message,
                onConfirm: () => {
                    setDialogState((prev) => ({ ...prev, isOpen: false }));
                    resolve();
                },
                onCancel: () => {
                    setDialogState((prev) => ({ ...prev, isOpen: false }));
                    resolve();
                },
            });
        });
    }, []);

    const showConfirm = useCallback(
        (message: string, title?: string, confirmText?: string, cancelText?: string): Promise<boolean> => {
            return new Promise((resolve) => {
                setDialogState({
                    isOpen: true,
                    type: "confirm",
                    title,
                    message,
                    confirmText,
                    cancelText,
                    onConfirm: () => {
                        setDialogState((prev) => ({ ...prev, isOpen: false }));
                        resolve(true);
                    },
                    onCancel: () => {
                        setDialogState((prev) => ({ ...prev, isOpen: false }));
                        resolve(false);
                    },
                });
            });
        },
        []
    );

    return (
        <DialogContext.Provider value={{ showAlert, showConfirm }}>
            {children}
            <Dialog {...dialogState} />
        </DialogContext.Provider>
    );
};
