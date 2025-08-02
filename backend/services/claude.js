import axios from 'axios';

class ClaudeService {
  constructor() {
    this.baseURL = 'https://api.anthropic.com/v1';
    this.apiKey = process.env.ANTHROPIC_API_KEY;
    this.defaultModel = 'claude-3-sonnet-20240229';
  }

  async sendMessage(message, options = {}) {
    const {
      sessionId,
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = "You are Claude, a helpful AI assistant created by Anthropic."
    } = options;

    // If no API key, return mock response
    if (!this.apiKey || this.apiKey === 'demo-key') {
      return this.generateMockResponse(message, sessionId, 'Claude');
    }

    try {
      const messages = [
        {
          role: 'user',
          content: message
        }
      ];

      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system: systemPrompt,
          messages
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 30000
        }
      );

      return {
        success: true,
        response: response.data.content[0].text,
        sessionId: sessionId || `claude_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usage: {
          promptTokens: response.data.usage.input_tokens,
          completionTokens: response.data.usage.output_tokens,
          totalTokens: response.data.usage.input_tokens + response.data.usage.output_tokens
        },
        model: response.data.model
      };
    } catch (error) {
      console.error('Claude API Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to get Claude response',
        code: error.response?.status || 500
      };
    }
  }

  async generateMockResponse(message, sessionId, modelName = 'Claude') {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

    const finalSessionId = sessionId || `claude_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const responses = [
      `Hello! I'm ${modelName}, and I'm here to help you with your request about "${message}". I excel at reasoning, analysis, and providing thoughtful responses to complex questions.`,
      
      `Thank you for your message about "${message}". As ${modelName}, I can help you explore this topic in depth with careful analysis and creative problem-solving.`,
      
      `I appreciate your question regarding "${message}". Let me provide you with a comprehensive and helpful response based on my training and capabilities.`,
      
      `That's an interesting topic! Regarding "${message}", I can offer insights from multiple perspectives and help you think through the various aspects systematically.`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    return {
      success: true,
      response: response + "\n\nHow would you like me to elaborate on this topic? I'm here to help with detailed analysis, creative solutions, or any follow-up questions you might have.",
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
      return { valid: false, message: 'Claude API key not configured' };
    }

    try {
      // Test with a simple message
      const response = await axios.post(
        `${this.baseURL}/messages`,
        {
          model: this.defaultModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01'
          },
          timeout: 10000
        }
      );

      return { valid: true, message: 'Claude API key is valid' };
    } catch (error) {
      return { 
        valid: false, 
        message: error.response?.data?.error?.message || 'Invalid Claude API key' 
      };
    }
  }
}

// Create and export singleton instance
const claudeService = new ClaudeService();
export default claudeService;
