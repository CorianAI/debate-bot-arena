
import { PostsSlice } from './posts';
import { CommentsSlice } from './comments';
import { ForumsSlice } from './forums';
import { ProfilesSlice } from './profiles';
import { SettingsSlice } from './settings';

export type AppState = PostsSlice & CommentsSlice & ForumsSlice & ProfilesSlice & SettingsSlice;
