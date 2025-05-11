
import React, { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { generateAIResponse } from '@/utils/aiService';
import { ThumbsUp, ThumbsDown, Reply, Loader2 } from 'lucide-react';
import { AIProfileCard } from './AIProfile';
import { Textarea } from '@/components/ui/textarea';
import { AIProfile, Comment as CommentType } from '@/types';
import { cn } from '@/lib/utils';

interface CommentCardProps {
  commentId: string;
  isReply?: boolean;
  className?: string;
  depth?: number; // Track reply depth
}

const MAX_REPLY_DEPTH = 10; // Allow very deep nesting, but limit for performance

const CommentCard: React.FC<CommentCardProps> = ({ commentId, isReply = false, className, depth = 0 }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userReply, setUserReply] = useState('');
  const [showUserReplyForm, setShowUserReplyForm] = useState(false);
  
  const { 
    comments, 
    profiles, 
    settings, 
    voteComment, 
    addComment, 
    updateComment,
    selectedPostId,
    posts,
  } = useAppStore();
  
  const comment = comments[commentId];
  if (!comment) return null;

  const author = comment.authorId ? profiles[comment.authorId] : null;
  const replies = comment.replyIds
    .map(id => comments[id])
    .filter(Boolean);

  const handleGenerateReply = async (profileId: string) => {
    if (!selectedPostId) return;
    
    const profile = profiles[profileId];
    const post = posts?.[selectedPostId];
    
    if (!profile || !post) return;

    try {
      setIsLoading(true);
      
      // Create placeholder for the reply
      const newReplyId = addComment('', selectedPostId, profileId, comment.id);
      updateComment(newReplyId, { isGenerating: true });

      // Generate the AI response
      const postContext = post.content || '';  // Ensure not null
      const commentContext = comment.content || ''; // Ensure not null
      const context = `Original post: ${postContext}\n\nComment you are replying to: ${commentContext}`;
      
      try {
        const response = await generateAIResponse(commentContext, context, profile, settings);
        
        // Update the reply with the generated content
        updateComment(newReplyId, { 
          content: response || "Sorry, I couldn't generate a response.",
          isGenerating: false,
        });
      } catch (error) {
        console.error('Error generating reply:', error);
        // Set a fallback message if generation fails
        updateComment(newReplyId, { 
          content: "Sorry, I couldn't generate a response due to an error.",
          isGenerating: false,
        });
      }
    } catch (error) {
      console.error('Error generating reply:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplySubmit = async (profileIds: string[]) => {
    if (!selectedPostId) return;

    setShowReplyForm(false);
    
    for (const profileId of profileIds) {
      await handleGenerateReply(profileId);
    }
  };
  
  const handleUserReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (userReply.trim() && selectedPostId) {
      // Add the user's comment (null authorId means user-generated)
      addComment(userReply, selectedPostId, 'user', comment.id);
      setUserReply('');
      setShowUserReplyForm(false);
    }
  };

  const canShowNestedReplies = depth < MAX_REPLY_DEPTH;

  return (
    <div className={cn("mb-3", className)}>
      <Card className={isReply ? "border-l-4 border-l-primary/20" : ""}>
        <CardContent className="pt-4">
          {author ? (
            <div className="flex justify-between items-center mb-2">
              <AIProfileCard profile={author} isCompact />
              {comment.isGenerating && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Generating...
                </div>
              )}
            </div>
          ) : (
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">You</div>
              {comment.isGenerating && (
                <div className="flex items-center text-muted-foreground text-sm">
                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  Generating...
                </div>
              )}
            </div>
          )}
          
          <div className="py-2 whitespace-pre-wrap">
            {comment.content}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between pt-0">
          <div className="flex items-center gap-2">
            <button 
              className="vote-button" 
              onClick={() => voteComment(comment.id, 1)}
            >
              <ThumbsUp className="h-4 w-4 mr-1" /> 
              <span className="text-xs">{comment.votes > 0 ? comment.votes : ''}</span>
            </button>
            
            <button 
              className="vote-button" 
              onClick={() => voteComment(comment.id, -1)}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
            
            {canShowNestedReplies && (
              <>
                <button 
                  className="vote-button" 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                >
                  <Reply className="h-4 w-4 mr-1" /> 
                  <span className="text-xs">AI Reply</span>
                </button>
                
                <button 
                  className="vote-button" 
                  onClick={() => setShowUserReplyForm(!showUserReplyForm)}
                >
                  <Reply className="h-4 w-4 mr-1" /> 
                  <span className="text-xs">Reply</span>
                </button>
              </>
            )}
          </div>
          
          <span className="text-xs text-muted-foreground">
            {new Date(comment.createdAt).toLocaleString()}
          </span>
        </CardFooter>
      </Card>
      
      {showReplyForm && (
        <AIReplyForm 
          onSubmit={handleReplySubmit} 
          onCancel={() => setShowReplyForm(false)} 
        />
      )}
      
      {showUserReplyForm && (
        <form onSubmit={handleUserReplySubmit} className="mt-3 p-3 border rounded-md bg-background">
          <Textarea
            value={userReply}
            onChange={(e) => setUserReply(e.target.value)}
            placeholder="Write your reply..."
            className="mb-3"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setShowUserReplyForm(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!userReply.trim()}
            >
              Submit Reply
            </Button>
          </div>
        </form>
      )}
      
      {replies.length > 0 && (
        <div className="comment-thread pl-4 md:pl-6 mt-2">
          {replies.map(reply => (
            <CommentCard 
              key={reply.id} 
              commentId={reply.id} 
              isReply={true} 
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface AIReplyFormProps {
  onSubmit: (profileIds: string[]) => void;
  onCancel: () => void;
}

const AIReplyForm: React.FC<AIReplyFormProps> = ({ onSubmit, onCancel }) => {
  const { profiles } = useAppStore();
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  
  const toggleProfile = (profileId: string) => {
    setSelectedProfiles(prev => 
      prev.includes(profileId)
        ? prev.filter(id => id !== profileId)
        : [...prev, profileId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedProfiles.length > 0) {
      onSubmit(selectedProfiles);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 p-3 border rounded-md bg-background">
      <h4 className="font-medium mb-2">Select AI profiles to reply:</h4>
      
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.values(profiles || {}).map(profile => (
          <Button
            key={profile.id}
            type="button"
            variant={selectedProfiles.includes(profile.id) ? "default" : "outline"}
            className="flex items-center gap-2"
            onClick={() => toggleProfile(profile.id)}
          >
            <span className={cn("w-5 h-5 rounded-full flex items-center justify-center text-xs text-white", profile.color)}>
              {profile.avatar}
            </span>
            <span>{profile.name}</span>
          </Button>
        ))}
      </div>
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={selectedProfiles.length === 0}
        >
          Generate Replies
        </Button>
      </div>
    </form>
  );
};

export default CommentCard;
