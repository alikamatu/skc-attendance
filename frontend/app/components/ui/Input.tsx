interface InputProps {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
  }
  
  export function Input({ value, onChange, placeholder }: InputProps) {
    return (
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="border p-2 rounded w-full"
      />
    );
  }
  