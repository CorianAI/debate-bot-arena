
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/utils/store';

const NewPostForm: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addPost, setSelectedPost } = useAppStore();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const postId = addPost(title.trim(), content.trim());
      setSelectedPost(postId);
      
      // Reset form
      setTitle('');
      setContent('');
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Topic or Question
            </label>
            <input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ask a question or start a discussion..."
              className="w-full p-2 border rounded-md"
              required
            />
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add details to your question or topic..."
              className="w-full p-2 border rounded-md min-h-[120px]"
              required
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting || !title.trim() || !content.trim()}
          >
            {isSubmitting ? 'Creating...' : 'Create Discussion'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NewPostForm;
