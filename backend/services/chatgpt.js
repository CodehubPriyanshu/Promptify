import axios from 'axios';

class ChatGPTService {
  constructor() {
    this.baseURL = 'https://api.openai.com/v1';
    this.apiKey = process.env.OPENAI_API_KEY;
    this.defaultModel = 'gpt-3.5-turbo';
  }

  async sendMessage(message, options = {}) {
    const {
      sessionId,
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = "You are ChatGPT, a helpful AI assistant created by OpenAI."
    } = options;

    // If no API key, return mock response
    if (!this.apiKey || this.apiKey === 'demo-key') {
      return this.generateMockResponse(message, sessionId, 'ChatGPT');
    }

    try {
      const messages = [];
      
      if (systemPrompt) {
        messages.push({
          role: 'system',
          content: systemPrompt
        });
      }
      
      messages.push({
        role: 'user',
        content: message
      });

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model,
          messages,
          temperature,
          max_tokens: maxTokens,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        response: response.data.choices[0].message.content,
        sessionId: sessionId || `chatgpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        },
        model: response.data.model
      };
    } catch (error) {
      console.error('ChatGPT API Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to get ChatGPT response',
        code: error.response?.status || 500
      };
    }
  }

  async generateMockResponse(message, sessionId, modelName = 'ChatGPT') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 1800));

    const finalSessionId = sessionId || `chatgpt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const responses = [
      `Hi there! I'm ${modelName}, and I'm excited to help you with "${message}". I'm designed to be conversational and helpful across a wide range of topics.`,
      
      `Great question about "${message}"! As ${modelName}, I love engaging in discussions and helping solve problems. Let me share some thoughts on this.`,
      
      `Thanks for reaching out about "${message}". I'm ${modelName}, and I'm here to assist you with detailed explanations, creative ideas, and practical solutions.`,
      
      `I appreciate you asking about "${message}". As ${modelName}, I can help break this down and provide you with useful insights and actionable advice.`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    return {
      success: true,
      response: response + "\n\nI'm ready to dive deeper into any aspect of this topic that interests you. What specific questions do you have, or how can I help you further?",
      sessionId: finalSessionId,
      usage: {
        promptTokens: Math.floor(message.length / 4),
        completionTokens: Math.floor(response.length / 4),
        totalTokens: Math.floor((message.length + response.length) / 4)
      },
      model: this.defaultModel
    };
  }

  async validateApiKey() {
    if (!this.apiKey || this.apiKey === 'demo-key') {
      return { valid: false, message: 'OpenAI API key not configured' };
    }

    try {
      // Test with a simple completion
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.defaultModel,
          messages: [{ role: 'user', content: 'Hi' }],
          max_tokens: 5
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return { valid: true, message: 'OpenAI API key is valid' };
    } catch (error) {
      return { 
        valid: false, 
        message: error.response?.data?.error?.message || 'Invalid OpenAI API key' 
      };
    }
  }

  async getModels() {
    if (!this.apiKey || this.apiKey === 'demo-key') {
      return {
        success: true,
        models: [
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
          { id: 'gpt-4', name: 'GPT-4', description: 'Most capable model for complex tasks' },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Latest model with enhanced capabilities' }
        ]
      };
    }

    try {
      const response = await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      const chatModels = response.data.data.filter(model => 
        model.id.includes('gpt') && !model.id.includes('instruct')
      );

      return {
        success: true,
        models: chatModels.map(model => ({
          id: model.id,
          name: model.id.toUpperCase(),
          description: `OpenAI ${model.id} model`
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to fetch models'
      };
    }
  }
}

// Create and export singleton instance
const chatGPTService = new ChatGPTService();
export default chatGPTService;
