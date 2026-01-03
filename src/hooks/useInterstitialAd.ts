/**
 * useInterstitialAd Hook
 * Manages interstitial ad lifecycle for game over screen
 */

import { useEffect, useCallback, useState } from 'react';
import { getAdService } from '../services/AdService';

interface UseInterstitialAdResult {
  isLoaded: boolean;
  isShowing: boolean;
  showAd: () => Promise<boolean>;
  error: Error | null;
}

export function useInterstitialAd(): UseInterstitialAdResult {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const adService = getAdService();

    // Subscribe to state changes
    const unsubscribe = adService.subscribe((state) => {
      setIsLoaded(state.interstitialLoaded);
      setError(state.interstitialError);
    });

    // Get initial state
    const initialState = adService.getState();
    setIsLoaded(initialState.interstitialLoaded);
    setError(initialState.interstitialError);

    return unsubscribe;
  }, []);

  const showAd = useCallback(async (): Promise<boolean> => {
    const adService = getAdService();
    setIsShowing(true);

    try {
      const shown = await adService.showInterstitial();
      return shown;
    } finally {
      setIsShowing(false);
    }
  }, []);

  return {
    isLoaded,
    isShowing,
    showAd,
    error,
  };
}
