interface ButtonProps {
    onClick?: () => void;
    children: React.ReactNode;
    disabled?: boolean;
  }
  
  export function Button({ onClick, children, disabled }: ButtonProps) {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        {children}
      </button>
    );
  }
  