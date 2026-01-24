import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Download, Upload, Trash2, X } from "lucide-react";
import { marked } from 'marked';
import { MarkdownCheatsheet } from '@/components/MarkdownCheatsheet';

interface TabEditFormProps {
  selectedTab: number | null;
  formData: {
    tabTitle: string;
    htmlContent: string;
    isVisible: boolean;
    backgroundType: "color" | "gradient" | "image";
    backgroundValue: string;
    notionDatabaseUrl: string;
    notionDatabaseUrl2: string;
    notionDatabaseUrl3: string;
  };
  setFormData: (data: any) => void;
  onSave: () => void;
  onDelete?: () => void;
  isSaving: boolean;
  isDeleting: boolean;
  onImageUpload: (file: File) => Promise<string>;
}

export function TabEditForm({
  selectedTab,
  formData,
  setFormData,
  onSave,
  onDelete,
  isSaving,
  isDeleting,
  onImageUpload,
}: TabEditFormProps) {
  const [notionMarkdownInput, setNotionMarkdownInput] = useState("");
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; name: string }>>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<Array<{ url: string; name: string; size: number }>>([]);

  if (selectedTab === null) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Select a tab from the list to edit its content
      </div>
    );
  }

  const handleConvertNotionMarkdown = () => {
    if (!notionMarkdownInput.trim()) {
      toast.error("Please paste some Notion markdown first");
      return;
    }

    try {
      let converted = notionMarkdownInput;
      
      // Remove toggle blocks
      converted = converted.replace(/▶\s*###\s*\*\*(.*?)\*\*/g, '### $1');
      converted = converted.replace(/▶\s*##\s*\*\*(.*?)\*\*/g, '## $1');
      converted = converted.replace(/▶\s*#\s*\*\*(.*?)\*\*/g, '# $1');
      converted = converted.replace(/▶\s*\*\*(.*?)\*\*/g, '**$1**');
      converted = converted.replace(/▶\s*/g, '');
      
      // Remove Notion color syntax
      converted = converted.replace(/\s*\{color="[^"]+"\}/g, '');
      
      // Remove empty blocks
      converted = converted.replace(/<empty-block\/>/g, '');
      
      // Convert Notion columns to sections
      converted = converted.replace(/<columns>[\s\S]*?<\/columns>/g, (match) => {
        const columnMatches = match.match(/<column>([\s\S]*?)<\/column>/g);
        if (!columnMatches) return '';
        return columnMatches.map(col => col.replace(/<\/?column>/g, '').trim()).join('\n\n---\n\n');
      });
      
      // Convert Notion images
      converted = converted.replace(/<image source="([^"]+)"[^>]*>/g, '![]($1)');
      
      // Convert Notion files
      converted = converted.replace(/<file source="([^"]+)"[^>]*>/g, '[Download File]($1)');
      
      // Clean up excessive whitespace
      converted = converted.replace(/\n{3,}/g, '\n\n');
      
      setFormData({ ...formData, htmlContent: converted.trim() });
      setNotionMarkdownInput('');
      toast.success("Notion markdown converted and inserted!");
    } catch (error: any) {
      console.error("Conversion error:", error);
      toast.error("Failed to convert markdown");
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    try {
      const url = await onImageUpload(file);
      const newImages = [...uploadedImages];
      newImages[index] = { url, name: file.name };
      setUploadedImages(newImages);
      
      // Update formData with image URL
      const key = `notionDatabaseUrl${index === 0 ? '' : index + 1}` as keyof typeof formData;
      setFormData({ ...formData, [key]: url });
      
      toast.success(`Image ${index + 1} uploaded!`);
    } catch (error) {
      toast.error("Failed to upload image");
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + uploadedDocuments.length > 10) {
      toast.error("Maximum 10 documents allowed per tab");
      return;
    }
    
    try {
      for (const file of files) {
        const url = await onImageUpload(file); // Reuse image upload for documents
        setUploadedDocuments(prev => [...prev, { url, name: file.name, size: file.size }]);
      }
      toast.success(`${files.length} document(s) uploaded!`);
    } catch (error) {
      toast.error("Failed to upload documents");
    }
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Tab Title + Save Button + Visible Toggle */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-[1fr,auto,auto] gap-4 items-end">
          <div>
            <Label htmlFor="tabTitle">Tab Title</Label>
            <Input
              id="tabTitle"
              value={formData.tabTitle}
              onChange={(e) => setFormData({ ...formData, tabTitle: e.target.value })}
              className="bg-white"
            />
          </div>
          
          <Button onClick={onSave} disabled={isSaving} className="h-10">
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Tab
          </Button>
          
          <div className="flex items-center gap-2 h-10">
            <Switch
              id="isVisible"
              checked={formData.isVisible}
              onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
            />
            <Label htmlFor="isVisible" className="cursor-pointer">Visible</Label>
          </div>
        </div>
      </div>

      {/* Section 2: Tab Background */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <Label className="text-sm font-semibold">Tab Background</Label>
        
        <div className="grid grid-cols-[120px,1fr,1fr] gap-3 items-center">
          {/* Color Picker */}
          <Input
            type="color"
            value={formData.backgroundType === "color" ? formData.backgroundValue : "#FFFFFF"}
            onChange={(e) => setFormData({ ...formData, backgroundType: "color", backgroundValue: e.target.value })}
            className="w-full h-10 cursor-pointer"
            title="Color Picker"
          />
          
          {/* Color Code / Gradient */}
          <Input
            type="text"
            value={formData.backgroundValue}
            onChange={(e) => setFormData({ ...formData, backgroundValue: e.target.value })}
            placeholder={formData.backgroundType === "gradient" ? "linear-gradient(...)" : "#FFFFFF"}
            className="bg-white"
            onFocus={() => {
              if (formData.backgroundType === "color" && !formData.backgroundValue.startsWith("linear-gradient")) {
                // Keep as color
              } else if (formData.backgroundValue.startsWith("linear-gradient")) {
                setFormData({ ...formData, backgroundType: "gradient" });
              }
            }}
          />
          
          {/* Image Link */}
          <div className="flex gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const url = await onImageUpload(file);
                  setFormData({ ...formData, backgroundType: "image", backgroundValue: url });
                  toast.success('Background image uploaded!');
                } catch (error) {
                  toast.error("Failed to upload image");
                }
              }}
              className="flex-1 bg-white"
            />
            <Input
              type="text"
              value={formData.backgroundType === "image" ? formData.backgroundValue : ""}
              onChange={(e) => setFormData({ ...formData, backgroundType: "image", backgroundValue: e.target.value })}
              placeholder="Or paste URL"
              className="flex-1 bg-white"
            />
          </div>
        </div>
        
        {/* Background Preview */}
        {formData.backgroundValue && formData.backgroundType === "image" && (
          <div className="relative w-full h-24 rounded border bg-white">
            <img
              src={formData.backgroundValue}
              alt="Background preview"
              className="w-full h-full object-cover rounded"
            />
          </div>
        )}
      </div>

      {/* Section 3: Content Images (replacing Notion Database URLs) */}
      {selectedTab >= 1 && selectedTab <= 10 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <Label className="text-sm font-semibold">Content Images</Label>
          <p className="text-xs text-muted-foreground">
            Upload up to 3 images and insert them in markdown using: {'{'}{'{'} image1:left {'}'}{'}'}, {'{'}{'{'} image2:center {'}'}{'}'}, {'{'}{'{'} image3:right {'}'}{'}'}
          </p>
          
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((index) => (
              <div key={index} className="space-y-2">
                <Label htmlFor={`image${index + 1}`} className="text-xs">Image {index + 1}</Label>
                <Input
                  id={`image${index + 1}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, index)}
                  className="bg-white text-xs"
                />
                {uploadedImages[index] && (
                  <div className="relative w-full h-20 rounded border bg-white">
                    <img
                      src={uploadedImages[index].url}
                      alt={uploadedImages[index].name}
                      className="w-full h-full object-cover rounded"
                    />
                    <button
                      onClick={() => {
                        const newImages = [...uploadedImages];
                        newImages[index] = { url: '', name: '' };
                        setUploadedImages(newImages);
                        const key = `notionDatabaseUrl${index === 0 ? '' : index + 1}` as keyof typeof formData;
                        setFormData({ ...formData, [key]: '' });
                      }}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Notion Markdown (Side-by-side with resizable) */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <Label className="text-sm font-semibold">Paste Notion Markdown</Label>
        <p className="text-xs text-muted-foreground">
          In Notion: Select content → Copy as Markdown (Cmd/Ctrl+Shift+C) → Paste here → Click Convert
        </p>
        
        <div className="grid grid-cols-[1fr,auto,1fr] gap-3">
          {/* Left: Input */}
          <Textarea
            placeholder="Paste Notion markdown here..."
            value={notionMarkdownInput}
            onChange={(e) => setNotionMarkdownInput(e.target.value)}
            className="font-mono text-sm bg-white resize-y min-h-[200px]"
          />
          
          {/* Middle: Convert Button */}
          <div className="flex flex-col justify-center">
            <Button
              onClick={handleConvertNotionMarkdown}
              disabled={!notionMarkdownInput.trim()}
              variant="outline"
              size="sm"
              className="h-auto py-8 px-2 flex flex-col gap-2"
            >
              <Download className="h-4 w-4" />
              <span className="text-xs writing-mode-vertical-rl">Convert</span>
            </Button>
          </div>
          
          {/* Right: Preview */}
          <div className="border rounded-md p-4 bg-white overflow-y-auto prose prose-sm max-w-none resize-y min-h-[200px]">
            {notionMarkdownInput ? (
              <div dangerouslySetInnerHTML={{ __html: marked(notionMarkdownInput) }} />
            ) : (
              <p className="text-muted-foreground text-sm">Preview will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 5: Type Markdown (Side-by-side with resizable) */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <Label className="text-sm font-semibold">Markdown Content</Label>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Left: Editor */}
          <Textarea
            value={formData.htmlContent}
            onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
            className="font-mono text-sm bg-white resize-y min-h-[400px]"
            placeholder="Enter markdown content here...\n\n# Heading\n\n**Bold text**\n\n- List item"
          />
          
          {/* Right: Preview */}
          <div className="border rounded-md p-4 bg-white overflow-y-auto prose prose-sm max-w-none resize-y min-h-[400px]">
            {formData.htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: marked(formData.htmlContent) }} />
            ) : (
              <p className="text-muted-foreground text-sm">Preview will appear here...</p>
            )}
          </div>
        </div>
      </div>

      {/* Section 6: Upload Documents */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <Label className="text-sm font-semibold">Upload Documents (Max 10)</Label>
        <p className="text-xs text-muted-foreground">
          Upload PDFs, Word docs, Excel sheets, or other files. They will appear as download links in the proposal.
        </p>
        
        <Input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
          onChange={handleDocumentUpload}
          disabled={uploadedDocuments.length >= 10}
          className="bg-white"
        />
        
        {uploadedDocuments.length > 0 && (
          <div className="space-y-2 mt-3">
            {uploadedDocuments.map((doc, index) => (
              <div key={index} className="flex items-center justify-between bg-white p-2 rounded border">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Upload className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <span className="text-sm truncate">{doc.name}</span>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    ({(doc.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setUploadedDocuments(prev => prev.filter((_, i) => i !== index));
                    toast.success("Document removed");
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 7: Markdown Formatting Guide (moved to bottom) */}
      <div className="bg-gray-50 rounded-lg p-4">
        <MarkdownCheatsheet />
      </div>

      {/* Delete Button (if applicable) */}
      {selectedTab !== 0 && selectedTab !== 11 && onDelete && (
        <div className="flex justify-end">
          <Button 
            variant="destructive" 
            onClick={onDelete}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Tab
          </Button>
        </div>
      )}
    </div>
  );
}
