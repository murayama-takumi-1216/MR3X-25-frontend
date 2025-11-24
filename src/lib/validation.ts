/**
 * Frontend validation utilities for Brazilian documents
 */

export interface ValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
  normalized?: string;
  scheme?: 'legacy' | '2026';
}

/**
 * Validates CPF (Cadastro de Pessoas Físicas)
 */
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

/**
 * Validates CNPJ (Cadastro Nacional da Pessoa Jurídica)
 */
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

/**
 * Formats CPF with dots and dash
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formats CNPJ with dots, slash and dash
 */
export function formatCNPJ(cnpj: string): string {
  const cleanCNPJ = cnpj.replace(/\D/g, '');
  return cleanCNPJ.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
}

/**
 * Formats CEP with dash
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

/**
 * Formats CEP input as user types
 */
export function formatCEPInput(value: string): string {
  if (!value) return '';
  const cleanValue = value.replace(/\D/g, '');
  
  if (cleanValue.length <= 5) {
    return cleanValue;
  } else {
    return cleanValue.replace(/(\d{5})(\d{3})/, '$1-$2');
  }
}

/**
 * Validates CEP format
 */
export function isValidCEPFormat(cep: string): boolean {
  if (!cep) return false;
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8 && /^\d{8}$/.test(cleanCEP);
}

/**
 * Validates document (CPF or CNPJ) based on length
 */
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

/**
 * Provisional 2026 support (feature-flagged)
 */
export function validateDocument2026(document: string): ValidationResult {
  const clean = document.replace(/[^0-9A-Za-z]/g, '').toUpperCase();
  if (/^\d{11}$/.test(clean)) return validateCPF(document);
  if (/^\d{14}$/.test(clean)) return validateCNPJ(document);
  if (/^[0-9A-Z]{14}$/.test(clean)) {
    const map = (ch: string) => (ch >= 'A' && ch <= 'Z' ? ch.charCodeAt(0) - 55 : parseInt(ch, 10));
    const vals = clean.split('').map(map);
    const w1 = [5,4,3,2,9,8,7,6,5,4,3,2];
    let sum = 0; for (let i=0;i<12;i++) sum += vals[i]*w1[i];
    let r = sum % 11; const d1 = r < 2 ? 0 : 11 - r;
    const w2 = [6,5,4,3,2,9,8,7,6,5,4,3,2];
    sum = 0; for (let i=0;i<13;i++) sum += (i===12?d1:vals[i])*w2[i];
    r = sum % 11; const d2 = r < 2 ? 0 : 11 - r;
    if (vals[12] === d1 && vals[13] === d2) {
      return { isValid: true, formatted: clean, normalized: clean, scheme: '2026' };
    }
    return { isValid: false, error: 'Documento 2026 inválido (DV)' };
  }
  return { isValid: false, error: 'Formato de documento não suportado' };
}
