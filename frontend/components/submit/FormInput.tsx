interface FormInputProps {
  label: string;
  icon: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}

export function FormInput({ 
  label, 
  icon, 
  required = false, 
  value, 
  onChange, 
  placeholder,
  multiline = false 
}: FormInputProps) {
  const baseClassName = "w-full px-5 py-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border-2 border-gray-300 dark:border-gray-700 rounded-xl font-semibold hover:border-purple-400 dark:hover:border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 transition-all";

  return (
    <div>
      <label className="block text-sm font-bold mb-3 text-gray-900 dark:text-gray-100">
        {icon} {label} {required && <span className="text-red-500 dark:text-red-400">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${baseClassName} h-32 resize-none`}
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClassName}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  );
}

