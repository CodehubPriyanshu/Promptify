import axios from 'axios';

class PerplexityService {
  constructor() {
    this.baseURL = 'https://api.perplexity.ai';
    this.apiKey = process.env.PERPLEXITY_API_KEY;
    this.defaultModel = 'llama-3.1-sonar-small-128k-online';
  }

  async sendMessage(message, options = {}) {
    const {
      sessionId,
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt = "You are Perplexity AI, a helpful research assistant that provides accurate, up-to-date information with citations."
    } = options;

    // If no API key, return mock response
    if (!this.apiKey || this.apiKey === 'demo-key') {
      return this.generateMockResponse(message, sessionId, 'Perplexity');
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
        sessionId: sessionId || `perplexity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        usage: {
          promptTokens: response.data.usage.prompt_tokens || 0,
          completionTokens: response.data.usage.completion_tokens || 0,
          totalTokens: response.data.usage.total_tokens || 0
        },
        model: response.data.model,
        citations: response.data.citations || []
      };
    } catch (error) {
      console.error('Perplexity API Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to get Perplexity response',
        code: error.response?.status || 500
      };
    }
  }

  async generateMockResponse(message, sessionId, modelName = 'Perplexity') {
    // Simulate API delay (Perplexity is typically slower due to web search)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    const finalSessionId = sessionId || `perplexity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const responses = [
      `Hello! I'm ${modelName}, your research-focused AI assistant. Regarding "${message}", I can help you find accurate, up-to-date information with proper citations and sources.`,
      
      `Great research question about "${message}"! As ${modelName}, I specialize in providing well-sourced, factual information by searching through current web content and academic sources.`,
      
      `Thank you for your inquiry about "${message}". I'm ${modelName}, and I excel at research tasks, fact-checking, and providing comprehensive answers with reliable sources.`,
      
      `Interesting topic! For "${message}", I can provide you with current information, relevant statistics, and credible sources to help you understand this subject thoroughly.`
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];

    // Add mock citations for research-focused responses
    const mockCitations = [
      "https://example.com/research-article-1",
      "https://example.com/academic-source-2", 
      "https://example.com/news-article-3"
    ];

    return {
      success: true,
      response: response + "\n\n**Sources:**\n" + mockCitations.map((url, i) => `[${i + 1}] ${url}`).join('\n') + "\n\nWould you like me to dive deeper into any specific aspect of this topic? I can provide more detailed research and additional sources.",
      sessionId: finalSessionId,
      usage: {
        promptTokens: Math.floor(message.length / 4),
        completionTokens: Math.floor(response.length / 4),
        totalTokens: Math.floor((message.length + response.length) / 4)
      },
      model: this.defaultModel,
      citations: mockCitations
    };
  }

  async validateApiKey() {
    if (!this.apiKey || this.apiKey === 'demo-key') {
      return { valid: false, message: 'Perplexity API key not configured' };
    }

    try {
      // Test with a simple message
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

      return { valid: true, message: 'Perplexity API key is valid' };
    } catch (error) {
      return { 
        valid: false, 
        message: error.response?.data?.error?.message || 'Invalid Perplexity API key' 
      };
    }
  }

  async getModels() {
    return {
      success: true,
      models: [
        { 
          id: 'llama-3.1-sonar-small-128k-online', 
          name: 'Sonar Small Online', 
          description: 'Fast online model with web search capabilities' 
        },
        { 
          id: 'llama-3.1-sonar-large-128k-online', 
          name: 'Sonar Large Online', 
          description: 'More capable online model with enhanced reasoning' 
        },
        { 
          id: 'llama-3.1-sonar-huge-128k-online', 
          name: 'Sonar Huge Online', 
          description: 'Most powerful online model for complex research tasks' 
        }
      ]
    };
  }
}

// Create and export singleton instance
const perplexityService = new PerplexityService();
export default perplexityService;
