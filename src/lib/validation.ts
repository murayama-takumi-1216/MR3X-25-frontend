
export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
  normalized?: string;
  scheme?: 'legacy' | '2026';
}

export function validateCPF(cpf: string): ValidationResult {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) {
    return {
      isValid: false,
      error: 'CPF deve ter 11 dígitos'
    };
  }

  if (/^(\d)\1{10}$/.test(cleanCPF)) {
    return {
      isValid: false,
      error: 'CPF inválido (sequência inválida)'
    };
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCPF[9]) !== firstDigit || parseInt(cleanCPF[10]) !== secondDigit) {
    return {
      isValid: false,
      error: 'CPF inválido (dígitos verificadores incorretos)'
    };
  }

  return {
    isValid: true,
    formatted: formatCPF(cleanCPF)
  };
}

export function validateCNPJ(cnpj: string): ValidationResult {
  const cleanCNPJ = cnpj.replace(/\D/g, '');

  if (cleanCNPJ.length !== 14) {
    return {
      isValid: false,
      error: 'CNPJ deve ter 14 dígitos'
    };
  }

  if (/^(\d)\1{13}$/.test(cleanCNPJ)) {
    return {
      isValid: false,
      error: 'CNPJ inválido (sequência inválida)'
    };
  }

  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights1[i];
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cleanCNPJ[i]) * weights2[i];
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(cleanCNPJ[12]) !== firstDigit || parseInt(cleanCNPJ[13]) !== secondDigit) {
    return {
      isValid: false,
      error: 'CNPJ inválido (dígitos verificadores incorretos)'
    };
  }

  return {
    isValid: true,
    formatted: formatCNPJ(cleanCNPJ),
    normalized: cleanCNPJ,
    scheme: 'legacy',
  };
}

export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

export function formatCPFInput(value: string): string {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);

  if (cleanValue.length <= 3) {
    return cleanValue;
  } else if (cleanValue.length <= 6) {
    return cleanValue.replace(/(\d{3})(\d{0,3})/, '$1.$2');
  } else if (cleanValue.length <= 9) {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else {
    return cleanValue.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
  }
}

export function formatCNPJInput(value: string): string {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '').slice(0, 14);

  if (cleanValue.length <= 2) {
    return cleanValue;
  } else if (cleanValue.length <= 5) {
    return cleanValue.replace(/(\d{2})(\d{0,3})/, '$1.$2');
  } else if (cleanValue.length <= 8) {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3');
  } else if (cleanValue.length <= 12) {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{0,4})/, '$1.$2.$3/$4');
  } else {
    return cleanValue.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5');
  }
}

export function formatDocumentInput(value: string): string {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length <= 11) {
    return formatCPFInput(value);
  } else {
    return formatCNPJInput(value);
  }
}

export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

export function formatCEPInput(value: string): string {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '');

  if (cleanValue.length <= 5) {
    return cleanValue;
  } else {
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}

export function isValidCEPFormat(cep: string): boolean {
  if (!cep) return false;
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
}

export function validateDocument(document: string): ValidationResult {
  const cleanDoc = document.replace(/\D/g, '');

  if (cleanDoc.length === 11) {
    return validateCPF(document);
  } else if (cleanDoc.length === 14) {
    return validateCNPJ(document);
  } else {
    return {
      isValid: false,
      error: 'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)'
    };
  }
}

export function formatCRECIInput(value: string): string {
  if (!value) return '';

  let formatted = value.toUpperCase();

  const parts = formatted.split('/');

  if (parts.length === 1) {
    const digits = formatted.replace(/[^0-9]/g, '').slice(0, 10);
    return digits;
  } else {
    const numberPart = parts[0].replace(/[^0-9]/g, '').slice(0, 10);
    let statePart = parts.slice(1).join('/').replace(/[^A-Z\-]/g, '').slice(0, 4);

    return numberPart + '/' + statePart;
  }
}
