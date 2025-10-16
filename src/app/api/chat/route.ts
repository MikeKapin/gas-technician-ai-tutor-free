import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/services/ai/aiService';
import { TutorLevel, ChatMessage } from '@/types';

interface ChatRequest {
  message: string;
  level: TutorLevel;
  conversationHistory?: ChatMessage[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { message, level, conversationHistory = [] } = body;

    if (!message || !level) {
      return NextResponse.json(
        { error: 'Message and level are required' },
        { status: 400 }
      );
    }

    if (!['G3', 'G2'].includes(level)) {
      return NextResponse.json(
        { error: 'Level must be G3 or G2' },
        { status: 400 }
      );
    }

    // Generate AI response using enhanced service
    const aiResponse = await aiService.generateResponse(
      message,
      level,
      conversationHistory
    );

    return NextResponse.json({
      response: aiResponse.content,
      timestamp: new Date().toISOString(),
      metadata: {
        confidence: aiResponse.confidence,
        sources: aiResponse.sources,
        codeReferences: aiResponse.codeReferences || [],
        moduleReferences: aiResponse.moduleReferences || []
      }
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  const connectionStatus = await aiService.testConnection();

  return NextResponse.json({
    message: 'Canadian Gas Technician Tutor API',
    version: '2.0.0',
    supported_levels: ['G3', 'G2'],
    ai_provider: process.env.NEXT_PUBLIC_AI_PROVIDER || 'anthropic',
    connection_status: connectionStatus ? 'connected' : 'disconnected',
    features: [
      'Enhanced AI responses with CSA code references',
      'Module-specific guidance (1-9 for G3, 10-24 for G2)',
      'Real-time code section mapping',
      'Advanced troubleshooting support',
      'LARK Labs educational integration'
    ]
  });
}