import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "@supabase/supabase-js";
import ThemePreview from "./ThemePreview";
import { X, User as UserIcon, Palette, Database, Settings, Download } from "lucide-react";
import { exportDataToCSV } from "../services/expenseService";
import { useTheme } from "../services/ThemeContext";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUpdateProfile: (name: string) => Promise<void>;
    onManageCategories: () => void;
    onManageProfiles: () => void;
}

type Tab = "general" | "appearance" | "data";

const SettingsModal: React.FC<Props> = ({
    isOpen,
    onClose,
    user,
    onUpdateProfile,
    onManageCategories,
    onManageProfiles,
}) => {
    const { currentTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<Tab>("general");
    const [displayName, setDisplayName] = useState(
        user.user_metadata?.full_name || user.user_metadata?.username || ""
    );
    const [isSaving, setIsSaving] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportDataToCSV();
        } catch (error) {
            console.error("Export failed:", error);
            alert("Failed to export data. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!displayName.trim()) return;
        setIsSaving(true);
        try {
            await onUpdateProfile(displayName.trim());
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[var(--bg-card)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                role="dialog"
                aria-modal="true"
                aria-labelledby="settings-modal-title"
            >
                {/* Header */}
                <div className="p-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-elevated)]">
                    <div className="flex items-center gap-2">
                        <Settings className="w-5 h-5" style={{ color: "var(--text-highlight)" }} aria-hidden="true" />
                        <h2 id="settings-modal-title" className="text-xl font-bold text-[var(--text-main)]">Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="button-icon"
                        aria-label="Close settings"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar */}
                    <div className="w-48 bg-[var(--bg-elevated)] border-r border-[var(--border-subtle)] flex flex-col p-2 gap-1" role="tablist" aria-orientation="vertical">
                        <button
                            onClick={() => setActiveTab("general")}
                            role="tab"
                            aria-selected={activeTab === "general"}
                            aria-controls="panel-general"
                            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "general"
                                ? "bg-[var(--bg-surface)] text-[var(--text-highlight)] shadow-sm"
                                : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                                }`}
                        >
                            <UserIcon className="w-4 h-4" aria-hidden="true" />
                            General
                        </button>
                        <button
                            onClick={() => setActiveTab("appearance")}
                            role="tab"
                            aria-selected={activeTab === "appearance"}
                            aria-controls="panel-appearance"
                            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "appearance"
                                ? "bg-[var(--bg-surface)] text-[var(--text-highlight)] shadow-sm"
                                : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                                }`}
                        >
                            <Palette className="w-4 h-4" aria-hidden="true" />
                            Appearance
                        </button>
                        <button
                            onClick={() => setActiveTab("data")}
                            role="tab"
                            aria-selected={activeTab === "data"}
                            aria-controls="panel-data"
                            className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${activeTab === "data"
                                ? "bg-[var(--bg-surface)] text-[var(--text-highlight)] shadow-sm"
                                : "text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                                }`}
                        >
                            <Database className="w-4 h-4" aria-hidden="true" />
                            Data & Profiles
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {activeTab === "general" && (
                                <motion.div
                                    key="general"
                                    role="tabpanel"
                                    id="panel-general"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Profile Information</h3>
                                        <p className="text-sm text-[var(--text-muted)] mb-4">
                                            Update your display name and personal details.
                                        </p>

                                        <div className="space-y-4">
                                            <div>
                                                <label htmlFor="display-name-input" className="label-base">
                                                    Display Name
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        id="display-name-input"
                                                        type="text"
                                                        value={displayName}
                                                        onChange={(e) => setDisplayName(e.target.value)}
                                                        className="input-base flex-1"
                                                        placeholder="Enter your name"
                                                    />
                                                    <button
                                                        onClick={handleSaveProfile}
                                                        disabled={isSaving}
                                                        className="button button-primary whitespace-nowrap"
                                                    >
                                                        {isSaving ? "Saving..." : "Save Changes"}
                                                    </button>
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="email-input" className="label-base">
                                                    Email
                                                </label>
                                                <input
                                                    id="email-input"
                                                    type="text"
                                                    value={user.email}
                                                    disabled
                                                    className="input-base w-full opacity-60 cursor-not-allowed"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "appearance" && (
                                <motion.div
                                    key="appearance"
                                    role="tabpanel"
                                    id="panel-appearance"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Theme & Appearance</h3>
                                        <p className="text-sm text-[var(--text-muted)] mb-4">
                                            Customize the look and feel of your expense tracker.
                                        </p>
                                        <ThemePreview />
                                    </div>
                                </motion.div>
                            )}

                            {activeTab === "data" && (
                                <motion.div
                                    key="data"
                                    role="tabpanel"
                                    id="panel-data"
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className="space-y-6"
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold mb-1">Data Management</h3>
                                        <p className="text-sm text-[var(--text-muted)] mb-4">
                                            Manage your expense categories and user profiles.
                                        </p>

                                        <div className="grid gap-4">
                                            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-between items-center gap-4">
                                                <div>
                                                    <h4 className="font-medium">Expense Categories</h4>
                                                    <p className="text-sm text-[var(--text-muted)]">
                                                        Add, edit, or remove custom categories.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={onManageCategories}
                                                    className="button button-secondary button-sm whitespace-nowrap"
                                                    aria-label="Manage expense categories"
                                                >
                                                    Manage
                                                </button>
                                            </div>

                                            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-between items-center gap-4">
                                                <div>
                                                    <h4 className="font-medium">User Profiles</h4>
                                                    <p className="text-sm text-[var(--text-muted)]">
                                                        Create and manage multiple profiles.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={onManageProfiles}
                                                    className="button button-secondary button-sm whitespace-nowrap"
                                                    aria-label="Manage user profiles"
                                                >
                                                    Manage
                                                </button>
                                            </div>

                                            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex justify-between items-center gap-4">
                                                <div>
                                                    <h4 className="font-medium">Export Data</h4>
                                                    <p className="text-sm text-[var(--text-muted)]">
                                                        Download all your expenses as a CSV file.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={handleExport}
                                                    disabled={isExporting}
                                                    className="button button-secondary button-sm whitespace-nowrap flex items-center gap-2"
                                                    aria-label="Export data to CSV"
                                                >
                                                    <Download className="w-4 h-4" aria-hidden="true" />
                                                    {isExporting ? "Exporting..." : "Export CSV"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default SettingsModal;
