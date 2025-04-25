
import React, { useEffect } from 'react';
import { useAppStore } from '@/utils/store';
import Header from '@/components/Header';
import PostCard from '@/components/Post';
import NewPostForm from '@/components/NewPostForm';
import { toast } from 'sonner';

const Index: React.FC = () => {
  const { posts, selectedPostId, settings } = useAppStore();
  
  // Show a warning if API key is not set
  useEffect(() => {
    if (!settings.apiKey) {
      toast.warning(
        "OpenAI API key not set", 
        { 
          description: "Please set your OpenAI API key in settings to enable AI responses",
          duration: 5000,
        }
      );
    }
  }, [settings.apiKey]);
  
  // Selected post view
  if (selectedPostId) {
    const post = posts[selectedPostId];
    if (!post) return null;
    
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-6">
          <PostCard post={post} />
        </main>
      </div>
    );
  }
  
  // Posts list view
  const sortedPosts = Object.values(posts)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">Discussions</h2>
            {sortedPosts.length === 0 ? (
              <div className="text-center p-8 border rounded-lg bg-muted/20">
                <p className="text-muted-foreground">
                  No discussions yet. Start a new one!
                </p>
              </div>
            ) : (
              sortedPosts.map(post => (
                <PostCard key={post.id} post={post} isCompact />
              ))
            )}
          </div>
          
          <div>
            <h2 className="text-2xl font-bold mb-6">Start a New Discussion</h2>
            <NewPostForm />
            
            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <h3 className="font-medium mb-2">How it works</h3>
              <ol className="list-decimal list-inside text-sm space-y-2">
                <li>Create a new discussion topic</li>
                <li>Select AI personalities to respond to your topic</li>
                <li>Watch as they debate and discuss with each other</li>
                <li>Add more AI responses at any time</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
