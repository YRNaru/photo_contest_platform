'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface FormInputProps {
  label: string
  icon: string
  required?: boolean
  value: string
  onChange: (value: string) => void
  placeholder: string
  multiline?: boolean
}

export function FormInput({
  label,
  icon,
  required = false,
  value,
  onChange,
  placeholder,
  multiline = false,
}: FormInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-bold">
        {icon} {label}{' '}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {multiline ? (
        <Textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          className="min-h-32 resize-none"
          placeholder={placeholder}
          required={required}
        />
      ) : (
        <Input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
        />
      )}
    </div>
  )
}
