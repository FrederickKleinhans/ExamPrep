import { create } from 'zustand';

type PreferencesState = {
  analyticsEnabled: boolean;
  debugMode: boolean;
  setAnalyticsEnabled: (enabled: boolean) => void;
  toggleAnalytics: () => void;
  setDebugMode: (enabled: boolean) => void;
  toggleDebugMode: () => void;
};

function getInitialAnalyticsEnabled(): boolean {
  try {
    const stored = localStorage.getItem('certready_analytics_enabled');
    if (stored === 'true') return true;
    if (stored === 'false') return false;
  } catch {
    // Ignore localStorage errors
  }
  return true;
}

function getInitialDebugMode(): boolean {
  try {
    return localStorage.getItem('certready_debug_mode') === 'true';
  } catch {
    return false;
  }
}

function persistPreference(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore
  }
}

export const usePreferences = create<PreferencesState>((set) => ({
  analyticsEnabled: getInitialAnalyticsEnabled(),
  debugMode: getInitialDebugMode(),
  setAnalyticsEnabled: (enabled) => {
    persistPreference('certready_analytics_enabled', String(enabled));
    set({ analyticsEnabled: enabled });
  },
  toggleAnalytics: () =>
    set((state) => {
      const next = !state.analyticsEnabled;
      persistPreference('certready_analytics_enabled', String(next));
      return { analyticsEnabled: next };
    }),
  setDebugMode: (enabled) => {
    persistPreference('certready_debug_mode', String(enabled));
    set({ debugMode: enabled });
  },
  toggleDebugMode: () =>
    set((state) => {
      const next = !state.debugMode;
      persistPreference('certready_debug_mode', String(next));
      return { debugMode: next };
    }),
}));
