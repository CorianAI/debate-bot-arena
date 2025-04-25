const { generateAIResponse, generateMultipleResponses } = require('@/utils/aiService');
const { AIProfile, OpenAISettings, Forum } = require('@/types');

// Mock fetch
global.fetch = jest.fn();

describe('aiService', () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('generateAIResponse', () => {
    it('should throw an error if API key is not set', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const context = 'Test context';
      const aiProfile = {
        id: 'test-id',
        name: 'Test AI',
        avatar: 'test-avatar',
        personality: 'friendly',
        prompt: 'You are a friendly AI',
        color: 'blue',
        endpoint: 'openai'
      };
      const settings = {
        apiKey: '',
        defaultModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      };

      // Act
      const result = await generateAIResponse(prompt, context, aiProfile, settings);

      // Assert
      expect(result).toContain('Error: API key is not set');
    });

    it('should generate a response from OpenAI endpoint', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const context = 'Test context';
      const aiProfile = {
        id: 'test-id',
        name: 'Test AI',
        avatar: 'test-avatar',
        personality: 'friendly',
        prompt: 'You are a friendly AI',
        color: 'blue',
        endpoint: 'openai'
      };
      const settings = {
        apiKey: 'test-api-key',
        defaultModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      };

      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'This is a test response'
              }
            }
          ]
        })
      });

      // Act
      const result = await generateAIResponse(prompt, context, aiProfile, settings);

      // Assert
      expect(result).toBe('This is a test response');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: expect.any(String)
      });

      // Verify request body
      const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(requestBody.model).toBe('gpt-3.5-turbo');
      expect(requestBody.messages[0].role).toBe('system');
      expect(requestBody.messages[1].content).toContain('Test prompt');
    });

    it('should generate a response from Anthropic endpoint', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const context = 'Test context';
      const aiProfile = {
        id: 'test-id',
        name: 'Test AI',
        avatar: 'test-avatar',
        personality: 'friendly',
        prompt: 'You are a friendly AI',
        color: 'blue',
        endpoint: 'anthropic',
        model: 'claude-3-opus'
      };
      const settings = {
        apiKey: 'test-api-key',
        defaultModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      };

      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          content: [
            {
              text: 'This is a test response from Claude'
            }
          ]
        })
      });

      // Act
      const result = await generateAIResponse(prompt, context, aiProfile, settings);

      // Assert
      expect(result).toBe('This is a test response from Claude');
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': 'test-api-key',
          'anthropic-version': '2023-06-01'
        },
        body: expect.any(String)
      });

      // Verify request body
      const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      expect(requestBody.model).toBe('claude-3-opus');
      expect(requestBody.system).toContain('You are a friendly AI');
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const context = 'Test context';
      const aiProfile = {
        id: 'test-id',
        name: 'Test AI',
        avatar: 'test-avatar',
        personality: 'friendly',
        prompt: 'You are a friendly AI',
        color: 'blue',
        endpoint: 'openai'
      };
      const settings = {
        apiKey: 'test-api-key',
        defaultModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      };

      // Mock error response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            message: 'Invalid API key'
          }
        })
      });

      // Act
      const result = await generateAIResponse(prompt, context, aiProfile, settings);

      // Assert
      expect(result).toContain('Error: Invalid API key');
    });

    it('should include forum context when provided', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const context = 'Test context';
      const aiProfile = {
        id: 'test-id',
        name: 'Test AI',
        avatar: 'test-avatar',
        personality: 'friendly',
        prompt: 'You are a friendly AI',
        color: 'blue',
        endpoint: 'openai'
      };
      const settings = {
        apiKey: 'test-api-key',
        defaultModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      };
      const forum = {
        id: 'forum-id',
        name: 'Test Forum',
        description: 'A test forum',
        rules: 'Be nice',
        systemPrompt: 'This is a test forum'
      };

      // Mock successful response
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          choices: [
            {
              message: {
                content: 'This is a test response'
              }
            }
          ]
        })
      });

      // Act
      const result = await generateAIResponse(prompt, context, aiProfile, settings, forum);

      // Assert
      expect(result).toBe('This is a test response');
      
      // Verify request body includes forum context
      const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);
      const systemPrompt = requestBody.messages[0].content;
      expect(systemPrompt).toContain('Forum context: This is a test forum');
      expect(systemPrompt).toContain('Forum rules: Be nice');
    });
  });

  describe('generateMultipleResponses', () => {
    it('should generate responses for multiple AI profiles', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const context = 'Test context';
      const profiles = [
        {
          id: 'ai1',
          name: 'AI 1',
          avatar: 'avatar1',
          personality: 'friendly',
          prompt: 'You are AI 1',
          color: 'blue',
          endpoint: 'openai'
        },
        {
          id: 'ai2',
          name: 'AI 2',
          avatar: 'avatar2',
          personality: 'analytical',
          prompt: 'You are AI 2',
          color: 'green',
          endpoint: 'anthropic'
        }
      ];
      const settings = {
        apiKey: 'test-api-key',
        defaultModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      };

      // Mock responses for each AI
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: 'Response from AI 1'
                }
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            content: [
              {
                text: 'Response from AI 2'
              }
            ]
          })
        });

      // Mock progress callback
      const onProgress = jest.fn();

      // Act
      const results = await generateMultipleResponses(prompt, context, profiles, settings, undefined, onProgress);

      // Assert
      expect(results).toEqual({
        ai1: 'Response from AI 1',
        ai2: 'Response from AI 2'
      });
      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledTimes(2);
      expect(onProgress).toHaveBeenCalledWith('ai1', 'Response from AI 1');
      expect(onProgress).toHaveBeenCalledWith('ai2', 'Response from AI 2');
    });

    it('should handle errors for individual profiles', async () => {
      // Arrange
      const prompt = 'Test prompt';
      const context = 'Test context';
      const profiles = [
        {
          id: 'ai1',
          name: 'AI 1',
          avatar: 'avatar1',
          personality: 'friendly',
          prompt: 'You are AI 1',
          color: 'blue',
          endpoint: 'openai'
        },
        {
          id: 'ai2',
          name: 'AI 2',
          avatar: 'avatar2',
          personality: 'analytical',
          prompt: 'You are AI 2',
          color: 'green',
          endpoint: 'anthropic'
        }
      ];
      const settings = {
        apiKey: 'test-api-key',
        defaultModel: 'gpt-3.5-turbo',
        temperature: 0.7,
        maxTokens: 500
      };

      // First request succeeds, second fails
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [
              {
                message: {
                  content: 'Response from AI 1'
                }
              }
            ]
          })
        })
        .mockResolvedValueOnce({
          ok: false,
          json: async () => ({
            error: {
              message: 'Rate limit exceeded'
            }
          })
        });

      // Act
      const results = await generateMultipleResponses(prompt, context, profiles, settings);

      // Assert
      expect(results.ai1).toBe('Response from AI 1');
      expect(results.ai2).toContain('Error:');
    });
  });
});