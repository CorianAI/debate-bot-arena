
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/utils/store';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import SettingsModal from './SettingsModal';

const Header: React.FC = () => {
  const { selectedPostId, setSelectedPost } = useAppStore();

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          {selectedPostId && (
            <Button 
              variant="ghost" 
              onClick={() => setSelectedPost(null)}
              className="mr-2"
            >
              ← Back
            </Button>
          )}
          <h1 className="text-xl font-bold">AI Debate Forum</h1>
        </div>
        
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Settings</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Settings</DialogTitle>
              </DialogHeader>
              <SettingsModal />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </header>
  );
};

export default Header;
