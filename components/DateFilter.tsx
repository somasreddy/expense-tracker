import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface DateFilterProps {
  onFilter: (startDate: string, endDate: string) => void;
  onClear: () => void;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilter, onClear }) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleFilter = () => {
    if (startDate && endDate) {
      onFilter(startDate, endDate);
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    onClear();
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-sm shadow-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
        style={{ colorScheme: 'dark' }}
      />
      <span className="text-slate-400">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="px-3 py-2 bg-slate-700/50 border border-slate-600 rounded-md text-sm shadow-sm text-slate-300 focus:outline-none focus:ring-1 focus:ring-amber-400"
        style={{ colorScheme: 'dark' }}
      />
      <motion.button
        onClick={handleFilter}
        disabled={!startDate || !endDate}
        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white animated-button focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 dark:focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Filter
      </motion.button>
      <motion.button
        onClick={handleClear}
        className="py-2 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-slate-200 bg-slate-700/80 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 dark:focus:ring-offset-slate-900"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Clear
      </motion.button>
    </div>
  );
};

export default DateFilter;
