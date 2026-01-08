import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Proposal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const { data: storedPassword } = trpc.settings.get.useQuery({ key: "password" });

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === storedPassword) {
      setIsAuthenticated(true);
      toast.success("Access granted!");
    } else {
      toast.error("Incorrect password");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Proposal Access</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <Label htmlFor="password">Enter Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Password"
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full">
                Access Proposal
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProposalContent />;
}

function ProposalContent() {
  const { data: settings } = trpc.settings.getAll.useQuery();
  const { data: hero } = trpc.hero.get.useQuery();
  const { data: tabs } = trpc.tabs.getAll.useQuery();
  const { data: teamMembers } = trpc.team.getAll.useQuery();
  const { data: projects } = trpc.projects.getAll.useQuery();

  const [activeTab, setActiveTab] = useState<number>(0);

  const settingsMap = useMemo(() => {
    const map: Record<string, string> = {};
    settings?.forEach(s => {
      if (s.settingKey && s.settingValue) {
        map[s.settingKey] = s.settingValue;
      }
    });
    return map;
  }, [settings]);

  const primaryColor = settingsMap.primary_color || "#E65100";
  const visibleTabs = tabs?.filter(t => t.isVisible) || [];

  // Set first visible tab as active on load
  useEffect(() => {
    if (visibleTabs.length > 0 && activeTab === 0) {
      setActiveTab(visibleTabs[0].tabNumber);
    }
  }, [visibleTabs, activeTab]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header with 4 logos */}
      <header className="border-b" style={{ borderColor: primaryColor }}>
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            {/* Left logos */}
            <div className="flex items-center gap-4 flex-1">
              {settingsMap.logo1_url && (
                <img src={settingsMap.logo1_url} alt="Logo 1" className="h-12 object-contain" />
              )}
              {settingsMap.logo3_url && (
                <img src={settingsMap.logo3_url} alt="Logo 3" className="h-12 object-contain" />
              )}
            </div>

            {/* Center navigation */}
            <nav className="flex gap-2 flex-shrink-0">
              {visibleTabs.slice(0, 6).map(tab => (
                <Button
                  key={tab.tabNumber}
                  variant={activeTab === tab.tabNumber ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.tabNumber)}
                  style={activeTab === tab.tabNumber ? { backgroundColor: primaryColor } : {}}
                >
                  {tab.tabTitle}
                </Button>
              ))}
            </nav>

            {/* Right logos */}
            <div className="flex items-center gap-4 flex-1 justify-end">
              {settingsMap.logo4_url && (
                <img src={settingsMap.logo4_url} alt="Logo 4" className="h-12 object-contain" />
              )}
              {settingsMap.logo2_url && (
                <img src={settingsMap.logo2_url} alt="Logo 2" className="h-12 object-contain" />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {hero && (
        <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
          <div className="container mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-5xl font-bold" style={{ color: primaryColor }}>
                {hero.mainTitle}
              </h1>
              {hero.stampText && (
                <Badge 
                  variant="outline" 
                  className="text-sm px-4 py-2 rotate-12"
                  style={{ borderColor: primaryColor, color: primaryColor }}
                >
                  {hero.stampText}
                </Badge>
              )}
            </div>
            {hero.subtitle && (
              <p className="text-xl text-gray-600">{hero.subtitle}</p>
            )}
          </div>
        </section>
      )}

      {/* Tab Navigation (secondary) */}
      {visibleTabs.length > 6 && (
        <div className="border-b bg-gray-50">
          <div className="container mx-auto py-2">
            <div className="flex gap-2 flex-wrap">
              {visibleTabs.slice(6).map(tab => (
                <Button
                  key={tab.tabNumber}
                  variant={activeTab === tab.tabNumber ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveTab(tab.tabNumber)}
                  style={activeTab === tab.tabNumber ? { backgroundColor: primaryColor } : {}}
                >
                  {tab.tabTitle}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      <div className="container mx-auto py-8">
        {visibleTabs.map(tab => (
          <div key={tab.tabNumber} style={{ display: activeTab === tab.tabNumber ? 'block' : 'none' }}>
            {/* Special handling for Team tab (Tab 8) */}
            {tab.tabNumber === 8 ? (
              <TeamSection members={teamMembers || []} primaryColor={primaryColor} />
            ) : tab.tabNumber === 11 ? (
              <ExperienceMapSection projects={projects || []} primaryColor={primaryColor} />
            ) : (
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: tab.htmlContent || "" }}
              />
            )}

            {/* Comments Section */}
            <CommentsSection tabNumber={tab.tabNumber} tabName={tab.tabTitle} primaryColor={primaryColor} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ============= Team Section =============
function TeamSection({ members, primaryColor }: { members: any[]; primaryColor: string }) {
  const visibleMembers = members.filter(m => m.isVisible);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>Our Team</h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleMembers.map(member => (
          <Card key={member.id}>
            <CardContent className="p-6">
              {member.photoUrl && (
                <img 
                  src={member.photoUrl} 
                  alt={member.name} 
                  className="w-32 h-32 rounded-full object-cover mx-auto mb-4"
                />
              )}
              <h3 className="text-xl font-semibold text-center">{member.name}</h3>
              <p className="text-center text-muted-foreground mb-2">{member.title}</p>
              {member.yearsExperience && (
                <p className="text-center text-sm text-muted-foreground mb-4">
                  {member.yearsExperience} years experience
                </p>
              )}
              {member.bio && (
                <p className="text-sm mb-4">{member.bio}</p>
              )}
              {member.keySkills && (
                <div className="flex flex-wrap gap-2">
                  {member.keySkills.split(',').map((skill: string, i: number) => (
                    <Badge key={i} variant="secondary">{skill.trim()}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============= Experience Map Section =============
function ExperienceMapSection({ projects, primaryColor }: { projects: any[]; primaryColor: string }) {
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  const visibleProjects = projects.filter(p => p.isVisible);

  // Extract unique entities and services
  const entities = useMemo(() => {
    const set = new Set<string>();
    visibleProjects.forEach(p => {
      if (p.entity) set.add(p.entity);
    });
    return Array.from(set);
  }, [visibleProjects]);

  const services = useMemo(() => {
    const set = new Set<string>();
    visibleProjects.forEach(p => {
      if (p.services) {
        try {
          const parsed = JSON.parse(p.services);
          if (Array.isArray(parsed)) {
            parsed.forEach(s => set.add(s));
          }
        } catch (e) {
          // If not JSON, try comma-separated
          p.services.split(',').forEach((s: string) => set.add(s.trim()));
        }
      }
    });
    return Array.from(set);
  }, [visibleProjects]);

  // Filter projects
  const filteredProjects = useMemo(() => {
    return visibleProjects.filter(p => {
      const entityMatch = entityFilter === "all" || p.entity === entityFilter;
      
      let serviceMatch = serviceFilter === "all";
      if (!serviceMatch && p.services) {
        try {
          const parsed = JSON.parse(p.services);
          serviceMatch = Array.isArray(parsed) && parsed.includes(serviceFilter);
        } catch (e) {
          serviceMatch = p.services.split(',').map((s: string) => s.trim()).includes(serviceFilter);
        }
      }
      
      return entityMatch && serviceMatch;
    });
  }, [visibleProjects, entityFilter, serviceFilter]);

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold" style={{ color: primaryColor }}>Experience Map</h2>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label>Filter by Entity</Label>
          <Select value={entityFilter} onValueChange={setEntityFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Entities</SelectItem>
              {entities.map(entity => (
                <SelectItem key={entity} value={entity}>{entity}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1">
          <Label>Filter by Service</Label>
          <Select value={serviceFilter} onValueChange={setServiceFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Services</SelectItem>
              {services.map(service => (
                <SelectItem key={service} value={service}>{service}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map(project => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle className="text-lg">{project.projectName}</CardTitle>
              <Badge style={{ backgroundColor: primaryColor, color: 'white' }}>
                {project.entity}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-2">
              {project.client && (
                <p className="text-sm"><strong>Client:</strong> {project.client}</p>
              )}
              {project.location && (
                <p className="text-sm"><strong>Location:</strong> {project.location}, {project.country}</p>
              )}
              {project.projectValue && (
                <p className="text-sm"><strong>Value:</strong> {project.projectValue}</p>
              )}
              {project.projectYear && (
                <p className="text-sm"><strong>Year:</strong> {project.projectYear}</p>
              )}
              {project.services && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {(() => {
                    try {
                      const parsed = JSON.parse(project.services);
                      return Array.isArray(parsed) ? parsed.map((s: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
                      )) : null;
                    } catch (e) {
                      return project.services.split(',').map((s: string, i: number) => (
                        <Badge key={i} variant="secondary" className="text-xs">{s.trim()}</Badge>
                      ));
                    }
                  })()}
                </div>
              )}
              {project.description && (
                <p className="text-sm text-muted-foreground mt-2">{project.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No projects match the selected filters
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ============= Comments Section =============
function CommentsSection({ tabNumber, tabName, primaryColor }: { tabNumber: number; tabName: string; primaryColor: string }) {
  const { data: comments, refetch } = trpc.commentsRouter.getByTab.useQuery({ tabNumber });
  const addCommentMutation = trpc.commentsRouter.add.useMutation({
    onSuccess: () => {
      toast.success("Comment submitted!");
      setFormData({ authorName: "", authorEmail: "", commentText: "" });
      refetch();
    },
  });

  const [formData, setFormData] = useState({
    authorName: "",
    authorEmail: "",
    commentText: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.authorName || !formData.commentText) {
      toast.error("Please fill in required fields");
      return;
    }
    addCommentMutation.mutate({
      tabNumber,
      tabName,
      ...formData,
    });
  };

  return (
    <div className="mt-12 border-t pt-8">
      <h3 className="text-2xl font-bold mb-6" style={{ color: primaryColor }}>Comments</h3>
      
      {/* Comment Form */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="authorName">Name *</Label>
                <Input
                  id="authorName"
                  value={formData.authorName}
                  onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="authorEmail">Email</Label>
                <Input
                  id="authorEmail"
                  type="email"
                  value={formData.authorEmail}
                  onChange={(e) => setFormData({ ...formData, authorEmail: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="commentText">Comment *</Label>
              <Textarea
                id="commentText"
                value={formData.commentText}
                onChange={(e) => setFormData({ ...formData, commentText: e.target.value })}
                rows={4}
                required
              />
            </div>

            <Button 
              type="submit" 
              disabled={addCommentMutation.isPending}
              style={{ backgroundColor: primaryColor }}
            >
              {addCommentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Submit Comment
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-4">
        {comments && comments.length === 0 && (
          <p className="text-muted-foreground text-center py-8">No comments yet. Be the first to comment!</p>
        )}

        {comments?.map(comment => (
          <Card key={comment.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="font-semibold">{comment.authorName}</span>
                  {comment.authorEmail && (
                    <span className="text-sm text-muted-foreground ml-2">({comment.authorEmail})</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm">{comment.commentText}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
