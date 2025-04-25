
import { OpenAISettings, AIProfile, Forum } from '@/types';

export async function generateAIResponse(
  prompt: string,
  context: string,
  aiProfile: AIProfile,
  settings: OpenAISettings,
  forum?: Forum
): Promise<string> {
  try {
    if (!settings.apiKey) {
      throw new Error('OpenAI API key is not set');
    }

    const systemPrompt = `${aiProfile.prompt}${forum ? `\n\nForum context: ${forum.systemPrompt}\nForum rules: ${forum.rules}` : ''} Your name is ${aiProfile.name}. You are participating in a discussion forum. Keep your response under 3 paragraphs and stay in character.`;

    const endpoint = aiProfile.endpoint === 'openai' 
      ? 'https://api.openai.com/v1/chat/completions'
      : aiProfile.endpoint === 'anthropic'
      ? 'https://api.anthropic.com/v1/messages'
      : 'https://api.openrouter.ai/api/v1/chat/completions';

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (aiProfile.endpoint === 'openai') {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
    } else if (aiProfile.endpoint === 'anthropic') {
      headers['x-api-key'] = settings.apiKey;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      headers['Authorization'] = `Bearer ${settings.apiKey}`;
      headers['HTTP-Referer'] = window.location.href;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(
        aiProfile.endpoint === 'anthropic' 
          ? {
              messages: [{
                role: 'user',
                content: `Context of discussion: ${context}\n\nRespond to this: ${prompt}`
              }],
              model: aiProfile.model || 'claude-3-opus',
              system: systemPrompt,
              max_tokens: settings.maxTokens
            }
          : {
              model: aiProfile.model || settings.defaultModel,
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
            }
      )
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate AI response');
    }

    const data = await response.json();
    return aiProfile.endpoint === 'anthropic' 
      ? data.content[0].text
      : data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error generating AI response:', error);
    return `Error: ${error instanceof Error ? error.message : 'Failed to generate response'}`;
  }
}

export async function generateMultipleResponses(
  prompt: string,
  context: string,
  profiles: AIProfile[],
  settings: OpenAISettings,
  onProgress?: (profileId: string, response: string) => void
): Promise<Record<string, string>> {
  const responses: Record<string, string> = {};
  
  // Generate responses sequentially to avoid rate limiting
  for (const profile of profiles) {
    try {
      const response = await generateAIResponse(prompt, context, profile, settings);
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
