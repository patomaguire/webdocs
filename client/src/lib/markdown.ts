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
  console.log('[processImageShortcodes] Called with:', { contentLength: content.length, imageUrls });
  let processed = content;
  
  // Process image1, image2, image3 with alignment
  ['image1', 'image2', 'image3'].forEach((imageKey, index) => {
    const imageUrl = imageUrls[imageKey as keyof typeof imageUrls];
    console.log(`[processImageShortcodes] Processing ${imageKey}: ${imageUrl ? 'has URL' : 'no URL'}`);
    if (!imageUrl) return;
    
    // Match {{imageN:alignment}} where alignment is left, center, or right
    const regex = new RegExp(`\\{\\{\\s*${imageKey}\\s*:\\s*(left|center|right)\\s*\\}\\}`, 'gi');
    console.log(`[processImageShortcodes] Regex for ${imageKey}:`, regex);
    
    processed = processed.replace(regex, (match, alignment) => {
      console.log(`[processImageShortcodes] Found match: ${match}, alignment: ${alignment}, replacing with URL: ${imageUrl}`);
      const alignClass = alignment === 'left' ? 'text-left' : alignment === 'center' ? 'text-center' : 'text-right';
      return `<div class="${alignClass} my-4"><img src="${imageUrl}" alt="Image ${index + 1}" class="inline-block max-w-full h-auto rounded-lg shadow-md" /></div>`;
    });
  });
  
  console.log('[processImageShortcodes] Finished processing, changed:', processed !== content);
  return processed;
}

/**
 * Render content - auto-detect markdown or HTML
 * Note: Notion placeholder processing happens in ProposalContent component
 * This function handles markdown-to-HTML conversion and image shortcodes
 */
export function renderContent(
  content: string | null | undefined,
  imageUrls?: { image1?: string; image2?: string; image3?: string }
): string {
  if (!content) return '';
  
  console.log('[renderContent] Called with:', { contentLength: content.length, imageUrls });
  
  // Process image shortcodes first
  let processed = content;
  if (imageUrls) {
    processed = processImageShortcodes(content, imageUrls);
  }
  
  // If content looks like markdown, parse it
  if (isMarkdown(processed)) {
    console.log('[renderContent] Content is markdown, parsing...');
    return parseMarkdown(processed);
  }
  
  // Otherwise return as-is (HTML)
  console.log('[renderContent] Content is HTML, returning as-is');
  return processed;
}
