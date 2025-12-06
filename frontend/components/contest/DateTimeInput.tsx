interface DateTimeInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  helperText?: string;
}

export function DateTimeInput({ label, value, onChange, required = false, helperText }: DateTimeInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="datetime-local"
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {helperText && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

