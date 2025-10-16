/**
 * LARK Labs Tool References for Gas Technician Training
 * These tools support practical application of CSA training content
 */

interface LarkLabsTool {
  name: string;
  description: string;
  url: string;
  applicableTo: string[];
  relevantUnits: number[];
  useCase: string;
}

class ToolReferencesService {
  private readonly baseUrl = 'https://larklabs.org';

  private tools: LarkLabsTool[] = [
    {
      name: 'Canadian Gas Pipe Sizing Calculator',
      description: 'Interactive calculator for gas pipe sizing per CSA B149.1-25',
      url: 'https://larklabs.org/apps/calculators/canadian-gas-piping-calculator.html',
      applicableTo: ['pipe sizing', 'piping', 'BTU calculations', 'pressure drop'],
      relevantUnits: [8, 10],
      useCase: 'Calculate proper pipe sizes based on BTU load and actual pipe length'
    },
    {
      name: 'HVAC Load Calculator',
      description: 'Calculate heating and cooling loads for gas appliances',
      url: 'https://larklabs.org/apps/calculators/hvac-load-calculator.html',
      applicableTo: ['BTU calculations', 'load calculations', 'appliance sizing', 'heating load', 'cooling load'],
      relevantUnits: [8, 9, 15, 19, 20],
      useCase: 'Determine proper heating/cooling loads for gas system design'
    },
    {
      name: 'Pressure Drop Calculator',
      description: 'Verify pressure drop calculations for gas piping systems',
      url: 'https://larklabs.org/',
      applicableTo: ['pressure drop', 'piping', 'system design'],
      relevantUnits: [8, 10, 11],
      useCase: 'Ensure pressure drop stays within CSA B149.1-25 limits'
    },
    {
      name: 'Clearance Reference Guide',
      description: 'Interactive clearance requirements for gas appliances',
      url: 'https://larklabs.org/',
      applicableTo: ['clearances', 'safety', 'installation', 'appliances'],
      relevantUnits: [1, 9, 15, 21, 22],
      useCase: 'Verify proper clearances for safe appliance installation'
    },
    {
      name: 'Venting Calculator',
      description: 'Calculate proper venting requirements for gas appliances',
      url: 'https://larklabs.org/',
      applicableTo: ['venting', 'vent sizing', 'appliances', 'clearances'],
      relevantUnits: [22],
      useCase: 'Size venting systems per CSA B149.1-25 requirements'
    },
    {
      name: 'Code Compass',
      description: 'Interactive CSA code navigation and reference system',
      url: 'https://larklabs.org/',
      applicableTo: ['codes', 'regulations', 'CSA B149', 'code lookup', 'compliance'],
      relevantUnits: [4], // Code and Regulations unit
      useCase: 'Navigate CSA B149.1-25 and B149.2-25 codes with intelligent search and cross-references'
    },
    {
      name: 'HVAC Jack 4.0 Troubleshooting Assistant',
      description: 'AI-powered diagnostic and troubleshooting assistant for gas appliances',
      url: 'https://larklabs.org/',
      applicableTo: ['troubleshooting', 'diagnostics', 'appliance repair', 'service', 'maintenance', 'problems', 'issues'],
      relevantUnits: [9, 13, 15, 16, 17, 18, 19, 20, 21],
      useCase: 'Step-by-step troubleshooting guidance for gas appliance service and repair'
    },
    {
      name: 'Gas Technician Study Tools',
      description: 'Interactive study materials and practice tests',
      url: 'https://larklabs.org/',
      applicableTo: ['study', 'exam prep', 'certification', 'practice'],
      relevantUnits: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      useCase: 'Practice questions and interactive learning for G3/G2 certification'
    }
  ];

  /**
   * Find relevant tools based on query content
   */
  findRelevantTools(query: string, unitNumbers?: number[]): LarkLabsTool[] {
    const queryLower = query.toLowerCase();
    const relevantTools: LarkLabsTool[] = [];

    // Check each tool for relevance
    this.tools.forEach(tool => {
      // Check if query matches tool's applicable topics
      const matchesTopic = tool.applicableTo.some(topic =>
        queryLower.includes(topic.toLowerCase())
      );

      // Check if query relates to tool's relevant units
      const matchesUnit = unitNumbers?.some(unitNum =>
        tool.relevantUnits.includes(unitNum)
      ) || false;

      if (matchesTopic || matchesUnit) {
        relevantTools.push(tool);
      }
    });

    // Sort by relevance (number of matching topics)
    return relevantTools.sort((a, b) => {
      const aMatches = a.applicableTo.filter(topic =>
        queryLower.includes(topic.toLowerCase())
      ).length;
      const bMatches = b.applicableTo.filter(topic =>
        queryLower.includes(topic.toLowerCase())
      ).length;
      return bMatches - aMatches;
    });
  }

  /**
   * Generate tool recommendations section for AI responses
   */
  generateToolRecommendations(query: string, unitNumbers?: number[]): string {
    const relevantTools = this.findRelevantTools(query, unitNumbers);

    if (relevantTools.length === 0) {
      return `\n\n🔧 **Additional Resources:**\nFor more gas technician tools and calculators, visit: **[LARK Labs Tools](https://larklabs.org/)**`;
    }

    let toolSection = '\n\n🔧 **Helpful Tools from LARK Labs:**\n\n';

    // Include top 2-3 most relevant tools
    relevantTools.slice(0, 3).forEach(tool => {
      toolSection += `**[${tool.name}](${tool.url})**\n`;
      toolSection += `${tool.description}\n`;
      toolSection += `*Use case: ${tool.useCase}*\n\n`;
    });

    toolSection += `*Visit **[LARK Labs Tools](https://larklabs.org/)** for the complete collection of gas technician calculators and resources.*`;

    return toolSection;
  }

  /**
   * Get specific tool for pipe sizing
   */
  getPipeSizingToolReference(): string {
    const pipeTool = this.tools.find(tool => tool.name === 'Canadian Gas Pipe Sizing Calculator');
    if (pipeTool) {
      return `\n\n🔧 **Recommended Tool:**\n**[${pipeTool.name}](${pipeTool.url})**\n${pipeTool.description}\n*${pipeTool.useCase}*`;
    }
    return '';
  }

  /**
   * Get Code Compass reference
   */
  getCodeCompassReference(): string {
    const codeTool = this.tools.find(tool => tool.name === 'Code Compass');
    if (codeTool) {
      return `\n\n📋 **Code Navigation:**\n**[${codeTool.name}](${codeTool.url})**\n${codeTool.description}\n*${codeTool.useCase}*`;
    }
    return '';
  }

  /**
   * Get HVAC Jack 4.0 reference
   */
  getHVACJackReference(): string {
    const hvacTool = this.tools.find(tool => tool.name === 'HVAC Jack 4.0 Troubleshooting Assistant');
    if (hvacTool) {
      return `\n\n🔧 **Troubleshooting Assistant:**\n**[${hvacTool.name}](${hvacTool.url})**\n${hvacTool.description}\n*${hvacTool.useCase}*`;
    }
    return '';
  }

  /**
   * Get all available tools
   */
  getAllTools(): LarkLabsTool[] {
    return [...this.tools];
  }
}

export const toolReferencesService = new ToolReferencesService();
export default toolReferencesService;