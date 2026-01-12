import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MarkdownCheatsheet() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer hover:bg-gray-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Markdown Formatting Guide</CardTitle>
          </div>
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-6">
          {/* Text Formatting */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Text Formatting</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2 font-mono text-sm">
              <div><code>**bold text**</code> → <strong>bold text</strong></div>
              <div><code>*italic text*</code> → <em>italic text</em></div>
              <div><code>~~strikethrough~~</code> → <del>strikethrough</del></div>
              <div><code>`inline code`</code> → <code className="bg-gray-200 px-1 rounded">inline code</code></div>
            </div>
          </div>

          {/* Headings */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Headings</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2 font-mono text-sm">
              <div><code># Heading 1</code></div>
              <div><code>## Heading 2</code></div>
              <div><code>### Heading 3</code></div>
              <div><code>#### Heading 4</code></div>
            </div>
          </div>

          {/* Lists */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Lists</h3>
            <div className="bg-gray-50 p-3 rounded space-y-3 font-mono text-sm">
              <div>
                <div className="text-gray-600 mb-1">Unordered list:</div>
                <pre className="whitespace-pre-wrap">{`- Item 1
- Item 2
  - Nested item (2 spaces indent)
  - Another nested item`}</pre>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Ordered list:</div>
                <pre className="whitespace-pre-wrap">{`1. First item
2. Second item
3. Third item`}</pre>
              </div>
            </div>
          </div>

          {/* Tables */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Tables</h3>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              <pre className="whitespace-pre-wrap">{`| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`}</pre>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Images</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2 font-mono text-sm">
              <div><code>![Alt text](https://example.com/image.jpg)</code></div>
              <div className="text-gray-600 text-xs mt-1">Upload images to S3 first, then use the URL</div>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Links</h3>
            <div className="bg-gray-50 p-3 rounded space-y-2 font-mono text-sm">
              <div><code>[Link text](https://example.com)</code></div>
            </div>
          </div>

          {/* Blockquotes */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Blockquotes</h3>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              <pre className="whitespace-pre-wrap">{`> This is a blockquote
> It can span multiple lines`}</pre>
            </div>
          </div>

          {/* Horizontal Rule */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Horizontal Rule</h3>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              <code>---</code> or <code>***</code>
            </div>
          </div>

          {/* Code Blocks */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Code Blocks</h3>
            <div className="bg-gray-50 p-3 rounded font-mono text-sm">
              <pre className="whitespace-pre-wrap">{`\`\`\`
Code block
Multiple lines
\`\`\``}</pre>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
            <h3 className="font-semibold text-md mb-2 text-blue-700">💡 Tips</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Use the Preview tab to see how your markdown renders</li>
              <li>• Leave blank lines between paragraphs for better spacing</li>
              <li>• Combine formatting: <code>**_bold italic_**</code></li>
              <li>• For complex layouts, use HTML tags directly</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
