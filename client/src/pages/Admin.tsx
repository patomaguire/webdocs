import { useState, useEffect, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Trash2, Plus, Copy, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText } from "lucide-react";
import { marked } from 'marked';
import { MarkdownCheatsheet } from '@/components/MarkdownCheatsheet';
import { FilterCheatsheet } from '@/components/FilterCheatsheet';
import { filterProjects, filterTeamMembers } from '@/lib/advancedFilter';

// ============= Document Selector Component =============
interface DocumentSelectorProps {
  selectedDocumentId: number;
  onDocumentChange: (id: number) => void;
}

function DocumentSelector({ selectedDocumentId, onDocumentChange }: DocumentSelectorProps) {
  const utils = trpc.useUtils();
  const { data: documents } = trpc.documents.getAll.useQuery();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ slug: "", name: "", password: "" });
  const [sourceDocumentId, setSourceDocumentId] = useState<number | null>(null);
  
  const createMutation = trpc.documents.create.useMutation({
    onSuccess: (result) => {
      toast.success("Document created successfully!");
      utils.documents.getAll.invalidate();
      setIsCreateDialogOpen(false);
      setCreateForm({ slug: "", name: "", password: "" });
      if (result.document) {
        onDocumentChange(result.document.id);
      }
    },
    onError: () => {
      toast.error("Failed to create document");
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      utils.documents.getAll.invalidate();
      setIsDeleteDialogOpen(false);
      // Switch to first available document
      if (documents && documents.length > 1) {
        const remainingDoc = documents.find(d => d.id !== selectedDocumentId);
        if (remainingDoc) onDocumentChange(remainingDoc.id);
      }
    },
    onError: () => {
      toast.error("Failed to delete document");
    },
  });

  const copyMutation = trpc.documents.copyContent.useMutation({
    onSuccess: () => {
      toast.success("Content copied successfully!");
      utils.settings.getAll.invalidate();
      utils.hero.get.invalidate();
      utils.tabs.getAll.invalidate();
      utils.team.getAll.invalidate();
      utils.projects.getAll.invalidate();
      setIsCopyDialogOpen(false);
      setSourceDocumentId(null);
    },
    onError: () => {
      toast.error("Failed to copy content");
    },
  });

  const handleCreate = () => {
    if (!createForm.slug || !createForm.name || !createForm.password) {
      toast.error("All fields are required");
      return;
    }
    createMutation.mutate(createForm);
  };

  const handleCopy = () => {
    if (!sourceDocumentId) {
      toast.error("Please select a source document");
      return;
    }
    copyMutation.mutate({
      sourceDocumentId,
      targetDocumentId: selectedDocumentId,
    });
  };

  const selectedDoc = documents?.find(d => d.id === selectedDocumentId);

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Document Manager
        </CardTitle>
        <CardDescription>
          Select a document to edit or create a new one
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label>Current Document</Label>
            <Select
              value={selectedDocumentId.toString()}
              onValueChange={(value) => onDocumentChange(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select document" />
              </SelectTrigger>
              <SelectContent>
                {documents?.map((doc) => (
                  <SelectItem key={doc.id} value={doc.id.toString()}>
                    {doc.name} ({doc.slug})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => setIsCopyDialogOpen(true)}>
            <Copy className="w-4 h-4 mr-2" />
            Copy from Document
          </Button>

          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={documents?.length === 1}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Document
          </Button>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Document
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
                <DialogDescription>
                  Create a new proposal document with its own content and password
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label htmlFor="slug">Slug (URL identifier)</Label>
                  <Input
                    id="slug"
                    placeholder="client-proposal-2024"
                    value={createForm.slug}
                    onChange={(e) => setCreateForm({ ...createForm, slug: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="name">Document Name</Label>
                  <Input
                    id="name"
                    placeholder="Client Proposal 2024"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={createForm.password}
                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Copy Content from Another Document</DialogTitle>
                <DialogDescription>
                  This will copy all content (settings, hero, tabs, team, projects, comments) from the selected document to "{selectedDoc?.name}". This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="source-doc">Source Document</Label>
                <Select
                  value={sourceDocumentId?.toString() || ""}
                  onValueChange={(value) => setSourceDocumentId(Number(value))}
                >
                  <SelectTrigger id="source-doc">
                    <SelectValue placeholder="Select document to copy from" />
                  </SelectTrigger>
                  <SelectContent>
                    {documents?.filter(d => d.id !== selectedDocumentId).map((doc) => (
                      <SelectItem key={doc.id} value={doc.id.toString()}>
                        {doc.name} ({doc.slug})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCopyDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCopy} disabled={copyMutation.isPending}>
                  {copyMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Copy Content
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Delete Document</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete "{selectedDoc?.name}"? This will permanently delete all content including settings, hero, tabs, team, projects, and comments. This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => deleteMutation.mutate({ documentId: selectedDocumentId })}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Delete Permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {selectedDoc && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-semibold">Name:</span> {selectedDoc.name}
              </div>
              <div>
                <span className="font-semibold">Slug:</span> {selectedDoc.slug}
              </div>
              <div>
                <span className="font-semibold">URL:</span>{" "}
                <a 
                  href={`${window.location.origin}/doc/${selectedDoc.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline break-all"
                >
                  {window.location.origin}/doc/{selectedDoc.slug}
                </a>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("settings");
  const [selectedDocumentId, setSelectedDocumentId] = useState<number>(1);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  
  // Check if admin password is already verified in localStorage
  useEffect(() => {
    const storedAuth = localStorage.getItem("adminPasswordVerified");
    if (storedAuth === "true") {
      setIsAdminAuthenticated(true);
      setShowPasswordDialog(false);
    }
  }, []);
  
  const handlePasswordSubmit = () => {
    if (adminPassword === "M2proWebAdmin076") {
      setIsAdminAuthenticated(true);
      setShowPasswordDialog(false);
      localStorage.setItem("adminPasswordVerified", "true");
      toast.success("Admin access granted");
    } else {
      toast.error("Incorrect password");
      setAdminPassword("");
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("adminPasswordVerified");
    setIsAdminAuthenticated(false);
    setShowPasswordDialog(true);
    setAdminPassword("");
    toast.success("Logged out from admin");
  };
  
  // Show password dialog if not authenticated
  if (!isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>WebDoc Admin Console</CardTitle>
            <CardDescription>Enter the admin password to continue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handlePasswordSubmit()}
                placeholder="Enter admin password"
              />
            </div>
            <Button onClick={handlePasswordSubmit} className="w-full">
              Access Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">WebDoc Admin Console</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Internal project name: <code className="bg-muted px-1.5 py-0.5 rounded">client_name_proposal</code>
            </p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            Logout from Admin
          </Button>
        </div>
        
        <DocumentSelector 
          selectedDocumentId={selectedDocumentId}
          onDocumentChange={setSelectedDocumentId}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="tabs">Tabs</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="comments">Comments</TabsTrigger>
          </TabsList>

          <TabsContent value="settings">
            <SettingsTab documentId={selectedDocumentId} />
          </TabsContent>

          <TabsContent value="hero">
            <HeroTab documentId={selectedDocumentId} />
          </TabsContent>

          <TabsContent value="tabs">
            <TabsContentTab documentId={selectedDocumentId} />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab documentId={selectedDocumentId} />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab documentId={selectedDocumentId} />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsTab documentId={selectedDocumentId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============= Settings Tab =============
function SettingsTab({ documentId }: { documentId: number }) {
  const utils = trpc.useUtils();
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery({ documentId });
  const { data: documents } = trpc.documents.getAll.useQuery();
  const currentDocument = documents?.find(d => d.id === documentId);
  const upsertMutation = trpc.settings.upsert.useMutation({
    onSuccess: () => {
      utils.settings.getAll.invalidate({ documentId });
    },
  });
  
  const updateDocumentMutation = trpc.documents.update.useMutation({
    onSuccess: () => {
      toast.success("Document password updated!");
      utils.documents.getAll.invalidate();
    },
  });
  
  const imageUploadMutation = trpc.imageUpload.uploadImage.useMutation();
  
  const [formData, setFormData] = useState({
    password: "",
    notification_email: "",
    primary_color: "#E65100",
    secondary_color: "#1976D2",
    contrast_color: "#FFFFFF",
    background_color: "#F5F5F5",
    logo1_url: "",
    logo2_url: "",
    logo3_url: "",
    logo4_url: "",
  });

  // Load settings and document password into form when available
  useEffect(() => {
    if (settings) {
      const newData: any = {};
      settings.forEach(s => {
        if (s.settingKey && s.settingValue !== null) {
          newData[s.settingKey] = s.settingValue;
        }
      });
      setFormData(prev => ({ ...prev, ...newData }));
    }
    if (currentDocument) {
      setFormData(prev => ({ ...prev, password: currentDocument.password }));
    }
  }, [settings, currentDocument]);

  const handleSave = async () => {
    try {
      // Update document password in documents table
      if (currentDocument && formData.password !== currentDocument.password) {
        await updateDocumentMutation.mutateAsync({
          id: documentId,
          slug: currentDocument.slug,
          name: currentDocument.name,
          password: formData.password,
        });
      }
      
      // Update other settings in proposal_settings table
      for (const [key, value] of Object.entries(formData)) {
        if (key !== 'password') {
          await upsertMutation.mutateAsync({ key, value, documentId });
        }
      }
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Proposal Settings</CardTitle>
        <CardDescription>Configure password, colors, logos, and notification email</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="password">Public Access Password</Label>
          <Input
            id="password"
            type="text"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password for public access"
          />
        </div>

        <div>
          <Label htmlFor="notification_email">Notification Email</Label>
          <Input
            id="notification_email"
            type="email"
            value={formData.notification_email}
            onChange={(e) => setFormData({ ...formData, notification_email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>

        <div>
          <Label htmlFor="primary_color">Primary Color</Label>
          <div className="flex gap-2">
            <Input
              id="primary_color"
              type="color"
              value={formData.primary_color}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              className="w-20"
            />
            <Input
              type="text"
              value={formData.primary_color}
              onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
              placeholder="#E65100"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="secondary_color">Secondary Color</Label>
          <div className="flex gap-2">
            <Input
              id="secondary_color"
              type="color"
              value={formData.secondary_color}
              onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
              className="w-20"
            />
            <Input
              type="text"
              value={formData.secondary_color}
              onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
              placeholder="#1976D2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="contrast_color">Contrast Color</Label>
          <div className="flex gap-2">
            <Input
              id="contrast_color"
              type="color"
              value={formData.contrast_color}
              onChange={(e) => setFormData({ ...formData, contrast_color: e.target.value })}
              className="w-20"
            />
            <Input
              type="text"
              value={formData.contrast_color}
              onChange={(e) => setFormData({ ...formData, contrast_color: e.target.value })}
              placeholder="#FFFFFF"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="background_color">Background Color</Label>
          <div className="flex gap-2">
            <Input
              id="background_color"
              type="color"
              value={formData.background_color}
              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              className="w-20"
            />
            <Input
              type="text"
              value={formData.background_color}
              onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
              placeholder="#F5F5F5"
            />
          </div>
        </div>

        <div className="space-y-4">
          <Label>Logo Images (2 left, 2 right)</Label>
          
          {/* Logo 1 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-foreground">Logo 1 (left)</Label>
              {formData.logo1_url && (
                <img src={formData.logo1_url} alt="Logo 1" className="h-8 max-w-[100px] object-contain" />
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="file"
                id="logo1-upload"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = async () => {
                    try {
                      const base64 = reader.result as string;
                      const result = await imageUploadMutation.mutateAsync({
                        fileData: base64,
                        fileName: file.name,
                        contentType: file.type,
                        folder: 'logos',
                      });
                      if (result.success) {
                        setFormData({ ...formData, logo1_url: result.url });
                        toast.success('Logo 1 uploaded!');
                      }
                    } catch (error) {
                      console.error('Logo upload error:', error);
                      toast.error('Failed to upload logo: ' + (error as Error).message);
                    }
                  };
                  reader.readAsDataURL(file);
                }}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('logo1-upload')?.click()}
                className="flex-1"
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Image
              </Button>
              <Input
                placeholder="Or paste URL"
                value={formData.logo1_url}
                onChange={(e) => setFormData({ ...formData, logo1_url: e.target.value })}
                className="flex-1"
              />
            </div>
          </div>

          {/* Logo 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-foreground">Logo 2 (right)</Label>
              {formData.logo2_url && (
                <img src={formData.logo2_url} alt="Logo 2" className="h-8 max-w-[100px] object-contain" />
              )}
            </div>
            <div className="flex gap-2">
              <input type="file" id="logo2-upload" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = async () => { const base64 = reader.result as string; const result = await trpc.imageUpload.uploadImage.mutate({ fileData: base64, fileName: file.name, contentType: file.type, folder: 'logos', }); if (result.success) { setFormData({ ...formData, logo2_url: result.url }); toast.success('Logo 2 uploaded!'); } }; reader.readAsDataURL(file); }} className="hidden" />
              <Button type="button" variant="outline" onClick={() => document.getElementById('logo2-upload')?.click()} className="flex-1"><Upload className="mr-2 h-4 w-4" />Upload Image</Button>
              <Input placeholder="Or paste URL" value={formData.logo2_url} onChange={(e) => setFormData({ ...formData, logo2_url: e.target.value })} className="flex-1" />
            </div>
          </div>

          {/* Logo 3 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-foreground">Logo 3 (left)</Label>
              {formData.logo3_url && (
                <img src={formData.logo3_url} alt="Logo 3" className="h-8 max-w-[100px] object-contain" />
              )}
            </div>
            <div className="flex gap-2">
              <input type="file" id="logo3-upload" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = async () => { const base64 = reader.result as string; const result = await trpc.imageUpload.uploadImage.mutate({ fileData: base64, fileName: file.name, contentType: file.type, folder: 'logos', }); if (result.success) { setFormData({ ...formData, logo3_url: result.url }); toast.success('Logo 3 uploaded!'); } }; reader.readAsDataURL(file); }} className="hidden" />
              <Button type="button" variant="outline" onClick={() => document.getElementById('logo3-upload')?.click()} className="flex-1"><Upload className="mr-2 h-4 w-4" />Upload Image</Button>
              <Input placeholder="Or paste URL" value={formData.logo3_url} onChange={(e) => setFormData({ ...formData, logo3_url: e.target.value })} className="flex-1" />
            </div>
          </div>

          {/* Logo 4 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-semibold text-foreground">Logo 4 (right)</Label>
              {formData.logo4_url && (
                <img src={formData.logo4_url} alt="Logo 4" className="h-8 max-w-[100px] object-contain" />
              )}
            </div>
            <div className="flex gap-2">
              <input type="file" id="logo4-upload" accept="image/*" onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = async () => { const base64 = reader.result as string; const result = await trpc.imageUpload.uploadImage.mutate({ fileData: base64, fileName: file.name, contentType: file.type, folder: 'logos', }); if (result.success) { setFormData({ ...formData, logo4_url: result.url }); toast.success('Logo 4 uploaded!'); } }; reader.readAsDataURL(file); }} className="hidden" />
              <Button type="button" variant="outline" onClick={() => document.getElementById('logo4-upload')?.click()} className="flex-1"><Upload className="mr-2 h-4 w-4" />Upload Image</Button>
              <Input placeholder="Or paste URL" value={formData.logo4_url} onChange={(e) => setFormData({ ...formData, logo4_url: e.target.value })} className="flex-1" />
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Publish Your Site</h3>
          <p className="text-sm text-blue-700 mb-3">
            To make your proposal site publicly accessible, click the <strong>Publish</strong> button in the Management UI panel (top-right corner of this page). After publishing, you can customize domains and view analytics in the Dashboard panel.
          </p>
          <p className="text-xs text-blue-600 italic">
            💡 Tip: Click the panel icon in the top-right corner to open Management UI → Dashboard
          </p>
        </div>

        <Button onClick={handleSave} disabled={upsertMutation.isPending}>
          {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Settings
        </Button>
      </CardContent>
    </Card>
  );
}

// ============= Hero Tab =============
function HeroTab({ documentId }: { documentId: number }) {
  const { data: hero, isLoading, refetch } = trpc.hero.get.useQuery({ documentId });
  const upsertMutation = trpc.hero.upsert.useMutation({
    onSuccess: () => {
      toast.success("Hero section updated!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to save: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    mainTitle: "",
    subtitle: "",
    stampText: "",
  });

  useEffect(() => {
    if (hero) {
      setFormData({
        mainTitle: hero.mainTitle || "",
        subtitle: hero.subtitle || "",
        stampText: hero.stampText || "",
      });
    }
  }, [hero]);

  const handleSave = () => {
    upsertMutation.mutate({ documentId, ...formData });
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>Configure the main title, subtitle, and stamp badge</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="mainTitle">Main Title</Label>
          <Input
            id="mainTitle"
            value={formData.mainTitle}
            onChange={(e) => setFormData({ ...formData, mainTitle: e.target.value })}
            placeholder="Your Company Name"
          />
        </div>

        <div>
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder="Proposal for Services"
          />
        </div>

        <div>
          <Label htmlFor="stampText">Stamp Badge Text</Label>
          <Input
            id="stampText"
            value={formData.stampText}
            onChange={(e) => setFormData({ ...formData, stampText: e.target.value })}
            placeholder="ISSUED FOR DISCUSSION"
          />
        </div>

        <Button onClick={handleSave} disabled={upsertMutation.isPending}>
          {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Hero Section
        </Button>
      </CardContent>
    </Card>
  );
}

// ============= Tabs Content Tab =============
function TabsContentTab({ documentId }: { documentId: number }) {
  const { data: tabs, isLoading, refetch } = trpc.tabs.getAll.useQuery({ documentId });
  const upsertMutation = trpc.tabs.upsert.useMutation({
    onSuccess: () => {
      toast.success("Tab updated!");
      refetch();
    },
  });
  const imageUploadMutation = trpc.imageUpload.uploadImage.useMutation();
  const deleteMutation = trpc.tabs.delete.useMutation({
    onSuccess: () => {
      toast.success("Tab deleted!");
      refetch();
      setSelectedTab(null);
    },
  });

  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tabTitle: "",
    htmlContent: "",
    isVisible: true,
    backgroundType: "color" as "color" | "gradient" | "image",
    backgroundValue: "#FFFFFF",
    notionDatabaseUrl: "",
    notionDatabaseUrl2: "",
    notionDatabaseUrl3: "",
  });

  const handleSelectTab = (tabNumber: number) => {
    const tab = tabs?.find(t => t.tabNumber === tabNumber);
    if (tab) {
      setSelectedTab(tabNumber);
      setFormData({
        tabTitle: tab.tabTitle || "",
        htmlContent: tab.htmlContent || "",
        isVisible: tab.isVisible ?? true,
        backgroundType: (tab.backgroundType as "color" | "gradient" | "image") || "color",
        backgroundValue: tab.backgroundValue || "#FFFFFF",
        notionDatabaseUrl: tab.notionDatabaseUrl || "",
        notionDatabaseUrl2: tab.notionDatabaseUrl2 || "",
        notionDatabaseUrl3: tab.notionDatabaseUrl3 || "",
      });
    }
  };

  const handleSave = () => {
    if (selectedTab !== null) {
      upsertMutation.mutate({
        documentId,
        tabNumber: selectedTab,
        ...formData,
      });
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Tab List</CardTitle>
          <Button size="sm" onClick={() => {
            const nextTabNumber = tabs && tabs.length > 0 ? Math.max(...tabs.map(t => t.tabNumber)) + 1 : 0;
            upsertMutation.mutate({
              documentId,
              tabNumber: nextTabNumber,
              tabTitle: `New Tab ${nextTabNumber}`,
              htmlContent: "",
              isVisible: true,
            });
          }}>Add New Tab</Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tabs
              ?.sort((a, b) => {
                // Sort order: Tab A (0), Tab B (11), then 1-10
                if (a.tabNumber === 0) return -1;
                if (b.tabNumber === 0) return 1;
                if (a.tabNumber === 11) return b.tabNumber === 0 ? 1 : -1;
                if (b.tabNumber === 11) return 1;
                return a.tabNumber - b.tabNumber;
              })
              .map(tab => (
                <Button
                  key={tab.tabNumber}
                  variant={selectedTab === tab.tabNumber ? "default" : "outline"}
                  className="w-full justify-start"
                  onClick={() => handleSelectTab(tab.tabNumber)}
                >
                  {tab.tabNumber === 0 ? 'Tab A' : tab.tabNumber === 11 ? 'Tab B' : tab.tabTitle}
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Edit Tab Content</CardTitle>
          <CardDescription>
            {selectedTab !== null ? `Editing Tab ${selectedTab}` : "Select a tab to edit"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTab !== null ? (
            <>
              <div>
                <Label htmlFor="tabTitle">Tab Title</Label>
                <Input
                  id="tabTitle"
                  value={formData.tabTitle}
                  onChange={(e) => setFormData({ ...formData, tabTitle: e.target.value })}
                />
              </div>

              <div className="flex gap-2 items-center">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
                <Label htmlFor="isVisible">Visible</Label>
              </div>

              <div className="space-y-2">
                <Label>Tab Background</Label>
                <Select
                  value={formData.backgroundType}
                  onValueChange={(value: "color" | "gradient" | "image") => 
                    setFormData({ ...formData, backgroundType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Solid Color</SelectItem>
                    <SelectItem value="gradient">Gradient</SelectItem>
                    <SelectItem value="image">Image URL</SelectItem>
                  </SelectContent>
                </Select>

                {formData.backgroundType === "color" && (
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={formData.backgroundValue}
                      onChange={(e) => setFormData({ ...formData, backgroundValue: e.target.value })}
                      className="w-20"
                    />
                    <Input
                      type="text"
                      value={formData.backgroundValue}
                      onChange={(e) => setFormData({ ...formData, backgroundValue: e.target.value })}
                      placeholder="#FFFFFF"
                    />
                  </div>
                )}

                {formData.backgroundType === "gradient" && (
                  <Input
                    type="text"
                    value={formData.backgroundValue}
                    onChange={(e) => setFormData({ ...formData, backgroundValue: e.target.value })}
                    placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  />
                )}

                {formData.backgroundType === "image" && (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = reader.result as string;
                            const result = await imageUploadMutation.mutateAsync({
                              fileData: base64,
                              fileName: file.name,
                              contentType: file.type,
                              folder: 'backgrounds',
                            });
                            if (result.success) {
                              setFormData({ ...formData, backgroundValue: result.url });
                              toast.success('Background image uploaded!');
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="flex-1"
                      />
                      <Input
                        type="text"
                        value={formData.backgroundValue}
                        onChange={(e) => setFormData({ ...formData, backgroundValue: e.target.value })}
                        placeholder="Or paste image URL"
                        className="flex-1"
                      />
                    </div>
                    {formData.backgroundValue && (
                      <div className="relative w-full h-24 rounded border">
                        <img
                          src={formData.backgroundValue}
                          alt="Background preview"
                          className="w-full h-full object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notion Database URLs - Only for tabs 1-10 */}
              {selectedTab !== null && selectedTab >= 1 && selectedTab <= 10 && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="notionDatabaseUrl">Notion Database 1 (db1)</Label>
                    <Input
                      id="notionDatabaseUrl"
                      type="text"
                      value={formData.notionDatabaseUrl}
                      onChange={(e) => setFormData({ ...formData, notionDatabaseUrl: e.target.value })}
                      placeholder="https://notion.so/your-database-id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notionDatabaseUrl2">Notion Database 2 (db2)</Label>
                    <Input
                      id="notionDatabaseUrl2"
                      type="text"
                      value={formData.notionDatabaseUrl2}
                      onChange={(e) => setFormData({ ...formData, notionDatabaseUrl2: e.target.value })}
                      placeholder="https://notion.so/your-second-database-id"
                    />
                  </div>
                  <div>
                    <Label htmlFor="notionDatabaseUrl3">Notion Database 3 (db3)</Label>
                    <Input
                      id="notionDatabaseUrl3"
                      type="text"
                      value={formData.notionDatabaseUrl3}
                      onChange={(e) => setFormData({ ...formData, notionDatabaseUrl3: e.target.value })}
                      placeholder="https://notion.so/your-third-database-id"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    💡 Use placeholders in markdown: {'{'}{'{'} notion:db1:column_name {'}'}{'}'},  {'{'}{'{'} notion:db2:column_name {'}'}{'}'},  etc.
                  </p>
                </div>
              )}

              <MarkdownCheatsheet />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="htmlContent">Markdown Content</Label>
                  <Textarea
                    id="htmlContent"
                    value={formData.htmlContent}
                    onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                    rows={15}
                    className="font-mono text-sm"
                    placeholder="Enter markdown content here...\n\n# Heading\n\n**Bold text**\n\n- List item"
                  />
                </div>
                <div>
                  <Label>Preview</Label>
                  <div 
                    className="border rounded-md p-4 h-[360px] overflow-y-auto prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: formData.htmlContent ? marked(formData.htmlContent) : '<p class="text-muted-foreground">Preview will appear here...</p>' }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                  {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Tab
                </Button>
                {selectedTab !== 0 && selectedTab !== 11 && (
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (selectedTab !== null && confirm(`Delete Tab ${selectedTab}?`)) {
                        deleteMutation.mutate({ documentId, tabNumber: selectedTab });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">Select a tab from the list to edit its content</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============= Team Tab =============
function TeamTab({ documentId }: { documentId: number }) {
  const { data: members, isLoading, refetch } = trpc.team.getAll.useQuery({ documentId });
  const createMutation = trpc.team.create.useMutation({
    onSuccess: () => {
      toast.success("Team member added!");
      refetch();
      setShowForm(false);
    },
  });
  const updateMutation = trpc.team.update.useMutation({
    onSuccess: () => {
      toast.success("Team member updated!");
      refetch();
      setShowForm(false);
    },
  });
  const deleteMutation = trpc.team.delete.useMutation({
    onSuccess: () => {
      toast.success("Team member deleted!");
      refetch();
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNotionDialog, setShowNotionDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    photoUrl: "",
    yearsExperience: 0,
    keySkills: "",
    sortOrder: 0,
  });
  
  const [notionDbId, setNotionDbId] = useState('');
  const [importingFromNotion, setImportingFromNotion] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "experience" | "title" | "skills">("name");
  
  // Filter and sort members
  const filteredAndSortedMembers = useMemo(() => {
    const filtered = filterTeamMembers(members || [], filterText);
    return filtered.sort((a, b) => {
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      } else if (sortBy === "experience") {
        return (b.yearsExperience || 0) - (a.yearsExperience || 0);
      } else if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      } else if (sortBy === "skills") {
        return (a.keySkills || "").localeCompare(b.keySkills || "");
      }
      return 0;
    });
  }, [members, filterText, sortBy]);
  
  const importFromNotionMutation = trpc.team.importFromNotion.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Successfully imported ${data.imported} team members!`);
        refetch();
        setShowNotionDialog(false);
        setNotionDbId('');
      } else {
        toast.error(data.error || 'Import failed');
        if (data.availableFields) {
          toast.info(`Available fields in Notion: ${data.availableFields.join(', ')}`);
        }
      }
      setImportingFromNotion(false);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
      setImportingFromNotion(false);
    },
  });
  
  const handleNotionImport = () => {
    if (!notionDbId) return;
    setImportingFromNotion(true);
    importFromNotionMutation.mutate({ databaseId: notionDbId, documentId });
  };

  const handleEdit = (member: any) => {
    setEditingId(member.id);
    setFormData({
      name: member.name || "",
      title: member.title || "",
      bio: member.bio || "",
      photoUrl: member.photoUrl || "",
      yearsExperience: member.yearsExperience || 0,
      keySkills: member.keySkills || "",
      sortOrder: member.sortOrder || 0,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this team member?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const member: any = { documentId };
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'name') member.name = value;
        else if (header === 'title') member.title = value;
        else if (header === 'bio') member.bio = value;
        else if (header === 'photoUrl') member.photoUrl = value;
        else if (header === 'yearsExperience') member.yearsExperience = parseInt(value) || 0;
        else if (header === 'keySkills') member.keySkills = value;
        else if (header === 'sortOrder') member.sortOrder = parseInt(value) || 0;
      });
      
      await createMutation.mutateAsync(member);
    }
    
    toast.success(`Imported ${lines.length - 1} team members`);
    refetch();
    e.target.value = '';
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      title: "",
      bio: "",
      photoUrl: "",
      yearsExperience: 0,
      keySkills: "",
      sortOrder: 0,
    });
    setShowForm(false);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Team Members</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNotionDialog(true)}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.887-.748-.84l-15.177.887c-.56.047-.747.327-.747.887zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
            </svg>
            Import from Notion
          </Button>
          <label htmlFor="team-csv-upload">
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Upload CSV
              </span>
            </Button>
          </label>
          <input
            id="team-csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Filter by name, title, experience, skills, or bio..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort by Name</SelectItem>
              <SelectItem value="experience">Sort by Experience</SelectItem>
              <SelectItem value="title">Sort by Title</SelectItem>
              <SelectItem value="skills">Sort by Skills</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FilterCheatsheet type="teams" />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit" : "Add"} Team Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="photoUrl">Photo URL</Label>
              <Input
                id="photoUrl"
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="yearsExperience">Years Experience</Label>
                <Input
                  id="yearsExperience"
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => setFormData({ ...formData, yearsExperience: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="keySkills">Key Skills (comma separated)</Label>
              <Input
                id="keySkills"
                value={formData.keySkills}
                onChange={(e) => setFormData({ ...formData, keySkills: e.target.value })}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredAndSortedMembers?.map(member => (
          <Card key={member.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                {member.photoUrl && (
                  <img src={member.photoUrl} alt={member.name} className="w-16 h-16 rounded-full object-cover" />
                )}
                <div>
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.title}</p>
                  <p className="text-xs text-muted-foreground">{member.yearsExperience} years experience</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(member)}>Edit</Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(member.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notion Import Dialog */}
      <Dialog open={showNotionDialog} onOpenChange={setShowNotionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Team Members from Notion</DialogTitle>
            <DialogDescription>
              Connect your Notion database to bulk import. The system will validate field names before importing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-sm">
              <p className="font-semibold mb-2">📍 How to find your Database ID:</p>
              <ol className="space-y-1 ml-4 list-decimal">
                <li>Open your Notion database as a full page</li>
                <li>Copy the URL from your browser</li>
                <li>Extract the ID: <code className="bg-white px-1 rounded">notion.so/workspace/<strong className="text-blue-600">abc123def456</strong>?v=...</code></li>
                <li>Paste the full URL or just the ID below</li>
              </ol>
              <p className="mt-3"><strong>sortOrder field:</strong> Use numbers (1, 2, 3...) to control display order. Lower numbers appear first.</p>
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Required Fields</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">name</span>
                  <span className="text-muted-foreground">Text - Team member's full name</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">title</span>
                  <span className="text-muted-foreground">Text - Job title or role</span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Optional Fields</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">bio</span>
                  <span className="text-muted-foreground">Text - Biography or description</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">photoUrl</span>
                  <span className="text-muted-foreground">URL - Profile photo URL</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">yearsExperience</span>
                  <span className="text-muted-foreground">Number - Years of experience</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">keySkills</span>
                  <span className="text-muted-foreground">Text - Comma-separated skills</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">sortOrder</span>
                  <span className="text-muted-foreground">Number - Display order</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notion-db-id">Notion Database ID or URL</Label>
              <Input
                id="notion-db-id"
                placeholder="https://notion.so/... or database ID"
                value={notionDbId}
                onChange={(e) => setNotionDbId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotionDialog(false)}>Cancel</Button>
            <Button onClick={handleNotionImport} disabled={!notionDbId || importingFromNotion}>
              {importingFromNotion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============= Projects Tab =============
function ProjectsTab({ documentId }: { documentId: number }) {
  const { data: projects, isLoading, refetch } = trpc.projects.getAll.useQuery({ documentId });
  const createMutation = trpc.projects.create.useMutation({
    onSuccess: () => {
      toast.success("Project added!");
      refetch();
      setShowForm(false);
    },
  });
  const updateMutation = trpc.projects.update.useMutation({
    onSuccess: () => {
      toast.success("Project updated!");
      refetch();
      setShowForm(false);
    },
  });
  const deleteMutation = trpc.projects.delete.useMutation({
    onSuccess: () => {
      toast.success("Project deleted!");
      refetch();
    },
  });

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showNotionDialog, setShowNotionDialog] = useState(false);
  const [formData, setFormData] = useState({
    projectName: "",
    entity: "",
    client: "",
    location: "",
    country: "",
    latitude: "",
    longitude: "",
    projectValue: "",
    projectYear: "",
    services: "",
    description: "",
    sortOrder: 0,
  });
  
  const [notionDbId, setNotionDbId] = useState('');
  const [importingFromNotion, setImportingFromNotion] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [sortBy, setSortBy] = useState<"entity" | "client" | "location" | "value" | "year" | "services">("entity");
  
  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    const filtered = filterProjects(projects || [], filterText);
    return filtered.sort((a, b) => {
      if (sortBy === "entity") {
        return (a.entity || "").localeCompare(b.entity || "");
      } else if (sortBy === "client") {
        return (a.client || "").localeCompare(b.client || "");
      } else if (sortBy === "location") {
        return (a.location || "").localeCompare(b.location || "");
      } else if (sortBy === "year") {
        return (b.projectYear || "").localeCompare(a.projectYear || "");
      } else if (sortBy === "value") {
        const aVal = parseFloat(a.projectValue || "0");
        const bVal = parseFloat(b.projectValue || "0");
        return bVal - aVal;
      } else if (sortBy === "services") {
        return (a.services || "").localeCompare(b.services || "");
      }
      return 0;
    });
  }, [projects, filterText, sortBy]);
  
  const importFromNotionMutation = trpc.projects.importFromNotion.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Successfully imported ${data.imported} projects!`);
        refetch();
        setShowNotionDialog(false);
        setNotionDbId('');
      } else {
        toast.error(data.error || 'Import failed');
        if (data.availableFields) {
          toast.info(`Available fields in Notion: ${data.availableFields.join(', ')}`);
        }
      }
      setImportingFromNotion(false);
    },
    onError: (error) => {
      toast.error(`Import failed: ${error.message}`);
      setImportingFromNotion(false);
    },
  });
  
  const handleNotionImport = () => {
    if (!notionDbId) return;
    setImportingFromNotion(true);
    importFromNotionMutation.mutate({ databaseId: notionDbId, documentId });
  };

  const handleEdit = (project: any) => {
    setEditingId(project.id);
    setFormData({
      projectName: project.projectName || "",
      entity: project.entity || "",
      client: project.client || "",
      location: project.location || "",
      country: project.country || "",
      latitude: project.latitude || "",
      longitude: project.longitude || "",
      projectValue: project.projectValue || "",
      projectYear: project.projectYear || "",
      services: project.services || "",
      description: project.description || "",
      sortOrder: project.sortOrder || 0,
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const project: any = { documentId };
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (header === 'projectName') project.projectName = value;
        else if (header === 'entity') project.entity = value;
        else if (header === 'client') project.client = value;
        else if (header === 'location') project.location = value;
        else if (header === 'country') project.country = value;
        else if (header === 'latitude') project.latitude = value;
        else if (header === 'longitude') project.longitude = value;
        else if (header === 'projectValue') project.projectValue = value;
        else if (header === 'projectYear') project.projectYear = value;
        else if (header === 'services') project.services = value;
        else if (header === 'description') project.description = value;
        else if (header === 'sortOrder') project.sortOrder = parseInt(value) || 0;
      });
      
      await createMutation.mutateAsync(project);
    }
    
    toast.success(`Imported ${lines.length - 1} projects`);
    refetch();
    e.target.value = '';
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      projectName: "",
      entity: "",
      client: "",
      location: "",
      country: "",
      latitude: "",
      longitude: "",
      projectValue: "",
      projectYear: "",
      services: "",
      description: "",
      sortOrder: 0,
    });
    setShowForm(false);
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowNotionDialog(true)}>
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.887-.748-.84l-15.177.887c-.56.047-.747.327-.747.887zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.139c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
            </svg>
            Import from Notion
          </Button>
          <label htmlFor="projects-csv-upload">
            <Button variant="outline" asChild>
              <span className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Upload CSV
              </span>
            </Button>
          </label>
          <input
            id="projects-csv-upload"
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleCSVUpload}
          />
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Project
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <Input
              placeholder="Filter projects using advanced syntax (see guide below)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
            />
          </div>
          <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="entity">Sort by Entity</SelectItem>
              <SelectItem value="client">Sort by Client</SelectItem>
              <SelectItem value="location">Sort by Location</SelectItem>
              <SelectItem value="value">Sort by Value</SelectItem>
              <SelectItem value="year">Sort by Year</SelectItem>
              <SelectItem value="services">Sort by Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FilterCheatsheet type="projects" />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit" : "Add"} Project</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="projectName">Project Name</Label>
                <Input
                  id="projectName"
                  value={formData.projectName}
                  onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="entity">Entity</Label>
                <Input
                  id="entity"
                  value={formData.entity}
                  onChange={(e) => setFormData({ ...formData, entity: e.target.value })}
                  placeholder="e.g., EPCM, AXTON"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="client">Client</Label>
                <Input
                  id="client"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  value={formData.latitude}
                  onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  value={formData.longitude}
                  onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="projectValue">Project Value</Label>
                <Input
                  id="projectValue"
                  value={formData.projectValue}
                  onChange={(e) => setFormData({ ...formData, projectValue: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="projectYear">Project Year</Label>
                <Input
                  id="projectYear"
                  value={formData.projectYear}
                  onChange={(e) => setFormData({ ...formData, projectYear: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="services">Services (JSON array, e.g., ["QS", "Planning"])</Label>
              <Input
                id="services"
                value={formData.services}
                onChange={(e) => setFormData({ ...formData, services: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
              <Button variant="outline" onClick={resetForm}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredAndSortedProjects?.map(project => (
          <Card key={project.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{project.projectName}</h3>
                  <p className="text-sm text-muted-foreground">{project.entity} • {project.client}</p>
                  <p className="text-sm text-muted-foreground">{project.location}, {project.country}</p>
                  <p className="text-xs text-muted-foreground mt-1">{project.projectYear} • {project.projectValue}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(project)}>Edit</Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(project.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Notion Import Dialog */}
      <Dialog open={showNotionDialog} onOpenChange={setShowNotionDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Import Projects from Notion</DialogTitle>
            <DialogDescription>
              Connect your Notion database to bulk import. The system will validate field names before importing.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 text-sm">
              <p className="font-semibold mb-2">📍 How to find your Database ID:</p>
              <ol className="space-y-1 ml-4 list-decimal">
                <li>Open your Notion database as a full page</li>
                <li>Copy the URL from your browser</li>
                <li>Extract the ID: <code className="bg-white px-1 rounded">notion.so/workspace/<strong className="text-blue-600">abc123def456</strong>?v=...</code></li>
                <li>Paste the full URL or just the ID below</li>
              </ol>
              <p className="mt-3"><strong>sortOrder field:</strong> Use numbers (1, 2, 3...) to control display order. Lower numbers appear first.</p>
            </div>
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Required Fields</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">projectName</span>
                  <span className="text-muted-foreground">Text - Project name or title</span>
                </div>
              </div>
            </div>
            
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-sm">Optional Fields</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">entity</span>
                  <span className="text-muted-foreground">Text - Entity or organization</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">client</span>
                  <span className="text-muted-foreground">Text - Client name</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">location</span>
                  <span className="text-muted-foreground">Text - Project location</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">country</span>
                  <span className="text-muted-foreground">Text - Country name</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">latitude</span>
                  <span className="text-muted-foreground">Text - Latitude coordinate</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">longitude</span>
                  <span className="text-muted-foreground">Text - Longitude coordinate</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">projectValue</span>
                  <span className="text-muted-foreground">Text - Project value/budget</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">projectYear</span>
                  <span className="text-muted-foreground">Text - Project year</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">services</span>
                  <span className="text-muted-foreground">Text - Services provided</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">description</span>
                  <span className="text-muted-foreground">Text - Project description</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">sortOrder</span>
                  <span className="text-muted-foreground">Number - Display order</span>
                </div>
              </div>
            </div>
            
            <div>
              <Label htmlFor="notion-db-id-projects">Notion Database ID or URL</Label>
              <Input
                id="notion-db-id-projects"
                placeholder="https://notion.so/... or database ID"
                value={notionDbId}
                onChange={(e) => setNotionDbId(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotionDialog(false)}>Cancel</Button>
            <Button onClick={handleNotionImport} disabled={!notionDbId || importingFromNotion}>
              {importingFromNotion ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============= Comments Tab =============
function CommentsTab({ documentId }: { documentId: number }) {
  const { data: comments, isLoading, refetch } = trpc.commentsRouter.getAll.useQuery({ documentId });
  const deleteMutation = trpc.commentsRouter.delete.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted!");
      refetch();
    },
  });
  const markAsReadMutation = trpc.commentsRouter.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this comment?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleMarkAsRead = (id: number) => {
    markAsReadMutation.mutate({ id });
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Comments</h2>
      
      {comments && comments.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No comments yet
          </CardContent>
        </Card>
      )}

      {comments?.map(comment => (
        <Card key={comment.id} className={comment.isRead ? "" : "border-blue-500"}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-semibold">{comment.authorName}</span>
                  {comment.authorEmail && (
                    <span className="text-sm text-muted-foreground">({comment.authorEmail})</span>
                  )}
                  {!comment.isRead && (
                    <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">New</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Tab {comment.tabNumber}: {comment.tabName}
                </p>
                <p className="text-sm">{comment.commentText}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                {!comment.isRead && (
                  <Button variant="outline" size="sm" onClick={() => handleMarkAsRead(comment.id)}>
                    Mark Read
                  </Button>
                )}
                <Button variant="destructive" size="sm" onClick={() => handleDelete(comment.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
