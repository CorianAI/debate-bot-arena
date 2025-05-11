
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit, Star, StarOff } from 'lucide-react';
import { useAppStore } from '@/store';
import { LLMProvider } from '@/types';

interface ProviderFormProps {
  provider?: LLMProvider;
  onSave: (provider: Omit<LLMProvider, 'id'>) => void;
  onCancel: () => void;
}

const ProviderForm: React.FC<ProviderFormProps> = ({ provider, onSave, onCancel }) => {
  const [name, setName] = useState(provider?.name || '');
  const [endpoint, setEndpoint] = useState(provider?.endpoint || '');
  const [apiKey, setApiKey] = useState(provider?.apiKey || '');
  const [models, setModels] = useState(provider?.models?.join('\n') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      endpoint,
      apiKey,
      models: models.split('\n').filter(model => model.trim().length > 0),
      isDefault: provider?.isDefault || false
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium">Provider Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="endpoint" className="text-sm font-medium">API Endpoint</label>
        <input
          id="endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="https://api.provider.com/v1/chat/completions"
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="apiKey" className="text-sm font-medium">API Key</label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border rounded p-2 w-full"
          placeholder="sk-..."
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="models" className="text-sm font-medium">Available Models (one per line)</label>
        <textarea
          id="models"
          value={models}
          onChange={(e) => setModels(e.target.value)}
          className="border rounded p-2 w-full min-h-[100px]"
          placeholder="gpt-4o-mini&#10;gpt-4o&#10;gpt-4-turbo"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save
        </Button>
      </div>
    </form>
  );
};

const LLMProviderManager: React.FC = () => {
  const { settings, addProvider, updateProvider, deleteProvider, setDefaultProvider } = useAppStore();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<LLMProvider | null>(null);

  const handleAddProvider = (provider: Omit<LLMProvider, 'id'>) => {
    addProvider(provider);
    setIsAddDialogOpen(false);
  };

  const handleEditProvider = (provider: Omit<LLMProvider, 'id'>) => {
    if (editingProvider) {
      updateProvider(editingProvider.id, provider);
    }
    setEditingProvider(null);
    setIsEditDialogOpen(false);
  };

  const handleSetDefault = (id: string) => {
    setDefaultProvider(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">LLM Providers</h3>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add Provider
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add LLM Provider</DialogTitle>
            </DialogHeader>
            <ProviderForm
              onSave={handleAddProvider}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        {Object.values(settings.providers).map((provider) => (
          <Card key={provider.id} className="relative">
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{provider.name}</h4>
                  {provider.isDefault && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                </div>
                
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    title={provider.isDefault ? "Default Provider" : "Set as Default"}
                    disabled={provider.isDefault}
                    onClick={() => handleSetDefault(provider.id)}
                  >
                    {provider.isDefault ? (
                      <Star className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setEditingProvider(provider);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => deleteProvider(provider.id)}
                    disabled={Object.keys(settings.providers).length <= 1}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground truncate mb-1" title={provider.endpoint}>
                Endpoint: {provider.endpoint}
              </p>
              
              <div className="mt-2">
                <p className="text-xs text-muted-foreground mb-1">Models:</p>
                <div className="flex flex-wrap gap-1">
                  {provider.models.map((model) => (
                    <Badge key={model} variant="outline" className="text-xs">
                      {model}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit LLM Provider</DialogTitle>
          </DialogHeader>
          {editingProvider && (
            <ProviderForm
              provider={editingProvider}
              onSave={handleEditProvider}
              onCancel={() => {
                setEditingProvider(null);
                setIsEditDialogOpen(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LLMProviderManager;
