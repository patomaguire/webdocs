import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface NotionDatabaseSchema {
  properties: Record<string, { type: string; name: string }>;
}

interface NotionPage {
  properties: Record<string, any>;
}

export async function fetchNotionDatabase(databaseId: string) {
  try {
    const { stdout, stderr } = await execAsync(
      `manus-mcp-cli tool call notion-fetch --server notion --input '${JSON.stringify({ id: databaseId })}'`,
      { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer for large databases
    );

    if (stderr && !stderr.includes('Tools list saved')) {
      console.error("Notion fetch stderr:", stderr);
    }

    // Parse the JSON response from MCP CLI
    const lines = stdout.trim().split('\n');
    const jsonLine = lines.find(line => line.trim().startsWith('{'));
    
    if (!jsonLine) {
      throw new Error("No valid JSON response from Notion MCP");
    }

    const response = JSON.parse(jsonLine);
    return response;
  } catch (error) {
    console.error("Error fetching from Notion:", error);
    throw new Error(`Failed to fetch from Notion: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function extractPropertyNames(notionData: any): string[] {
  // Extract property names from Notion database schema
  const propertyNames: string[] = [];
  
  // Check if response contains database schema
  if (notionData.content && Array.isArray(notionData.content)) {
    for (const item of notionData.content) {
      if (item.type === 'text' && typeof item.text === 'string') {
        const text = item.text;
        
        // Look for SQLite schema definition which lists all columns
        // Format: CREATE TABLE ... (column_name type, ...)
        const sqliteMatch = text.match(/CREATE TABLE[^(]+\(([^)]+)\)/s);
        if (sqliteMatch) {
          const columns = sqliteMatch[1].split(',');
          for (const col of columns) {
            const colName = col.trim().split(/\s+/)[0].replace(/["'`]/g, '');
            if (colName && !['id', 'url'].includes(colName.toLowerCase())) {
              propertyNames.push(colName);
            }
          }
          return propertyNames; // Found schema, return immediately
        }
        
        // Fallback: Parse markdown property list
        // Format: "- PropertyName (type)"
        const lines = text.split('\n');
        for (const line of lines) {
          const match = line.match(/^-\s+(.+?)\s+\(/);
          if (match) {
            const propName = match[1].trim();
            if (!propertyNames.includes(propName)) {
              propertyNames.push(propName);
            }
          }
        }
      }
    }
  }
  
  return propertyNames;
}

export function validateTeamMemberFields(notionData: any): { valid: boolean; missingFields: string[]; availableFields: string[] } {
  const requiredFields = ['name', 'title'];
  const optionalFields = ['bio', 'photoUrl', 'yearsExperience', 'keySkills', 'sortOrder'];
  
  const availableFields = extractPropertyNames(notionData);
  const availableFieldsLower = availableFields.map(f => f.toLowerCase());
  
  const missingFields = requiredFields.filter(
    required => !availableFieldsLower.includes(required.toLowerCase())
  );
  
  return {
    valid: missingFields.length === 0,
    missingFields,
    availableFields
  };
}

export function validateProjectFields(notionData: any): { valid: boolean; missingFields: string[]; availableFields: string[] } {
  const requiredFields = ['projectName'];
  const optionalFields = ['entity', 'client', 'location', 'country', 'latitude', 'longitude', 'projectValue', 'projectYear', 'services', 'description', 'sortOrder'];
  
  const availableFields = extractPropertyNames(notionData);
  const availableFieldsLower = availableFields.map(f => f.toLowerCase());
  
  const missingFields = requiredFields.filter(
    required => !availableFieldsLower.includes(required.toLowerCase())
  );
  
  return {
    valid: missingFields.length === 0,
    missingFields,
    availableFields
  };
}

function findPropertyValue(properties: Record<string, any>, targetName: string): any {
  // Case-insensitive property lookup
  const key = Object.keys(properties).find(
    k => k.toLowerCase() === targetName.toLowerCase()
  );
  
  if (!key) return null;
  
  const value = properties[key];
  
  // Handle different Notion property types
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value;
  if (value === null || value === undefined) return null;
  
  // Handle rich text, title, etc.
  if (Array.isArray(value)) {
    return value.map(v => v.text?.content || v).join(' ');
  }
  
  return String(value);
}

export function parseNotionTeamMembers(notionData: any): Array<{
  name: string;
  title: string;
  bio?: string;
  photoUrl?: string;
  yearsExperience?: number;
  keySkills?: string;
  sortOrder?: number;
}> {
  const members: any[] = [];
  
  // Extract pages from Notion response
  if (notionData.content && Array.isArray(notionData.content)) {
    for (const item of notionData.content) {
      if (item.type === 'text' && typeof item.text === 'string') {
        // Parse markdown to find page data
        const pageMatches = item.text.matchAll(/<page[^>]*>(.*?)<\/page>/gs);
        
        for (const match of pageMatches) {
          const pageContent = match[1];
          const properties: Record<string, any> = {};
          
          // Extract properties from page content
          const propLines = pageContent.split('\n');
          for (const line of propLines) {
            const propMatch = line.match(/^-\s+(.+?):\s+(.+)$/);
            if (propMatch) {
              properties[propMatch[1].trim()] = propMatch[2].trim();
            }
          }
          
          const name = findPropertyValue(properties, 'name');
          const title = findPropertyValue(properties, 'title');
          
          if (name && title) {
            members.push({
              name,
              title,
              bio: findPropertyValue(properties, 'bio') || undefined,
              photoUrl: findPropertyValue(properties, 'photoUrl') || undefined,
              yearsExperience: parseInt(findPropertyValue(properties, 'yearsExperience')) || undefined,
              keySkills: findPropertyValue(properties, 'keySkills') || undefined,
              sortOrder: parseInt(findPropertyValue(properties, 'sortOrder')) || members.length,
            });
          }
        }
      }
    }
  }
  
  return members;
}

export function parseNotionProjects(notionData: any): Array<{
  projectName: string;
  entity?: string;
  client?: string;
  location?: string;
  country?: string;
  latitude?: string;
  longitude?: string;
  projectValue?: string;
  projectYear?: string;
  services?: string;
  description?: string;
  isVisible?: boolean;
  sortOrder?: number;
}> {
  const projects: any[] = [];
  
  // Extract pages from Notion response
  if (notionData.content && Array.isArray(notionData.content)) {
    for (const item of notionData.content) {
      if (item.type === 'text' && typeof item.text === 'string') {
        // Parse markdown to find page data
        const pageMatches = item.text.matchAll(/<page[^>]*>(.*?)<\/page>/gs);
        
        for (const match of pageMatches) {
          const pageContent = match[1];
          const properties: Record<string, any> = {};
          
          // Extract properties from page content
          const propLines = pageContent.split('\n');
          for (const line of propLines) {
            const propMatch = line.match(/^-\s+(.+?):\s+(.+)$/);
            if (propMatch) {
              properties[propMatch[1].trim()] = propMatch[2].trim();
            }
          }
          
          const projectName = findPropertyValue(properties, 'projectName');
          
          if (projectName) {
            // Parse isVisible (default to true if not specified)
            const isVisibleValue = findPropertyValue(properties, 'isVisible');
            const isVisible = isVisibleValue ? (isVisibleValue === 'true' || isVisibleValue === '1') : true;
            
            projects.push({
              projectName,
              entity: findPropertyValue(properties, 'entity') || undefined,
              client: findPropertyValue(properties, 'client') || undefined,
              location: findPropertyValue(properties, 'location') || undefined,
              country: findPropertyValue(properties, 'country') || undefined,
              latitude: findPropertyValue(properties, 'latitude') || undefined,
              longitude: findPropertyValue(properties, 'longitude') || undefined,
              projectValue: findPropertyValue(properties, 'projectValue') || undefined,
              projectYear: findPropertyValue(properties, 'projectYear') || undefined,
              services: findPropertyValue(properties, 'services') || undefined,
              description: findPropertyValue(properties, 'description') || undefined,
              isVisible,
              sortOrder: parseInt(findPropertyValue(properties, 'sortOrder')) || projects.length,
            });
          }
        }
      }
    }
  }
  
  return projects;
}
