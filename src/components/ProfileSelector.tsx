import React from 'react';
import { Account } from "../types";

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
        className="input-base max-w-[150px] cursor-pointer"
        value={currentAccountId}
        onChange={(e) => onSelectAccount(e.target.value)}
      >
        <option value="all">All Profiles</option>
        {accounts.map((a) => (
          <option key={a.id} value={a.id}>
            {a.name}
          </option>
        ))}
      </select>

      {/* Button to open the Profile Manager Modal */}
      <button
        type="button"
        className="button button-secondary whitespace-nowrap"
        onClick={onManageAccounts}
      >
        Manage
      </button>
    </div>
  );
};

export default ProfileSelector;