interface SelectProps {
    options: string[];
    value: string | null;
    onChange: (value: string) => void;
  }
  
  export function Select({ options, value, onChange }: SelectProps) {
    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Select your name</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
  