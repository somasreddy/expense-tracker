import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Edit2, Trash2, Plus, Check } from "lucide-react";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    customCategories: string[];
    onAddCategory: (name: string) => Promise<void | string | null>;
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

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;

        setLoading(true);
        try {
            await onAddCategory(newCategoryName.trim());
            setNewCategoryName("");
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const startEditing = (category: string) => {
        setEditingCategory(category);
        setEditValue(category);
    };

    const handleUpdate = async () => {
        if (!editingCategory || !editValue.trim() || editValue === editingCategory) {
            setEditingCategory(null);
            return;
        }

        setLoading(true);
        try {
            await onUpdateCategory(editingCategory, editValue.trim());
            setEditingCategory(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (category: string) => {
        if (!window.confirm(`Are you sure you want to delete "${category}"?`)) return;

        setLoading(true);
        try {
            await onDeleteCategory(category);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh]"
                >
                    {/* Header */}
                    <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                        <h2 className="text-xl font-bold text-white">Manage Categories</h2>
                        <button
                            onClick={onClose}
                            className="text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 overflow-y-auto flex-1 space-y-4">
                        {/* Add New Category */}
                        <form onSubmit={handleAdd} className="flex gap-2">
                            <input
                                type="text"
                                value={newCategoryName}
                                onChange={(e) => setNewCategoryName(e.target.value)}
                                placeholder="New category name..."
                                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                            <button
                                type="submit"
                                disabled={loading || !newCategoryName.trim()}
                                className="bg-amber-500 hover:bg-amber-600 text-slate-900 p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={20} />
                            </button>
                        </form>

                        {/* Category List */}
                        <div className="space-y-2">
                            {customCategories.length === 0 ? (
                                <p className="text-slate-500 text-center py-4">
                                    No custom categories yet.
                                </p>
                            ) : (
                                customCategories.map((category) => (
                                    <div
                                        key={category}
                                        className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50"
                                    >
                                        {editingCategory === category ? (
                                            <div className="flex items-center gap-2 flex-1">
                                                <input
                                                    type="text"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                                                    autoFocus
                                                />
                                                <button
                                                    onClick={handleUpdate}
                                                    disabled={loading}
                                                    className="text-green-400 hover:text-green-300 p-1"
                                                >
                                                    <Check size={18} />
                                                </button>
                                                <button
                                                    onClick={() => setEditingCategory(null)}
                                                    disabled={loading}
                                                    className="text-slate-400 hover:text-slate-300 p-1"
                                                >
                                                    <X size={18} />
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <span className="text-slate-200">{category}</span>
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() => startEditing(category)}
                                                        className="text-slate-400 hover:text-amber-400 p-1.5 rounded hover:bg-slate-700 transition-colors"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(category)}
                                                        className="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-slate-700 transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default CategoryManagerModal;
