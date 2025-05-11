
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import { ArrowLeft } from 'lucide-react';
import SettingsModal from './SettingsModal';

const Header: React.FC = () => {
  const { selectedPostId, setSelectedPost, selectedForumId, setSelectedForum } = useAppStore();

  const handleBackClick = () => {
    if (selectedPostId) {
      setSelectedPost(null);
    } else if (selectedForumId) {
      setSelectedForum(null);
    }
  };

  const showBackButton = selectedPostId || selectedForumId;

  return (
    <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          {showBackButton && (
            <Button 
              variant="ghost" 
              onClick={handleBackClick}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
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
                <DialogDescription>
                  Configure your OpenAI API key and AI profiles
                </DialogDescription>
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
