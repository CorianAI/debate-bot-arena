
export interface AIProfile {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  prompt: string;
  color: string;
  model?: string;
  endpoint?: 'openai' | 'anthropic' | 'openrouter' | string;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  parentId: string | null;
  createdAt: Date;
  votes: number;
  replyIds: string[];
  isGenerating?: boolean;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  authorId: string | null;
  forumId: string;
  createdAt: Date;
  votes: number;
  commentIds: string[];
  isGenerating?: boolean;
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  rules: string;
  systemPrompt: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  endpoint: string;
  apiKey: string;
  models: string[];
  isDefault: boolean;
}

export interface OpenAISettings {
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
  minThreadReplies: number;
  maxThreadReplies: number;
  providers: Record<string, LLMProvider>;
}
