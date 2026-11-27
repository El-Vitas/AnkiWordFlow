import { useId } from 'react';

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  /** Adds an empty first option, for settings that can be left unset. */
  emptyLabel?: string;
}

export const Select = ({ label, options, value, onChange, emptyLabel }: SelectProps) => {
  const id = useId();
  const knownValue = value === '' || options.some((option) => option.value === value);
  return (
    <div className="flex items-center justify-between gap-4">
      <label htmlFor={id} className="text-sm text-gray-700">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-44 p-1 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {!knownValue && <option value={value}>{value}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
