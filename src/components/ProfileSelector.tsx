import React from 'react';
import { Account } from "../types"; // Assuming this path and type are correct

interface Props {
  accounts: Account[];
  currentAccountId: string;
  onSelectAccount: (id: string) => void;
  onManageAccounts: () => void;
}

const ProfileSelector: React.FC<Props> = ({
  accounts,
  currentAccountId,
  onSelectAccount,
  onManageAccounts,
}) => {
  return (
    <div className="flex items-center gap-2 text-sm">
      {/* Profile Selection Dropdown */}
      <select
        // The 'input max-w-xs' class is assumed to provide styling for the dark theme
        className="input max-w-xs bg-gray-800 text-white border border-gray-700 rounded-lg p-2 focus:ring-blue-500 focus:border-blue-500" 
        value={currentAccountId}
        onChange={(e) => onSelectAccount(e.target.value)}
      >
        {/* Static Option for selecting all profiles */}
        <option value="all">All Profiles</option>
        
        {/* Dynamically generated options from the accounts prop */}
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>
      
      {/* Button to open the Profile Manager Modal */}
      <button
        type="button"
        // Applying Tailwind classes for consistency with a dark theme
        className="button button-secondary px-4 py-2 border rounded-lg text-white border-gray-700 hover:bg-gray-700 transition-colors duration-200"
        onClick={onManageAccounts}
      >
        Manage
      </button>
    </div>
  );
};

export default ProfileSelector;