
import React from 'react';
import { Card } from '@/components/ui/card';
import { useAppStore } from '@/utils/store';

const ForumSelector: React.FC = () => {
  const { forums, selectedForumId, setSelectedForum } = useAppStore();
  
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Forums</h2>
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
