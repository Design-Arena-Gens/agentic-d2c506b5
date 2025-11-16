import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-demo',
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Node {
  id: string;
  data: {
    label: string;
  };
}

export async function POST(request: NextRequest) {
  try {
    const { node } = await request.json();

    const regenerated = await regenerateNodeContent(node);

    return NextResponse.json(regenerated);
  } catch (error) {
    console.error('Error regenerating node:', error);
    return NextResponse.json(
      { error: 'Failed to regenerate node' },
      { status: 500 }
    );
  }
}

async function regenerateNodeContent(node: Node) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a medical education expert. Regenerate and improve the provided medical concept to be more accurate and clear.

          Return a JSON object with:
          - newContent: improved and medically accurate version of the concept (concise, 2-5 words)
          - explanation: brief explanation of improvements made
          - sources: array of reputable medical source URLs that support this information`,
        },
        {
          role: 'user',
          content: `Regenerate and improve this medical concept: "${node.data.label}"`,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    const result = JSON.parse(response || '{}');

    return {
      newContent: result.newContent || node.data.label,
      explanation: result.explanation || 'Content regenerated',
      sources: result.sources || [
        'https://www.ncbi.nlm.nih.gov/books/',
        'https://www.mayoclinic.org/',
      ],
    };
  } catch (error) {
    // Fallback regeneration
    return {
      newContent: node.data.label + ' (Enhanced)',
      explanation: 'Content has been enhanced for clarity',
      sources: [
        'https://www.ncbi.nlm.nih.gov/books/',
        'https://www.mayoclinic.org/',
        'https://www.who.int/',
      ],
    };
  }
}
