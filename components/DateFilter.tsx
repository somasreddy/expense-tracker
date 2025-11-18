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
        className="px-3 py-2 text-sm shadow-sm"
      />
      <span className="text-slate-400">to</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="px-3 py-2 text-sm shadow-sm"
      />
      <motion.button
        onClick={handleFilter}
        disabled={!startDate || !endDate}
        className="button animated-button disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Filter
      </motion.button>
      <motion.button
        onClick={handleClear}
        className="button button-secondary"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        Clear
      </motion.button>
    </div>
  );
};

export default DateFilter;