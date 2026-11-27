import { useId } from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export const Toggle = ({ label, checked, onChange }: ToggleProps) => {
  const labelId = useId();
  return (
    <div className="flex items-center justify-between gap-4">
      <span id={labelId} className="text-sm text-gray-700">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={labelId}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 shrink-0 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 ${checked ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${checked ? 'translate-x-6' : ''}`}
        />
      </button>
    </div>
  );
};
