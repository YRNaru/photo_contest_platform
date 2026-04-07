'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface ContestFormInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  placeholder?: string
  helperText?: string
  type?: 'text' | 'textarea' | 'number' | 'file'
  accept?: string
  onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  min?: string
  max?: string
  disabled?: boolean
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
  max,
  disabled = false,
}: ContestFormInputProps) {
  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {type === 'textarea' ? (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          rows={4}
          placeholder={placeholder}
        />
      ) : type === 'file' ? (
        <Input
          type="file"
          accept={accept}
          onChange={onFileChange}
          disabled={disabled}
          className="cursor-pointer py-2 file:mr-3"
        />
      ) : type === 'number' ? (
        <Input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
        />
      ) : (
        <Input
          type={type}
          required={required}
          value={value}
          onChange={e => onChange(e.target.value)}
          disabled={disabled}
          placeholder={placeholder}
        />
      )}
      {helperText && <p className="text-sm text-muted-foreground">{helperText}</p>}
    </div>
  )
}
