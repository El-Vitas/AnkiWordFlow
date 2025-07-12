interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (newCheckedState: boolean) => void;
}

export function Toggle({ label, checked, onChange }: ToggleProps) {
  return (
    <div className="grid grid-cols-2 items-center gap-4">
      <span className="text-sm text-gray-700 justify-self-start">{label}</span>
      <div className="justify-self-end">
        <div
          className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
            checked ? 'bg-blue-600' : 'bg-gray-300'
          }`}
          onClick={() => onChange(!checked)} 
        >
          <div
            className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ${
              checked ? 'transform translate-x-6' : ''
            }`}
          ></div>
        </div>
      </div>
    </div>
  );
}