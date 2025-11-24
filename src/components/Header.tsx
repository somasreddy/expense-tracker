import React from "react";
import { motion } from "framer-motion";
import { useTheme } from "../services/ThemeContext";
import ProfileSelector from "./ProfileSelector";
import { Account, Category } from "../types";
import { formatToINR } from "../services/expenseService";

interface HeaderProps {
    user: { displayName: string | null };
    accounts: Account[];
    currentAccountId: string;
    onSelectAccount: (id: string) => void;
    onManageAccounts: () => void;
    onSignOut: () => void;
    filter: { start: string | null; end: string | null };
    categoryFilter: Category | null;
    currentProfileName: string;
    filteredTotal: number;
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
                        {user.displayName ? `${user.displayName}'s` : "My"} Expense Tracker
                    </span>
                </h1>

                <div className="flex items-center gap-3">
                    <ProfileSelector
                        accounts={accounts}
                        currentAccountId={currentAccountId}
                        onSelectAccount={onSelectAccount}
                        onManageAccounts={onManageAccounts}
                    />

                    <motion.button
                        onClick={onSignOut}
                        className="button button-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Sign Out
                    </motion.button>
                </div>
            </div>

            {(filter.start && filter.end) || categoryFilter ? (
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
            ) : null}
        </header>
    );
};

export default Header;
