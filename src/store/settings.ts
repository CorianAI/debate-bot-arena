
import { StateCreator } from 'zustand';
import { AppState } from './types';
import { OpenAISettings } from '@/types';

export interface SettingsSlice {
  settings: OpenAISettings;
  isProcessing: boolean;
  updateSettings: (settings: Partial<OpenAISettings>) => void;
  setIsProcessing: (isProcessing: boolean) => void;
}

export const createSettingsSlice: StateCreator<AppState, [], [], SettingsSlice> = (set) => ({
  settings: {
    apiKey: '',
    defaultModel: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
  },
  isProcessing: false,

  updateSettings: (settings) => {
    set(state => ({
      settings: {
        ...state.settings,
        ...settings
      }
    }));
  },

  setIsProcessing: (isProcessing) => {
    set({ isProcessing });
  },
});
