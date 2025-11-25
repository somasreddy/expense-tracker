import { useState } from "react";
import { Expense, Category } from "../types";
import CategorySelect from "./CategorySelect";
import { ErrorMessage } from "./ErrorMessage";
import { isNotBlank, isValidAmount } from "../utils/validators";

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
  const [nameError, setNameError] = useState<string | undefined>();
  const [amountError, setAmountError] = useState<string | undefined>();

  const handleSave = () => {
    // Validate name
    const nameCheck = isNotBlank(name);
    if (!nameCheck.isValid) {
      setNameError(nameCheck.error || "Expense name is required");
      return;
    }

    // Validate amount
    const amountCheck = isValidAmount(amount);
    if (!amountCheck.isValid) {
      setAmountError(amountCheck.error);
      return;
    }

    const amt = parseFloat(amount);
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
              className={`input-base w-full ${nameError ? 'input-error' : ''}`}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setNameError(undefined); // Clear error on change
              }}
            />
            <ErrorMessage message={nameError} show={!!nameError} />
          </div>
          <div>
            <label htmlFor="edit-amount" className="block text-sm text-[var(--text-muted)] font-medium mb-1">Amount</label>
            <input
              id="edit-amount"
              type="number"
              step="0.01"
              className={`input-base w-full ${amountError ? 'input-error' : ''}`}
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                setAmountError(undefined); // Clear error on change
              }}
            />
            <ErrorMessage message={amountError} show={!!amountError} />
          </div>
          <CategorySelect
            selectedCategory={category}
            onSelectCategory={setCategory}
            customCategories={customCategories}
            onAddCategory={onAddCategory}
          />
        </div>
        <div className="flex justify-end gap-2">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpenseModal;
