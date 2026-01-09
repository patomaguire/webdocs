# Content Guide: Markdown, Images, Charts & Visuals

This guide explains how to create rich content for proposal tabs using Markdown, images, charts, and other visual elements.

## Background Options

The proposal supports two background types:

### 1. Flat Color Background
In Admin → Settings, set:
- `background_type`: `color`
- `background_value`: Any hex color (e.g., `#FFFFFF`, `#F5F5F5`)

### 2. Image Background
In Admin → Settings, set:
- `background_type`: `image`
- `background_value`: Full URL to image (e.g., `https://example.com/bg.jpg`)

The image background includes subtle animation (20s ease-in-out) and covers the entire page.

---

## Markdown Support

The system **automatically detects** markdown vs HTML content. You can write content in either format.

### Markdown Syntax Examples

#### Headers
```markdown
# Header 1
## Header 2
### Header 3
```

#### Text Formatting
```markdown
**Bold text**
*Italic text*
~~Strikethrough~~
```

#### Lists
```markdown
- Unordered item 1
- Unordered item 2

1. Ordered item 1
2. Ordered item 2
```

#### Links
```markdown
[Link text](https://example.com)
```

#### Images
```markdown
![Image alt text](https://example.com/image.jpg)
```

#### Blockquotes
```markdown
> This is a quote
> It can span multiple lines
```

#### Code
```markdown
Inline `code` here

```javascript
// Code block
function hello() {
  console.log("Hello!");
}
```
```

#### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

---

## Images

### Method 1: Markdown Syntax (Recommended)
```markdown
![Project Photo](https://example.com/project.jpg)
```

### Method 2: HTML (For more control)
```html
<img src="https://example.com/project.jpg" alt="Project Photo" style="max-width: 600px; border-radius: 8px;">
```

### Image Best Practices
- Use HTTPS URLs
- Optimize images (recommended max width: 1200px)
- Use descriptive alt text for accessibility
- Consider using image hosting services (Imgur, Cloudinary, S3)

---

## Charts & Visualizations

### Using HTML Canvas for Charts

You can embed Chart.js charts using HTML canvas elements with inline scripts:

```html
<canvas id="myChart" width="400" height="200"></canvas>
<script>
const ctx = document.getElementById('myChart').getContext('2d');
new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Q1', 'Q2', 'Q3', 'Q4'],
    datasets: [{
      label: 'Revenue',
      data: [12, 19, 3, 5],
      backgroundColor: 'rgba(54, 162, 235, 0.5)'
    }]
  }
});
</script>
```

### Chart Types Supported
- **Bar charts**: `type: 'bar'`
- **Line charts**: `type: 'line'`
- **Pie charts**: `type: 'pie'`
- **Doughnut charts**: `type: 'doughnut'`
- **Radar charts**: `type: 'radar'`
- **Scatter charts**: `type: 'scatter'`

### Simple Data Visualization with HTML Tables

For simple data, use markdown tables (automatically styled):

```markdown
| Metric | 2022 | 2023 | 2024 |
|--------|------|------|------|
| Revenue | $1.2M | $1.8M | $2.4M |
| Projects | 12 | 18 | 24 |
| Team Size | 8 | 12 | 16 |
```

---

## Mixed Content Example

You can combine markdown, images, tables, and HTML in the same content:

```markdown
## Project Overview

Our team delivered **15 successful projects** in 2024, exceeding targets by 25%.

![Team Photo](https://example.com/team.jpg)

### Key Metrics

| Metric | Target | Actual | Variance |
|--------|--------|--------|----------|
| Revenue | $2.0M | $2.4M | +20% |
| Projects | 12 | 15 | +25% |
| Satisfaction | 85% | 92% | +7% |

### Client Testimonial

> "The team exceeded our expectations in every way. Their professionalism and technical expertise were outstanding."
> — John Smith, CEO

<div style="background: #f0f9ff; padding: 20px; border-left: 4px solid #0284c7; margin: 20px 0;">
  <strong>Note:</strong> All projects were delivered on time and within budget.
</div>
```

---

## Tips & Best Practices

1. **Start with Markdown**: It's cleaner and easier to maintain
2. **Use HTML for special formatting**: When you need precise control
3. **Optimize images**: Large images slow down page load
4. **Test responsiveness**: View content on mobile devices
5. **Use consistent styling**: Maintain visual coherence across tabs
6. **Add alt text**: Improves accessibility and SEO

---

## Troubleshooting

### Content not rendering?
- Check for syntax errors in markdown
- Ensure image URLs are accessible (HTTPS)
- Verify HTML tags are properly closed

### Images not showing?
- Confirm URL is publicly accessible
- Check for CORS restrictions
- Try using a different image host

### Charts not displaying?
- Ensure Chart.js script is loaded
- Check browser console for errors
- Verify canvas ID is unique

---

## Need Help?

For technical support or questions about content formatting, contact the development team or refer to:
- [Markdown Guide](https://www.markdownguide.org/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
