import React from "react";

interface Props {
  onFilter: (start: string, end: string) => void;
  onClear: () => void;
}

const DateFilter: React.FC<Props> = ({ onFilter, onClear }) => {
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");

  const handleApply = () => {
    if (start && end) onFilter(start, end);
  };

  const handleClear = () => {
    setStart("");
    setEnd("");
    onClear();
  };

  return (
    <div className="flex flex-wrap items-end gap-2 text-sm">
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium opacity-70">From</label>
        <input
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          // Using the new standardized CSS class
          className="input-base w-32 sm:w-auto h-10 cursor-pointer"
        />
      </div>
      
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium opacity-70">To</label>
        <input
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="input-base w-32 sm:w-auto h-10 cursor-pointer"
        />
      </div>

      <div className="flex gap-2 mt-2 sm:mt-0">
        <button
          onClick={handleApply}
          className="px-4 h-10 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition-colors shadow-md"
        >
          Apply
        </button>
        <button
          onClick={handleClear}
          className="px-4 h-10 rounded-lg bg-slate-700/50 text-[var(--text-main)] font-medium border border-[var(--border-subtle)] hover:bg-slate-600/50 transition-colors"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

export default DateFilter;