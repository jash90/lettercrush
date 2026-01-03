/**
 * AdService - Singleton service for AdMob ad management
 * Handles banner and interstitial ads with state subscriptions
 */

import mobileAds, {
  InterstitialAd,
  AdEventType,
} from 'react-native-google-mobile-ads';
import { adConfig } from '../config/adConfig';

export interface AdServiceState {
  isInitialized: boolean;
  interstitialLoaded: boolean;
  interstitialError: Error | null;
  bannerVisible: boolean;
}

type StateListener = (state: AdServiceState) => void;

class AdService {
  private interstitial: InterstitialAd | null = null;
  private state: AdServiceState = {
    isInitialized: false,
    interstitialLoaded: false,
    interstitialError: null,
    bannerVisible: true,
  };
  private listeners: Set<StateListener> = new Set();

  /**
   * Initialize the ad service
   * Should be called on app startup
   */
  async initialize(): Promise<void> {
    if (this.state.isInitialized) return;

    try {
      // CRITICAL: Initialize the Google Mobile Ads SDK first
      await mobileAds().initialize();
      console.log('[AdService] SDK initialized');

      // Create interstitial ad instance
      this.interstitial = InterstitialAd.createForAdRequest(
        adConfig.unitIds.interstitial,
        adConfig.banner.requestOptions
      );

      // Set up event listeners
      this.setupInterstitialListeners();

      // Preload interstitial
      if (adConfig.interstitial.preloadOnInit) {
        this.loadInterstitial();
      }

      this.updateState({ isInitialized: true });
      console.log('[AdService] Initialized successfully');
    } catch (error) {
      console.error('[AdService] Initialization failed:', error);
      this.updateState({
        isInitialized: false,
        interstitialError: error as Error,
      });
    }
  }

  /**
   * Set up interstitial ad event listeners
   */
  private setupInterstitialListeners(): void {
    if (!this.interstitial) return;

    this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdService] Interstitial loaded');
      this.updateState({ interstitialLoaded: true, interstitialError: null });
    });

    this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
      console.error('[AdService] Interstitial error:', error);
      this.updateState({
        interstitialLoaded: false,
        interstitialError: error as unknown as Error,
      });
    });

    this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
      console.log('[AdService] Interstitial closed');
      // Preload next interstitial
      this.loadInterstitial();
    });
  }

  /**
   * Load/preload interstitial ad
   */
  loadInterstitial(): void {
    if (!this.interstitial) return;

    try {
      this.interstitial.load();
    } catch (error) {
      console.error('[AdService] Failed to load interstitial:', error);
      this.updateState({ interstitialError: error as Error });
    }
  }

  /**
   * Show interstitial ad (typically on game over)
   * Returns a promise that resolves when ad is CLOSED (not just shown)
   */
  async showInterstitial(): Promise<boolean> {
    if (!this.interstitial || !this.state.interstitialLoaded) {
      console.log('[AdService] Interstitial not ready');
      return false;
    }

    return new Promise((resolve) => {
      let unsubscribeClosed: (() => void) | null = null;
      let unsubscribeError: (() => void) | null = null;

      const cleanup = () => {
        unsubscribeClosed?.();
        unsubscribeError?.();
      };

      // One-time listener for when ad is closed
      const onClosed = () => {
        console.log('[AdService] Ad closed - resolving promise');
        cleanup();
        resolve(true);
      };

      // One-time listener for errors during display
      const onError = () => {
        console.log('[AdService] Ad error during display - resolving promise');
        cleanup();
        resolve(false);
      };

      // Add one-time listeners - store unsubscribe functions
      unsubscribeClosed = this.interstitial!.addAdEventListener(AdEventType.CLOSED, onClosed);
      unsubscribeError = this.interstitial!.addAdEventListener(AdEventType.ERROR, onError);

      // Show the ad
      this.interstitial!.show().catch((error) => {
        console.error('[AdService] Failed to show interstitial:', error);
        cleanup();
        resolve(false);
      });
    });
  }

  /**
   * Check if interstitial is ready to show
   */
  isInterstitialReady(): boolean {
    return this.state.interstitialLoaded;
  }

  /**
   * Get current service state
   */
  getState(): AdServiceState {
    return { ...this.state };
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Update state and notify listeners
   */
  private updateState(updates: Partial<AdServiceState>): void {
    this.state = { ...this.state, ...updates };
    this.listeners.forEach((listener) => listener(this.state));
  }

  /**
   * Set banner visibility (hide during certain game phases)
   */
  setBannerVisible(visible: boolean): void {
    this.updateState({ bannerVisible: visible });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    this.interstitial?.removeAllListeners();
    this.interstitial = null;
    this.listeners.clear();
    this.state = {
      isInitialized: false,
      interstitialLoaded: false,
      interstitialError: null,
      bannerVisible: true,
    };
  }
}

// Singleton instance
let adServiceInstance: AdService | null = null;

/**
 * Get the singleton AdService instance
 */
export function getAdService(): AdService {
  if (!adServiceInstance) {
    adServiceInstance = new AdService();
  }
  return adServiceInstance;
}

/**
 * Reset the service (for testing)
 */
export function resetAdService(): void {
  adServiceInstance?.destroy();
  adServiceInstance = null;
}
