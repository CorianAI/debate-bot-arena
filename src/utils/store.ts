import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { AIProfile, Comment, Post, Forum, OpenAISettings } from '@/types';

interface AppState {
  posts: Record<string, Post>;
  comments: Record<string, Comment>;
  profiles: Record<string, AIProfile>;
  forums: Record<string, Forum>;
  settings: OpenAISettings;
  selectedPostId: string | null;
  selectedForumId: string | null;
  isProcessing: boolean;
  
  // Actions
  addPost: (title: string, content: string, forumId: string) => string;
  addForum: (name: string, description: string, rules: string, systemPrompt: string) => string;
  addComment: (content: string, postId: string, authorId: string, parentId?: string | null) => string;
  addProfile: (profile: Omit<AIProfile, 'id'>) => string;
  updateProfile: (id: string, profile: Partial<AIProfile>) => void;
  setSelectedPost: (postId: string | null) => void;
  setSelectedForum: (forumId: string | null) => void;
  updatePost: (id: string, post: Partial<Post>) => void;
  updateComment: (id: string, comment: Partial<Comment>) => void;
  updateSettings: (settings: Partial<OpenAISettings>) => void;
  setIsProcessing: (isProcessing: boolean) => void;
  votePost: (id: string, value: number) => void;
  voteComment: (id: string, value: number) => void;
  deletePost: (id: string) => void;
  deleteComment: (id: string) => void;
  deleteProfile: (id: string) => void;
}

// Default AI profiles
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
  },
];

// Default forums
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

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      posts: {},
      comments: {},
      profiles: Object.fromEntries(defaultProfiles.map(profile => [profile.id, profile])),
      forums: Object.fromEntries(defaultForums.map(forum => [forum.id, forum])),
      settings: {
        apiKey: '',
        defaultModel: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
      },
      selectedPostId: null,
      selectedForumId: null,
      isProcessing: false,

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

      addComment: (content, postId, authorId, parentId = null) => {
        const id = uuidv4();
        const newComment: Comment = {
          id,
          content,
          authorId,
          parentId,
          createdAt: new Date(),
          votes: 0,
          replyIds: [],
        };

        set(state => {
          // Update the comments
          const newComments = {
            ...state.comments,
            [id]: newComment
          };

          // Update the parent (either a post or another comment)
          if (parentId === null) {
            // This is a top-level comment, update the post
            const post = state.posts[postId];
            if (!post) return { comments: newComments }; // Post not found

            const updatedPost = {
              ...post,
              commentIds: [...post.commentIds, id]
            };

            return {
              comments: newComments,
              posts: {
                ...state.posts,
                [postId]: updatedPost
              }
            };
          } else {
            // This is a reply, update the parent comment
            const parentComment = state.comments[parentId];
            if (!parentComment) return { comments: newComments }; // Parent comment not found

            const updatedParentComment = {
              ...parentComment,
              replyIds: [...parentComment.replyIds, id]
            };

            return {
              comments: {
                ...newComments,
                [parentId]: updatedParentComment
              }
            };
          }
        });

        return id;
      },

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

      setSelectedPost: (postId) => {
        set({ selectedPostId: postId });
      },

      setSelectedForum: (forumId) => {
        set({ selectedForumId: forumId });
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

      updateComment: (id, comment) => {
        set(state => {
          const existingComment = state.comments[id];
          if (!existingComment) return state;

          return {
            comments: {
              ...state.comments,
              [id]: { ...existingComment, ...comment }
            }
          };
        });
      },

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

      voteComment: (id, value) => {
        set(state => {
          const comment = state.comments[id];
          if (!comment) return state;

          return {
            comments: {
              ...state.comments,
              [id]: { ...comment, votes: comment.votes + value }
            }
          };
        });
      },

      deletePost: (id) => {
        set(state => {
          const { [id]: _, ...remainingPosts } = state.posts;
          
          // Also delete all comments associated with this post
          const commentsToKeep = Object.entries(state.comments).reduce((acc, [commentId, comment]) => {
            const post = state.posts[id];
            if (post && post.commentIds.includes(commentId)) {
              return acc; // Skip this comment
            }
            acc[commentId] = comment;
            return acc;
          }, {} as Record<string, Comment>);
          
          return {
            posts: remainingPosts,
            comments: commentsToKeep,
            selectedPostId: state.selectedPostId === id ? null : state.selectedPostId
          };
        });
      },

      deleteComment: (id) => {
        set(state => {
          const { [id]: commentToDelete, ...remainingComments } = state.comments;
          if (!commentToDelete) return state;

          // Remove comment from parent post or comment
          if (commentToDelete.parentId === null) {
            // This is a top-level comment, find the post it belongs to
            const updatedPosts = Object.entries(state.posts).reduce((acc, [postId, post]) => {
              if (post.commentIds.includes(id)) {
                acc[postId] = {
                  ...post,
                  commentIds: post.commentIds.filter(cId => cId !== id)
                };
              } else {
                acc[postId] = post;
              }
              return acc;
            }, {} as Record<string, Post>);

            return {
              comments: remainingComments,
              posts: updatedPosts
            };
          } else {
            // This is a reply, update the parent comment
            const parentComment = state.comments[commentToDelete.parentId];
            if (parentComment) {
              const updatedParentComment = {
                ...parentComment,
                replyIds: parentComment.replyIds.filter(rId => rId !== id)
              };

              return {
                comments: {
                  ...remainingComments,
                  [parentComment.id]: updatedParentComment
                }
              };
            }
          }

          return { comments: remainingComments };
        });
      },

      deleteProfile: (id) => {
        set(state => {
          const { [id]: _, ...remainingProfiles } = state.profiles;
          return { profiles: remainingProfiles };
        });
      },
    }),
    {
      name: 'ai-debate-storage',
    }
  )
);
