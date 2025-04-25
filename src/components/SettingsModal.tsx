
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useAppStore } from '@/utils/store';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AIProfileCard, AIProfileForm } from './AIProfile';
import { AIProfile } from '@/types';

const SettingsModal: React.FC = () => {
  return (
    <Tabs defaultValue="api" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="api">API Settings</TabsTrigger>
        <TabsTrigger value="profiles">AI Profiles</TabsTrigger>
      </TabsList>
      
      <TabsContent value="api">
        <OpenAISettings />
      </TabsContent>
      
      <TabsContent value="profiles">
        <AIProfilesSettings />
      </TabsContent>
    </Tabs>
  );
};

const OpenAISettings: React.FC = () => {
  const { settings, updateSettings } = useAppStore();
  const [apiKey, setApiKey] = useState(settings.apiKey);
  const [model, setModel] = useState(settings.defaultModel);
  const [temperature, setTemperature] = useState(settings.temperature);
  const [maxTokens, setMaxTokens] = useState(settings.maxTokens);
  
  const handleSave = () => {
    updateSettings({
      apiKey,
      defaultModel: model,
      temperature,
      maxTokens,
    });
  };
  
  const modelOptions = [
    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
    { value: 'gpt-4o', label: 'GPT-4o' },
    { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
    { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
  ];
  
  return (
    <div className="space-y-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="apiKey">OpenAI API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-..."
        />
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally and is only sent to OpenAI.
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="model">Default Model</Label>
        <select
          id="model"
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full border rounded-md p-2"
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
        </div>
        <Slider
          id="temperature"
          min={0}
          max={2}
          step={0.1}
          value={[temperature]}
          onValueChange={(values) => setTemperature(values[0])}
        />
        <p className="text-xs text-muted-foreground">
          Lower values make responses more deterministic, higher values make them more creative.
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="maxTokens">Max Tokens: {maxTokens}</Label>
        </div>
        <Slider
          id="maxTokens"
          min={100}
          max={2000}
          step={50}
          value={[maxTokens]}
          onValueChange={(values) => setMaxTokens(values[0])}
        />
        <p className="text-xs text-muted-foreground">
          Maximum number of tokens to generate in responses.
        </p>
      </div>
      
      <Button onClick={handleSave} className="w-full">Save Settings</Button>
    </div>
  );
};

const AIProfilesSettings: React.FC = () => {
  const { profiles, addProfile, updateProfile, deleteProfile } = useAppStore();
  const [editingProfile, setEditingProfile] = useState<AIProfile | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  const handleAddProfile = (profile: Omit<AIProfile, 'id'>) => {
    addProfile(profile);
    setIsAddDialogOpen(false);
  };
  
  const handleEditProfile = (profile: Omit<AIProfile, 'id'>) => {
    if (editingProfile) {
      updateProfile(editingProfile.id, profile);
    }
    setEditingProfile(null);
    setIsEditDialogOpen(false);
  };
  
  return (
    <div className="space-y-4 py-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">AI Profiles</h3>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Profile
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New AI Profile</DialogTitle>
            </DialogHeader>
            <AIProfileForm onSave={handleAddProfile} onCancel={() => setIsAddDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid gap-4">
        {Object.values(profiles).map((profile) => (
          <div key={profile.id} className="flex items-center gap-2">
            <AIProfileCard profile={profile} isCompact className="flex-1" />
            
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  setEditingProfile(profile);
                  setIsEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => deleteProfile(profile.id)}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit AI Profile</DialogTitle>
          </DialogHeader>
          {editingProfile && (
            <AIProfileForm 
              profile={editingProfile} 
              onSave={handleEditProfile} 
              onCancel={() => {
                setEditingProfile(null);
                setIsEditDialogOpen(false);
              }} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SettingsModal;
