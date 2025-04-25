
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { AIProfile as AIProfileType } from '@/types';

interface AIProfileCardProps {
  profile: AIProfileType;
  isCompact?: boolean;
  className?: string;
}

export const AIProfileCard: React.FC<AIProfileCardProps> = ({ 
  profile, 
  isCompact = false,
  className
}) => {
  if (isCompact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <div className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center text-white avatar-ring",
          profile.color
        )}>
          {profile.avatar}
        </div>
        <span className="font-medium">{profile.name}</span>
        {profile.endpoint && (
          <Badge variant="outline" className="text-xs">{profile.endpoint}</Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center text-xl text-white avatar-ring",
            profile.color
          )}>
            {profile.avatar}
          </div>
          <div>
            <h3 className="font-bold text-lg">{profile.name}</h3>
            {profile.model && (
              <p className="text-xs text-muted-foreground">{profile.model}</p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Badge variant="outline" className="mb-2">{profile.personality}</Badge>
        <p className="text-sm text-muted-foreground">Prompt: {profile.prompt}</p>
        {profile.endpoint && (
          <p className="text-xs text-muted-foreground mt-2">
            Endpoint: {profile.endpoint} • Model: {profile.model}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

interface AIProfileFormProps {
  profile?: AIProfileType;
  onSave: (profile: Omit<AIProfileType, 'id'>) => void;
  onCancel?: () => void;
}

export const AIProfileForm: React.FC<AIProfileFormProps> = ({ profile, onSave, onCancel }) => {
  const [name, setName] = React.useState(profile?.name || '');
  const [avatar, setAvatar] = React.useState(profile?.avatar || '😊');
  const [personality, setPersonality] = React.useState(profile?.personality || '');
  const [prompt, setPrompt] = React.useState(profile?.prompt || '');
  const [color, setColor] = React.useState(profile?.color || 'bg-blue-500');
  const [endpoint, setEndpoint] = React.useState(profile?.endpoint || 'openai');
  const [model, setModel] = React.useState(profile?.model || 'gpt-4o-mini');

  const colorOptions = [
    'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-yellow-500', 
    'bg-lime-500', 'bg-green-500', 'bg-emerald-500', 'bg-teal-500', 
    'bg-cyan-500', 'bg-sky-500', 'bg-blue-500', 'bg-indigo-500',
    'bg-violet-500', 'bg-purple-500', 'bg-fuchsia-500', 'bg-pink-500', 
    'bg-rose-500'
  ];

  const avatarOptions = [
    '😊', '😎', '🤓', '🧐', '🤔', '😐', '😑', '😶', '😏', '😒', '🙄',
    '😬', '🤨', '😌', '🥰', '😍', '🤩', '😏', '🤫', '🤭', '🧠', '🦾',
    '👽', '🤖', '👾', '👹', '👺', '👻', '☠️', '👀', '👁️', '💫', '🌟',
    '⭐', '🌈', '🔥', '💥', '⚡', '❄️', '🌊', '🍀', '🌵', '🌴', '🦄'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      avatar,
      personality,
      prompt,
      color,
      endpoint,
      model,
    });
  };

  const endpointOptions = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'anthropic', label: 'Anthropic' },
    { value: 'openrouter', label: 'OpenRouter' },
  ];

  const getModelOptions = (selectedEndpoint: string) => {
    switch(selectedEndpoint) {
      case 'openai':
        return [
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
          { value: 'gpt-4o', label: 'GPT-4o' },
          { value: 'gpt-4-turbo', label: 'GPT-4 Turbo' },
          { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        ];
      case 'anthropic':
        return [
          { value: 'claude-3-opus', label: 'Claude 3 Opus' },
          { value: 'claude-3-sonnet', label: 'Claude 3 Sonnet' },
          { value: 'claude-3-haiku', label: 'Claude 3 Haiku' },
        ];
      case 'openrouter':
        return [
          { value: 'gpt-4o', label: 'OpenAI GPT-4o' },
          { value: 'claude-3-opus', label: 'Anthropic Claude 3 Opus' },
          { value: 'claude-3-sonnet', label: 'Anthropic Claude 3 Sonnet' },
          { value: 'mixtral-8x7b', label: 'Mistral Mixtral 8x7B' },
          { value: 'llama-3-70b', label: 'Meta Llama 3 70B' },
          { value: 'command-r', label: 'Cohere Command R' },
        ];
      default:
        return [
          { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
        ];
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="name" className="text-sm font-medium">Name</label>
        <input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Avatar</label>
        <div className="flex flex-wrap gap-2">
          {avatarOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "w-8 h-8 rounded-full text-lg",
                color,
                avatar === option ? "ring-2 ring-primary ring-offset-2" : ""
              )}
              onClick={() => setAvatar(option)}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium">Color</label>
        <div className="flex flex-wrap gap-2">
          {colorOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                "w-8 h-8 rounded-full",
                option,
                color === option ? "ring-2 ring-primary ring-offset-2" : ""
              )}
              onClick={() => setColor(option)}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label htmlFor="personality" className="text-sm font-medium">Personality (short description)</label>
        <input
          id="personality"
          value={personality}
          onChange={(e) => setPersonality(e.target.value)}
          className="border rounded p-2 w-full"
          required
        />
      </div>

      <div className="grid gap-2">
        <label htmlFor="endpoint" className="text-sm font-medium">AI Endpoint</label>
        <select 
          id="endpoint" 
          value={endpoint}
          onChange={(e) => {
            setEndpoint(e.target.value);
            // Reset model when endpoint changes
            setModel(getModelOptions(e.target.value)[0].value);
          }}
          className="border rounded p-2 w-full"
        >
          {endpointOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="model" className="text-sm font-medium">AI Model</label>
        <select 
          id="model" 
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="border rounded p-2 w-full"
        >
          {getModelOptions(endpoint).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <label htmlFor="prompt" className="text-sm font-medium">System Prompt</label>
        <textarea
          id="prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="border rounded p-2 w-full min-h-[100px]"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Save Profile
        </button>
      </div>
    </form>
  );
};
