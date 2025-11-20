import React, { useState } from "react";
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
  
  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = () => {
    if (!editingId || !editingName.trim()) {
        if (editingId) setEditingId(null);
        return;
    }
    onUpdateAccount(editingId, editingName.trim());
    setEditingId(null);
  };
  
  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container - Using card-surface for theme consistency */}
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 max-w-lg w-full text-[var(--text-main)]"> 
        
        {/* Header */}
        <h2 className="text-xl font-bold mb-4">Manage Profiles</h2>

        {/* Account List */}
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            >
              {editingId === acc.id ? (
                // Edit Mode
                <input
                  className="input-base w-full text-sm" 
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveEdit();
                    if (e.key === 'Escape') cancelEdit();
                  }}
                />
              ) : (
                // View Mode
                <span className="font-medium text-sm truncate">{acc.name}</span>
              )}
              
              <div className="flex gap-2 shrink-0">
                {editingId === acc.id ? (
                  <>
                    <button
                      className="p-2 text-xs rounded bg-green-600 text-white hover:bg-green-500 transition-colors" 
                      onClick={saveEdit}
                    >
                      Save
                    </button>
                    <button
                      className="p-2 text-xs rounded bg-slate-600 text-white hover:bg-slate-500 transition-colors" 
                      onClick={cancelEdit}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                  <button
                    className="p-2 text-xs rounded bg-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white transition-all" 
                    onClick={() => startEdit(acc)}
                  >
                    Edit
                  </button>
                  <button
                    className="p-2 text-xs rounded bg-red-600/20 text-red-500 hover:bg-red-600 hover:text-white transition-all" 
                    onClick={() => onDeleteAccount(acc.id)}
                  >
                    Delete
                  </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Account Form */}
        <div className="flex gap-2 pt-4 border-t border-[var(--border-subtle)]">
          <input
            className="input-base w-full"
            placeholder="New profile name..."
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') handleAdd();
            }}
          />
          <button 
            className="button button-primary whitespace-nowrap" 
            onClick={handleAdd}
          >
            Add Profile
          </button>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-4 pt-2">
          <button 
            className="button button-secondary text-sm" 
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagerModal;