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
 * Process image shortcodes in content
 * Replaces {{image1:left}}, {{image2:center}}, {{image3:right}} with aligned images
 */
export function processImageShortcodes(
  content: string,
  imageUrls: { image1?: string; image2?: string; image3?: string }
): string {

  let processed = content;
  
  // Process image1, image2, image3 with alignment
  ['image1', 'image2', 'image3'].forEach((imageKey, index) => {
    const imageUrl = imageUrls[imageKey as keyof typeof imageUrls];

    if (!imageUrl) return;
    
    // Match {{imageN:alignment:width}} where alignment is left, center, or right, and width is optional
    const regex = new RegExp(`\\{\\{\\s*${imageKey}\\s*:\\s*(left|center|right)(?:\\s*:\\s*([^}]+))?\\s*\\}\\}`, 'gi');

    
    processed = processed.replace(regex, (match, alignment, width) => {
      const alignClass = alignment === 'left' ? 'text-left' : alignment === 'center' ? 'text-center' : 'text-right';
      const widthStyle = width ? ` style="width: ${width.trim()};"` : '';
      return `<div class="${alignClass} my-4"><img src="${imageUrl}" alt="Image ${index + 1}" class="inline-block max-w-full h-auto rounded-lg shadow-md"${widthStyle} /></div>`;
    });
  });
  

  return processed;
}

/**
 * Render content - auto-detect markdown or HTML
 * Note: Notion placeholder processing happens in ProposalContent component
 * This function handles markdown-to-HTML conversion and image shortcodes
 */
/**
 * Process Notion-style image scaling: ![alt](url){width=50%}
 * Converts to HTML with inline width style
 */
export function processNotionImageScaling(content: string): string {
  // Match ![alt](url){width=value} pattern
  const regex = /!\[([^\]]*)\]\(([^)]+)\)\{width=([^}]+)\}/gi;
  
  return content.replace(regex, (match, alt, url, width) => {
    return `<img src="${url}" alt="${alt}" style="width: ${width.trim()};" class="max-w-full h-auto rounded-lg" />`;
  });
}

export function renderContent(
  content: string | null | undefined,
  imageUrls?: { image1?: string; image2?: string; image3?: string }
): string {
  if (!content) return '';
  
  // Process image shortcodes first
  let processed = content;
  if (imageUrls) {
    processed = processImageShortcodes(content, imageUrls);
  }
  
  // Process Notion-style image scaling
  processed = processNotionImageScaling(processed);
  
  // If content looks like markdown, parse it
  if (isMarkdown(processed)) {
    return parseMarkdown(processed);
  }
  
  // Otherwise return as-is (HTML)
  return processed;
}
