import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThumbsUp, ThumbsDown, MessageSquare, Loader2 } from 'lucide-react';
import { useAppStore } from '@/store';
import { generateMultipleResponses } from '@/utils/aiService';
import { Post as PostType, Forum } from '@/types';
import { AIProfileCard } from './AIProfile';
import CommentCard from './Comment';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: PostType;
  isCompact?: boolean;
  forum?: Forum;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isCompact = false, forum }) => {
  const { 
    setSelectedPost, 
    votePost, 
    comments, 
    profiles,
    addComment,
    updateComment,
  } = useAppStore();
  
  const commentCount = post.commentIds.length;
  const topLevelComments = post.commentIds
    .map(id => comments[id])
    .filter(comment => comment && comment.parentId === null);

  if (isCompact) {
    return (
      <Card className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedPost(post.id)}>
        <CardHeader className="pb-2">
          <h2 className="text-lg font-bold">{post.title}</h2>
          {post.authorId && profiles[post.authorId] && (
            <AIProfileCard profile={profiles[post.authorId]} isCompact className="mt-2" />
          )}
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-muted-foreground line-clamp-3">{post.content}</p>
        </CardContent>
        <CardFooter className="pt-0">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <ThumbsUp className="h-4 w-4 mr-1" /> 
              <span>{post.votes}</span>
            </div>
            <div className="flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" /> 
              <span>{commentCount}</span>
            </div>
            <div>
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <h1 className="text-2xl font-bold mb-2">{post.title}</h1>
          {post.authorId && profiles[post.authorId] && (
            <AIProfileCard profile={profiles[post.authorId]} isCompact className="mt-2" />
          )}
          {post.isGenerating && (
            <div className="flex items-center text-muted-foreground mt-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating responses...
            </div>
          )}
          <div className="text-xs text-muted-foreground mt-1">
            Posted on {new Date(post.createdAt).toLocaleString()}
          </div>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{post.content}</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="flex items-center gap-2">
            <button 
              className="vote-button" 
              onClick={() => votePost(post.id, 1)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" /> 
              <span className="text-sm">{post.votes}</span>
            </button>
            <button 
              className="vote-button" 
              onClick={() => votePost(post.id, -1)}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <Badge variant="outline">
            <MessageSquare className="h-4 w-4 mr-1" /> 
            {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </Badge>
        </CardFooter>
      </Card>

      <AIDebateSection postId={post.id} forum={forum} />

      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">Comments</h2>
        {topLevelComments.length === 0 ? (
          <div className="text-center p-6 text-muted-foreground">
            No comments yet. Generate some AI responses above!
          </div>
        ) : (
          topLevelComments.map(comment => (
            <CommentCard key={comment.id} commentId={comment.id} />
          ))
        )}
      </div>
    </div>
  );
};

interface AIDebateSectionProps {
  postId: string;
  forum?: Forum;
}

const AIDebateSection: React.FC<AIDebateSectionProps> = ({ postId, forum }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  
  const { 
    profiles, 
    posts, 
    settings,
    addComment,
    updateComment,
    updatePost,
  } = useAppStore();
  
  const post = posts[postId];
  if (!post) return null;
  
  const toggleProfile = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };
  
  const handleGenerateResponses = async () => {
    if (selectedProfiles.length === 0) return;
    
    try {
      setIsLoading(true);
      updatePost(postId, { isGenerating: true });
      
      // Create placeholder comments
      const commentIds = selectedProfiles.map(profileId => {
        const id = addComment('', postId, profileId, null);
        updateComment(id, { isGenerating: true });
        return { id, profileId };
      });
      
      // Generate AI responses
      await generateMultipleResponses(
        post.title + '\n\n' + post.content,
        forum?.systemPrompt || '',
        selectedProfiles.map(id => profiles[id]).filter(Boolean),
        settings,
        forum,
        (profileId, response) => {
          const commentData = commentIds.find(c => c.profileId === profileId);
          if (commentData) {
            updateComment(commentData.id, { 
              content: response,
              isGenerating: false,
            });
          }
        }
      );
      
      setSelectedProfiles([]);
    } catch (error) {
      console.error('Error generating responses:', error);
    } finally {
      setIsLoading(false);
      updatePost(postId, { isGenerating: false });
    }
  };
  
  return (
    <div className="bg-secondary/30 rounded-lg p-4 mb-6">
      <h2 className="text-lg font-medium mb-3">Generate AI Debate</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Select AI profiles to respond to this post:
      </p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.values(profiles).map(profile => (
          <Button
            key={profile.id}
            type="button"
            variant={selectedProfiles.includes(profile.id) ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleProfile(profile.id)}
            disabled={isLoading}
          >
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs text-white", profile.color)}>
              {profile.avatar}
            </span>
            <span>{profile.name}</span>
          </Button>
        ))}
      </div>
      
      <Button 
        onClick={handleGenerateResponses} 
        disabled={selectedProfiles.length === 0 || isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Generating...
          </>
        ) : (
          'Generate AI Responses'
        )}
      </Button>
    </div>
  );
};

export default PostCard;
