import { useState } from "react";

interface Props {
  onAddExpense: (name: string, amount: number) => void;
}

const ExpenseForm: React.FC<Props> = ({ onAddExpense }) => {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!name.trim() || isNaN(amt) || amt <= 0) return;
    onAddExpense(name.trim(), amt);
    setName("");
    setAmount("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="label">Expense Name</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Groceries, Fuel, EMI..."
        />
      </div>
      <div>
        <label className="label">Amount</label>
        <input
          className="input"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="e.g. 1200"
        />
      </div>
      <button type="submit" className="button button-primary w-full">
        Add Expense
      </button>
    </form>
  );
};

export default ExpenseForm;
