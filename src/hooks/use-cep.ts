import { useState, useCallback, useRef } from 'react';

export interface CEPData {
  cep: string;
  state: string;
  city: string;
  neighborhood: string;
  street: string;
  service: string;
}

export interface CEPHookResult {
  cepData: CEPData | null;
  isLoading: boolean;
  error: string | null;
  fetchCEP: (cep: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Hook for CEP auto-completion
 */
export function useCEP(): CEPHookResult {
  const [cepData, setCepData] = useState<CEPData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastFetchedCEP = useRef<string>('');

  const fetchCEP = useCallback(async (cep: string) => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setError('CEP deve ter 8 dígitos');
      return;
    }

    const cleanCEP = cep.replace(/\D/g, '');
    
    // Prevent duplicate requests for the same CEP
    if (cleanCEP === lastFetchedCEP.current && isLoading) {
      return;
    }

    lastFetchedCEP.current = cleanCEP;
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081'}/validation/cep/${cleanCEP}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao buscar CEP');
      }

      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.message);
      }

      setCepData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar CEP');
      setCepData(null);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    cepData,
    isLoading,
    error,
    fetchCEP,
    clearError,
  };
}
