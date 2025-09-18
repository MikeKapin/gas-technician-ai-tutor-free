import { CertificationLevel } from '@/types';

interface CSAUnit {
  unitNumber: number;
  title: string;
  filePath: string;
  content?: string;
  applicableLevel: 'G3' | 'G2' | 'Both';
}

class CSAContentService {
  private contentCache = new Map<string, string>();

  // Define which units apply to which certification levels
  private unitMapping: CSAUnit[] = [
    // G3 Units (1-9)
    { unitNumber: 1, title: 'Safety', filePath: 'Unit 1 - Safety', applicableLevel: 'Both' },
    { unitNumber: 2, title: 'Fasteners, Tools and Testing Equipment', filePath: 'Unit 2 - Fasteners, Tools and Testing Equipment', applicableLevel: 'Both' },
    { unitNumber: 3, title: 'Properties of Natural Gas and Fuels Safe Handling', filePath: 'Unit 3 - Properties of Natural Gas and Fuels Safe Handling', applicableLevel: 'Both' },
    { unitNumber: 4, title: 'Code and Regulations', filePath: 'Unit 4 - Code and Regs', applicableLevel: 'Both' },
    { unitNumber: 5, title: 'Introduction to Electricity', filePath: 'Unit 5 - Introduction to Electricity', applicableLevel: 'Both' },
    { unitNumber: 6, title: 'Technical Manuals, Specs, Drawings and Graphs', filePath: 'Unit 6 - Technical Manuals, Specs, Drawings and Graphs', applicableLevel: 'Both' },
    { unitNumber: 7, title: 'Customer Relations', filePath: 'Unit 7 - Customer Relations', applicableLevel: 'Both' },
    { unitNumber: 8, title: 'Introduction to Piping and Tubing Systems', filePath: 'Unit 8 - Intro to Piping and Tubing Systems', applicableLevel: 'Both' },
    { unitNumber: 9, title: 'Introduction to Gas Appliances', filePath: 'Unit 9 - Intro to Gas Appliances', applicableLevel: 'Both' },

    // G2 Units (10-24) - Advanced topics
    { unitNumber: 10, title: 'Advanced Piping and Tubing Systems', filePath: 'Unit 10 - Advanced Piping and Tubing Systems', applicableLevel: 'G2' },
    { unitNumber: 11, title: 'Pressure Regulators', filePath: 'Unit 11 - Pressure Regulators', applicableLevel: 'G2' },
    { unitNumber: 12, title: 'Basic Electricity for Gas Fired Equipment', filePath: 'Unit 12 - Basic Electricity for Gas Fired Equipment', applicableLevel: 'G2' },
    { unitNumber: 13, title: 'Controls', filePath: 'Unit 13 - Controls', applicableLevel: 'G2' },
    { unitNumber: 14, title: 'Building as a System', filePath: 'Unit 14 - Building as a System', applicableLevel: 'G2' },
    { unitNumber: 15, title: 'Domestic Appliances', filePath: 'Unit 15 - Domestic Appliances', applicableLevel: 'G2' },
    { unitNumber: 16, title: 'Gas Fired Refrigerators', filePath: 'Unit 16 - Gas Fired Refrigerators', applicableLevel: 'G2' },
    { unitNumber: 17, title: 'Conversion Burners', filePath: 'Unit 17 - Conversion Burners', applicableLevel: 'G2' },
    { unitNumber: 18, title: 'Water Heaters and Combination Systems', filePath: 'Unit 18 - Water Heaters and Combination Systems', applicableLevel: 'G2' },
    { unitNumber: 19, title: 'Forced Warm Air Heating Systems', filePath: 'Unit 19 - Forced Warm Air Heating Systems', applicableLevel: 'G2' },
    { unitNumber: 20, title: 'Hydronic Heating Systems', filePath: 'Unit 20 - Hydronic Heating Systems', applicableLevel: 'G2' },
    { unitNumber: 21, title: 'Space Heaters and Fireplaces', filePath: 'Unit 21 - Space Heaters and Fireplaces', applicableLevel: 'G2' },
    { unitNumber: 22, title: 'Venting Systems', filePath: 'Unit 22 - Venting Systems', applicableLevel: 'G2' },
    { unitNumber: 23, title: 'Forced Air Add-On Devices', filePath: 'Unit 23 - Forced Air Add-On Devices', applicableLevel: 'G2' },
    { unitNumber: 24, title: 'Air Handling', filePath: 'Unit 24 - Air Handling', applicableLevel: 'G2' }
  ];

  /**
   * Get relevant units for a specific tutor level
   */
  getUnitsForLevel(level: CertificationLevel): CSAUnit[] {
    if (level === 'G3') {
      return this.unitMapping.filter(unit =>
        unit.applicableLevel === 'G3' || unit.applicableLevel === 'Both'
      ).slice(0, 9); // Units 1-9
    } else {
      return this.unitMapping; // All units 1-24
    }
  }

  /**
   * Find units related to a specific topic
   */
  findRelevantUnits(query: string, level: CertificationLevel): CSAUnit[] {
    const availableUnits = this.getUnitsForLevel(level);
    const queryLower = query.toLowerCase();

    // Topic-based unit mapping
    const topicMappings: { [key: string]: number[] } = {
      'safety': [1],
      'piping': [8, 10],
      'pipe sizing': [8, 10],
      'tools': [2],
      'testing': [2],
      'gas properties': [3],
      'natural gas': [3],
      'codes': [4],
      'regulations': [4],
      'electricity': [5, 12],
      'electrical': [5, 12],
      'manuals': [6],
      'drawings': [6],
      'customer': [7],
      'appliances': [9, 15],
      'furnace': [19],
      'heating': [19, 20, 21],
      'water heater': [18],
      'venting': [22],
      'controls': [13],
      'regulators': [11],
      'clearance': [1, 21, 22],
      'installation': [8, 9, 10, 15],
      'commercial': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      'pressure': [11, 8, 10],
      'building': [14],
      'construction': [14],
      'platform construction': [14],
      'balloon construction': [14],
      'solid construction': [14],
      'frame construction': [14],
      'cavity wall': [14]
    };

    const relevantUnitNumbers = new Set<number>();

    // Check topic mappings
    for (const [topic, units] of Object.entries(topicMappings)) {
      if (queryLower.includes(topic)) {
        units.forEach(unitNum => relevantUnitNumbers.add(unitNum));
      }
    }

    // If no specific topics found, check titles
    if (relevantUnitNumbers.size === 0) {
      availableUnits.forEach(unit => {
        if (unit.title.toLowerCase().includes(queryLower)) {
          relevantUnitNumbers.add(unit.unitNumber);
        }
      });
    }

    // Return matched units, or top 3 most relevant for the level if none found
    if (relevantUnitNumbers.size > 0) {
      return availableUnits.filter(unit => relevantUnitNumbers.has(unit.unitNumber))
        .sort((a, b) => a.unitNumber - b.unitNumber);
    } else {
      // Default relevant units for common queries
      return level === 'G3' ?
        availableUnits.slice(0, 3) : // Units 1-3 for G3
        availableUnits.slice(0, 5);   // Units 1-5 for G2
    }
  }

  /**
   * Generate CSA study content and reference for free users
   */
  async generateCSAContent(query: string, level: CertificationLevel): Promise<string> {
    const relevantUnits = this.findRelevantUnits(query, level);

    let content = `## CSA Training Content Related to Your Query\n\n`;

    if (relevantUnits.length === 0) {
      content += `**General ${level} Training Information:**\n\n`;
      content += level === 'G3' ?
        `The G3 certification covers natural gas appliances up to 400,000 BTU/hr and includes Units 1-9 of CSA B149.1-25 training materials.` :
        `The G2 certification covers all gas appliances and advanced installations, including Units 1-24 of CSA B149.1-25 and B149.2-25 training materials.`;

      const allUnits = this.getUnitsForLevel(level);
      content += `\n\n**Available Study Units:**\n`;
      allUnits.slice(0, 6).forEach(unit => {
        content += `• **Unit ${unit.unitNumber}**: ${unit.title}\n`;
      });

      if (allUnits.length > 6) {
        content += `• ... and ${allUnits.length - 6} more units\n`;
      }
    } else {
      content += `Found **${relevantUnits.length}** relevant training unit${relevantUnits.length > 1 ? 's' : ''}:\n\n`;

      relevantUnits.slice(0, 3).forEach(unit => {
        content += `### Unit ${unit.unitNumber}: ${unit.title}\n\n`;

        // Generate specific content based on unit topic
        content += this.generateUnitContent(unit, query);
        content += `\n\n`;
      });
    }

    content += `---\n\n`;
    content += `**This is free CSA training content.** For detailed explanations, interactive Q&A, and personalized tutoring, upgrade to AI Tutor Pro.\n\n`;
    content += `[**Upgrade to Pro - $9.99/month**](https://buy.stripe.com/5kQeVefxX2VmbCS0tO7ok05) for:\n`;
    content += `• AI-powered explanations of complex topics\n`;
    content += `• Interactive problem-solving guidance\n`;
    content += `• Personalized study recommendations\n`;
    content += `• Code compliance assistance`;

    return content;
  }

  /**
   * Generate unit-specific content based on the topic
   */
  private generateUnitContent(unit: CSAUnit, query: string): string {
    const queryLower = query.toLowerCase();

    switch (unit.unitNumber) {
      case 1: // Safety
        return `**Key Safety Topics:**\n• Personal protective equipment (PPE)\n• Hazard identification and risk assessment\n• Safe work practices for gas installations\n• Emergency procedures and leak response\n• CSA B149.1 safety requirements`;

      case 2: // Tools and Testing
        return `**Tools and Testing Equipment:**\n• Manometers for pressure testing\n• Electronic gas detectors\n• Pipe threading and cutting tools\n• Testing procedures and documentation\n• Calibration requirements`;

      case 3: // Gas Properties
        return `**Natural Gas Properties:**\n• Specific gravity and heating value\n• Combustion characteristics\n• Gas composition and quality standards\n• Safe handling and storage procedures\n• Detection and leak response`;

      case 4: // Codes and Regulations
        return `**CSA B149.1-25 Code References:**\n• Installation requirements\n• Clearance specifications\n• Pressure testing procedures\n• Documentation and permits\n• Compliance verification`;

      case 8: // Piping Systems
        if (queryLower.includes('sizing') || queryLower.includes('pressure')) {
          return `**Piping System Design:**\n• Pipe sizing calculations\n• Pressure drop considerations\n• Material specifications (black iron, CSST, PE)\n• Installation methods and supports\n• Testing and commissioning`;
        }
        return `**Piping and Tubing Systems:**\n• Material types and specifications\n• Installation methods and techniques\n• Support and protection requirements\n• Testing and inspection procedures\n• Code compliance requirements`;

      case 9: // Gas Appliances
        return `**Gas Appliance Basics:**\n• Appliance categories and classifications\n• Installation requirements\n• Venting and combustion air\n• Controls and safety devices\n• Maintenance and troubleshooting`;

      case 11: // Pressure Regulators
        return `**Pressure Regulation:**\n• Regulator types and applications\n• Installation and adjustment procedures\n• Testing and maintenance requirements\n• Troubleshooting common issues\n• Code compliance standards`;

      case 18: // Water Heaters
        return `**Gas Water Heaters:**\n• Installation requirements\n• Venting specifications\n• Temperature and pressure relief\n• Controls and safety devices\n• Maintenance procedures`;

      case 22: // Venting
        return `**Venting Systems:**\n• Vent categories and classifications\n• Sizing and installation requirements\n• Clearance specifications\n• Inspection and testing procedures\n• Troubleshooting vent problems`;

      default:
        return `**${unit.title} Overview:**\n• CSA B149.1-25 compliance requirements\n• Installation and safety procedures\n• Code references and specifications\n• Best practices and common applications\n• Testing and documentation requirements`;
    }
  }
}

export const csaContentService = new CSAContentService();
export default csaContentService;