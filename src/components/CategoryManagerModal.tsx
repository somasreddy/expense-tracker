import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "./Icon";
import { useDialog } from "../contexts/DialogContext";
import { ErrorMessage } from "./ErrorMessage";
import { isNotBlank, isUnique } from "../utils/validators";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    customCategories: string[];
    onAddCategory: (category: string) => Promise<void>;
    onUpdateCategory: (oldName: string, newName: string) => Promise<void>;
    onDeleteCategory: (name: string) => Promise<void>;
}

const CategoryManagerModal: React.FC<Props> = ({
    isOpen,
    onClose,
    customCategories,
    onAddCategory,
    onUpdateCategory,
    onDeleteCategory,
}) => {
    const [newCategoryName, setNewCategoryName] = useState("");
    const [editingCategory, setEditingCategory] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");
    const [loading, setLoading] = useState(false);
    const [newCategoryError, setNewCategoryError] = useState<string | undefined>();
    const [editError, setEditError] = useState<string | undefined>();
    const { showConfirm } = useDialog();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validate not blank
        const blankCheck = isNotBlank(newCategoryName);
        if (!blankCheck.isValid) {
            setNewCategoryError(blankCheck.error);
            return;
        }

        // Validate unique
        const uniqueCheck = isUnique(newCategoryName, customCategories);
        if (!uniqueCheck.isValid) {
            setNewCategoryError(uniqueCheck.error || "This category already exists");
            return;
        }

        setLoading(true);
        try {
            await onAddCategory(newCategoryName.trim());
            setNewCategoryName("");
            setNewCategoryError(undefined);
        } catch (error) {
            console.error(error);
            setNewCategoryError("Failed to add category");
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (category: string) => {
        setEditingCategory(category);
        setEditValue(category);
        setEditError(undefined);
    };

    const handleUpdate = async () => {
        if (!editingCategory) return;

        // Validate not blank
        const blankCheck = isNotBlank(editValue);
        if (!blankCheck.isValid) {
            setEditError(blankCheck.error);
            return;
        }

        // If unchanged, just cancel
        if (editValue.trim() === editingCategory) {
            setEditingCategory(null);
            return;
        }

        // Validate unique (excluding current)
        const otherCategories = customCategories.filter(c => c !== editingCategory);
        const uniqueCheck = isUnique(editValue, otherCategories, editingCategory);
        if (!uniqueCheck.isValid) {
            setEditError(uniqueCheck.error || "This category already exists");
            return;
        }

        setLoading(true);
        try {
            await onUpdateCategory(editingCategory, editValue.trim());
            setEditingCategory(null);
            setEditError(undefined);
        } catch (error) {
            console.error(error);
            setEditError("Failed to update category");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (category: string) => {
        if (await showConfirm(`Are you sure you want to delete "${category}"?`, "Delete Category")) {
            setLoading(true);
            try {
                await onDeleteCategory(category);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="content-surface max-w-lg w-full p-0 overflow-hidden shadow-2xl rounded-2xl border border-[var(--border-subtle)]"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="category-modal-title"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-surface)]">
                        <h2 id="category-modal-title" className="text-xl font-bold text-[var(--text-main)]">Manage Categories</h2>
                        <button
                            onClick={onClose}
                            className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                            aria-label="Close modal"
                        >
                            <Icon name="x" className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                        {/* Category List */}
                        <div className="space-y-2">
                            {customCategories.map((category) => (
                                <div
                                    key={category}
                                    className="flex items-center gap-2 p-3 bg-[var(--bg-card)] rounded-lg border border-[var(--border-subtle)]"
                                >
                                    {editingCategory === category ? (
                                        <div className="flex-1">
                                            <input
                                                className={`input-base w-full ${editError ? 'input-error' : ''}`}
                                                value={editValue}
                                                onChange={(e) => {
                                                    setEditValue(e.target.value);
                                                    setEditError(undefined);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") handleUpdate();
                                                    if (e.key === "Escape") {
                                                        setEditingCategory(null);
                                                        setEditError(undefined);
                                                    }
                                                }}
                                                autoFocus
                                                disabled={loading}
                                            />
                                            <ErrorMessage message={editError} show={!!editError} />
                                        </div>
                                    ) : (
                                        <span className="flex-1 text-[var(--text-main)]">{category}</span>
                                    )}

                                    <div className="flex gap-1shrink-0">
                                        {editingCategory === category ? (
                                            <>
                                                <button
                                                    onClick={handleUpdate}
                                                    className="p-2 text-green-500 hover:bg-green-500/10 rounded transition-colors"
                                                    disabled={loading}
                                                    aria-label="Save changes"
                                                >
                                                    <Icon name="check" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditingCategory(null);
                                                        setEditError(undefined);
                                                    }}
                                                    className="p-2 text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded transition-colors"
                                                    disabled={loading}
                                                    aria-label="Cancel editing"
                                                >
                                                    <Icon name="x" className="w-4 h-4" />
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => startEditing(category)}
                                                    className="p-2 text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
                                                    disabled={loading}
                                                    aria-label={`Edit ${category}`}
                                                >
                                                    <Icon name="edit" className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category)}
                                                    className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-colors"
                                                    disabled={loading}
                                                    aria-label={`Delete ${category}`}
                                                >
                                                    <Icon name="trash" className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Add Category Form */}
                        <form onSubmit={handleAdd} className="pt-4 border-t border-[var(--border-subtle)]">
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <input
                                        className={`input-base w-full ${newCategoryError ? 'input-error' : ''}`}
                                        placeholder="New category name..."
                                        value={newCategoryName}
                                        onChange={(e) => {
                                            setNewCategoryName(e.target.value);
                                            setNewCategoryError(undefined);
                                        }}
                                        disabled={loading}
                                    />
                                    <ErrorMessage message={newCategoryError} show={!!newCategoryError} />
                                </div>
                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    disabled={loading}
                                >
                                    <Icon name="plus" className="w-4 h-4 mr-1" />
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Footer */}
                    <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] flex justify-end">
                        <button
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            Close
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CategoryManagerModal;
