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
      <select
        className="input max-w-xs"
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
      <button
        type="button"
        className="button button-secondary"
        onClick={onManageAccounts}
      >
        Manage
      </button>
    </div>
  );
};

export default ProfileSelector;
