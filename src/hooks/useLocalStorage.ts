import { useEffect, useState, useCallback } from "react";
import { loadSettings, saveSettings, AppSettings, defaultSettings } from "../stores/settingsStore";

export function useSettings() {
  const [settings, setSettingsState] = useState<AppSettings>(defaultSettings);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    loadSettings().then(s => {
      setSettingsState(s);
      setLoaded(true);
    });
  }, []);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettingsState(newSettings);
    await saveSettings(newSettings);
  }, [settings]);

  return { settings, updateSettings, loaded };
}
