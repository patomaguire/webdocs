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
            <div className="bg-gray-50 p-3 rounded space-y-3 font-mono text-sm">
              <div>
                <div className="text-gray-600 mb-1">Basic table:</div>
                <pre className="whitespace-pre-wrap">{`| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | Data     |
| Row 2    | Data     | Data     |`}</pre>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Column alignment:</div>
                <pre className="whitespace-pre-wrap">{`| Left | Center | Right |
|:-----|:------:|------:|
| Text | Text   | Text  |`}</pre>
                <div className="text-xs text-gray-500 mt-1">:--- (left), :---: (center), ---: (right)</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Styled table with HTML:</div>
                <pre className="whitespace-pre-wrap">{`<table style="width:100%; border-collapse:collapse;">
  <tr style="background:#f0f0f0;">
    <th style="border:1px solid #ddd; padding:8px;">Name</th>
    <th style="border:1px solid #ddd; padding:8px;">Value</th>
  </tr>
  <tr>
    <td style="border:1px solid #ddd; padding:8px;">Item 1</td>
    <td style="border:1px solid #ddd; padding:8px;">$100</td>
  </tr>
</table>`}</pre>
              </div>
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

          {/* Multi-Column Layouts */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Multi-Column Layouts</h3>
            <div className="bg-gray-50 p-3 rounded space-y-3 font-mono text-sm">
              <div>
                <div className="text-gray-600 mb-1">Two columns:</div>
                <pre className="whitespace-pre-wrap">{`<div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
  <div>
    <h3>Column 1</h3>
    <p>Content for first column...</p>
  </div>
  <div>
    <h3>Column 2</h3>
    <p>Content for second column...</p>
  </div>
</div>`}</pre>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Three columns:</div>
                <pre className="whitespace-pre-wrap">{`<div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:15px;">
  <div>Column 1 content</div>
  <div>Column 2 content</div>
  <div>Column 3 content</div>
</div>`}</pre>
              </div>
            </div>
          </div>

          {/* Visual Enhancements */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">Visual Enhancements</h3>
            <div className="bg-gray-50 p-3 rounded space-y-3 font-mono text-sm">
              <div>
                <div className="text-gray-600 mb-1">Colored boxes:</div>
                <pre className="whitespace-pre-wrap">{`<div style="background:#e3f2fd; border-left:4px solid #2196f3; padding:12px; margin:10px 0;">
  Important information here
</div>`}</pre>
              </div>
              <div>
                <div className="text-gray-600 mb-1">Spacing and borders:</div>
                <pre className="whitespace-pre-wrap">{`<div style="border:2px solid #ddd; border-radius:8px; padding:16px; margin:20px 0;">
  Boxed content
</div>`}</pre>
              </div>
            </div>
          </div>

          {/* Notion Embeds */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-purple-700">📊 Notion Database Embeds</h3>
            <div className="bg-gray-50 p-3 rounded space-y-3 text-sm">
              <div>
                <div className="text-gray-600 mb-2">Embed Notion databases as interactive tables, timelines, galleries, and more.</div>
                <div className="text-gray-600 mb-2 font-semibold">Step 1: Get Notion Embed Link</div>
                <ol className="text-gray-600 ml-4 space-y-1 text-xs">
                  <li>1. Open your Notion database</li>
                  <li>2. Click "Share" → "Publish to web"</li>
                  <li>3. Copy the public link (e.g., https://notion.so/...)</li>
                  <li>4. Or click "Copy embed link" for iframe code</li>
                </ol>
              </div>
              <div>
                <div className="text-gray-600 mb-1 font-semibold">Step 2: Embed in Tab Content</div>
                <pre className="whitespace-pre-wrap font-mono text-xs">{`<iframe 
  src="https://notion.so/your-database-id?v=..." 
  width="100%" 
  height="600px" 
  frameborder="0"
  style="border-radius: 8px;">
</iframe>`}</pre>
              </div>
              <div className="bg-purple-50 p-2 rounded text-xs">
                <strong>Notion Views:</strong> Table, Board (Kanban), Timeline (Gantt), Calendar, Gallery, List. 
                Create different views in Notion and embed each with its unique URL.
              </div>
            </div>
          </div>

          {/* Chart.js Visualizations */}
          <div>
            <h3 className="font-semibold text-md mb-2 text-blue-700">📈 Chart.js Visualizations</h3>
            <div className="bg-gray-50 p-3 rounded space-y-4 text-sm">
              <div className="text-gray-600">Create custom charts using Chart.js. Add canvas element and script to render interactive charts.</div>
              
              {/* Pie Chart */}
              <div>
                <div className="text-gray-600 mb-1 font-semibold">Pie Chart:</div>
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">{`<canvas id="myPieChart" width="400" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('myPieChart').getContext('2d');
new Chart(ctx, {
  type: 'pie',
  data: {
    labels: ['Design', 'Construction', 'Planning', 'Management'],
    datasets: [{
      data: [30, 40, 20, 10],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Project Distribution' }
    }
  }
});
</script>`}</pre>
              </div>

              {/* Bar Chart */}
              <div>
                <div className="text-gray-600 mb-1 font-semibold">Bar Chart:</div>
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">{`<canvas id="myBarChart" width="600" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('myBarChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['2020', '2021', '2022', '2023', '2024'],
    datasets: [{
      label: 'Projects Completed',
      data: [12, 19, 15, 25, 22],
      backgroundColor: '#36A2EB'
    }]
  },
  options: {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { title: { display: true, text: 'Annual Projects' } }
  }
});
</script>`}</pre>
              </div>

              {/* Line Chart */}
              <div>
                <div className="text-gray-600 mb-1 font-semibold">Line Chart:</div>
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">{`<canvas id="myLineChart" width="600" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('myLineChart').getContext('2d');
new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Revenue (M)',
      data: [2.5, 3.2, 2.8, 4.1, 3.9, 4.5],
      borderColor: '#FF6384',
      backgroundColor: 'rgba(255, 99, 132, 0.1)',
      tension: 0.4,
      fill: true
    }]
  },
  options: {
    responsive: true,
    plugins: { title: { display: true, text: 'Revenue Trend' } }
  }
});
</script>`}</pre>
              </div>

              {/* Gantt-style */}
              <div>
                <div className="text-gray-600 mb-1 font-semibold">Gantt-Style Chart (Horizontal Bar):</div>
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">{`<canvas id="ganttChart" width="800" height="400"></canvas>
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script>
const ctx = document.getElementById('ganttChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Planning', 'Design', 'Construction', 'Testing'],
    datasets: [{
      label: 'Duration (weeks)',
      data: [4, 8, 16, 3],
      backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0']
    }]
  },
  options: {
    indexAxis: 'y',
    responsive: true,
    plugins: { title: { display: true, text: 'Project Timeline' } },
    scales: { x: { beginAtZero: true } }
  }
});
</script>`}</pre>
              </div>

              <div className="bg-blue-50 p-2 rounded text-xs">
                <strong>Important:</strong> Each chart needs a unique ID. Change <code className="bg-white px-1 rounded">id="myPieChart"</code> 
                to different names if using multiple charts in the same tab.
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
            <h3 className="font-semibold text-md mb-2 text-blue-700">💡 Tips</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Use the Preview tab to see how your markdown renders</li>
              <li>• Leave blank lines between paragraphs for better spacing</li>
              <li>• Combine formatting: <code>**_bold italic_**</code></li>
              <li>• For complex layouts, use HTML tags directly with inline styles</li>
              <li>• Tables support HTML for advanced styling (colors, borders, padding)</li>
              <li>• Multi-column layouts work best on desktop; consider mobile responsiveness</li>
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
