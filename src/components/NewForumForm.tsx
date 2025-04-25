
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/utils/store';
import { toast } from 'sonner';

const NewForumForm: React.FC = () => {
  const { addForum, setSelectedForum } = useAppStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Please enter a forum name');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const forumId = addForum(name, description, rules, systemPrompt);
      setSelectedForum(forumId);
      
      toast.success('Forum created successfully!');
      
      // Reset form
      setName('');
      setDescription('');
      setRules('');
      setSystemPrompt('');
    } catch (error) {
      toast.error('Failed to create forum');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="name" className="text-sm font-medium">
          Forum Name
        </label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Product Ideas"
          maxLength={50}
          required
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description of this forum's purpose"
          maxLength={100}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="rules" className="text-sm font-medium">
          Forum Rules
        </label>
        <Textarea
          id="rules"
          value={rules}
          onChange={(e) => setRules(e.target.value)}
          placeholder="Rules for participating in this forum"
          className="min-h-[100px]"
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="systemPrompt" className="text-sm font-medium">
          System Prompt
        </label>
        <Textarea
          id="systemPrompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          placeholder="Additional context that will be added to all AI responses in this forum"
          className="min-h-[100px]"
        />
        <p className="text-xs text-muted-foreground">
          This will be added to all AI responses to help them stay contextually relevant.
        </p>
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Forum'}
      </Button>
    </form>
  );
};

export default NewForumForm;
