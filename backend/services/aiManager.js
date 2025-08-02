import claudeService from './claude.js';
import chatGPTService from './chatgpt.js';
import perplexityService from './perplexity.js';
import catGPTService from './catgpt.js'; // Keep existing service for backward compatibility

class AIManager {
  constructor() {
    this.services = {
      claude: claudeService,
      chatgpt: chatGPTService,
      perplexity: perplexityService,
      catgpt: catGPTService // Legacy support
    };
    this.defaultModel = 'claude';
  }

  async sendMessage(message, options = {}) {
    const { model = this.defaultModel, ...otherOptions } = options;
    
    // Validate model
    if (!this.services[model]) {
      return {
        success: false,
        error: `Unsupported AI model: ${model}. Available models: ${Object.keys(this.services).join(', ')}`,
        code: 400
      };
    }

    try {
      const service = this.services[model];
      const result = await service.sendMessage(message, otherOptions);
      
      // Add model info to response
      if (result.success) {
        result.aiModel = model;
      }
      
      return result;
    } catch (error) {
      console.error(`AI Manager Error for model ${model}:`, error);
      return {
        success: false,
        error: `Failed to process request with ${model}: ${error.message}`,
        code: 500
      };
    }
  }

  async validateApiKeys() {
    const results = {};
    
    for (const [modelName, service] of Object.entries(this.services)) {
      if (service.validateApiKey) {
        try {
          results[modelName] = await service.validateApiKey();
        } catch (error) {
          results[modelName] = {
            valid: false,
            message: `Validation failed: ${error.message}`
          };
        }
      } else {
        results[modelName] = {
          valid: true,
          message: 'Validation not implemented for this service'
        };
      }
    }
    
    return results;
  }

  async getAvailableModels() {
    const models = [];
    
    for (const [modelName, service] of Object.entries(this.services)) {
      try {
        if (service.getModels) {
          const serviceModels = await service.getModels();
          if (serviceModels.success) {
            models.push({
              service: modelName,
              models: serviceModels.models
            });
          }
        } else {
          // Default model info if getModels not implemented
          models.push({
            service: modelName,
            models: [{
              id: modelName,
              name: modelName.charAt(0).toUpperCase() + modelName.slice(1),
              description: `${modelName} AI service`
            }]
          });
        }
      } catch (error) {
        console.error(`Failed to get models for ${modelName}:`, error);
      }
    }
    
    return {
      success: true,
      models
    };
  }

  getServiceInfo(modelName) {
    const service = this.services[modelName];
    if (!service) {
      return null;
    }

    const info = {
      name: modelName,
      available: true,
      description: this.getModelDescription(modelName)
    };

    return info;
  }

  getModelDescription(modelName) {
    const descriptions = {
      claude: 'Anthropic\'s Claude - Excellent for reasoning, analysis, and coding tasks',
      chatgpt: 'OpenAI\'s ChatGPT - Great for general conversations and creative tasks',
      perplexity: 'Perplexity AI - Perfect for research and up-to-date information with citations',
      catgpt: 'CatGPT - Demo AI service for testing and development'
    };

    return descriptions[modelName] || `${modelName} AI service`;
  }

  async healthCheck() {
    const health = {
      status: 'healthy',
      services: {},
      timestamp: new Date().toISOString()
    };

    for (const [modelName, service] of Object.entries(this.services)) {
      try {
        // Basic health check - just verify service exists and has required methods
        health.services[modelName] = {
          status: 'available',
          hasValidateMethod: typeof service.validateApiKey === 'function',
          hasGetModelsMethod: typeof service.getModels === 'function'
        };
      } catch (error) {
        health.services[modelName] = {
          status: 'error',
          error: error.message
        };
        health.status = 'degraded';
      }
    }

    return health;
  }

  // Get usage statistics (placeholder for future implementation)
  async getUsageStats(userId, timeframe = '24h') {
    // This would typically query a database for usage statistics
    return {
      success: true,
      userId,
      timeframe,
      stats: {
        totalRequests: 0,
        requestsByModel: {},
        tokensUsed: 0,
        averageResponseTime: 0
      },
      message: 'Usage tracking not yet implemented'
    };
  }

  // Rate limiting check (placeholder for future implementation)
  async checkRateLimit(userId, model) {
    // This would typically check against rate limiting rules
    return {
      allowed: true,
      remaining: 100,
      resetTime: Date.now() + 3600000, // 1 hour from now
      message: 'Rate limiting not yet implemented'
    };
  }
}

// Create and export singleton instance
const aiManager = new AIManager();
export default aiManager;
