
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState } from './types';
import { OpenAISettings, LLMProvider } from '@/types';

export interface SettingsSlice {
  settings: OpenAISettings;
  isProcessing: boolean;
  updateSettings: (settings: Partial<OpenAISettings>) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  addProvider: (provider: Omit<LLMProvider, 'id'>) => string;
  updateProvider: (id: string, provider: Partial<LLMProvider>) => void;
  deleteProvider: (id: string) => void;
  setDefaultProvider: (id: string) => void;
}

const defaultProviders: LLMProvider[] = [
  {
    id: 'openai-default',
    name: 'OpenAI',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    apiKey: '',
    models: [
      'gpt-4o-mini',
      'gpt-4o',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ],
    isDefault: true
  },
  {
    id: 'anthropic-default',
    name: 'Anthropic',
    endpoint: 'https://api.anthropic.com/v1/messages',
    apiKey: '',
    models: [
      'claude-3-opus',
      'claude-3-sonnet',
      'claude-3-haiku'
    ],
    isDefault: false
  },
  {
    id: 'openrouter-default',
    name: 'OpenRouter',
    endpoint: 'https://api.openrouter.ai/api/v1/chat/completions',
    apiKey: '',
    models: [
      'gpt-4o',
      'claude-3-opus',
      'claude-3-sonnet',
      'mixtral-8x7b',
      'llama-3-70b',
      'command-r'
    ],
    isDefault: false
  }
];

export const createSettingsSlice: StateCreator<AppState, [], [], SettingsSlice> = (set) => ({
  settings: {
    apiKey: '',
    defaultModel: 'gpt-4o-mini',
    temperature: 0.7,
    maxTokens: 500,
    minThreadReplies: 2,
    maxThreadReplies: 5,
    providers: Object.fromEntries(defaultProviders.map(provider => [provider.id, provider])),
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

  addProvider: (provider) => {
    const id = uuidv4();
    const newProvider = { ...provider, id };

    set(state => ({
      settings: {
        ...state.settings,
        providers: {
          ...state.settings.providers,
          [id]: newProvider
        }
      }
    }));

    return id;
  },

  updateProvider: (id, provider) => {
    set(state => {
      const existingProvider = state.settings.providers[id];
      if (!existingProvider) return state;

      return {
        settings: {
          ...state.settings,
          providers: {
            ...state.settings.providers,
            [id]: { ...existingProvider, ...provider }
          }
        }
      };
    });
  },

  deleteProvider: (id) => {
    set(state => {
      const { [id]: _, ...remainingProviders } = state.settings.providers;
      
      // If we're deleting the default provider, set a new default
      let providers = remainingProviders;
      if (state.settings.providers[id]?.isDefault && Object.keys(remainingProviders).length > 0) {
        const newDefaultId = Object.keys(remainingProviders)[0];
        providers = {
          ...remainingProviders,
          [newDefaultId]: {
            ...remainingProviders[newDefaultId],
            isDefault: true
          }
        };
      }
      
      return {
        settings: {
          ...state.settings,
          providers
        }
      };
    });
  },
  
  setDefaultProvider: (id) => {
    set(state => {
      const updatedProviders = { ...state.settings.providers };
      
      // Reset all providers to non-default
      Object.keys(updatedProviders).forEach(providerId => {
        if (updatedProviders[providerId].isDefault) {
          updatedProviders[providerId] = {
            ...updatedProviders[providerId],
            isDefault: false
          };
        }
      });
      
      // Set the new default provider
      if (updatedProviders[id]) {
        updatedProviders[id] = {
          ...updatedProviders[id],
          isDefault: true
        };
      }
      
      return {
        settings: {
          ...state.settings,
          providers: updatedProviders
        }
      };
    });
  }
});
