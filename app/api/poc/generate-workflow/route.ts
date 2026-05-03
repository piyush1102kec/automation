import { NextRequest, NextResponse } from 'next/server';
import type { GeneratedWorkflow, N8nWorkflow } from '@/types/n8n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Mock implementation for the POC
// In a real implementation, this would use an AI model to generate workflows
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Mock workflow generation based on prompt
    const mockWorkflow: N8nWorkflow = {
      name: "Generated Workflow",
      nodes: [
        {
          id: "1",
          name: "Schedule Trigger",
          type: "scheduleTrigger",
          typeVersion: 1,
          position: [250, 300],
          parameters: {
            rule: "every monday at 9am"
          }
        },
        {
          id: "2",
          name: "HTTP Request",
          type: "httpRequest",
          typeVersion: 1,
          position: [500, 300],
          parameters: {
            url: "https://api.example.com/data",
            method: "GET"
          }
        }
      ],
      connections: {
        "1": {
          main: [
            [
              {
                node: "2",
                type: "main",
                index: 0
              }
            ]
          ]
        }
      },
      active: false,
      settings: {}
    };

    // Explanation based on prompt
    const explanation = `This workflow was generated based on your request: "${prompt}". 
It runs on a schedule and fetches data from an API.`;

    // Steps for visualization
    const steps = [
      {
        nodeType: "scheduleTrigger",
        nodeName: "Schedule Trigger",
        description: "Runs on schedule"
      },
      {
        nodeType: "httpRequest",
        nodeName: "HTTP Request",
        description: "Fetches from URL"
      }
    ];

    const generatedWorkflow: GeneratedWorkflow = {
      workflow: mockWorkflow,
      explanation,
      steps
    };

    return NextResponse.json(generatedWorkflow);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate workflow' }, { status: 500 });
  }
}