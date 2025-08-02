import axios from 'axios';

class CatGPTService {
  constructor() {
    this.baseURL = process.env.CATGPT_API_URL || 'https://api.catgpt.com/v1';
    this.apiKey = process.env.CATGPT_API_KEY || 'demo-key';
    this.defaultModel = 'catgpt-3.5-turbo';
  }

  async sendMessage(message, options = {}) {
    const {
      sessionId,
      model = this.defaultModel,
      temperature = 0.7,
      maxTokens = 1000,
      systemPrompt
    } = options;

    // For demo purposes, use mock response
    // In production, uncomment the real API call below
    return this.generateMockResponse(message, sessionId);

    // Real CatGPT API implementation:
    /*
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
          session_id: sessionId,
          stream: false
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        }
      );

      return {
        success: true,
        response: response.data.choices[0].message.content,
        sessionId: response.data.session_id || sessionId,
        usage: {
          promptTokens: response.data.usage.prompt_tokens,
          completionTokens: response.data.usage.completion_tokens,
          totalTokens: response.data.usage.total_tokens
        },
        model: response.data.model
      };
    } catch (error) {
      console.error('CatGPT API Error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.error?.message || 'Failed to get AI response',
        code: error.response?.status || 500
      };
    }
    */
  }

  async generateMockResponse(message, sessionId) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    // Generate session ID if not provided
    const finalSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Intelligent mock responses based on message content
    const messageText = message.toLowerCase();
    let response = '';

    if (messageText.includes('hello') || messageText.includes('hi') || messageText.includes('hey')) {
      response = "Hello! I'm CatGPT, your AI assistant. I'm here to help you with creative writing, coding, marketing, analysis, and much more. What would you like to work on today? 🐱";
    } else if (messageText.includes('write') && (messageText.includes('story') || messageText.includes('novel') || messageText.includes('fiction'))) {
      response = `I'd love to help you write a story! Here's a creative beginning based on your request:

**The Digital Awakening**

In the year 2045, Maya discovered that her grandmother's old typewriter wasn't just vintage—it was magical. Every story she typed on it came to life in the digital realm, creating entire worlds populated by characters who believed they were real.

As she typed her latest story about "${message.replace(/write|story|novel|fiction/gi, '').trim()}", the characters began to communicate back through the screen, pleading for better plot lines and more interesting conflicts.

Would you like me to continue this story or help you develop a different narrative? I can also help with character development, plot structure, or writing techniques.`;
    } else if (messageText.includes('code') || messageText.includes('programming') || messageText.includes('javascript') || messageText.includes('python') || messageText.includes('react')) {
      response = `I'm here to help with your coding needs! Based on your message about "${message}", I can assist with:

🔧 **Code Review & Optimization**
- Performance improvements
- Best practices implementation
- Code refactoring suggestions

💡 **Problem Solving**
- Algorithm design
- Debugging assistance
- Architecture recommendations

📚 **Learning Support**
- Concept explanations
- Code examples
- Step-by-step tutorials

What specific coding challenge are you working on? Share your code and I'll provide detailed feedback and suggestions.`;
    } else if (messageText.includes('marketing') || messageText.includes('copy') || messageText.includes('advertisement') || messageText.includes('sales')) {
      response = `Excellent! I can help you create compelling marketing copy. Here's a framework for your "${message}" project:

**The AIDA Framework:**
🎯 **Attention** - Hook your audience with a compelling headline
💡 **Interest** - Build curiosity with benefits and value
🔥 **Desire** - Create emotional connection and urgency  
✅ **Action** - Clear, specific call-to-action

**Key Elements for Success:**
- Know your target audience's pain points
- Focus on benefits, not just features
- Use social proof and testimonials
- Create urgency without being pushy
- Test different versions (A/B testing)

What specific type of marketing copy would you like me to help you create? (Email campaign, social media ads, website copy, etc.)`;
    } else if (messageText.includes('explain') || messageText.includes('what is') || messageText.includes('how does')) {
      response = `Great question! I'd be happy to explain that concept. Let me break down "${message}" in a clear, easy-to-understand way:

**Key Points:**
1. **Definition** - I'll start with a simple explanation
2. **How it works** - The underlying mechanisms or processes
3. **Real-world examples** - Practical applications you can relate to
4. **Why it matters** - The significance and impact

To give you the most helpful explanation, could you tell me:
- What's your current level of familiarity with this topic?
- Are you looking for a technical deep-dive or a general overview?
- Is there a specific aspect you'd like me to focus on?

This will help me tailor my explanation to be most useful for you!`;
    } else if (messageText.includes('creative') || messageText.includes('brainstorm') || messageText.includes('ideas')) {
      response = `Let's get those creative juices flowing! I love brainstorming sessions. Here are some powerful techniques we can use for "${message}":

🧠 **Mind Mapping**
- Start with your core concept and branch out
- No idea is too wild in the initial phase

💭 **"What If" Scenarios**
- Challenge assumptions
- Explore impossible possibilities

🔄 **Reverse Engineering**
- Start with the end goal and work backwards
- What would the opposite approach look like?

🎯 **SCAMPER Method**
- **S**ubstitute - What can be substituted?
- **C**ombine - What can be combined?
- **A**dapt - What can be adapted?
- **M**odify - What can be modified?
- **P**ut to other uses - How else can this be used?
- **E**liminate - What can be removed?
- **R**everse - What can be rearranged?

What specific area would you like to brainstorm about? The more details you share, the more targeted and creative our session can be!`;
    } else if (messageText.includes('analyze') || messageText.includes('data') || messageText.includes('research')) {
      response = `Perfect! I can help you with analysis and research. Based on your request about "${message}", here's how we can approach this:

📊 **Analysis Framework:**
1. **Define Objectives** - What specific insights are you seeking?
2. **Data Collection** - What information do we need?
3. **Methodology** - How should we analyze the data?
4. **Interpretation** - What do the results mean?
5. **Actionable Insights** - How can you use these findings?

🔍 **Research Strategies:**
- Primary vs. Secondary sources
- Quantitative vs. Qualitative methods
- Bias identification and mitigation
- Validation and cross-referencing

What type of analysis or research are you looking to conduct? Share more details about your project, and I'll provide specific methodologies and tools that would be most effective.`;
    } else {
      // Generate a contextual response for other messages
      const responses = [
        `That's a fascinating topic! Regarding "${message}", there are several interesting angles we could explore. This subject touches on multiple areas that I'd love to dive deeper into with you.`,
        
        `I find your question about "${message}" quite thought-provoking. There are multiple layers to consider here, and I can help you explore different perspectives and approaches.`,
        
        `Excellent point about "${message}"! This is exactly the kind of topic where AI assistance can be really valuable. I can help you break this down systematically and explore various solutions.`,
        
        `Thank you for bringing up "${message}". This is an area where I can provide significant value through analysis, creative thinking, and practical recommendations.`,
        
        `Your message about "${message}" opens up some really interesting possibilities. I'd love to help you explore this further and develop actionable insights.`
      ];
      
      response = responses[Math.floor(Math.random() * responses.length)];
      response += "\n\nTo give you the most helpful response, could you provide a bit more context about:\n- What specific aspect interests you most?\n- What's your goal or desired outcome?\n- Are there any constraints or requirements I should know about?\n\nThis will help me tailor my assistance to be most valuable for your needs!";
    }

    return {
      success: true,
      response,
      sessionId: finalSessionId,
      usage: {
        promptTokens: Math.floor(message.length / 4), // Rough estimate
        completionTokens: Math.floor(response.length / 4),
        totalTokens: Math.floor((message.length + response.length) / 4)
      },
      model: this.defaultModel
    };
  }

  async validateApiKey() {
    // In production, this would validate the API key with CatGPT
    return { valid: true, message: 'Demo mode - API key validation skipped' };
  }

  async getModels() {
    // In production, this would fetch available models from CatGPT
    return {
      success: true,
      models: [
        { id: 'catgpt-3.5-turbo', name: 'CatGPT 3.5 Turbo', description: 'Fast and efficient for most tasks' },
        { id: 'catgpt-4', name: 'CatGPT 4', description: 'Most capable model for complex tasks' },
        { id: 'catgpt-4-turbo', name: 'CatGPT 4 Turbo', description: 'Latest model with enhanced capabilities' }
      ]
    };
  }
}

// Create and export singleton instance
const catGPTService = new CatGPTService();
export default catGPTService;
