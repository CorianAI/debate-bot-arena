
import { StateCreator } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { AppState } from './types';
import { Comment, Post } from '@/types';

export interface CommentsSlice {
  comments: Record<string, Comment>;
  addComment: (content: string, postId: string, authorId: string, parentId?: string | null) => string;
  updateComment: (id: string, comment: Partial<Comment>) => void;
  voteComment: (id: string, value: number) => void;
  deleteComment: (id: string) => void;
}

export const createCommentsSlice: StateCreator<AppState, [], [], CommentsSlice> = (set) => ({
  comments: {},

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
      const newComments = {
        ...state.comments,
        [id]: newComment
      };

      if (parentId === null) {
        const post = state.posts[postId];
        if (!post) return { comments: newComments };

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
        const parentComment = state.comments[parentId];
        if (!parentComment) return { comments: newComments };

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

  deleteComment: (id) => {
    set(state => {
      const { [id]: commentToDelete, ...remainingComments } = state.comments;
      if (!commentToDelete) return state;

      if (commentToDelete.parentId === null) {
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
});
