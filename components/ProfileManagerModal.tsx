import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Account } from '../types';

interface AccountManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  onAddAccount: (name: string) => void;
  onDeleteAccount: (id: string) => void;
  onUpdateAccount: (id: string, newName: string) => void;
}

const ProfileManagerModal: React.FC<AccountManagerModalProps> = ({ isOpen, onClose, accounts, onAddAccount, onDeleteAccount, onUpdateAccount }) => {
  const [newAccountName, setNewAccountName] = useState('');
  const [addError, setAddError] = useState('');

  // State for editing
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [editError, setEditError] = useState('');

  const handleAddAccount = () => {
    if (!newAccountName.trim()) {
      setAddError('Account name cannot be empty.');
      return;
    }
    if (accounts.some(p => p.name.toLowerCase() === newAccountName.trim().toLowerCase())) {
        setAddError('An account with this name already exists.');
        return;
    }
    onAddAccount(newAccountName.trim());
    setNewAccountName('');
    setAddError('');
  };

  // Handlers for editing
  const handleStartEdit = (account: Account) => {
    setEditingAccountId(account.id);
    setEditingName(account.name);
    setEditError('');
  };

  const handleCancelEdit = () => {
    setEditingAccountId(null);
    setEditingName('');
    setEditError('');
  };

  const handleSaveEdit = (accountId: string) => {
    if (!editingName.trim()) {
      setEditError('Account name cannot be empty.');
      return;
    }
    if (accounts.some(p => p.id !== accountId && p.name.toLowerCase() === editingName.trim().toLowerCase())) {
      setEditError('An account with this name already exists.');
      return;
    }
    onUpdateAccount(accountId, editingName.trim());
    handleCancelEdit();
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-40 flex justify-center items-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-slate-800/50 backdrop-blur-2xl rounded-2xl shadow-2xl w-full max-w-md m-4 border border-white/10"
        initial={{ scale: 0.9, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.9, y: 20, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-white">Manage Accounts</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-slate-200">Add New Account</h3>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="e.g., Business Card"
                className="flex-grow mt-1 block w-full px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
              <motion.button
                onClick={handleAddAccount}
                className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium animated-button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Add
              </motion.button>
            </div>
            {addError && <p className="text-xs text-red-400 mt-1">{addError}</p>}
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2 text-slate-200">Existing Accounts</h3>
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-2 -mr-2">
              <AnimatePresence>
                {accounts.map(account => (
                  <motion.li
                    key={account.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                    transition={{ type: 'spring', stiffness: 500, damping: 50 }}
                    className="p-3 bg-slate-900/40 rounded-lg"
                  >
                    {editingAccountId === account.id ? (
                      <div className="w-full">
                        <div className="flex items-center gap-2">
                           <input
                            type="text"
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="flex-grow w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded-md text-sm text-white focus:outline-none focus:ring-1 focus:ring-sky-500"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(account.id)}
                          />
                          <motion.button onClick={() => handleSaveEdit(account.id)} className="text-green-400 hover:text-green-300 p-1" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Save account name">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                          </motion.button>
                          <motion.button onClick={handleCancelEdit} className="text-red-400 hover:text-red-300 p-1" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label="Cancel editing account name">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                          </motion.button>
                        </div>
                        {editError && <p className="text-xs text-red-400 mt-1">{editError}</p>}
                      </div>
                    ) : (
                      <div className="flex justify-between items-center w-full">
                        <span className="text-slate-200">{account.name}</span>
                        <div className="flex items-center gap-2">
                           <motion.button onClick={() => handleStartEdit(account)} className="text-slate-400 hover:text-amber-300 p-1 rounded-full" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} aria-label={`Edit account ${account.name}`}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
                          </motion.button>
                          <motion.button
                            onClick={() => onDeleteAccount(account.id)}
                            className={`p-1 rounded-full transition-colors ${
                              accounts.length > 1
                                ? 'text-slate-400 hover:text-red-400'
                                : 'text-slate-600 cursor-not-allowed'
                            }`}
                            whileHover={accounts.length > 1 ? { scale: 1.1 } : {}}
                            whileTap={accounts.length > 1 ? { scale: 0.9 } : {}}
                            aria-label={
                              accounts.length > 1
                                ? `Delete account ${account.name}`
                                : "Cannot delete the last account"
                            }
                            disabled={accounts.length <= 1}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </div>

          <div className="flex justify-end">
            <motion.button
              onClick={onClose}
              className="py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-slate-700/80 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProfileManagerModal;