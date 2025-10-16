import { TutorLevel, ChatMessage, TutorConfiguration, CodeReference, ModuleReference, AIResponse, AIServiceConfig, TUTOR_CONFIGURATIONS } from '@/types'
import { csaPDFReader } from '@/services/csa/pdfReader'
import { toolReferencesService } from '@/services/csa/toolReferences'

class AIService {
  private config: AIServiceConfig

  constructor() {
    const provider = (process.env.NEXT_PUBLIC_AI_PROVIDER as 'openai' | 'anthropic') || 'anthropic'

    this.config = {
      provider,
      apiKey: provider === 'openai'
        ? process.env.OPENAI_API_KEY || ''
        : process.env.ANTHROPIC_API_KEY || '',
      model: provider === 'openai'
        ? process.env.NEXT_PUBLIC_OPENAI_MODEL || 'gpt-4-turbo-preview'
        : process.env.NEXT_PUBLIC_CLAUDE_MODEL || 'claude-sonnet-4-20250514'
    }

    if (!this.config.apiKey) {
      console.warn(`AI Service: No API key found for ${provider}`)
    }
  }

  async generateResponse(
    message: string,
    tutorLevel: TutorLevel,
    conversationHistory: ChatMessage[] = []
  ): Promise<AIResponse> {
    console.log('🤖 AI Service: generateResponse called')
    console.log('Config check:', {
      hasApiKey: !!this.config.apiKey,
      provider: this.config.provider,
      keyPrefix: this.config.apiKey ? this.config.apiKey.substring(0, 10) + '...' : 'NONE'
    })

    if (!this.config.apiKey) {
      console.log('❌ No API key - returning fallback')
      return this.generateFallbackResponse(message, tutorLevel)
    }

    const configuration = TUTOR_CONFIGURATIONS[tutorLevel]

    try {
      console.log('🔄 Attempting API call to:', this.config.provider)
      if (this.config.provider === 'openai') {
        const result = await this.callOpenAI(message, tutorLevel, configuration, conversationHistory)
        console.log('✅ OpenAI call successful')
        return result
      } else {
        const result = await this.callAnthropic(message, tutorLevel, configuration, conversationHistory)
        console.log('✅ Anthropic call successful')
        return result
      }
    } catch (error) {
      console.error('💥 AI Service Error - falling back:', error)
      return this.generateFallbackResponse(message, tutorLevel)
    }
  }

  private async callOpenAI(
    message: string,
    tutorLevel: TutorLevel,
    configuration: TutorConfiguration,
    conversationHistory: ChatMessage[]
  ): Promise<AIResponse> {
    const systemPrompt = await this.buildSystemPrompt(tutorLevel, configuration, message)
    const chatHistory = this.formatChatHistory(conversationHistory)

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          ...chatHistory,
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenAI API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.'

    return this.parseAIResponse(content, tutorLevel)
  }

  private async callAnthropic(
    message: string,
    tutorLevel: TutorLevel,
    configuration: TutorConfiguration,
    conversationHistory: ChatMessage[]
  ): Promise<AIResponse> {
    console.log('🔮 Anthropic: Building request')
    const systemPrompt = await this.buildSystemPrompt(tutorLevel, configuration, message)
    const chatHistory = this.formatChatHistoryForAnthropic(conversationHistory)

    const requestBody = {
      model: this.config.model,
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        ...chatHistory,
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.7
    }

    console.log('📤 Anthropic: Sending request', {
      model: this.config.model,
      messageCount: requestBody.messages.length,
      systemPromptLength: systemPrompt.length
    })

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    })

    console.log('📥 Anthropic: Response status', response.status, response.statusText)

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Anthropic API Error:', error)
      throw new Error(`Anthropic API error: ${error.error?.message || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('📋 Anthropic: Response data structure', {
      hasContent: !!data.content,
      contentLength: data.content?.length,
      firstContentType: data.content?.[0]?.type
    })

    const content = data.content[0]?.text || 'Sorry, I couldn\'t generate a response.'
    console.log('✅ Anthropic: Extracted content length', content.length)

    return this.parseAIResponse(content, tutorLevel)
  }

  private async buildSystemPrompt(tutorLevel: TutorLevel, configuration: TutorConfiguration, userQuery: string): Promise<string> {
    // Get relevant CSA content for this query
    const relevantCSAContent = csaPDFReader.searchCSAContent(userQuery, tutorLevel);

    // Get relevant unit numbers for tool recommendations
    const relevantUnitNumbers = relevantCSAContent.map(content => content.unitNumber);

    let csaContentSection = '';
    if (relevantCSAContent.length > 0) {
      csaContentSection = '\n\n**RELEVANT CSA TRAINING CONTENT:**\n\n';
      relevantCSAContent.forEach(content => {
        csaContentSection += `**${content.title} (Unit ${content.unitNumber}):**\n${content.content}\n\n`;
      });
      csaContentSection += '**END CSA CONTENT**\n\n';
    }

    // Get tool recommendations
    const toolRecommendations = toolReferencesService.generateToolRecommendations(userQuery, relevantUnitNumbers);

    return `You are a specialized ${tutorLevel} Gas Technician AI Tutor for Canadian gas installations. You are an expert in:

${configuration.coverage.codes.map(code => `• ${code}`).join('\n')}
${configuration.coverage.regulations.map(reg => `• ${reg}`).join('\n')}

SPECIALIZATION LEVEL: ${tutorLevel}
${tutorLevel === 'G3' ? `
G3 FOCUS AREAS:
• Residential gas appliances and installations
• Small commercial applications (up to 400,000 BTU/hr)
• Basic piping systems and clearance requirements
• CSA B149.1-25 code compliance
• TSSA Act and Ontario regulations
• Learning modules 1-9 competency development

TARGET APPLICATIONS:
- Residential furnaces, water heaters, fireplaces
- Small commercial cooking equipment
- Basic gas piping and connections
- Standard venting systems

COVERED CSA MODULES:
${configuration.coverage.modules.map(module => `- Unit ${module}: ${this.getModuleTitle(module)}`).join('\n')}
` : `
G2 FOCUS AREAS:
• Large commercial and industrial gas systems
• Advanced CSA B149.1-25 applications
• Complete CSA B149.2-25 (Propane) expertise
• Complex piping calculations and system design
• Multi-appliance installations and coordination
• Learning modules 10-24 advanced competencies

TARGET APPLICATIONS:
- Large commercial boilers and process equipment
- Industrial gas systems and distribution
- Propane installations (CSA B149.2-25)
- Complex multi-appliance systems
- Advanced troubleshooting and diagnostics

COVERED CSA MODULES:
${configuration.coverage.modules.map(module => `- Unit ${module}: ${this.getModuleTitle(module)}`).join('\n')}
`}

RESPONSE STYLE:
• Use "Code Compass" explanation style - break down complex concepts into easy-to-understand steps
• Provide specific code references with section numbers
• Include real-world examples relevant to ${tutorLevel} level work
• Use practical installation scenarios
• Emphasize safety requirements and procedures
• Reference appropriate learning modules when relevant

FORMATTING:
• Use markdown formatting with headers, bullet points, and code references
• Include code section references like "CSA B149.1-25, Section X.X.X"
• Highlight key safety points
• Provide step-by-step explanations when appropriate
• Use examples specific to ${tutorLevel === 'G3' ? 'residential/small commercial' : 'large commercial/industrial'} applications

Always tailor your responses to the ${tutorLevel} certification level and avoid topics outside your coverage area.

${csaContentSection}

**CRITICAL INSTRUCTIONS:**
1. **Base all responses on the CSA content provided above** - this is authentic Canadian gas technician training material
2. **If CSA content contradicts general AI knowledge, ALWAYS use the CSA content** as it represents official training standards
3. **Reference specific CSA sections and code numbers** when applicable
4. **For pipe sizing questions**: Remember that CSA sizing tables include fitting allowances - do NOT add equivalent lengths
5. **Always emphasize safety first** and proper CSA B149.1-25 compliance
6. **When uncertain about technical details**, recommend consulting the official CSA B149.1-25 and B149.2-25 codes

**Response Structure:**
- Start with direct answer based on CSA content
- Provide CSA code references where applicable
- Include relevant safety considerations
- Use "Code Compass" explanation style for complex concepts
- **ALWAYS end responses with relevant LARK Labs tool recommendations**

**LARK LABS TOOL INTEGRATION:**
${toolRecommendations}

**IMPORTANT:** Always include the relevant LARK Labs tools section at the end of your response to help users with practical applications and calculations.`
  }

  private formatChatHistory(conversationHistory: ChatMessage[]): { role: string, content: string }[] {
    return conversationHistory
      .filter(msg => msg.role !== 'system')
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
  }

  private formatChatHistoryForAnthropic(conversationHistory: ChatMessage[]): { role: 'user' | 'assistant', content: string }[] {
    return conversationHistory
      .filter(msg => msg.role !== 'system')
      .slice(-10) // Keep last 10 messages for context
      .map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
  }

  private parseAIResponse(content: string, tutorLevel: TutorLevel): AIResponse {
    // Extract code references from the response
    const codeReferences = this.extractCodeReferences(content, tutorLevel)
    const moduleReferences = this.extractModuleReferences(content, tutorLevel)

    return {
      content,
      confidence: 0.95, // AI typically has high confidence
      sources: this.getSources(tutorLevel),
      codeReferences,
      moduleReferences
    }
  }

  private extractCodeReferences(content: string, tutorLevel: TutorLevel): CodeReference[] {
    const references: CodeReference[] = []

    // Extract CSA B149.1-25 references
    const b1491Matches = content.match(/CSA B149\.1-25[,\s]*Section\s*([\d.]+)/gi)
    if (b1491Matches) {
      b1491Matches.forEach(match => {
        const sectionMatch = match.match(/([\d.]+)/)
        if (sectionMatch) {
          references.push({
            code: 'CSA B149.1-25',
            section: sectionMatch[1],
            title: this.getCodeSectionTitle(sectionMatch[1]),
            relevance: 'direct'
          })
        }
      })
    }

    // Extract CSA B149.2-25 references (for G2)
    if (tutorLevel === 'G2') {
      const b1492Matches = content.match(/CSA B149\.2-25[,\s]*Section\s*([\d.]+)/gi)
      if (b1492Matches) {
        b1492Matches.forEach(match => {
          const sectionMatch = match.match(/([\d.]+)/)
          if (sectionMatch) {
            references.push({
              code: 'CSA B149.2-25',
              section: sectionMatch[1],
              title: 'Propane Installation Code',
              relevance: 'direct'
            })
          }
        })
      }
    }

    return references
  }

  private extractModuleReferences(content: string, tutorLevel: TutorLevel): ModuleReference[] {
    const references: ModuleReference[] = []
    const moduleMatches = content.match(/(?:Module|Unit)\s*(\d+)/gi)

    if (moduleMatches) {
      moduleMatches.forEach(match => {
        const moduleNumber = parseInt(match.match(/(\d+)/)?.[1] || '0')
        if (moduleNumber > 0) {
          references.push({
            moduleNumber,
            title: this.getModuleTitle(moduleNumber),
            relevance: 'direct',
            competencies: this.getModuleCompetencies(moduleNumber)
          })
        }
      })
    }

    return references
  }

  private getCodeSectionTitle(section: string): string {
    // Map common code sections to titles
    const sectionTitles: { [key: string]: string } = {
      '6.2.1': 'Installation Requirements',
      '5.1': 'Piping Materials',
      '5.2': 'Pipe Sizing',
      '7.1': 'Testing Procedures',
      '3.1': 'Safety Requirements',
      '4.1': 'Appliance Classifications',
      '8.1': 'Venting Systems',
      '9.1': 'Service Requirements'
    }
    return sectionTitles[section] || 'Code Section'
  }

  private getModuleTitle(moduleNumber: number): string {
    const moduleTitles: { [key: number]: string } = {
      1: 'Safety',
      2: 'Fasteners, Tools and Testing Equipment',
      3: 'Properties of Natural Gas and Fuels Safe Handling',
      4: 'Code and Regulations',
      5: 'Introduction to Electricity',
      6: 'Technical Manuals, Specs, Drawings and Graphs',
      7: 'Customer Relations',
      8: 'Introduction to Piping and Tubing Systems',
      9: 'Introduction to Gas Appliances',
      10: 'Advanced Piping and Tubing Systems',
      11: 'Pressure Regulators',
      12: 'Basic Electricity for Gas Fired Equipment',
      13: 'Controls',
      14: 'Building as a System',
      15: 'Domestic Appliances',
      16: 'Gas Fired Refrigerators',
      17: 'Conversion Burners',
      18: 'Water Heaters and Combination Systems',
      19: 'Forced Warm Air Heating Systems',
      20: 'Hydronic Heating Systems',
      21: 'Space Heaters and Fireplaces',
      22: 'Venting Systems',
      23: 'Forced Air Add-On Devices',
      24: 'Air Handling'
    }
    return moduleTitles[moduleNumber] || `Module ${moduleNumber}`
  }

  private getModuleCompetencies(moduleNumber: number): string[] {
    // Sample competencies for different modules
    const competencies: { [key: number]: string[] } = {
      1: ['Safety procedures', 'Emergency response', 'PPE usage'],
      4: ['Code interpretation', 'Compliance requirements', 'Permit processes'],
      8: ['Pipe sizing', 'Installation methods', 'Leak testing'],
      13: ['Control systems', 'Safety devices', 'Troubleshooting']
    }
    return competencies[moduleNumber] || ['General competencies']
  }

  private getSources(tutorLevel: TutorLevel): string[] {
    const sources = ['CSA B149.1-25', 'TSSA Regulations', 'LARK Labs Training Materials']
    if (tutorLevel === 'G2') {
      sources.push('CSA B149.2-25')
    }
    return sources
  }

  private generateFallbackResponse(message: string, tutorLevel: TutorLevel): AIResponse {
    const configuration = TUTOR_CONFIGURATIONS[tutorLevel]

    const fallbackResponses = {
      G3: [
        "That's an excellent question about G3 gas technician requirements. For residential and small commercial installations up to 400,000 BTU/hr, CSA B149.1-25 provides comprehensive guidance on installation procedures and safety protocols. Always ensure proper ventilation and follow manufacturer guidelines for optimal safety.",

        "According to CSA B149.1-25 standards for G3 technicians, proper clearances and installation requirements are essential. Remember to verify gas pressure, conduct thorough leak testing, and ensure adequate combustion air supply for all appliances.",

        "For G3 certification success, focus on understanding residential gas systems, basic piping design, and safety procedures. Units 1-9 cover the fundamental competencies including safety, tools, gas properties, codes, electricity, and appliance basics.",

        "Safety is paramount in G3 work. Always follow proper lockout/tagout procedures, use appropriate PPE, and maintain adequate ventilation. CSA B149.1-25 Section 3 outlines critical safety requirements for residential installations."
      ],
      G2: [
        "Excellent question regarding G2 advanced gas systems. CSA B149.1-25 and B149.2-25 provide comprehensive coverage for large commercial and industrial installations. G2 technicians must master complex system design, load calculations, and advanced venting requirements.",

        "As a G2 technician, you'll handle unlimited BTU capacity systems and complex multi-appliance installations. Units 10-24 cover advanced topics including pressure regulators, controls, commercial appliances, and sophisticated venting systems.",

        "For G2 certification, understanding both CSA B149.1-25 and B149.2-25 (Propane) codes is essential. Focus on advanced piping calculations, industrial applications, and complex system commissioning procedures.",

        "Advanced G2 work requires expertise in commercial boilers, industrial systems, and propane installations. Study complex piping networks, advanced controls, and system integration for comprehensive competency development."
      ]
    }

    const responses = fallbackResponses[tutorLevel]
    const selectedResponse = responses[Math.floor(Math.random() * responses.length)]

    // Add contextual enhancements based on message content
    let enhancedResponse = selectedResponse
    const lowerMessage = message.toLowerCase()

    if (lowerMessage.includes('safety')) {
      enhancedResponse = `Safety is the top priority in gas technician work. ${enhancedResponse}`
    }

    if (lowerMessage.includes('exam') || lowerMessage.includes('test') || lowerMessage.includes('certification')) {
      enhancedResponse += " This topic is crucial for your certification exam preparation."
    }

    if (lowerMessage.includes('btu')) {
      if (tutorLevel === 'G3') {
        enhancedResponse += " Remember, G3 technicians work with appliances up to 400,000 BTU/hr capacity."
      } else {
        enhancedResponse += " As a G2 technician, you can work with unlimited BTU capacity systems."
      }
    }

    return {
      content: enhancedResponse,
      confidence: 0.85,
      sources: this.getSources(tutorLevel),
      codeReferences: [],
      moduleReferences: []
    }
  }

  // Test connection method
  async testConnection(): Promise<boolean> {
    // If we have a properly formatted API key, consider it connected
    if (!this.config.apiKey) {
      console.log('No API key found')
      return false
    }

    // Basic validation of API key format
    if (this.config.provider === 'anthropic') {
      const isValidFormat = this.config.apiKey.startsWith('sk-ant-')
      if (!isValidFormat) {
        console.log('Invalid Anthropic API key format')
        return false
      }
    } else if (this.config.provider === 'openai') {
      const isValidFormat = this.config.apiKey.startsWith('sk-')
      if (!isValidFormat) {
        console.log('Invalid OpenAI API key format')
        return false
      }
    }

    console.log(`AI Service: ${this.config.provider} API key found and properly formatted`)
    return true
  }
}

export const aiService = new AIService()
export default aiService