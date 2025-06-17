const fs = require('fs');
const path = require('path');

async function runAgent(agentType, fullPrompt) {
  console.log(`🤖 Starting ${agentType} agent...`);
  
  try {
    // Call Anthropic API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 8000,
        messages: [
          {
            role: 'user',
            content: `${fullPrompt}

Please analyze the current codebase and implement the requested feature. 

IMPORTANT INSTRUCTIONS:
- Only make changes relevant to your agent type (${agentType})
- Create or modify files as needed
- Follow the existing code patterns in the repository
- Provide clear, production-ready code
- Include proper TypeScript types
- Add appropriate comments

Please provide your implementation as file operations in this format:

CREATE_FILE: path/to/new/file.ts
\`\`\`typescript
// file content here
\`\`\`

MODIFY_FILE: path/to/existing/file.ts
\`\`\`typescript
// updated file content here
\`\`\`

DELETE_FILE: path/to/file/to/delete.ts

Begin your implementation:`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    const agentResponse = result.content[0].text;
    
    console.log(`✅ ${agentType} agent completed analysis`);
    
    // Parse and apply file operations
    await applyFileOperations(agentResponse);
    
    console.log(`🎉 ${agentType} agent finished implementing changes`);
    
  } catch (error) {
    console.error(`❌ ${agentType} agent failed:`, error.message);
    
    // Create a simple file to indicate agent ran (even if failed)
    const errorLog = `# ${agentType} Agent Error Log

Task attempted but failed with error: ${error.message}

This file indicates the agent attempted to run. Manual implementation may be needed.

Timestamp: ${new Date().toISOString()}
`;
    
    fs.writeFileSync(`agent-${agentType}-error.md`, errorLog);
  }
}

async function applyFileOperations(agentResponse) {
  const lines = agentResponse.split('\n');
  let currentOperation = null;
  let currentPath = null;
  let currentContent = [];
  let inCodeBlock = false;
  
  for (const line of lines) {
    if (line.startsWith('CREATE_FILE:')) {
      if (currentOperation) await executeOperation(currentOperation, currentPath, currentContent.join('\n'));
      currentOperation = 'CREATE';
      currentPath = line.replace('CREATE_FILE:', '').trim();
      currentContent = [];
      inCodeBlock = false;
    } else if (line.startsWith('MODIFY_FILE:')) {
      if (currentOperation) await executeOperation(currentOperation, currentPath, currentContent.join('\n'));
      currentOperation = 'MODIFY';
      currentPath = line.replace('MODIFY_FILE:', '').trim();
      currentContent = [];
      inCodeBlock = false;
    } else if (line.startsWith('DELETE_FILE:')) {
      if (currentOperation) await executeOperation(currentOperation, currentPath, currentContent.join('\n'));
      currentOperation = 'DELETE';
      currentPath = line.replace('DELETE_FILE:', '').trim();
      await executeOperation(currentOperation, currentPath, '');
      currentOperation = null;
    } else if (line.startsWith('```')) {
      if (inCodeBlock) {
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
    } else if (inCodeBlock && currentOperation) {
      currentContent.push(line);
    }
  }
  
  // Execute final operation
  if (currentOperation && currentPath) {
    await executeOperation(currentOperation, currentPath, currentContent.join('\n'));
  }
}

async function executeOperation(operation, filePath, content) {
  try {
    switch (operation) {
      case 'CREATE':
      case 'MODIFY':
        // Ensure directory exists
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(filePath, content);
        console.log(`✅ ${operation}: ${filePath}`);
        break;
        
      case 'DELETE':
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ DELETED: ${filePath}`);
        }
        break;
    }
  } catch (error) {
    console.error(`❌ Failed to ${operation} ${filePath}:`, error.message);
  }
}

// Execute if called directly
if (require.main === module) {
  const [agentType, prompt] = process.argv.slice(2);
  runAgent(agentType, prompt);
}

module.exports = { runAgent };