// Migration script to convert agents.ts to navigation.json
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Implement the necessary utility functions directly
function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

function getInitials(name) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function generateDefaultLogo(name) {
  return {
    type: 'initials',
    initials: getInitials(name),
    color: stringToColor(name)
  };
}

async function migrateData() {
  try {
    // Read the agents.ts file
    const agentsFilePath = path.join(__dirname, 'src', 'data', 'agents.ts');
    const content = await fs.readFile(agentsFilePath, 'utf8');

    // Read the type definition
    const typeMatch = content.match(/export interface Agent[\s\S]*?\}/);
    if (!typeMatch) {
      console.error('Could not find Agent type definition in agents.ts');
      process.exit(1);
    }

    // Extract the agents array by finding start and end positions
    const startIndex = content.indexOf('export const agents: Agent[] = [');
    if (startIndex === -1) {
      console.error('Could not find agents array start in agents.ts');
      process.exit(1);
    }

    // Find the matching closing bracket
    let openBrackets = 1;
    let endIndex = startIndex + 'export const agents: Agent[] = ['.length;
    
    while (openBrackets > 0 && endIndex < content.length) {
      const char = content[endIndex];
      if (char === '[') openBrackets++;
      if (char === ']') openBrackets--;
      endIndex++;
    }

    if (openBrackets !== 0) {
      console.error('Could not find matching closing bracket for agents array');
      process.exit(1);
    }

    // Extract the array string
    const arrayString = content.substring(startIndex + 'export const agents: Agent[] = '.length, endIndex);
    
    // Convert the string to JavaScript object
    const agentsArray = eval(arrayString);

    // Create the navigation data structure
    const navigationData = {
      items: agentsArray,
      lastUpdated: new Date().toISOString()
    };

    // Write to navigation.json
    const navigationFilePath = path.join(__dirname, 'public', 'data', 'navigation.json');
    await fs.writeFile(navigationFilePath, JSON.stringify(navigationData, null, 2));

    console.log('Data migrated successfully to public/data/navigation.json');
  } catch (error) {
    console.error('Error migrating data:', error);
    process.exit(1);
  }
}

migrateData();
