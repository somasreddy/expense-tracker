import { useState } from "react";
import { Account } from "../types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddAccount: (name: string) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateAccount: (id: string, name: string) => void;
}

const ProfileManagerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  accounts,
  onAddAccount,
  onDeleteAccount,
  onUpdateAccount,
}) => {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  if (!isOpen) return null;

  const handleAdd = () => {
    if (!newName.trim()) return;
    onAddAccount(newName.trim());
    setNewName("");
  };

  const startEdit = (acc: Account) => {
    setEditingId(acc.id);
    setEditingName(acc.name);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) return;
    onUpdateAccount(editingId, editingName.trim());
    setEditingId(null);
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
      <div className="content-surface p-6 max-w-lg w-full">
        <h2 className="text-xl font-bold mb-4">Manage Profiles</h2>

        <div className="space-y-2 mb-4 max-h-60 overflow-auto pr-1">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between gap-2 text-sm"
            >
              {editingId === acc.id ? (
                <input
                  className="input"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                />
              ) : (
                <span>{acc.name}</span>
              )}
              <div className="flex gap-2">
                {editingId === acc.id ? (
                  <button
                    className="button button-primary"
                    onClick={saveEdit}
                  >
                    Save
                  </button>
                ) : (
                  <button
                    className="button button-secondary"
                    onClick={() => startEdit(acc)}
                  >
                    Rename
                  </button>
                )}
                <button
                  className="button button-secondary"
                  onClick={() => onDeleteAccount(acc.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <input
            className="input"
            placeholder="New profile name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <button className="button button-primary" onClick={handleAdd}>
            Add
          </button>
        </div>

        <div className="flex justify-end">
          <button className="button button-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagerModal;
