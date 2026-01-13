// Advanced filtering utility with logic operations support

interface Project {
  projectName?: string;
  entity?: string;
  client?: string;
  location?: string;
  country?: string;
  projectValue?: string;
  projectYear?: string;
  services?: string;
  description?: string;
}

interface TeamMember {
  name?: string;
  title?: string;
  bio?: string;
  yearsExperience?: number;
  keySkills?: string;
}

export function filterProjects(projects: Project[], filterText: string): Project[] {
  if (!filterText.trim()) return projects;

  const normalized = filterText.toLowerCase().trim();
  
  return projects.filter(project => {
    return evaluateFilter(normalized, (field, operator, value) => {
      return matchProjectField(project, field, operator, value);
    });
  });
}

export function filterTeamMembers(members: TeamMember[], filterText: string): TeamMember[] {
  if (!filterText.trim()) return members;

  const normalized = filterText.toLowerCase().trim();
  
  return members.filter(member => {
    return evaluateFilter(normalized, (field, operator, value) => {
      return matchTeamField(member, field, operator, value);
    });
  });
}

function evaluateFilter(
  filter: string,
  matcher: (field: string | null, operator: string, value: string) => boolean
): boolean {
  // Handle NOT operator
  if (filter.startsWith('not ')) {
    return !evaluateFilter(filter.substring(4), matcher);
  }

  // Handle OR operator
  if (filter.includes(' or ')) {
    const parts = filter.split(' or ');
    return parts.some(part => evaluateFilter(part.trim(), matcher));
  }

  // Handle AND operator
  if (filter.includes(' and ')) {
    const parts = filter.split(' and ');
    return parts.every(part => evaluateFilter(part.trim(), matcher));
  }

  // Handle parentheses
  if (filter.startsWith('(') && filter.endsWith(')')) {
    return evaluateFilter(filter.substring(1, filter.length - 1), matcher);
  }

  // Parse field:value syntax
  const colonIndex = filter.indexOf(':');
  if (colonIndex > 0) {
    const field = filter.substring(0, colonIndex).trim();
    let valueWithOp = filter.substring(colonIndex + 1).trim();
    
    // Extract operator
    let operator = 'contains';
    if (valueWithOp.startsWith('>=')) {
      operator = '>=';
      valueWithOp = valueWithOp.substring(2).trim();
    } else if (valueWithOp.startsWith('<=')) {
      operator = '<=';
      valueWithOp = valueWithOp.substring(2).trim();
    } else if (valueWithOp.startsWith('>')) {
      operator = '>';
      valueWithOp = valueWithOp.substring(1).trim();
    } else if (valueWithOp.startsWith('<')) {
      operator = '<';
      valueWithOp = valueWithOp.substring(1).trim();
    } else if (valueWithOp.includes('-')) {
      // Handle range like "5-10"
      operator = 'range';
    }
    
    return matcher(field, operator, valueWithOp);
  }

  // No field specified - search all fields
  return matcher(null, 'contains', filter);
}

function matchProjectField(
  project: Project,
  field: string | null,
  operator: string,
  value: string
): boolean {
  if (field === null) {
    // Search all text fields
    const searchableFields = [
      project.projectName,
      project.entity,
      project.client,
      project.location,
      project.country,
      project.projectYear,
      project.services,
      project.description,
    ];
    return searchableFields.some(f => 
      f?.toLowerCase().includes(value)
    );
  }

  const fieldValue = getProjectFieldValue(project, field);
  
  if (operator === 'contains') {
    return fieldValue?.toLowerCase().includes(value) ?? false;
  }

  // Numeric comparison for value and year
  if (field === 'value' || field === 'year') {
    const numValue = parseFloat(fieldValue || '0');
    const targetValue = parseFloat(value);
    
    switch (operator) {
      case '>': return numValue > targetValue;
      case '<': return numValue < targetValue;
      case '>=': return numValue >= targetValue;
      case '<=': return numValue <= targetValue;
      default: return numValue === targetValue;
    }
  }

  return fieldValue?.toLowerCase().includes(value) ?? false;
}

function matchTeamField(
  member: TeamMember,
  field: string | null,
  operator: string,
  value: string
): boolean {
  if (field === null) {
    // Search all text fields
    const searchableFields = [
      member.name,
      member.title,
      member.bio,
      member.keySkills,
    ];
    return searchableFields.some(f => 
      f?.toLowerCase().includes(value)
    );
  }

  if (field === 'experience') {
    const experience = member.yearsExperience || 0;
    
    if (operator === 'range') {
      const [min, max] = value.split('-').map(v => parseFloat(v.trim()));
      return experience >= min && experience <= max;
    }
    
    const targetValue = parseFloat(value);
    switch (operator) {
      case '>': return experience > targetValue;
      case '<': return experience < targetValue;
      case '>=': return experience >= targetValue;
      case '<=': return experience <= targetValue;
      default: return experience === targetValue;
    }
  }

  const fieldValue = getTeamFieldValue(member, field);
  return fieldValue?.toLowerCase().includes(value) ?? false;
}

function getProjectFieldValue(project: Project, field: string): string | undefined {
  const fieldMap: Record<string, string | undefined> = {
    'name': project.projectName,
    'projectname': project.projectName,
    'entity': project.entity,
    'client': project.client,
    'location': project.location,
    'country': project.country,
    'value': project.projectValue,
    'projectvalue': project.projectValue,
    'year': project.projectYear,
    'projectyear': project.projectYear,
    'services': project.services,
    'description': project.description,
  };
  
  return fieldMap[field.toLowerCase()];
}

function getTeamFieldValue(member: TeamMember, field: string): string | undefined {
  const fieldMap: Record<string, string | undefined> = {
    'name': member.name,
    'title': member.title,
    'bio': member.bio,
    'skills': member.keySkills,
    'keyskills': member.keySkills,
  };
  
  return fieldMap[field.toLowerCase()];
}
