
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState } from './types';
import { Forum } from '@/types';

export interface ForumsSlice {
  forums: Record<string, Forum>;
  selectedForumId: string | null;
  addForum: (name: string, description: string, rules: string, systemPrompt: string) => string;
  setSelectedForum: (forumId: string | null) => void;
}

const defaultForums: Forum[] = [
  {
    id: '1',
    name: 'Project Ideas',
    description: 'Share and discuss project ideas',
    rules: 'Be constructive with criticism. No personal attacks.',
    systemPrompt: 'This is a forum for discussing project ideas. Consider technical feasibility, market potential, and implementation challenges in your responses.'
  },
  {
    id: '2',
    name: 'Tech Debate',
    description: 'Debate technology choices and trends',
    rules: 'Back up claims with examples. Stay on topic.',
    systemPrompt: 'This is a forum for debating technology choices. Consider scalability, maintainability, and real-world applications in your responses.'
  }
];

export const createForumsSlice: StateCreator<AppState, [], [], ForumsSlice> = (set) => ({
  forums: Object.fromEntries(defaultForums.map(forum => [forum.id, forum])),
  selectedForumId: null,

  addForum: (name, description, rules, systemPrompt) => {
    const id = uuidv4();
    const newForum: Forum = {
      id,
      name,
      description,
      rules,
      systemPrompt
    };

    set(state => ({
      forums: {
        ...state.forums,
        [id]: newForum
      }
    }));

    return id;
  },

  setSelectedForum: (forumId) => {
    set({ selectedForumId: forumId });
  },
});
