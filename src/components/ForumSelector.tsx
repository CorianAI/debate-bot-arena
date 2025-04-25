
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/utils/store';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import NewForumForm from './NewForumForm';

const ForumSelector: React.FC = () => {
  const { forums, selectedForumId, setSelectedForum } = useAppStore();
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Forums</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> New Forum
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Forum</DialogTitle>
            </DialogHeader>
            <NewForumForm />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4">
        {Object.values(forums).map((forum) => (
          <Card
            key={forum.id}
            className={`p-4 cursor-pointer transition-colors ${
              selectedForumId === forum.id ? 'bg-primary/10' : 'hover:bg-muted'
            }`}
            onClick={() => setSelectedForum(forum.id)}
          >
            <h3 className="font-bold">{forum.name}</h3>
            <p className="text-sm text-muted-foreground">{forum.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ForumSelector;
