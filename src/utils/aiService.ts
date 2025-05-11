import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import OpenRouter from '@openrouter/sdk';
import { AIProfile, OpenAISettings, Forum } from '@/types';

const getModelName = (profile: AIProfile, settings: OpenAISettings) => {
  return profile.model || settings.defaultModel;
};

const callOpenAI = async (
  prompt: string,
  context: string,
  profile: AIProfile,
  settings: OpenAISettings,
  forum?: Forum
) => {
  const modelName = getModelName(profile, settings);
  const apiKey = settings.providers[profile.endpoint || 'openai']?.apiKey || settings.apiKey;

  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = forum?.systemPrompt || `You are ${profile.name}, ${profile.personality}. Your job is to participate in discussions and provide well-reasoned arguments.`;
  const finalPrompt = `${systemPrompt}\n\nContext: ${context}\n\n${profile.prompt}\n\n${prompt}`;

  const completion = await openai.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: finalPrompt }],
    model: modelName,
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
  });

  return completion.choices[0].message.content;
};

const callAnthropic = async (
  prompt: string,
  context: string,
  profile: AIProfile,
  settings: OpenAISettings,
  forum?: Forum
) => {
  const modelName = getModelName(profile, settings);
  const apiKey = settings.providers[profile.endpoint || 'openai']?.apiKey || settings.apiKey;

  const anthropic = new Anthropic({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = forum?.systemPrompt || `You are ${profile.name}, ${profile.personality}. Your job is to participate in discussions and provide well-reasoned arguments.`;
  const finalPrompt = `${systemPrompt}\n\nContext: ${context}\n\n${profile.prompt}\n\n${prompt}`;

  const completion = await anthropic.messages.create({
    messages: [{ role: "user", content: finalPrompt }],
    model: modelName,
    max_tokens: settings.maxTokens,
  });

  return completion.content[0].text;
};

const callOpenRouter = async (
  prompt: string,
  context: string,
  profile: AIProfile,
  settings: OpenAISettings,
  forum?: Forum
) => {
  const modelName = getModelName(profile, settings);
  const apiKey = settings.providers[profile.endpoint || 'openai']?.apiKey || settings.apiKey;

  const openrouter = new OpenRouter({ apiKey: apiKey, dangerouslyAllowBrowser: true });

  const systemPrompt = forum?.systemPrompt || `You are ${profile.name}, ${profile.personality}. Your job is to participate in discussions and provide well-reasoned arguments.`;
  const finalPrompt = `${systemPrompt}\n\nContext: ${context}\n\n${profile.prompt}\n\n${prompt}`;

  const completion = await openrouter.chat.completions.create({
    messages: [{ role: "system", content: systemPrompt }, { role: "user", content: finalPrompt }],
    model: modelName,
    temperature: settings.temperature,
    max_tokens: settings.maxTokens,
  });

  return completion.choices[0].message.content;
};

export const generateAIResponse = async (
  prompt: string,
  context: string,
  profile: AIProfile,
  settings: OpenAISettings
) => {
  try {
    // Handle null or undefined inputs safely
    const safePrompt = (prompt || '').trim();
    const safeContext = (context || '').trim();
    const safePersonality = (profile?.personality || '').trim();

    let response = '';
    switch (profile.endpoint) {
      case 'anthropic':
        response = await callAnthropic(safePrompt, safeContext, profile, settings);
        break;
      case 'openrouter':
        response = await callOpenRouter(safePrompt, safeContext, profile, settings);
        break;
      default:
        response = await callOpenAI(safePrompt, safeContext, profile, settings);
        break;
    }
    
    // Make sure the response is always a string
    return response || '';
  } catch (error) {
    console.error(`Error generating ${profile?.name || 'AI'} response:`, error);
    throw error;
  }
};

export const generateMultipleResponses = async (
  prompt: string,
  context: string,
  profiles: AIProfile[],
  settings: OpenAISettings,
  forum: Forum | undefined,
  onResponse: (profileId: string, response: string) => void
) => {
  await Promise.all(
    profiles.map(async (profile) => {
      try {
        let response = '';
        switch (profile.endpoint) {
          case 'anthropic':
            response = await callAnthropic(prompt, context, profile, settings, forum);
            break;
          case 'openrouter':
            response = await callOpenRouter(prompt, context, profile, settings, forum);
            break;
          default:
            response = await callOpenAI(prompt, context, profile, settings, forum);
            break;
        }
        onResponse(profile.id, response);
      } catch (error) {
        console.error(`Error generating ${profile.name} response:`, error);
        onResponse(profile.id, 'Sorry, I encountered an error generating this response.');
      }
    })
  );
};
