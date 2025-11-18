
import React from 'react';
import { motion } from 'framer-motion';
import { Account } from '../types';

interface AccountSelectorProps {
  accounts: Account[];
  currentAccountId: string | null;
  onSelectAccount: (id: string) => void;
  onManageAccounts: () => void;
}

const ProfileSelector: React.FC<AccountSelectorProps> = ({ accounts, currentAccountId, onSelectAccount, onManageAccounts }) => {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative">
        <select
          value={currentAccountId || 'all'}
          onChange={(e) => onSelectAccount(e.target.value)}
          className="appearance-none block w-full pl-3 pr-10 py-2 text-sm shadow-sm"
          aria-label="Select a profile"
        >
          <option value="all">All Profiles</option>
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-300">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
        </div>
      </div>
      <motion.button
        onClick={onManageAccounts}
        className="button button-secondary"
        whileHover={{ scale: 1.05, y: -2, boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.1)" }}
        whileTap={{ scale: 0.95 }}
      >
        Manage Profiles
      </motion.button>
    </div>
  );
};

export default ProfileSelector;
