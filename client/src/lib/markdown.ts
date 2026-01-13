import { marked } from 'marked';

/**
 * Configure marked options for better rendering
 */
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub Flavored Markdown
});

/**
 * Parse markdown to HTML
 * Supports:
 * - Headers (#, ##, ###)
 * - Lists (-, *, 1.)
 * - Bold (**text**)
 * - Italic (*text*)
 * - Links ([text](url))
 * - Images (![alt](url))
 * - Code blocks (```language)
 * - Tables (| col1 | col2 |)
 * - Blockquotes (>)
 */
export function parseMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return '';
  
  try {
    return marked.parse(markdown) as string;
  } catch (error) {
    console.error('Markdown parsing error:', error);
    return markdown || '';
  }
}

/**
 * Check if content is markdown or HTML
 * Simple heuristic: if it contains markdown syntax, treat as markdown
 */
export function isMarkdown(content: string | null | undefined): boolean {
  if (!content) return false;
  
  const markdownPatterns = [
    /^#{1,6}\s/m, // Headers
    /^\s*[-*+]\s/m, // Unordered lists
    /^\s*\d+\.\s/m, // Ordered lists
    /\*\*.*\*\*/,// Bold
    /\[.*\]\(.*\)/, // Links
    /!\[.*\]\(.*\)/, // Images
    /```/, // Code blocks
    /^\|.*\|$/m, // Tables
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
}

/**
 * Render content - auto-detect markdown or HTML
 * Note: Notion placeholder processing happens in ProposalContent component
 * This function only handles markdown-to-HTML conversion
 */
export function renderContent(content: string | null | undefined): string {
  if (!content) return '';
  
  // If content looks like markdown, parse it
  if (isMarkdown(content)) {
    return parseMarkdown(content);
  }
  
  // Otherwise return as-is (HTML)
  return content;
}
