
export interface AIProfile {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  prompt: string;
  color: string;
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
  authorId: string | null; // null means it's from the human user
  createdAt: Date;
  votes: number;
  commentIds: string[];
  isGenerating?: boolean;
}

export interface OpenAISettings {
  apiKey: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
}
