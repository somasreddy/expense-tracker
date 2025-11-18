import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Expense, Category, Profile } from './types';
import { loadData, saveData } from './services/expenseService';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Summary from './components/Summary';
import ExpenseChart from './components/ExpenseChart';
import DateFilter from './components/DateFilter';
import EditExpenseModal from './components/EditExpenseModal';
import ProfileSelector from './components/ProfileSelector';
import ProfileManagerModal from './components/ProfileManagerModal';

const App: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileId] = useState<string | null>('all');
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isProfileManagerOpen, setProfileManagerOpen] = useState(false);
  const [filter, setFilter] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  useEffect(() => {
    const { expenses: loadedExpenses, profiles: loadedProfiles } = loadData();
    setExpenses(loadedExpenses);
    setProfiles(loadedProfiles);
    
    if (loadedProfiles.length > 0 && !currentProfileId) {
      setCurrentProfileId(loadedProfiles[0].id);
    }
  }, []);

  useEffect(() => {
    saveData({ expenses, profiles });
  }, [expenses, profiles]);

  const handleAddExpense = (name: string, amount: number) => {
    // Can't add expenses in 'All Profiles' view. Must select a profile.
    if (currentProfileId === 'all' || !currentProfileId) {
      alert("Please select a specific profile to add an expense.");
      return;
    }

    const newExpense: Expense = {
      id: `${Date.now()}-${Math.random()}`,
      profileId: currentProfileId,
      name,
      amount,
      category: 'Others', // Let's keep it simple, or re-categorize
      date: new Date().toISOString().split('T')[0],
    };
    setExpenses(prevExpenses => [newExpense, ...prevExpenses]);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    setExpenses(prevExpenses =>
      prevExpenses.map(expense => (expense.id === updatedExpense.id ? updatedExpense : expense))
    );
    setEditingExpense(null);
  };

  const handleDeleteExpense = (id: string) => {
    setExpenses(prevExpenses => prevExpenses.filter(expense => expense.id !== id));
  };

  const handleAddProfile = (name: string) => {
    const newProfile: Profile = { id: `${Date.now()}`, name };
    setProfiles(prevProfiles => [...prevProfiles, newProfile]);
    setCurrentProfileId(newProfile.id); // Switch to the new profile
  };

  const handleDeleteProfile = (profileId: string) => {
    // Rule: At least one profile must always remain.
    if (profiles.length <= 1) {
      alert("Cannot delete the last profile. At least one must remain.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this profile? All its expenses will be transferred to another profile.")) {
      // Find a fallback profile to transfer expenses to.
      const fallbackProfile = profiles.find(p => p.id !== profileId);
      if (!fallbackProfile) {
        // This case should not be reachable due to the length check above.
        console.error("Error: Could not find a fallback profile for expense transfer.");
        return;
      }

      // Rule: Transfer expenses to another available profile.
      setExpenses(prevExpenses =>
        prevExpenses.map(expense =>
          expense.profileId === profileId
            ? { ...expense, profileId: fallbackProfile.id }
            : expense
        )
      );

      // Delete the profile.
      setProfiles(prevProfiles => prevProfiles.filter(p => p.id !== profileId));

      // If the deleted profile was the active one, switch view to 'All Profiles'.
      if (currentProfileId === profileId) {
        setCurrentProfileId('all');
      }
    }
  };

  const handleUpdateProfile = (profileId: string, newName: string) => {
    setProfiles(prevProfiles =>
      prevProfiles.map(p => (p.id === profileId ? { ...p, name: newName } : p))
    );
  };

  const handleSetFilter = (start: string, end: string) => setFilter({ start, end });
  const handleClearFilter = () => setFilter({ start: null, end: null });

  const profileExpenses = useMemo(() => {
    if (currentProfileId === 'all') return expenses;
    return expenses.filter(e => e.profileId === currentProfileId);
  }, [expenses, currentProfileId]);

  const filteredExpenses = useMemo(() => {
    if (!filter.start || !filter.end) return profileExpenses;
    return profileExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      const startDate = new Date(filter.start!);
      const endDate = new Date(filter.end!);
      return expenseDate >= startDate && expenseDate <= endDate;
    });
  }, [profileExpenses, filter]);

  const filteredTotal = useMemo(() => {
    return filteredExpenses.reduce((total, expense) => total + expense.amount, 0);
  }, [filteredExpenses]);

  const categoryTotals = useMemo(() => {
    const totals: { [key in Category]?: number } = {};
    filteredExpenses.forEach(expense => {
      totals[expense.category] = (totals[expense.category] || 0) + expense.amount;
    });
    return totals;
  }, [filteredExpenses]);

  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.2 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };
  const currentProfileName = profiles.find(p => p.id === currentProfileId)?.name || 'All Profiles';

  return (
    <div className="min-h-screen text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <AnimatePresence>
        {editingExpense && <EditExpenseModal expense={editingExpense} onUpdate={handleUpdateExpense} onCancel={() => setEditingExpense(null)} />}
        {isProfileManagerOpen && <ProfileManagerModal isOpen={isProfileManagerOpen} onClose={() => setProfileManagerOpen(false)} profiles={profiles} onAddProfile={handleAddProfile} onDeleteProfile={handleDeleteProfile} onUpdateProfile={handleUpdateProfile} />}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto bg-slate-900/50 backdrop-blur-xl p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl border border-white/10">
        <header className="mb-8">
          <div className="flex flex-wrap justify-between items-center gap-4">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-500 tracking-tight">
              Expense Tracker
            </h1>
            <ProfileSelector
              profiles={profiles}
              currentProfileId={currentProfileId}
              onSelectProfile={setCurrentProfileId}
              onManageProfiles={() => setProfileManagerOpen(true)}
            />
          </div>
          <p className="mt-2 text-lg text-slate-400">
            Currently viewing expenses for: <span className="font-bold text-amber-300">{currentProfileName}</span>
          </p>
        </header>

        <motion.main className="grid grid-cols-1 lg:grid-cols-3 gap-8" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div className="lg:col-span-1 space-y-8" variants={itemVariants}>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <h2 className="text-2xl font-bold mb-4 text-white">Add New Expense</h2>
              {currentProfileId !== 'all' ? (
                <ExpenseForm onAddExpense={handleAddExpense} />
              ) : (
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Please select a specific profile to add a new expense.</p>
                </div>
              )}
            </motion.div>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Summary filteredTotal={filteredTotal} categoryTotals={categoryTotals} />
            </motion.div>
          </motion.div>
          
          <motion.div className="lg:col-span-2 space-y-8" variants={itemVariants}>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <h2 className="text-2xl font-bold mb-4 text-white">Category Distribution</h2>
              <ExpenseChart categoryTotals={categoryTotals} />
            </motion.div>
            <motion.div className="bg-slate-800/40 backdrop-blur-2xl p-6 rounded-2xl shadow-lg border border-white/10" whileHover={{ y: -5, scale: 1.02, boxShadow: "0 20px 30px rgba(0,0,0,0.2)" }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                <h2 className="text-2xl font-bold text-white">Expense History</h2>
                <DateFilter onFilter={handleSetFilter} onClear={handleClearFilter} />
              </div>
              <ExpenseList expenses={filteredExpenses} onDeleteExpense={handleDeleteExpense} onEditExpense={setEditingExpense} />
            </motion.div>
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
};

export default App;