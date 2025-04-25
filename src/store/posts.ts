
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState } from './types';
import { Post } from '@/types';

export interface PostsSlice {
  posts: Record<string, Post>;
  selectedPostId: string | null;
  addPost: (title: string, content: string, forumId: string) => string;
  updatePost: (id: string, post: Partial<Post>) => void;
  setSelectedPost: (postId: string | null) => void;
  votePost: (id: string, value: number) => void;
  deletePost: (id: string) => void;
}

export const createPostsSlice: StateCreator<AppState, [], [], PostsSlice> = (set) => ({
  posts: {},
  selectedPostId: null,

  addPost: (title, content, forumId) => {
    const id = uuidv4();
    const newPost: Post = {
      id,
      title,
      content,
      authorId: null,
      forumId,
      createdAt: new Date(),
      votes: 0,
      commentIds: [],
    };

    set(state => ({
      posts: {
        ...state.posts,
        [id]: newPost
      },
      selectedPostId: id
    }));

    return id;
  },

  updatePost: (id, post) => {
    set(state => {
      const existingPost = state.posts[id];
      if (!existingPost) return state;

      return {
        posts: {
          ...state.posts,
          [id]: { ...existingPost, ...post }
        }
      };
    });
  },

  setSelectedPost: (postId) => {
    set({ selectedPostId: postId });
  },

  votePost: (id, value) => {
    set(state => {
      const post = state.posts[id];
      if (!post) return state;

      return {
        posts: {
          ...state.posts,
          [id]: { ...post, votes: post.votes + value }
        }
      };
    });
  },

  deletePost: (id) => {
    set(state => {
      const { [id]: _, ...remainingPosts } = state.posts;
      
      return {
        posts: remainingPosts,
        selectedPostId: state.selectedPostId === id ? null : state.selectedPostId
      };
    });
  },
});
