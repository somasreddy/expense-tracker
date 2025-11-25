import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Category } from "../types";
import { DEFAULT_CATEGORIES } from "../constants";

interface Props {
    selectedCategory: Category;
    onSelectCategory: (category: Category) => void;
    customCategories: string[];
    onAddCategory: (name: string) => Promise<string | null>;
}

const CategorySelect: React.FC<Props> = ({
    selectedCategory,
    onSelectCategory,
    customCategories,
    onAddCategory,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAdding, setIsAdding] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const allCategories = [...DEFAULT_CATEGORIES, ...customCategories];

    // Filter categories based on search
    const filteredCategories = allCategories.filter((c) =>
        c.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle clicking outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
                setIsAdding(false);
                setSearchTerm("");
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleAdd = async () => {
        if (!searchTerm.trim()) return;
        await onAddCategory(searchTerm.trim());
        onSelectCategory(searchTerm.trim());
        setIsOpen(false);
        setIsAdding(false);
        setSearchTerm("");
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="label-base" id="category-select-label">
                Category
            </label>

            {/* Trigger Button */}
            <div
                className="input-base w-full flex items-center justify-between cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
                tabIndex={0}
                role="combobox"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-labelledby="category-select-label"
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen(!isOpen);
                    }
                }}
            >
                <span className={selectedCategory ? "text-[var(--text-main)]" : "text-gray-400"}>
                    {selectedCategory || "Select Category"}
                </span>
                <svg
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-xl max-h-60 flex flex-col"
                        role="listbox"
                    >
                        {/* Search / Add Input */}
                        <div className="p-2 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-card)] rounded-t-lg">
                            <input
                                type="text"
                                className="w-full p-2 text-sm bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-amber-500"
                                placeholder="Search or add new..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                autoFocus
                                aria-label="Search categories"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (filteredCategories.length > 0 && filteredCategories[0].toLowerCase() === searchTerm.toLowerCase()) {
                                            onSelectCategory(filteredCategories[0]);
                                            setIsOpen(false);
                                        } else {
                                            handleAdd();
                                        }
                                    }
                                }}
                            />
                        </div>

                        {/* List */}
                        <div className="overflow-y-auto flex-1 custom-scrollbar p-1">
                            {filteredCategories.map((cat) => (
                                <div
                                    key={cat}
                                    role="option"
                                    aria-selected={selectedCategory === cat}
                                    tabIndex={0}
                                    className={`p-2 text-sm rounded cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 ${selectedCategory === cat
                                        ? "bg-amber-500/20 text-amber-500"
                                        : "hover:bg-[var(--bg-elevated)] text-[var(--text-main)]"
                                        }`}
                                    onClick={() => {
                                        onSelectCategory(cat);
                                        setIsOpen(false);
                                        setSearchTerm("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            onSelectCategory(cat);
                                            setIsOpen(false);
                                            setSearchTerm("");
                                        }
                                    }}
                                >
                                    {cat}
                                </div>
                            ))}

                            {/* Add New Option if no exact match */}
                            {searchTerm && !allCategories.some(c => c.toLowerCase() === searchTerm.toLowerCase()) && (
                                <div
                                    role="button"
                                    tabIndex={0}
                                    className="p-2 text-sm text-blue-400 cursor-pointer hover:bg-blue-500/10 rounded flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onClick={handleAdd}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            handleAdd();
                                        }
                                    }}
                                >
                                    <span>+ Create "{searchTerm}"</span>
                                </div>
                            )}

                            {filteredCategories.length === 0 && !searchTerm && (
                                <div className="p-4 text-center text-sm text-gray-500">No categories found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CategorySelect;
