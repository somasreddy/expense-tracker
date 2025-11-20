interface Props {
  onFilter: (start: string, end: string) => void;
  onClear: () => void;
}

const DateFilter: React.FC<Props> = ({ onFilter, onClear }) => {
  const handleChange = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const start = (form.elements.namedItem("start") as HTMLInputElement).value;
    const end = (form.elements.namedItem("end") as HTMLInputElement).value;
    if (start && end) onFilter(start, end);
  };

  return (
    <form
      onSubmit={handleChange}
      className="flex flex-wrap gap-2 items-end text-sm"
    >
      <div>
        <label className="label">From</label>
        <input
          type="date"
          name="start"
          className="input"
        />
      </div>
      <div>
        <label className="label">To</label>
        <input
          type="date"
          name="end"
          className="input"
        />
      </div>
      <button type="submit" className="button button-secondary">
        Apply
      </button>
      <button
        type="button"
        className="button button-secondary"
        onClick={onClear}
      >
        Clear
      </button>
    </form>
  );
};

export default DateFilter;
