
import { OpenAISettings, AIProfile } from '@/types';

export async function generateAIResponse(
  prompt: string,
  context: string,
  aiProfile: AIProfile,
  settings: OpenAISettings
): Promise<string> {
  try {
    if (!settings.apiKey) {
      throw new Error('OpenAI API key is not set');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.defaultModel,
        messages: [
          {
            role: 'system',
            content: `${aiProfile.prompt} Your name is ${aiProfile.name}. You are participating in a discussion forum. Keep your response under 3 paragraphs and stay in character.`
          },
          {
            role: 'user',
            content: `Context of discussion: ${context}\n\nRespond to this: ${prompt}`
          }
        ],
        temperature: settings.temperature,
        max_tokens: settings.maxTokens
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate AI response');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
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
