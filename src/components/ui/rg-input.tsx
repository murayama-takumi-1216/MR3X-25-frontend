import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle, XCircle } from 'lucide-react';

interface RGInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  showValidation?: boolean;
  id?: string;
  name?: string;
}

function formatRG(value: string): string {
  const digits = value.replace(/\D/g, '');

  if (digits.length <= 2) {
    return digits;
  } else if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  } else if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  } else {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}-${digits.slice(8, 9)}`;
  }
}

function validateRG(value: string): { isValid: boolean; error?: string } {
  const digits = value.replace(/\D/g, '');

  if (digits.length === 0) {
    return { isValid: false };
  }

  if (digits.length < 9) {
    return { isValid: false, error: 'RG incompleto' };
  }

  if (digits.length === 9) {
    return { isValid: true };
  }

  return { isValid: false, error: 'RG inválido' };
}

export function RGInput({
  value,
  onChange,
  label = 'RG',
  placeholder = '00.000.000-0',
  className,
  disabled = false,
  showValidation = true,
  id = 'rg',
  name = 'rg',
}: RGInputProps) {
  const [localValue, setLocalValue] = useState(value);
  const [validation, setValidation] = useState<{ isValid: boolean; error?: string } | null>(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const digits = (localValue || '').replace(/\D/g, '');

    if (digits.length > 0) {
      const result = validateRG(localValue);
      setValidation(result);
    } else {
      setValidation(null);
    }
  }, [localValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    const digits = inputValue.replace(/\D/g, '');

    if (digits.length > 9) return;

    const formatted = formatRG(inputValue);
    setLocalValue(formatted);
    onChange(formatted);
  };

  const getInputClassName = () => {
    if (!showValidation) return '';
    if (validation) return validation.isValid ? 'border-green-500' : 'border-red-500';
    return '';
  };

  return (
    <div className={className}>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          name={name}
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
        <p className="text-sm text-green-600 mt-1">RG válido</p>
      )}
    </div>
  );
}
