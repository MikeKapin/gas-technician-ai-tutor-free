import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Debug Info',
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
      anthropicKeyPrefix: process.env.ANTHROPIC_API_KEY ? process.env.ANTHROPIC_API_KEY.substring(0, 8) + '...' : 'NOT_FOUND',
      aiProvider: process.env.NEXT_PUBLIC_AI_PROVIDER,
      claudeModel: process.env.NEXT_PUBLIC_CLAUDE_MODEL,
      allEnvVars: Object.keys(process.env).filter(key =>
        key.startsWith('ANTHROPIC') ||
        key.startsWith('NEXT_PUBLIC_AI') ||
        key.startsWith('NEXT_PUBLIC_CLAUDE')
      )
    },
    timestamp: new Date().toISOString()
  });
}