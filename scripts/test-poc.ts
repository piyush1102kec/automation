import { generateN8nWorkflow } from '../lib/n8n-generator';
import fs from 'fs';

async function main() {
  const prompt = process.argv[2] || "Create a webhook that receives a lead and sends an HTTP POST request to Slack";
  console.log(`Generating workflow for: "${prompt}"...`);

  try {
    const workflow = await generateN8nWorkflow(prompt);
    const outputPath = 'poc-output.json';
    fs.writeFileSync(outputPath, JSON.stringify(workflow, null, 2));
    console.log(`\n✅ Success! Workflow saved to ${outputPath}`);
    console.log('\n--- PREVIEW ---');
    console.log(`Name: ${workflow.name}`);
    console.log(`Nodes: ${workflow.nodes.length}`);
    console.log(`Connections: ${Object.keys(workflow.connections).length}`);
  } catch (err) {
    console.error('\n❌ Generation failed:', err);
  }
}

main();
