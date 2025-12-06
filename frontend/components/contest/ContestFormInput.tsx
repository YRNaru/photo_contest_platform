interface ContestFormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  helperText?: string;
  type?: 'text' | 'textarea' | 'number' | 'file';
  accept?: string;
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min?: string;
  max?: string;
}

export function ContestFormInput({ 
  label, 
  value, 
  onChange, 
  required = false,
  placeholder = '',
  helperText = '',
  type = 'text',
  accept,
  onFileChange,
  min,
  max
}: ContestFormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={4}
          placeholder={placeholder}
        />
      ) : type === 'file' ? (
        <input
          type="file"
          accept={accept}
          onChange={onFileChange}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : type === 'number' ? (
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ) : (
        <input
          type={type}
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={placeholder}
        />
      )}
      {helperText && (
        <p className="text-sm text-gray-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}

