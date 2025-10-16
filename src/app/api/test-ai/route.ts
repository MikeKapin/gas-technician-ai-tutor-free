import { NextResponse } from 'next/server';
import { aiService } from '@/services/ai/aiService';

export async function GET() {
  try {
    console.log('🧪 Testing AI service directly...');

    const response = await aiService.generateResponse(
      'What are clearance requirements for residential furnaces?',
      'G3',
      []
    );

    console.log('🧪 Direct AI service response:', response);

    return NextResponse.json({
      success: true,
      response,
      debug: {
        isRealAI: response.confidence === 0.95, // AI responses have 0.95, fallbacks have 0.85
        contentLength: response.content.length,
        hasCodeRefs: (response.codeReferences?.length || 0) > 0,
        hasModuleRefs: (response.moduleReferences?.length || 0) > 0
      }
    });
  } catch (error) {
    console.error('🧪 AI service test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}