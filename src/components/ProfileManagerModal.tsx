import React, { useState } from "react";
import { Account } from "../types";
import { ErrorMessage } from "./ErrorMessage";
import { isNotBlank, isUnique } from "../utils/validators";

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
  const [newNameError, setNewNameError] = useState<string | undefined>();
  const [editNameError, setEditNameError] = useState<string | undefined>();

  if (!isOpen) return null;

  const handleAdd = () => {
    // Validate not blank
    const blankCheck = isNotBlank(newName);
    if (!blankCheck.isValid) {
      setNewNameError(blankCheck.error);
      return;
    }

    // Validate unique
    const existingNames = accounts.map(a => a.name);
    const uniqueCheck = isUnique(newName, existingNames);
    if (!uniqueCheck.isValid) {
      setNewNameError(uniqueCheck.error || "A profile with this name already exists");
      return;
    }

    onAddAccount(newName.trim());
    setNewName("");
    setNewNameError(undefined);
  };

  const startEdit = (acc: Account) => {
    setEditingId(acc.id);
    setEditingName(acc.name);
    setEditNameError(undefined);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNameError(undefined);
  };

  const saveEdit = () => {
    if (!editingId) return;

    // Validate not blank
    const blankCheck = isNotBlank(editingName);
    if (!blankCheck.isValid) {
      setEditNameError(blankCheck.error);
      return;
    }

    // Validate unique (excluding current editing name)
    const existingNames = accounts.filter(a => a.id !== editingId).map(a => a.name);
    const currentName = accounts.find(a => a.id === editingId)?.name;
    const uniqueCheck = isUnique(editingName, existingNames, currentName);
    if (!uniqueCheck.isValid) {
      setEditNameError(uniqueCheck.error || "A profile with this name already exists");
      return;
    }

    onUpdateAccount(editingId, editingName.trim());
    setEditingId(null);
    setEditNameError(undefined);
  };

  return (
    // Backdrop
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {/* Modal Container - Using card-surface for theme consistency */}
      <div
        className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl p-6 max-w-lg w-full text-[var(--text-main)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >

        {/* Header */}
        <h2 id="profile-modal-title" className="text-xl font-bold mb-4">Manage Profiles</h2>

        {/* Account List */}
        <div className="space-y-2 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
          {accounts.map((acc) => (
            <div
              key={acc.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-subtle)]"
            >
              {editingId === acc.id ? (
                // Edit Mode
                <div className="flex-1">
                  <input
                    className={`input-base w-full text-sm ${editNameError ? 'input-error' : ''}`}
                    value={editingName}
                    onChange={(e) => {
                      setEditingName(e.target.value);
                      setEditNameError(undefined); // Clear error on change
                    }}
                    autoFocus
                    aria-label={`Edit name for ${acc.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                  />
                  <ErrorMessage message={editNameError} show={!!editNameError} />
                </div>
              ) : (
                // View Mode
                <span className="font-medium text-sm truncate">{acc.name}</span>
              )}

              <div className="flex gap-2 shrink-0">
                {editingId === acc.id ? (
                  <>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={saveEdit}
                      aria-label="Save changes"
                    >
                      Save
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={cancelEdit}
                      aria-label="Cancel editing"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => startEdit(acc)}
                      aria-label={`Edit profile ${acc.name}`}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteAccount(acc.id)}
                      aria-label={`Delete profile ${acc.name}`}
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
        <div className="pt-4 border-t border-[var(--border-subtle)]">
          <div className="flex gap-2">
            <div className="flex-1">
              <input
                className={`input-base w-full ${newNameError ? 'input-error' : ''}`}
                placeholder="New profile name..."
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNewNameError(undefined); // Clear error on change
                }}
                aria-label="New profile name"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd();
                }}
              />
              <ErrorMessage message={newNameError} show={!!newNameError} />
            </div>
            <button
              className="btn btn-primary"
              onClick={handleAdd}
            >
              Add Profile
            </button>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end mt-4 pt-2">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileManagerModal;