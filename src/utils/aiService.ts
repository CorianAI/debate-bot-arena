
import { OpenAISettings, AIProfile, Forum, LLMProvider } from '@/types';

export async function generateAIResponse(
  prompt: string,
  context: string,
  aiProfile: AIProfile,
  settings: OpenAISettings,
  forum?: Forum
): Promise<string> {
  try {
    // Find the matching provider for this endpoint
    const providers = Object.values(settings.providers);
    let provider: LLMProvider | undefined;
    
    // First try to find exact match by endpoint name
    if (aiProfile.endpoint) {
      provider = providers.find(p => 
        p.name.toLowerCase() === aiProfile.endpoint?.toLowerCase() ||
        p.id === aiProfile.endpoint
      );
    }
    
    // If no match, use the default provider
    if (!provider) {
      provider = providers.find(p => p.isDefault) || providers[0];
    }
    
    if (!provider || !provider.apiKey) {
      throw new Error(`No API key found for provider: ${aiProfile.endpoint || 'default'}`);
    }

    const systemPrompt = `${aiProfile.prompt}${forum ? `\n\nForum context: ${forum.systemPrompt}\nForum rules: ${forum.rules}` : ''} Your name is ${aiProfile.name}. You are participating in a discussion forum. Keep your response under 3 paragraphs and stay in character.`;

    // Set endpoint from the provider
    const endpoint = provider.endpoint;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Set appropriate headers based on provider type
    if (provider.name.toLowerCase() === 'openai') {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    } else if (provider.name.toLowerCase() === 'anthropic') {
      headers['x-api-key'] = provider.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else if (provider.name.toLowerCase() === 'openrouter') {
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
      headers['HTTP-Referer'] = window.location.href;
      headers['X-Title'] = 'AI Debate Forum';
    } else {
      // Generic provider, assume OpenAI-like API
      headers['Authorization'] = `Bearer ${provider.apiKey}`;
    }

    // Format request body based on provider type
    let requestBody: any;
    if (provider.name.toLowerCase() === 'anthropic') {
      requestBody = {
        messages: [{
          role: 'user',
          content: `Context of discussion: ${context}\n\nRespond to this: ${prompt}`
        }],
        model: aiProfile.model || provider.models[0],
        system: systemPrompt,
        max_tokens: settings.maxTokens
      };
    } else {
      // OpenAI and OpenRouter use the same format
      requestBody = {
        model: aiProfile.model || provider.models[0],
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: `Context of discussion: ${context}\n\nRespond to this: ${prompt}`
          }
        ],
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      };
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || `Failed to generate response from ${provider.name}`);
    }

    const data = await response.json();
    
    // Parse response based on provider type
    return provider.name.toLowerCase() === 'anthropic' 
      ? data.content[0].text
      : data.choices[0].message.content.trim();
  } catch (error) {
    console.error(`Error generating ${aiProfile.name} response:`, error);
    return `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`;
  }
}

export async function generateMultipleResponses(
  prompt: string,
  context: string,
  profiles: AIProfile[],
  settings: OpenAISettings,
  forum?: Forum,
  onProgress?: (profileId: string, response: string) => void
): Promise<Record<string, string>> {
  const responses: Record<string, string> = {};
  
  // Generate responses sequentially to avoid rate limiting
  for (const profile of profiles) {
    try {
      const response = await generateAIResponse(prompt, context, profile, settings, forum);
      responses[profile.id] = response;
      if (onProgress) {
        onProgress(profile.id, response);
      }
    } catch (error) {
      console.error(`Error generating response for ${profile.name}:`, error);
      responses[profile.id] = `Error: Failed to generate response`;
    }
  }
  
  return responses;
}

// Function to generate a random number of thread replies
export function getRandomThreadCount(settings: OpenAISettings): number {
  const min = settings.minThreadReplies || 2;
  const max = settings.maxThreadReplies || 5;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
