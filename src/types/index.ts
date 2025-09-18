export type TutorLevel = 'G3' | 'G2';
export type CertificationLevel = TutorLevel;

export interface AppState {
  currentView: 'selection' | 'chat';
  selectedLevel: TutorLevel | '';
  messages: ChatMessage[];
  inputMessage: string;
  isRecording: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    codeReferences?: CodeReference[];
    moduleReferences?: ModuleReference[];
    confidence?: number;
    sources?: string[];
    attachments?: MessageAttachment[];
  }
}

export interface Message extends ChatMessage {
  // Legacy support
  type: 'user' | 'ai';
}

export interface CodeReference {
  code: 'CSA B149.1-25' | 'CSA B149.2-25' | 'TSSA Act';
  section: string;
  subsection?: string;
  title: string;
  relevance: 'direct' | 'related' | 'supporting';
  excerpt?: string;
}

export interface ModuleReference {
  moduleNumber: number;
  title: string;
  relevance: 'direct' | 'related' | 'prerequisite';
  competencies: string[];
}

export interface MessageAttachment {
  type: 'diagram' | 'code_snippet' | 'calculation' | 'checklist';
  title: string;
  content: string;
  metadata?: any;
}

export interface TutorConfiguration {
  level: TutorLevel;
  name: string;
  description: string;
  coverage: {
    codes: string[];
    modules: number[];
    regulations: string[];
    specialFocus: string[];
  };
  capabilities: string[];
  learningPath: string[];
}

export interface TutorSession {
  id: string;
  tutorLevel: TutorLevel;
  startedAt: Date;
  userId?: string;
  configuration: TutorConfiguration;
  conversationHistory: ChatMessage[];
  currentContext: {
    activeModule?: number;
    currentCodeSection?: string;
    learningObjective?: string;
  };
}

export interface WelcomeMessage {
  G3: string;
  G2: string;
}

export interface CertificationInfo {
  level: CertificationLevel;
  title: string;
  description: string;
  details: string;
  color: 'blue' | 'red';
}

export interface AIResponse {
  content: string;
  confidence: number;
  sources: string[];
  codeReferences?: CodeReference[];
  moduleReferences?: ModuleReference[];
}

export interface AIServiceConfig {
  provider: 'openai' | 'anthropic';
  apiKey: string;
  model: string;
}

// G3 and G2 Tutor Configurations
export const TUTOR_CONFIGURATIONS: Record<TutorLevel, TutorConfiguration> = {
  G3: {
    level: 'G3',
    name: 'G3 Gas Technician Tutor',
    description: 'Master residential and small commercial gas installations with CSA B149.1-25 code compliance',
    coverage: {
      codes: ['CSA B149.1-25'],
      modules: [1, 2, 3, 4, 5, 6, 7, 8, 9],
      regulations: ['TSSA Act', 'Ontario Regulation 215/01', 'Fuel Safety Program'],
      specialFocus: [
        'Residential gas appliances',
        'Basic piping systems',
        'Appliance venting',
        'Safety procedures',
        'Installation clearances',
        'Testing and commissioning'
      ]
    },
    capabilities: [
      'CSA B149.1-25 code interpretation',
      'Residential installation guidance',
      'Small commercial applications',
      'Safety procedure training',
      'TSSA regulation compliance',
      'Module 1-9 competency development',
      'Installation calculations',
      'Troubleshooting guidance'
    ],
    learningPath: [
      'Gas codes and standards fundamentals',
      'Safety procedures and emergency response',
      'Gas appliance types and classifications',
      'Basic piping system design',
      'Installation requirements and clearances',
      'Testing, commissioning, and leak detection',
      'Venting systems and requirements',
      'Service and maintenance procedures',
      'Regulatory compliance and documentation'
    ]
  },
  G2: {
    level: 'G2',
    name: 'G2 Gas Technician Tutor',
    description: 'Advanced training for large commercial and industrial gas systems with dual-code expertise',
    coverage: {
      codes: ['CSA B149.1-25', 'CSA B149.2-25'],
      modules: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
      regulations: ['TSSA Act', 'Ontario Regulation 215/01', 'Industrial Safety Standards'],
      specialFocus: [
        'Large commercial installations',
        'Industrial gas systems',
        'Complex piping networks',
        'Propane installations (CSA B149.2)',
        'Advanced troubleshooting',
        'System design and engineering'
      ]
    },
    capabilities: [
      'Advanced CSA B149.1-25 interpretation',
      'Complete CSA B149.2-25 (Propane) expertise',
      'Large commercial system design',
      'Industrial installation guidance',
      'Complex piping calculations',
      'Advanced troubleshooting techniques',
      'Module 10-24 competency development',
      'Multi-appliance system coordination',
      'Engineering principle applications'
    ],
    learningPath: [
      'Advanced gas system principles',
      'Large commercial installations',
      'Industrial gas applications',
      'Propane systems (CSA B149.2-25)',
      'Complex piping design and sizing',
      'Advanced control systems',
      'Multi-appliance installations',
      'System commissioning and optimization',
      'Advanced troubleshooting and diagnostics',
      'Engineering calculations and load analysis',
      'Safety management systems',
      'Advanced regulatory compliance',
      'Project management and coordination',
      'Quality assurance and testing',
      'Advanced service and maintenance'
    ]
  }
};