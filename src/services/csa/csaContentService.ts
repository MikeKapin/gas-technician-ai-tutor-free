import fs from 'fs';
import path from 'path';
import { TutorLevel } from '@/types';

// Also support CertificationLevel from free version for compatibility
type CertificationLevel = 'G3' | 'G2';
type Level = TutorLevel | CertificationLevel;

interface CSAUnit {
  unitNumber: number;
  title: string;
  filePath: string;
  content?: string;
  applicableLevel: 'G3' | 'G2' | 'Both';
}

class CSAContentService {
  private csaUnitsPath = 'C:\\Users\\m_kap\\OneDrive\\Desktop\\Personal\\WorkFlow\\NEW_Projects\\CSA Units';
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
  getUnitsForLevel(level: TutorLevel): CSAUnit[] {
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
  findRelevantUnits(query: string, level: TutorLevel): CSAUnit[] {
    const availableUnits = this.getUnitsForLevel(level);
    const queryLower = query.toLowerCase();

    // Topic-based unit mapping (enhanced)
    const topicMappings: { [key: string]: number[] } = {
      'safety': [1],
      'ppe': [1],
      'personal protective equipment': [1],
      'piping': [8, 10],
      'pipe sizing': [8, 10],
      'pipe size': [8, 10],
      'sizing': [8, 10],
      'tools': [2],
      'testing': [2],
      'pressure test': [2, 8],
      'leak test': [2, 3],
      'leak detection': [2, 3],
      'gas properties': [3],
      'natural gas': [3],
      'flame temperature': [3],
      'ignition temperature': [3],
      'specific gravity': [3],
      'density': [3],
      'heating value': [3],
      'btu': [3, 6],
      'codes': [4],
      'regulations': [4],
      'csa b149': [4],
      'electricity': [5, 12],
      'electrical': [5, 12],
      'manuals': [6],
      'drawings': [6],
      'customer': [7],
      'appliances': [9, 15],
      'furnace': [19],
      'heating': [19, 20, 21],
      'water heater': [18],
      'tankless': [18],
      'venting': [22],
      'vent': [22],
      'category i': [22],
      'category iv': [22],
      'controls': [13],
      'regulators': [11],
      'regulator': [11],
      'pressure regulation': [11],
      'clearance': [1, 21, 22],
      'clearances': [1, 21, 22],
      'installation': [8, 9, 10, 15],
      'commercial': [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
      'pressure': [11, 8, 10, 2],
      'building': [14],
      'construction': [14],
      'platform construction': [14],
      'balloon construction': [14],
      'solid construction': [14],
      'frame construction': [14],
      'cavity wall': [14],
      'fireplace': [21],
      'space heater': [21],
      'hydronic': [20],
      'boiler': [20],
      'forced air': [19],
      'air handling': [24],
      'refrigerator': [16],
      'conversion burner': [17],
      'add-on': [23]
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
   * Generate specific technical answers for common queries (Pro version gets these immediately)
   */
  getSpecificTechnicalAnswer(query: string, level: Level): string | null {
    const queryLower = query.toLowerCase();

    // Natural Gas Properties
    if (queryLower.includes('flame temperature') || queryLower.includes('combustion temperature')) {
      return `**Natural Gas Flame Temperature (Unit 3)**\n\n• **Adiabatic Flame Temperature:** ~1,950°C (3,542°F)\n• **Typical Operating:** 1,000-1,200°C (1,832-2,192°F)\n• Air-to-fuel ratio affects flame characteristics\n• Primary and secondary air complete combustion\n• CSA B149.1 Clause 4.2.1 - Combustion air requirements`;
    }

    if (queryLower.includes('ignition temperature') || queryLower.includes('auto ignition') || queryLower.includes('autoignition')) {
      return `**Natural Gas Ignition Temperature (Unit 3)**\n\n• **Auto-Ignition Temperature:** 540°C (1,004°F)\n• **Spark Ignition:** 15,000-20,000 volts\n• **Hot Surface Ignition:** 1,100°C minimum\n• **Flammability Limits:** 5.0% - 15.0% in air\n• CSA B149.1 Clause 4.5 - Ignition systems`;
    }

    if (queryLower.includes('ppe') && (queryLower.includes('requirement') || queryLower.includes('what'))) {
      return `**PPE Requirements (Unit 1)**\n\n• **Hard Hat:** CSA Type 1 Class E (electrical hazard protection)\n• **Safety Glasses:** ANSI Z87.1 with side shields\n• **Gloves:** Cut-resistant (ANSI A2 minimum) for metal handling\n• **Boots:** CSA Grade 1 steel-toe with puncture resistance\n• **Gas Detector:** Calibrated combustible gas detector (10% LEL alarm)\n• **High-Vis:** Class 2/3 vest in traffic areas`;
    }

    if (queryLower.includes('specific gravity') || queryLower.includes('density')) {
      return `**Natural Gas Specific Gravity (Unit 3)**\n\n• **Standard Specific Gravity:** 0.60 (relative to air)\n• **Density at STP:** 0.717 kg/m³\n• **Heating Value:** ~37.2 MJ/m³ (1,000 BTU/ft³)\n• **Lighter than air** - rises when released\n• Affects gas detector placement (ceiling level)\n• Different from propane (specific gravity 1.52)`;
    }

    if (queryLower.includes('pressure') && (queryLower.includes('test') || queryLower.includes('testing'))) {
      return `**Pressure Testing (Units 2 & 8)**\n\n• **Low Pressure (≤7 kPa):** Test at 10 kPa for 10 minutes, 0 Pa drop allowed\n• **Medium Pressure (7-103 kPa):** Test at 1.5× operating pressure for 30 min\n• **High Pressure (>103 kPa):** Test at 1.5× operating pressure for 1 hour\n• **Equipment:** Calibrated manometer accurate to ±25 Pa\n• **Documentation:** Required per CSA B149.1 Clause 7.7`;
    }

    if (queryLower.includes('clearance') || queryLower.includes('clearances')) {
      return `**Appliance Clearances (Units 1, 9, 21, 22)**\n\n• **Water Heater:** 150mm (6") top/sides, 600mm (24") front for service\n• **Furnace:** 300mm (12") top, 25mm (1") sides, 600mm (24") front\n• **Fireplace:** 200mm (8") from glass to combustibles\n• **Vent Connector:** 150mm (6") minimum to combustibles\n• CSA B149.1 Clause 6.3 - Clearance requirements`;
    }

    return null; // No specific answer found
  }

  /**
   * Extract key content from a unit (placeholder - would need actual file parsing)
   * This would be expanded to read PDF/HTML content from the units
   */
  async extractUnitContent(unit: CSAUnit): Promise<string> {
    const cacheKey = `unit_${unit.unitNumber}`;

    if (this.contentCache.has(cacheKey)) {
      return this.contentCache.get(cacheKey)!;
    }

    // Placeholder for actual content extraction
    // In a full implementation, this would:
    // 1. Read the PDF/HTML files from the unit directory
    // 2. Extract text content
    // 3. Parse and structure the information

    const placeholderContent = `
**Unit ${unit.unitNumber}: ${unit.title}**

[This would contain the actual CSA content from the ${unit.filePath} directory]

Key Topics:
- Detailed CSA B149.1-25 references
- Practical applications
- Safety requirements
- Code compliance procedures
- Real-world examples

*Note: Actual content extraction from PDFs/HTML files needs to be implemented*
    `.trim();

    this.contentCache.set(cacheKey, placeholderContent);
    return placeholderContent;
  }

  /**
   * Generate CSA-based context for AI prompts (Enhanced with specific technical data)
   */
  async generateCSAContext(query: string, level: TutorLevel): Promise<string> {
    let context = `**CSA Training Context for ${level} Level:**\n\n`;

    // First, check for specific technical answers
    const specificAnswer = this.getSpecificTechnicalAnswer(query, level);
    if (specificAnswer) {
      context += `**Direct Technical Answer:**\n${specificAnswer}\n\n`;
    }

    // Then add relevant unit context for AI to expand upon
    const relevantUnits = this.findRelevantUnits(query, level);

    context += `**Relevant Training Units:**\n`;
    for (const unit of relevantUnits.slice(0, 3)) { // Limit to top 3 units
      const content = await this.extractUnitContent(unit);
      context += content + '\n\n';
    }

    context += `**Instructions for AI Response:**\n`;
    context += `• Build upon the technical data provided above\n`;
    context += `• Add practical applications and examples\n`;
    context += `• Explain the "why" behind the specifications\n`;
    context += `• Reference specific CSA clauses when applicable\n`;
    context += `• Provide troubleshooting guidance where relevant\n\n`;

    context += `**Important:** All responses must be based on official CSA B149.1-25 and B149.2-25 codes and the above training materials. When in doubt, always defer to official CSA documentation.`;

    return context;
  }
}

export const csaContentService = new CSAContentService();
export default csaContentService;