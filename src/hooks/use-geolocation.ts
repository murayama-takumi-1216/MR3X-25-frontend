import { useState, useCallback, useEffect } from 'react';

export interface GeolocationState {
  loading: boolean;
  error: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  timestamp: number | null;
}

export interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  autoFetch?: boolean;
}

export function useGeolocation(options: UseGeolocationOptions = {}) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    autoFetch = false,
  } = options;

  const [state, setState] = useState<GeolocationState>({
    loading: false,
    error: null,
    latitude: null,
    longitude: null,
    accuracy: null,
    timestamp: null,
  });

  const [supported, setSupported] = useState<boolean>(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setSupported(false);
      setState((prev) => ({
        ...prev,
        error: 'Geolocalização não é suportada pelo seu navegador',
      }));
    }
  }, []);

  const getLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalização não é suportada pelo seu navegador'));
        return;
      }

      setState((prev) => ({ ...prev, loading: true, error: null }));

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setState({
            loading: false,
            error: null,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          });
          resolve(position);
        },
        (error) => {
          let errorMessage = 'Erro ao obter localização';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage =
                'Permissão de localização negada. Por favor, habilite nas configurações do navegador.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage =
                'Localização indisponível. Verifique se o GPS está habilitado.';
              break;
            case error.TIMEOUT:
              errorMessage =
                'Tempo esgotado ao obter localização. Tente novamente.';
              break;
          }

          setState((prev) => ({
            ...prev,
            loading: false,
            error: errorMessage,
          }));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      );
    });
  }, [enableHighAccuracy, timeout, maximumAge]);

  useEffect(() => {
    if (autoFetch && supported) {
      getLocation().catch(() => {
        
      });
    }
  }, [autoFetch, supported, getLocation]);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const reset = useCallback(() => {
    setState({
      loading: false,
      error: null,
      latitude: null,
      longitude: null,
      accuracy: null,
      timestamp: null,
    });
  }, []);

  return {
    ...state,
    supported,
    getLocation,
    clearError,
    reset,
    hasLocation: state.latitude !== null && state.longitude !== null,
  };
}

export default useGeolocation;
