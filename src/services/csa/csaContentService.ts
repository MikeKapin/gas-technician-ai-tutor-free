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
   * Generate specific technical answers for common queries
   */
  private generateSpecificAnswer(query: string, level: CertificationLevel): string | null {
    const queryLower = query.toLowerCase();

    // Natural Gas Properties
    if (queryLower.includes('flame temperature') || queryLower.includes('combustion temperature')) {
      return `## Natural Gas Flame Temperature (Unit 3)\n\n**Adiabatic Flame Temperature:** ~1,950°C (3,542°F)\n**Typical Operating Flame Temperature:** 1,000-1,200°C (1,832-2,192°F)\n\n**Key Points:**\n• Maximum theoretical temperature in air is 1,950°C\n• Actual temperatures vary based on air-to-fuel ratio\n• Excess air reduces flame temperature\n• Primary air affects flame characteristics\n• Secondary air completes combustion\n\n**CSA B149.1 References:**\n• Clause 4.2.1 - Combustion air requirements\n• Clause 6.3 - Appliance clearances based on operating temperatures\n• Clause 7.4 - Venting system temperature ratings`;
    }

    if (queryLower.includes('ignition temperature') || queryLower.includes('auto ignition') || queryLower.includes('autoignition')) {
      return `## Natural Gas Ignition Temperature (Unit 3)\n\n**Auto-Ignition Temperature:** 540°C (1,004°F)\n\n**Ignition Characteristics:**\n• **Pilot Light Temperature:** 1,000-1,200°C\n• **Spark Ignition:** 15,000-20,000 volts\n• **Hot Surface Ignition:** 1,100°C minimum\n• **Ignition Energy Required:** 0.28 millijoules\n• **Flammability Limits:** 5.0% - 15.0% in air\n\n**Safety Implications:**\n• Below 540°C, natural gas requires external ignition source\n• Hot surfaces above 540°C can cause auto-ignition\n• Safety shutoff systems prevent accumulation\n• Proper ventilation prevents dangerous concentrations\n\n**CSA Code References:**\n• CSA B149.1 Clause 4.5 - Ignition systems\n• CSA B149.1 Clause 6.9 - Safety controls\n• CSA B149.1 Clause 8.4 - Hot surface ignitors`;
    }

    if (queryLower.includes('ppe') && (queryLower.includes('requirement') || queryLower.includes('what'))) {
      return `## PPE Requirements for Gas Technicians (Unit 1)\n\n**Mandatory Personal Protective Equipment:**\n\n**Head Protection:**\n• CSA Type 1 Class E hard hat (electrical hazard protection)\n• Must be worn in all work areas\n• Regular inspection for cracks and damage required\n\n**Eye and Face Protection:**\n• ANSI Z87.1 safety glasses with side shields\n• Face shield required for cutting/welding operations\n• Chemical splash goggles for solvent use\n\n**Respiratory Protection:**\n• N95 respirator minimum for dusty environments\n• Supplied air for confined space entry\n• Gas detector required before entering confined spaces\n\n**Hand Protection:**\n• Cut-resistant gloves (ANSI A2 minimum) for handling metal\n• Chemical-resistant gloves for solvents\n• Insulated gloves for electrical work\n\n**Foot Protection:**\n• CSA Grade 1 steel-toe boots\n• Puncture-resistant soles\n• Electrical hazard protection\n• Non-slip soles required\n\n**High-Visibility Clothing:**\n• Class 2 or 3 high-vis vest in traffic areas\n• Reflective striping required\n• Flame-resistant clothing for certain operations\n\n**Gas Detection Equipment:**\n• Calibrated combustible gas detector\n• 10% LEL alarm minimum\n• Daily calibration check required\n\n**CSA B149.1 References:**\n• Clause 3.2 - Worker safety requirements\n• Clause 10.1 - Personal protective equipment standards`;
    }

    if (queryLower.includes('specific gravity') || queryLower.includes('density')) {
      return `## Natural Gas Specific Gravity (Unit 3)\n\n**Standard Specific Gravity:** 0.60 (relative to air at 1.00)\n\n**Key Properties:**\n• **Molecular Weight:** ~16.04 (primarily methane)\n• **Density at STP:** 0.717 kg/m³\n• **Vapor Density:** 0.554 (lighter than air)\n• **Compressibility Factor:** 0.998 at standard conditions\n\n**Practical Implications:**\n• Natural gas rises when released (lighter than air)\n• Accumulates at high points in buildings\n• Different from propane (specific gravity 1.52)\n• Affects gas detector placement (ceiling level)\n• Influences pipe sizing calculations\n\n**Heating Values:**\n• **Gross Heating Value:** ~37.2 MJ/m³ (1,000 BTU/ft³)\n• **Net Heating Value:** ~33.5 MJ/m³ (900 BTU/ft³)\n• **Wobbe Index:** 48.2-51.8 MJ/m³\n\n**CSA References:**\n• CSA B149.1 Clause 4.1 - Gas quality standards\n• CSA B149.1 Clause 5.2 - Gas detector installation`;
    }

    if (queryLower.includes('pressure') && (queryLower.includes('test') || queryLower.includes('testing'))) {
      return `## Gas Pressure Testing Requirements (Units 2 & 8)\n\n**Test Pressures (CSA B149.1):**\n\n**Low Pressure Systems (≤7 kPa/1 psi):**\n• Test Pressure: 10 kPa (1.5 psi) for 10 minutes\n• Allowable pressure drop: 0 Pa\n• Use manometer accurate to ±25 Pa\n\n**Medium Pressure Systems (7-103 kPa/1-15 psi):**\n• Test Pressure: 1.5 × operating pressure\n• Minimum 103 kPa (15 psi) for 30 minutes\n• Allowable pressure drop: 0% over test period\n\n**High Pressure Systems (>103 kPa/15 psi):**\n• Test Pressure: 1.5 × operating pressure\n• Hold for 1 hour minimum\n• Allowable pressure drop: 0%\n\n**Testing Equipment Required:**\n• Calibrated digital manometer\n• Test gauge accurate to ±1% of reading\n• Pressure relief protection\n• Isolation valves\n• Test medium: air or inert gas\n\n**Testing Procedure:**\n1. Install test equipment at highest point\n2. Pressurize slowly to test pressure\n3. Isolate source and monitor pressure\n4. Document results on test form\n5. Release pressure safely\n\n**Documentation Requirements:**\n• Test pressure and duration\n• Pressure drop measurement\n• Technician certification number\n• Test equipment calibration dates\n\n**CSA References:**\n• CSA B149.1 Clause 7.7 - Pressure testing\n• CSA B149.1 Clause 11.3 - Test documentation`;
    }

    if (queryLower.includes('pipe siz') || queryLower.includes('sizing')) {
      return `## Gas Pipe Sizing (Units 8 & 10)\n\n**Pipe Sizing Factors:**\n\n**Key Variables:**\n• **Gas demand** (m³/h or ft³/h)\n• **Pipe length** (equivalent length including fittings)\n• **Allowable pressure drop** (typically 250-500 Pa)\n• **Specific gravity** (0.60 for natural gas)\n• **Pipe material** (black iron, CSST, PE)\n\n**Black Iron Pipe Capacities (250 Pa drop, 30m length):**\n• **½":** 3.4 m³/h (120 ft³/h)\n• **¾":** 7.1 m³/h (250 ft³/h)\n• **1":** 13.3 m³/h (470 ft³/h)\n• **1¼":** 23.6 m³/h (830 ft³/h)\n• **1½":** 35.4 m³/h (1,250 ft³/h)\n• **2":** 70.8 m³/h (2,500 ft³/h)\n\n**CSST Sizing (Corrugated Stainless Steel):**\n• Use manufacturer's capacity tables\n• Factor in jacket type and installation method\n• Consider additional pressure drop at fittings\n• EHD (Equivalent Hydraulic Diameter) method\n\n**Pressure Drop Calculation:**\nΔP = f × (L + Le) × ρ × v² / (2 × D)\n\nWhere:\n• ΔP = pressure drop (Pa)\n• f = friction factor\n• L = actual length (m)\n• Le = equivalent length of fittings (m)\n• ρ = gas density (kg/m³)\n• v = velocity (m/s)\n• D = pipe diameter (m)\n\n**Sizing Steps:**\n1. Calculate total gas demand\n2. Determine equivalent length\n3. Select allowable pressure drop\n4. Use capacity tables or calculations\n5. Verify with pressure test\n\n**CSA References:**\n• CSA B149.1 Clause 6.5 - Pipe sizing\n• CSA B149.1 Annex B - Capacity tables`;
    }

    if (queryLower.includes('clearance') || queryLower.includes('clearances')) {
      return `## Appliance Clearances (Units 1, 9, 21, 22)\n\n**Minimum Clearances to Combustibles:**\n\n**Water Heaters:**\n• **Top:** 150mm (6") minimum\n• **Sides:** 150mm (6") minimum  \n• **Front:** 600mm (24") for service access\n• **Back:** 25mm (1") minimum\n• **Vent connector:** 150mm (6") minimum\n\n**Furnaces:**\n• **Top:** 300mm (12") minimum\n• **Sides:** 25mm (1") minimum\n• **Front:** 600mm (24") for service access\n• **Supply plenum:** 25mm (1") minimum\n• **Return air:** 25mm (1") minimum\n\n**Fireplaces (Direct Vent):**\n• **Glass front:** 200mm (8") from combustibles\n• **Sides:** per manufacturer specifications\n• **Mantel clearances:** varies by BTU rating\n• **Hearth extension:** 200mm (8") minimum\n\n**Special Conditions:**\n• **Reduced clearances:** with approved shields\n• **Zero clearance:** only with certified appliances\n• **Alcove installations:** additional restrictions apply\n• **Ceiling heights:** minimum 2.1m (7'0")\n\n**CSA B149.1 References:**\n• Clause 6.3 - Clearance requirements\n• Clause 8.7 - Installation clearances\n• Clause 9.2 - Combustible construction`;
    }

    if (queryLower.includes('venting') || queryLower.includes('vent')) {
      return `## Venting Systems (Unit 22)\n\n**Vent Categories:**\n\n**Category I (80% AFUE and below):**\n• **Vent temperature:** >140°C (284°F)\n• **Vent pressure:** Non-positive\n• **Materials:** Type B-1 double wall metal\n• **Minimum rise:** 600mm (24") vertical\n\n**Category II (Rare - negative pressure, cool):**\n• **Special venting:** Required\n• **Materials:** Corrosion-resistant\n\n**Category III (Positive pressure, hot):**\n• **Vent temperature:** >140°C (284°F)\n• **Vent pressure:** Positive\n• **Materials:** Special Category III approved\n\n**Category IV (90%+ AFUE condensing):**\n• **Vent temperature:** <140°C (284°F)\n• **Vent pressure:** Positive\n• **Materials:** PVC, CPVC, or stainless steel\n• **Condensate drainage:** Required\n\n**Vent Sizing:**\n• **Single appliance:** Use appliance vent table\n• **Multiple appliances:** Common vent sizing required\n• **Fan assisted:** Follow manufacturer tables\n• **Maximum capacity:** per vent diameter and height\n\n**Installation Requirements:**\n• **Minimum pitch:** 6mm per 300mm (¼" per foot)\n• **Maximum horizontal:** 75% of vertical rise\n• **Cleanouts:** Required at base and direction changes\n• **Termination height:** 600mm (24") above roof\n\n**CSA B149.1 References:**\n• Clause 7.3 - Venting systems\n• Clause 7.4 - Vent materials and construction\n• Table 7.1 - Vent capacity tables`;
    }

    if (queryLower.includes('regulator') || queryLower.includes('pressure regulat')) {
      return `## Gas Pressure Regulators (Unit 11)\n\n**Regulator Types:**\n\n**Service Regulators:**\n• **Inlet pressure:** 103-689 kPa (15-100 psi)\n• **Outlet pressure:** 1.75-3.5 kPa (7-14" WC)\n• **Capacity:** varies by size (e.g., 85m³/h for ¾")\n• **Over-pressure protection:** 4.2 kPa (17" WC) maximum\n\n**Appliance Regulators:**\n• **Inlet pressure:** 1.75-3.5 kPa (7-14" WC)\n• **Outlet pressure:** 0.87-2.75 kPa (3.5-11" WC)\n• **Built-in relief:** vents excess pressure\n• **Adjustment:** factory sealed only\n\n**Line Regulators:**\n• **Medium pressure:** 14-103 kPa (2-15 psi)\n• **2-stage systems:** service + line regulation\n• **Installation:** outdoor or mechanical room\n\n**Installation Requirements:**\n• **Accessibility:** for maintenance and replacement\n• **Protection:** from mechanical damage\n• **Venting:** relief vents terminate safely outdoors\n• **Support:** adequate structural support required\n\n**Testing and Adjustment:**\n• **Lockup pressure:** maximum 4.2 kPa (17" WC)\n• **Working pressure:** 1.75-3.5 kPa (7-14" WC)\n• **Relief valve setting:** 4.2 kPa (17" WC)\n• **Test equipment:** digital manometer required\n\n**Troubleshooting:**\n• **No gas flow:** check upstream pressure\n• **High pressure:** regulator failure, replace\n• **Pressure fluctuation:** debris or worn diaphragm\n• **Relief valve operation:** over-pressure condition\n\n**CSA B149.1 References:**\n• Clause 6.7 - Pressure regulation\n• Clause 6.8 - Regulator installation\n• Clause 11.2 - Testing and adjustment`;
    }

    if (queryLower.includes('leak') && queryLower.includes('detect')) {
      return `## Gas Leak Detection (Units 2 & 3)\n\n**Detection Equipment:**\n\n**Electronic Detectors:**\n• **Combustible gas detector:** 0-100% LEL range\n• **Sensitivity:** detects 10 ppm minimum\n• **Calibration:** daily check with known gas sample\n• **Response time:** <10 seconds typical\n• **Battery life:** 8+ hours continuous use\n\n**Soap Solution Testing:**\n• **Mixing ratio:** 1:1 dish soap to water\n• **Application:** brush or spray bottle\n• **Observation:** bubbles indicate gas escape\n• **Pressure required:** minimum operating pressure\n• **Documentation:** photograph leak locations\n\n**Detection Procedures:**\n1. **Pre-test calibration:** verify detector accuracy\n2. **Systematic approach:** upstream to downstream\n3. **Joint inspection:** all connections and fittings\n4. **Appliance connections:** flexible connectors priority\n5. **Post-repair verification:** re-test all repairs\n\n**Leak Classification:**\n\n**Grade 1 - Immediate Hazard:**\n• **Criteria:** >80% LEL or immediate ignition risk\n• **Action:** shut off gas immediately\n• **Evacuation:** clear area of ignition sources\n• **Notification:** gas utility emergency line\n\n**Grade 2 - Recognized Hazard:**\n• **Criteria:** 20-80% LEL at leak point\n• **Action:** repair within 24 hours\n• **Monitoring:** check daily until repaired\n• **Customer notification:** required\n\n**Grade 3 - Non-Hazardous:**\n• **Criteria:** <20% LEL under favorable conditions\n• **Action:** repair at next maintenance\n• **Documentation:** log location and reading\n\n**Common Leak Locations:**\n• **Threaded joints:** especially older installations\n• **Flex connectors:** stress concentration points\n• **Regulators:** internal diaphragm failures\n• **Shut-off valves:** stem and body joints\n• **Appliance connections:** vibration-prone areas\n\n**CSA B149.1 References:**\n• Clause 7.8 - Leak testing procedures\n• Clause 11.4 - Detection equipment requirements\n• Clause 12.1 - Emergency procedures`;
    }

    if (queryLower.includes('btus') || queryLower.includes('btu') || queryLower.includes('heating value')) {
      return `## BTU Ratings and Gas Calculations (Units 3 & 6)\n\n**Natural Gas Heating Values:**\n• **Gross heating value:** 37.2 MJ/m³ (1,000 BTU/ft³)\n• **Net heating value:** 33.5 MJ/m³ (900 BTU/ft³)\n• **Standard conditions:** 15°C, 101.325 kPa\n• **Wobbe Index:** 48.2-51.8 MJ/m³ (typical range)\n\n**Common Appliance BTU Ratings:**\n\n**Residential Water Heaters:**\n• **40 gallon tank:** 40,000 BTU/h typical\n• **50 gallon tank:** 40,000-50,000 BTU/h\n• **Tankless:** 150,000-200,000 BTU/h\n• **Power vent:** 30,000-75,000 BTU/h\n\n**Furnaces:**\n• **Small home:** 60,000-80,000 BTU/h\n• **Medium home:** 80,000-120,000 BTU/h\n• **Large home:** 120,000-200,000 BTU/h\n• **High efficiency:** 90%+ AFUE rating\n\n**Cooking Appliances:**\n• **Range burner:** 5,000-15,000 BTU/h each\n• **Oven:** 16,000-25,000 BTU/h\n• **BBQ grill:** 30,000-60,000 BTU/h total\n• **Commercial range:** 25,000-40,000 BTU/h per burner\n\n**Gas Consumption Calculations:**\n\n**Hourly consumption = BTU/h ÷ heating value**\n• Example: 100,000 BTU/h ÷ 1,000 BTU/ft³ = 100 ft³/h\n• Metric: 100,000 BTU/h ÷ 37.2 MJ/m³ = 2.7 m³/h\n\n**Annual consumption estimation:**\n• **Heating:** degree days × BTU/h × efficiency factor\n• **Water heating:** ~25% of total residential use\n• **Cooking:** ~5% of total residential use\n• **Total residential:** 2,000-4,000 m³/year typical\n\n**Load Calculations:**\n• **Simultaneous demand:** not all appliances at maximum\n• **Diversity factor:** typically 0.7-0.8 for residential\n• **Peak demand:** design basis for pipe sizing\n• **Connected load:** sum of all appliance inputs\n\n**G3 vs G2 Limits:**\n• **G3 maximum:** 400,000 BTU/h (117 kW) per appliance\n• **G2 maximum:** No limit on appliance size\n• **Commercial systems:** G2 certification required\n\n**CSA B149.1 References:**\n• Clause 4.1 - Gas quality and heating value\n• Clause 6.5 - Capacity calculations\n• Annex B - Appliance input ratings`;
    }

    return null;
  }

  /**
   * Generate CSA study content and reference for free users
   */
  async generateCSAContent(query: string, level: CertificationLevel): Promise<string> {
    // First check for specific technical answers
    const specificAnswer = this.generateSpecificAnswer(query, level);
    if (specificAnswer) {
      return specificAnswer + `\n\n---\n\n**Need More Detail?** Upgrade to AI Tutor Pro for:\n• Interactive Q&A with follow-up questions\n• Step-by-step problem solving\n• Code interpretation help\n• Personalized exam preparation\n\n[**Upgrade to Pro - $9.99/month**](https://buy.stripe.com/5kQeVefxX2VmbCS0tO7ok05)`;
    }

    // Fall back to unit-based search
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