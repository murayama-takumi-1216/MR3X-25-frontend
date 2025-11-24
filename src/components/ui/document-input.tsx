import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';
import { validateDocument, validateDocument2026, formatCPF, formatCNPJ } from '@/lib/validation';

interface DocumentInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showValidation?: boolean;
}

export function DocumentInput({
  value,
  onChange,
  label = 'Documento',
  placeholder = 'CPF ou CNPJ',
  className,
  disabled = false,
  showValidation = true,
}: DocumentInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string; formatted?: string } | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const raw = localValue || '';
    const allowAlpha = process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === 'true' || process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === '1';
    const hasAnyChar = allowAlpha
      ? /[0-9A-Za-z]/.test(raw)
      : /\d/.test(raw);

    if (hasAnyChar) {
      const use2026 = process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === 'true' || process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === '1';
      const result = use2026 ? validateDocument2026(raw) : validateDocument(raw);
      setValidation(result);

      // Auto-format if valid
      if (result.isValid && result.formatted) {
        if (result.formatted !== localValue) {
          setLocalValue(result.formatted);
          onChange(result.formatted);
        }
      }
    } else {
      setValidation(null);
    }
  }, [localValue, onChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const allowAlpha = process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === 'true' || process.env.NEXT_PUBLIC_ENABLE_CNPJ_2026 === '1';
    const cleanValue = allowAlpha ? inputValue.replace(/[^0-9A-Za-z]/g, '') : inputValue.replace(/\D/g, '');
    
    // Limit input length
    if (cleanValue.length > 14) return;
    
    // Format based on length
    let formatted = inputValue;
    if (cleanValue.length <= 11) {
      // CPF formatting
      formatted = cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else {
      // CNPJ formatting (legacy or provisional 2026 alphanumeric without separators)
      if (allowAlpha && /[A-Za-z]/.test(cleanValue)) {
        formatted = cleanValue.toUpperCase();
      } else {
        formatted = cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
      }
    }
    
    setLocalValue(formatted);
    onChange(formatted);
  };

  const getInputClassName = () => {
    if (!showValidation) return '';
    if (validation) return validation.isValid ? 'border-green-500' : 'border-red-500';
    // When user typed but not enough digits yet, show neutral; if you want red, uncomment:
    // return localValue ? 'border-red-500' : '';
    return '';
  };

  return (
    <div className={className}>
      <Label htmlFor="document">{label}</Label>
      <div className="relative">
        <Input
          id="document"
          value={localValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className={getInputClassName()}
        />
        {validation && showValidation && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validation.isValid ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </div>
      {validation && !validation.isValid && validation.error && (
        <p className="text-sm text-red-500 mt-1">{validation.error}</p>
      )}
      {validation && validation.isValid && (
        <p className="text-sm text-green-600 mt-1">
          {localValue.replace(/\D/g, '').length === 11 ? 'CPF válido' : 'CNPJ válido'}
        </p>
      )}
    </div>
  );
}
