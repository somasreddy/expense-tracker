import { useState } from "react";
import { Expense, Category } from "../types";
import CategorySelect from "./CategorySelect";

interface Props {
  expense: Expense;
  onUpdate: (expense: Expense) => void;
  onCancel: () => void;
  customCategories: string[];
  onAddCategory: (name: string) => Promise<string | null>;
}

const EditExpenseModal: React.FC<Props> = ({ expense, onUpdate, onCancel, customCategories, onAddCategory }) => {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState<Category>(expense.category);

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onUpdate({ ...expense, name: name.trim(), amount: amt, category });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
      <div
        className="content-surface p-6 max-w-md w-full"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-expense-title"
      >
        <h2 id="edit-expense-title" className="text-xl font-bold mb-4">Edit Expense</h2>
        <div className="space-y-4 mb-4">
          <div>
            <label htmlFor="edit-name" className="block text-sm text-[var(--text-muted)] font-medium mb-1">Name</label>
            <input
              id="edit-name"
              className="input-base w-full"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="edit-amount" className="block text-sm text-[var(--text-muted)] font-medium mb-1">Amount</label>
            <input
              id="edit-amount"
              className="input-base w-full"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <CategorySelect
            selectedCategory={category}
            onSelectCategory={setCategory}
            customCategories={customCategories}
            onAddCategory={onAddCategory}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="button button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="button button-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
