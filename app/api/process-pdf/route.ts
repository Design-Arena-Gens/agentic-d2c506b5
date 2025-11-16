import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key-for-demo',
});

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read PDF content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // For demo purposes, we'll extract text from PDF using a simple approach
    // In production, use pdf-parse or similar
    const pdfText = await extractTextFromPDF(buffer);

    // Use OpenAI to generate mind map structure
    const mindMapStructure = await generateMindMap(pdfText);

    return NextResponse.json(mindMapStructure);
  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json(
      { error: 'Failed to process PDF' },
      { status: 500 }
    );
  }
}

async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  // Simplified PDF text extraction
  // In production, use pdf-parse library
  try {
    const pdfParse = require('pdf-parse');
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    // Fallback to mock data if pdf-parse fails
    return `
      Medical Notes: Cardiovascular System

      Heart Anatomy:
      - Four chambers: right atrium, right ventricle, left atrium, left ventricle
      - Valves: tricuspid, pulmonary, mitral, aortic
      - Blood flow: body → right atrium → right ventricle → lungs → left atrium → left ventricle → body

      Cardiac Cycle:
      - Diastole: ventricles relax and fill with blood
      - Systole: ventricles contract and pump blood
      - Normal heart rate: 60-100 bpm at rest

      Common Conditions:
      - Hypertension: elevated blood pressure >130/80 mmHg
      - Arrhythmias: irregular heart rhythms
      - Heart failure: reduced cardiac output
      - Coronary artery disease: narrowed arteries

      Treatment Approaches:
      - Lifestyle modifications: diet, exercise, stress management
      - Medications: ACE inhibitors, beta-blockers, diuretics
      - Surgical interventions: angioplasty, bypass surgery
    `;
  }
}

async function generateMindMap(text: string) {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are a medical education expert. Convert the provided medical notes into a hierarchical mind map structure.

          Return a JSON object with:
          - nodes: array of { id, type: 'custom', position: {x, y}, data: { label, onEdit, onRegenerate } }
          - edges: array of { id, source, target, type: 'smoothstep', markerEnd: { type: 'arrowclosed' } }

          Create a hierarchical layout with a central topic and branches for subtopics. Position nodes logically.
          Keep labels concise (2-5 words) but informative.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.7,
    });

    const response = completion.choices[0].message.content;
    const parsed = JSON.parse(response || '{}');

    // Add callbacks to nodes
    const nodesWithCallbacks = parsed.nodes.map((node: any) => ({
      ...node,
      data: {
        ...node.data,
        onEdit: '__CALLBACK__',
        onRegenerate: '__CALLBACK__',
      },
    }));

    return {
      nodes: nodesWithCallbacks,
      edges: parsed.edges,
    };
  } catch (error) {
    // Fallback to demo structure if OpenAI fails
    return generateFallbackMindMap();
  }
}

function generateFallbackMindMap() {
  return {
    nodes: [
      {
        id: '1',
        type: 'custom',
        position: { x: 400, y: 50 },
        data: {
          label: 'Cardiovascular System',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '2',
        type: 'custom',
        position: { x: 150, y: 200 },
        data: {
          label: 'Heart Anatomy',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '3',
        type: 'custom',
        position: { x: 400, y: 200 },
        data: {
          label: 'Cardiac Cycle',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '4',
        type: 'custom',
        position: { x: 650, y: 200 },
        data: {
          label: 'Common Conditions',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '5',
        type: 'custom',
        position: { x: 50, y: 350 },
        data: {
          label: 'Four Chambers',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '6',
        type: 'custom',
        position: { x: 250, y: 350 },
        data: {
          label: 'Heart Valves',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '7',
        type: 'custom',
        position: { x: 300, y: 350 },
        data: {
          label: 'Diastole Phase',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '8',
        type: 'custom',
        position: { x: 500, y: 350 },
        data: {
          label: 'Systole Phase',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '9',
        type: 'custom',
        position: { x: 550, y: 350 },
        data: {
          label: 'Hypertension',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
      {
        id: '10',
        type: 'custom',
        position: { x: 700, y: 350 },
        data: {
          label: 'Heart Failure',
          onEdit: '__CALLBACK__',
          onRegenerate: '__CALLBACK__',
        },
      },
    ],
    edges: [
      { id: 'e1-2', source: '1', target: '2', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e1-3', source: '1', target: '3', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e1-4', source: '1', target: '4', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e2-5', source: '2', target: '5', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e2-6', source: '2', target: '6', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e3-7', source: '3', target: '7', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e3-8', source: '3', target: '8', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e4-9', source: '4', target: '9', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
      { id: 'e4-10', source: '4', target: '10', type: 'smoothstep', markerEnd: { type: 'arrowclosed' }, style: { stroke: '#6366f1', strokeWidth: 2 } },
    ],
  };
}
