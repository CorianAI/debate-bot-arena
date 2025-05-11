
import React, { useEffect } from 'react';
import { useAppStore } from '@/store';
import Header from '@/components/Header';
import PostCard from '@/components/Post';
import NewPostForm from '@/components/NewPostForm';
import ForumSelector from '@/components/ForumSelector';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { posts, selectedPostId, selectedForumId, settings, forums } = useAppStore();
  
  // Show a warning if API key is not set
  useEffect(() => {
    if (!settings.apiKey) {
      toast.warning(
        "API key not set", 
        { 
          description: "Please set your API key in settings to enable AI responses",
          duration: 5000,
        }
      );
    }
  }, [settings.apiKey]);
  
  // Selected post view
  if (selectedPostId) {
    const post = posts[selectedPostId];
    if (!post) return null;
    
    const forum = forums[post.forumId];
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          {forum && (
            <div className="mb-4">
              <h1 className="text-lg font-medium">{forum.name}</h1>
              <p className="text-sm text-muted-foreground">{forum.description}</p>
            </div>
          )}
          <PostCard post={post} forum={forum} />
        </main>
      </div>
    );
  }
  
  // Posts list or forum selection view
  const sortedPosts = Object.values(posts)
    .filter(post => !selectedForumId || post.forumId === selectedForumId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const selectedForum = selectedForumId ? forums[selectedForumId] : null;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {selectedForumId ? (
              <>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold">{selectedForum?.name}</h2>
                  <p className="text-muted-foreground">{selectedForum?.description}</p>
                </div>
                
                {selectedForum && selectedForum.rules && (
                  <div className="p-4 bg-muted/20 rounded-lg mb-6 border">
                    <h3 className="font-medium mb-2">Forum Rules</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedForum.rules}</p>
                  </div>
                )}
                
                <h3 className="text-xl font-bold mb-6">Discussions</h3>
                {sortedPosts.length === 0 ? (
                  <div className="text-center p-8 border rounded-lg bg-muted/20">
                    <p className="text-muted-foreground">
                      No discussions yet. Start a new one!
                    </p>
                  </div>
                ) : (
                  sortedPosts.map(post => (
                    <PostCard key={post.id} post={post} isCompact forum={selectedForum} />
                  ))
                )}
              </>
            ) : (
              <ForumSelector />
            )}
          </div>
          
          <div>
            {selectedForumId ? (
              <>
                <h2 className="text-2xl font-bold mb-6">Start a New Discussion</h2>
                <NewPostForm />
              </>
            ) : (
              <div className="p-4 bg-secondary/30 rounded-lg">
                <h3 className="font-medium mb-2">Welcome to AI Debate Forums</h3>
                <p className="text-sm text-muted-foreground">
                  Select a forum on the left to view discussions or start a new one.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
