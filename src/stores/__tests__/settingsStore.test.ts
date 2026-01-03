/**
 * Settings Store Tests
 * Tests for user preferences state management and persistence
 */

import { useSettingsStore, settingsSelectors, AnimationSpeed } from '../settingsStore';

// Helper to wrap state updates
const act = async (callback: () => Promise<void> | void) => {
  await callback();
};

describe('settingsStore', () => {
  // Reset store before each test
  beforeEach(() => {
    act(() => {
      useSettingsStore.setState({
        soundEnabled: true,
        hapticsEnabled: true,
        animationSpeed: 'normal',
        isLoaded: false,
      });
    });
  });

  describe('initial state', () => {
    it('should have sound enabled by default', () => {
      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(true);
    });

    it('should have haptics enabled by default', () => {
      const state = useSettingsStore.getState();
      expect(state.hapticsEnabled).toBe(true);
    });

    it('should have normal animation speed by default', () => {
      const state = useSettingsStore.getState();
      expect(state.animationSpeed).toBe('normal');
    });

    it('should not be loaded initially', () => {
      const state = useSettingsStore.getState();
      expect(state.isLoaded).toBe(false);
    });
  });

  describe('setSoundEnabled', () => {
    it('should set sound enabled to true', async () => {
      await act(async () => {
        await useSettingsStore.getState().setSoundEnabled(true);
      });

      expect(useSettingsStore.getState().soundEnabled).toBe(true);
    });

    it('should set sound enabled to false', async () => {
      await act(async () => {
        await useSettingsStore.getState().setSoundEnabled(false);
      });

      expect(useSettingsStore.getState().soundEnabled).toBe(false);
    });

    it('should not affect other settings', async () => {
      await act(async () => {
        await useSettingsStore.getState().setSoundEnabled(false);
      });

      const state = useSettingsStore.getState();
      expect(state.hapticsEnabled).toBe(true);
      expect(state.animationSpeed).toBe('normal');
    });
  });

  describe('setHapticsEnabled', () => {
    it('should set haptics enabled to true', async () => {
      await act(async () => {
        await useSettingsStore.getState().setHapticsEnabled(true);
      });

      expect(useSettingsStore.getState().hapticsEnabled).toBe(true);
    });

    it('should set haptics enabled to false', async () => {
      await act(async () => {
        await useSettingsStore.getState().setHapticsEnabled(false);
      });

      expect(useSettingsStore.getState().hapticsEnabled).toBe(false);
    });

    it('should not affect other settings', async () => {
      await act(async () => {
        await useSettingsStore.getState().setHapticsEnabled(false);
      });

      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(true);
      expect(state.animationSpeed).toBe('normal');
    });
  });

  describe('setAnimationSpeed', () => {
    it('should set animation speed to fast', async () => {
      await act(async () => {
        await useSettingsStore.getState().setAnimationSpeed('fast');
      });

      expect(useSettingsStore.getState().animationSpeed).toBe('fast');
    });

    it('should set animation speed to normal', async () => {
      // First set to something else
      await act(async () => {
        await useSettingsStore.getState().setAnimationSpeed('slow');
      });

      await act(async () => {
        await useSettingsStore.getState().setAnimationSpeed('normal');
      });

      expect(useSettingsStore.getState().animationSpeed).toBe('normal');
    });

    it('should set animation speed to slow', async () => {
      await act(async () => {
        await useSettingsStore.getState().setAnimationSpeed('slow');
      });

      expect(useSettingsStore.getState().animationSpeed).toBe('slow');
    });

    it('should not affect other settings', async () => {
      await act(async () => {
        await useSettingsStore.getState().setAnimationSpeed('fast');
      });

      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(true);
      expect(state.hapticsEnabled).toBe(true);
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all settings to defaults', async () => {
      // Change all settings first
      await act(async () => {
        await useSettingsStore.getState().setSoundEnabled(false);
        await useSettingsStore.getState().setHapticsEnabled(false);
        await useSettingsStore.getState().setAnimationSpeed('slow');
      });

      // Reset to defaults
      await act(async () => {
        await useSettingsStore.getState().resetToDefaults();
      });

      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(true);
      expect(state.hapticsEnabled).toBe(true);
      expect(state.animationSpeed).toBe('normal');
    });
  });

  describe('loadSettings', () => {
    it('should set isLoaded to true after loading', async () => {
      await act(async () => {
        await useSettingsStore.getState().loadSettings();
      });

      expect(useSettingsStore.getState().isLoaded).toBe(true);
    });

    it('should handle empty storage gracefully', async () => {
      await act(async () => {
        await useSettingsStore.getState().loadSettings();
      });

      // Should maintain defaults when nothing is stored
      const state = useSettingsStore.getState();
      expect(state.soundEnabled).toBe(true);
      expect(state.hapticsEnabled).toBe(true);
      expect(state.animationSpeed).toBe('normal');
    });
  });

  describe('selectors', () => {
    it('should select soundEnabled', () => {
      const state = useSettingsStore.getState();
      expect(settingsSelectors.soundEnabled(state)).toBe(true);
    });

    it('should select hapticsEnabled', () => {
      const state = useSettingsStore.getState();
      expect(settingsSelectors.hapticsEnabled(state)).toBe(true);
    });

    it('should select animationSpeed', () => {
      const state = useSettingsStore.getState();
      expect(settingsSelectors.animationSpeed(state)).toBe('normal');
    });

    it('should select isLoaded', () => {
      const state = useSettingsStore.getState();
      expect(settingsSelectors.isLoaded(state)).toBe(false);
    });

    it('should reflect updated values', async () => {
      await act(async () => {
        await useSettingsStore.getState().setSoundEnabled(false);
        await useSettingsStore.getState().setHapticsEnabled(false);
        await useSettingsStore.getState().setAnimationSpeed('fast');
      });

      const state = useSettingsStore.getState();
      expect(settingsSelectors.soundEnabled(state)).toBe(false);
      expect(settingsSelectors.hapticsEnabled(state)).toBe(false);
      expect(settingsSelectors.animationSpeed(state)).toBe('fast');
    });
  });

  describe('type safety', () => {
    it('should accept valid AnimationSpeed values', () => {
      const validSpeeds: AnimationSpeed[] = ['fast', 'normal', 'slow'];

      validSpeeds.forEach(speed => {
        expect(['fast', 'normal', 'slow']).toContain(speed);
      });
    });
  });

  describe('state independence', () => {
    it('should maintain separate boolean states', async () => {
      // Sound off, haptics on
      await act(async () => {
        await useSettingsStore.getState().setSoundEnabled(false);
      });

      const state1 = useSettingsStore.getState();
      expect(state1.soundEnabled).toBe(false);
      expect(state1.hapticsEnabled).toBe(true);

      // Sound on, haptics off
      await act(async () => {
        await useSettingsStore.getState().setSoundEnabled(true);
        await useSettingsStore.getState().setHapticsEnabled(false);
      });

      const state2 = useSettingsStore.getState();
      expect(state2.soundEnabled).toBe(true);
      expect(state2.hapticsEnabled).toBe(false);
    });
  });
});
