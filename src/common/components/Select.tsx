// También se vuelve un componente controlado.
interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  options: Option[];
  value: string;
  onChange: (newSelectedValue: string) => void;
}

export function Select({ label, options, value, onChange }: SelectProps) {
  return (
    <div className="grid grid-cols-2 items-center gap-4">
      <label htmlFor={label} className="text-sm text-gray-700 justify-self-start">
        {label}
      </label>
      <select
        id={label}
        value={value}
        onChange={(e) => onChange(e.target.value)} // Llama a la función del padre
        className="w-28 p-1 border border-gray-300 rounded-md bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none justify-self-end"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}