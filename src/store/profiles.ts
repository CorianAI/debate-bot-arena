
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState } from './types';
import { AIProfile } from '@/types';

export interface ProfilesSlice {
  profiles: Record<string, AIProfile>;
  addProfile: (profile: Omit<AIProfile, 'id'>) => string;
  updateProfile: (id: string, profile: Partial<AIProfile>) => void;
  deleteProfile: (id: string) => void;
}

const defaultProfiles: AIProfile[] = [
  {
    id: '1',
    name: 'CriticalThinker',
    avatar: '😑',
    personality: 'Always questions assumptions and pokes holes in ideas',
    prompt: 'You are highly skeptical and critical. Find flaws and weaknesses in the argument presented.',
    color: 'bg-red-500',
    model: 'gpt-4o-mini',
    endpoint: 'openai'
  },
  {
    id: '2',
    name: 'OptimistView',
    avatar: '😊',
    personality: 'Always sees the positive side and defends new ideas',
    prompt: 'You are extremely optimistic and supportive. Defend the idea with enthusiasm and highlight its potential benefits.',
    color: 'bg-green-500',
    model: 'claude-3-opus',
    endpoint: 'anthropic'
  },
  {
    id: '3',
    name: 'PragmaticOne',
    avatar: '🤔',
    personality: 'Focuses on practical implementation and reality',
    prompt: 'You are practical and realistic. Evaluate the idea based on feasibility and implementation challenges.',
    color: 'bg-blue-500',
    model: 'gpt-4o-mini',
    endpoint: 'openai'
  },
  {
    id: '4',
    name: 'DevilsAdvocate',
    avatar: '😈',
    personality: 'Takes contrary positions for the sake of debate',
    prompt: 'You play devil\'s advocate. Present counterarguments that challenge the main idea.',
    color: 'bg-purple-500',
    model: 'claude-3-opus',
    endpoint: 'anthropic'
  },
  {
    id: '5',
    name: 'FactChecker',
    avatar: '🧐',
    personality: 'Concerned with accuracy and truthfulness',
    prompt: 'You are detail-oriented and focused on facts. Question any unsupported claims or logical fallacies.',
    color: 'bg-yellow-500',
    model: 'gpt-4o-mini',
    endpoint: 'openai'
  }
];

export const createProfilesSlice: StateCreator<AppState, [], [], ProfilesSlice> = (set) => ({
  profiles: Object.fromEntries(defaultProfiles.map(profile => [profile.id, profile])),

  addProfile: (profile) => {
    const id = uuidv4();
    const newProfile = { ...profile, id };

    set(state => ({
      profiles: {
        ...state.profiles,
        [id]: newProfile
      }
    }));

    return id;
  },

  updateProfile: (id, profile) => {
    set(state => {
      const existingProfile = state.profiles[id];
      if (!existingProfile) return state;

      return {
        profiles: {
          ...state.profiles,
          [id]: { ...existingProfile, ...profile }
        }
      };
    });
  },

  deleteProfile: (id) => {
    set(state => {
      const { [id]: _, ...remainingProfiles } = state.profiles;
      return { profiles: remainingProfiles };
    });
  },
});
