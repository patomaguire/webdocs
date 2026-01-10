import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";

export default function Admin() {
  const [activeTab, setActiveTab] = useState("settings");
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
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
            <SettingsTab />
          </TabsContent>

          <TabsContent value="hero">
            <HeroTab />
          </TabsContent>

          <TabsContent value="tabs">
            <TabsContentTab />
          </TabsContent>

          <TabsContent value="team">
            <TeamTab />
          </TabsContent>

          <TabsContent value="projects">
            <ProjectsTab />
          </TabsContent>

          <TabsContent value="comments">
            <CommentsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============= Settings Tab =============
function SettingsTab() {
  const { data: settings, isLoading } = trpc.settings.getAll.useQuery();
  const upsertMutation = trpc.settings.upsert.useMutation();
  
  const [formData, setFormData] = useState({
    password: "",
    notification_email: "",
    primary_color: "#E65100",
    logo1_url: "",
    logo2_url: "",
    logo3_url: "",
    logo4_url: "",
  });

  // Load settings into form when available
  useState(() => {
    if (settings) {
      const newData: any = {};
      settings.forEach(s => {
        if (s.settingKey && s.settingValue !== null) {
          newData[s.settingKey] = s.settingValue;
        }
      });
      setFormData(prev => ({ ...prev, ...newData }));
    }
  });

  const handleSave = async () => {
    try {
      for (const [key, value] of Object.entries(formData)) {
        await upsertMutation.mutateAsync({ key, value });
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
          <Label htmlFor="password">Proposal Password</Label>
          <Input
            id="password"
            type="text"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            placeholder="Enter password for proposal access"
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

        <div className="space-y-2">
          <Label>Logo URLs (2 left, 2 right)</Label>
          <Input
            placeholder="Logo 1 URL (left)"
            value={formData.logo1_url}
            onChange={(e) => setFormData({ ...formData, logo1_url: e.target.value })}
          />
          <Input
            placeholder="Logo 2 URL (right)"
            value={formData.logo2_url}
            onChange={(e) => setFormData({ ...formData, logo2_url: e.target.value })}
          />
          <Input
            placeholder="Logo 3 URL (left)"
            value={formData.logo3_url}
            onChange={(e) => setFormData({ ...formData, logo3_url: e.target.value })}
          />
          <Input
            placeholder="Logo 4 URL (right)"
            value={formData.logo4_url}
            onChange={(e) => setFormData({ ...formData, logo4_url: e.target.value })}
          />
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
function HeroTab() {
  const { data: hero, isLoading } = trpc.hero.get.useQuery();
  const upsertMutation = trpc.hero.upsert.useMutation({
    onSuccess: () => {
      toast.success("Hero section updated!");
    },
  });

  const [formData, setFormData] = useState({
    mainTitle: "",
    subtitle: "",
    stampText: "",
  });

  useState(() => {
    if (hero) {
      setFormData({
        mainTitle: hero.mainTitle || "",
        subtitle: hero.subtitle || "",
        stampText: hero.stampText || "",
      });
    }
  });

  const handleSave = () => {
    upsertMutation.mutate(formData);
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
function TabsContentTab() {
  const { data: tabs, isLoading, refetch } = trpc.tabs.getAll.useQuery();
  const upsertMutation = trpc.tabs.upsert.useMutation({
    onSuccess: () => {
      toast.success("Tab updated!");
      refetch();
    },
  });

  const [selectedTab, setSelectedTab] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    tabTitle: "",
    htmlContent: "",
    isVisible: true,
  });

  const handleSelectTab = (tabNumber: number) => {
    const tab = tabs?.find(t => t.tabNumber === tabNumber);
    if (tab) {
      setSelectedTab(tabNumber);
      setFormData({
        tabTitle: tab.tabTitle || "",
        htmlContent: tab.htmlContent || "",
        isVisible: tab.isVisible ?? true,
      });
    }
  };

  const handleSave = () => {
    if (selectedTab !== null) {
      upsertMutation.mutate({
        tabNumber: selectedTab,
        ...formData,
      });
    }
  };

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Tab List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {tabs?.map(tab => (
              <Button
                key={tab.tabNumber}
                variant={selectedTab === tab.tabNumber ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => handleSelectTab(tab.tabNumber)}
              >
                Tab {tab.tabNumber}: {tab.tabTitle}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
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

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVisible"
                  checked={formData.isVisible}
                  onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                />
                <Label htmlFor="isVisible">Visible</Label>
              </div>

              <div>
                <Label htmlFor="htmlContent">HTML Content</Label>
                <Textarea
                  id="htmlContent"
                  value={formData.htmlContent}
                  onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={handleSave} disabled={upsertMutation.isPending}>
                {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Tab
              </Button>
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
function TeamTab() {
  const { data: members, isLoading, refetch } = trpc.team.getAll.useQuery();
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
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    photoUrl: "",
    yearsExperience: 0,
    keySkills: "",
    sortOrder: 0,
  });

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
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Member
        </Button>
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
        {members?.map(member => (
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
    </div>
  );
}

// ============= Projects Tab =============
function ProjectsTab() {
  const { data: projects, isLoading, refetch } = trpc.projects.getAll.useQuery();
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
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
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
        {projects?.map(project => (
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
    </div>
  );
}

// ============= Comments Tab =============
function CommentsTab() {
  const { data: comments, isLoading, refetch } = trpc.comments.getAll.useQuery();
  const deleteMutation = trpc.comments.delete.useMutation({
    onSuccess: () => {
      toast.success("Comment deleted!");
      refetch();
    },
  });
  const markAsReadMutation = trpc.comments.markAsRead.useMutation({
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
