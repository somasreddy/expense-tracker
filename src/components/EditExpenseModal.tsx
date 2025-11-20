import { useState } from "react";
import { Expense } from "../types";

interface Props {
  expense: Expense;
  onUpdate: (expense: Expense) => void;
  onCancel: () => void;
}

const EditExpenseModal: React.FC<Props> = ({ expense, onUpdate, onCancel }) => {
  const [name, setName] = useState(expense.name);
  const [amount, setAmount] = useState(expense.amount.toString());

  const handleSave = () => {
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onUpdate({ ...expense, name: name.trim(), amount: amt });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-40">
      <div className="content-surface p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Edit Expense</h2>
        <div className="space-y-4 mb-4">
          <div>
            <label className="label">Name</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Amount</label>
            <input
              className="input"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
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
