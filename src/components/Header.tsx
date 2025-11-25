import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../services/ThemeContext";
import ProfileSelector from "./ProfileSelector";
import { Account, Category } from "../types";
import { User } from "@supabase/supabase-js";
import { FilterState } from "../hooks/useExpenseFilters";
import { formatToINR } from "../utils/currencyUtils";
import { Settings } from "lucide-react";

interface HeaderProps {
    user: User;
    accounts: Account[];
    currentAccountId: string;
    onSelectAccount: (accountId: string) => void;
    onManageAccounts: () => void;
    onSignOut: () => void;
    filter: FilterState;
    categoryFilter: string | null;
    currentProfileName: string;
    filteredTotal: number;
    onManageCategories: () => void;
    onOpenSettings: () => void;
}

const Header: React.FC<HeaderProps> = ({
    user,
    accounts,
    currentAccountId,
    onSelectAccount,
    onManageAccounts,
    onSignOut,
    filter,
    categoryFilter,
    currentProfileName,
    filteredTotal,
    onManageCategories,
    onOpenSettings,
}) => {
    const { currentTheme } = useTheme();

    return (
        <header className="mb-8">
            <div className="flex flex-wrap justify-between items-baseline gap-4">
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight pb-1">
                    <span
                        className={`bg-clip-text text-transparent bg-gradient-to-r ${currentTheme.accentClass}`}
                        style={{
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        {(() => {
                            const meta = user.user_metadata;
                            if (meta?.username) return meta.username;
                            if (meta?.full_name) return meta.full_name;
                            if (user.email) return user.email.split('@')[0];
                            return "My";
                        })()} Expense Tracker
                    </span>
                </h1>

                <div className="flex items-center gap-3">
                    <ProfileSelector
                        accounts={accounts}
                        currentAccountId={currentAccountId}
                        onSelectAccount={onSelectAccount}
                        onManageAccounts={onManageAccounts}
                    />

                    <button
                        onClick={onOpenSettings}
                        className="button-icon mr-2 hover:rotate-90 transition-transform duration-500"
                        title="Settings"
                    >
                        <Settings className="w-5 h-5" />
                    </button>

                    <motion.button
                        onClick={onSignOut}
                        className="button button-danger border-opacity-50"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Sign Out
                    </motion.button>
                </div>
            </div>

            {
                (filter.start && filter.end) || categoryFilter ? (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 text-sm opacity-80"
                    >
                        Showing expenses for <strong>{currentProfileName}</strong> — Total:{" "}
                        <span className="font-bold text-[var(--text-highlight)]">
                            {formatToINR(filteredTotal)}
                        </span>
                    </motion.div>
                ) : null
            }
        </header >
    );
};

export default Header;
