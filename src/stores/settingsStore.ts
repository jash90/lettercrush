/**
 * Settings Store
 * Manages user preferences (sound, haptics) with persistence
 * Uses platform-specific storage (localStorage for web, SecureStore for native)
 */

import { create } from 'zustand';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { logger } from '../utils/logger';

const SETTINGS_STORAGE_KEY = 'lettercrush_settings';

// Platform-specific storage abstraction
const storage = {
  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return typeof localStorage !== 'undefined' ? localStorage.getItem(key) : null;
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(key, value);
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch (error) {
      logger.warn('[Storage] Failed to save settings:', error);
    }
  },
};

export type AnimationSpeed = 'fast' | 'normal' | 'slow';

interface SettingsState {
  // Audio/Haptics
  soundEnabled: boolean;
  hapticsEnabled: boolean;

  // Preferences
  animationSpeed: AnimationSpeed;

  // Loading state
  isLoaded: boolean;
}

interface SettingsActions {
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  setAnimationSpeed: (speed: AnimationSpeed) => Promise<void>;
  loadSettings: () => Promise<void>;
  resetToDefaults: () => Promise<void>;
}

type SettingsStore = SettingsState & SettingsActions;

// Default settings
const DEFAULT_SETTINGS: Omit<SettingsState, 'isLoaded'> = {
  soundEnabled: true,
  hapticsEnabled: true,
  animationSpeed: 'normal',
};

// Helper to persist settings
async function persistSettings(settings: Omit<SettingsState, 'isLoaded'>): Promise<void> {
  try {
    await storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    logger.error('[SettingsStore] Failed to persist settings:', error);
  }
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  // Initial state
  soundEnabled: true,
  hapticsEnabled: true,
  animationSpeed: 'normal',
  isLoaded: false,

  setSoundEnabled: async (enabled: boolean) => {
    set({ soundEnabled: enabled });
    const { hapticsEnabled, animationSpeed } = get();
    await persistSettings({
      soundEnabled: enabled,
      hapticsEnabled,
      animationSpeed,
    });
  },

  setHapticsEnabled: async (enabled: boolean) => {
    set({ hapticsEnabled: enabled });
    const { soundEnabled, animationSpeed } = get();
    await persistSettings({
      soundEnabled,
      hapticsEnabled: enabled,
      animationSpeed,
    });
  },

  setAnimationSpeed: async (speed: AnimationSpeed) => {
    set({ animationSpeed: speed });
    const { soundEnabled, hapticsEnabled } = get();
    await persistSettings({
      soundEnabled,
      hapticsEnabled,
      animationSpeed: speed,
    });
  },

  loadSettings: async () => {
    try {
      const stored = await storage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<Omit<SettingsState, 'isLoaded'>>;
        set({
          soundEnabled: parsed.soundEnabled ?? DEFAULT_SETTINGS.soundEnabled,
          hapticsEnabled: parsed.hapticsEnabled ?? DEFAULT_SETTINGS.hapticsEnabled,
          animationSpeed: parsed.animationSpeed ?? DEFAULT_SETTINGS.animationSpeed,
          isLoaded: true,
        });
      } else {
        set({ isLoaded: true });
      }
    } catch (error) {
      logger.error('[SettingsStore] Failed to load settings:', error);
      set({ isLoaded: true });
    }
  },

  resetToDefaults: async () => {
    set({
      ...DEFAULT_SETTINGS,
    });
    await persistSettings(DEFAULT_SETTINGS);
  },
}));

// Selectors for optimized subscriptions
export const settingsSelectors = {
  soundEnabled: (state: SettingsStore) => state.soundEnabled,
  hapticsEnabled: (state: SettingsStore) => state.hapticsEnabled,
  animationSpeed: (state: SettingsStore) => state.animationSpeed,
  isLoaded: (state: SettingsStore) => state.isLoaded,
};
