
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AppState } from './types';
import { createPostsSlice } from './posts';
import { createCommentsSlice } from './comments';
import { createForumsSlice } from './forums';
import { createProfilesSlice } from './profiles';
import { createSettingsSlice } from './settings';

export const useAppStore = create<AppState>()(
  persist(
    (...a) => ({
      ...createPostsSlice(...a),
      ...createCommentsSlice(...a),
      ...createForumsSlice(...a),
      ...createProfilesSlice(...a),
      ...createSettingsSlice(...a),
    }),
    {
      name: 'ai-debate-storage',
    }
  )
);
