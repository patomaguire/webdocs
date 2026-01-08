import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

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
  // Navigation
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Language
  const [language, setLanguage] = useState<"en" | "es">("en");
  
  // Map
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Data queries
  const { data: settings } = trpc.settings.getAll.useQuery();
  const { data: hero } = trpc.hero.get.useQuery();
  const { data: tabs } = trpc.tabs.getAll.useQuery();
  const { data: teamMembers } = trpc.team.getAll.useQuery();
  const { data: projects } = trpc.projects.getAll.useQuery();
  const { data: comments } = trpc.commentsRouter.getByTab.useQuery(
    { tabNumber: activeTab },
    { enabled: true }
  );
  
  const addCommentMutation = trpc.commentsRouter.add.useMutation({
    onSuccess: () => {
      toast.success("Comment submitted!");
      setCommentForm({ authorName: "", authorEmail: "", commentText: "" });
    },
  });

  const [commentForm, setCommentForm] = useState({
    authorName: "",
    authorEmail: "",
    commentText: "",
  });
  
  // Derived values
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

  const currentTab = tabs?.find(t => t.tabNumber === activeTab);

  // Print Functions
  const printSection = () => {
    const style = document.createElement('style');
    style.id = 'print-override';
    style.textContent = `
      @media print {
        body, body * { font-size: 9pt !important; }
        .no-print { display: none !important; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    document.getElementById('print-override')?.remove();
  };

  const printAll = () => {
    const style = document.createElement('style');
    style.id = 'print-override';
    style.textContent = `
      @media print {
        body, body * { font-size: 9pt !important; }
        .no-print { display: none !important; }
        .tab-content { display: block !important; page-break-after: always; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    document.getElementById('print-override')?.remove();
  };

  const printComments = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    let html = `
      <html>
      <head>
        <title>Comments</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 9pt; padding: 20px; }
          .comment { border: 1px solid #ddd; padding: 10px; margin: 10px 0; border-radius: 5px; }
          .tab-title { font-size: 12pt; font-weight: bold; margin-top: 20px; border-bottom: 2px solid ${primaryColor}; }
        </style>
      </head>
      <body>
        <h1 style="color: ${primaryColor};">Project Comments</h1>
    `;
    
    tabs?.forEach(tab => {
      html += `<div class="tab-title">${tab.tabTitle}</div>`;
    });
    
    html += '</body></html>';
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTab) return;
    
    addCommentMutation.mutate({
      tabNumber: activeTab,
      tabName: currentTab.tabTitle,
      authorName: commentForm.authorName,
      authorEmail: commentForm.authorEmail || undefined,
      commentText: commentForm.commentText,
    });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header 
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            
            {/* Left Logos (Logo 1 + Logo 3) */}
            <div className="flex items-center gap-4">
              {settingsMap.logo1_url && (
                <img 
                  src={settingsMap.logo1_url} 
                  alt="Logo 1" 
                  className="h-10 max-w-[120px] object-contain" 
                />
              )}
              {settingsMap.logo3_url && (
                <img 
                  src={settingsMap.logo3_url} 
                  alt="Logo 3" 
                  className="h-10 max-w-[120px] object-contain" 
                />
              )}
            </div>

            {/* Center Navigation */}
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab(0)}
                className="px-4 py-2 rounded text-white hover:bg-white/20 transition flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {language === "en" ? "Who we are" : "Quiénes somos"}
              </button>
              <button
                onClick={() => setActiveTab(11)}
                className="px-4 py-2 rounded text-white hover:bg-white/20 transition flex items-center gap-2"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {language === "en" ? "Experience map" : "Mapa de experiencia"}
              </button>
              
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === "en" ? "es" : "en")}
                className="px-3 py-2 rounded border border-white/30 hover:bg-white/20 transition"
                title={language === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
              >
                {language === "en" ? (
                  // UK Flag SVG
                  <svg viewBox="0 0 60 40" className="w-6 h-4">
                    <rect width="60" height="13.33" fill="#00247D"/>
                    <rect y="13.33" width="60" height="13.33" fill="#FFFFFF"/>
                    <rect y="26.67" width="60" height="13.33" fill="#CF142B"/>
                  </svg>
                ) : (
                  // Spanish Flag SVG
                  <svg viewBox="0 0 60 40" className="w-6 h-4">
                    <rect width="60" height="10" fill="#AA151B"/>
                    <rect y="10" width="60" height="20" fill="#F1BF00"/>
                    <rect y="30" width="60" height="10" fill="#AA151B"/>
                  </svg>
                )}
              </button>
            </nav>

            {/* Right Logos (Logo 4 + Logo 2) */}
            <div className="flex items-center gap-4">
              {settingsMap.logo4_url && (
                <img 
                  src={settingsMap.logo4_url} 
                  alt="Logo 4" 
                  className="h-10 max-w-[120px] object-contain" 
                />
              )}
              {settingsMap.logo2_url && (
                <img 
                  src={settingsMap.logo2_url} 
                  alt="Logo 2" 
                  className="h-10 max-w-[120px] object-contain" 
                />
              )}
            </div>
          </div>
        </div>

        {/* Print Buttons */}
        <div className="flex gap-3 justify-center pb-3 no-print">
          <button
            onClick={printSection}
            className="px-3 py-2 bg-white/90 text-gray-800 rounded text-sm flex items-center gap-2 hover:bg-white transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            {language === "en" ? "Print Section" : "Imprimir Sección"}
          </button>
          <button
            onClick={printAll}
            className="px-3 py-2 bg-white/90 text-gray-800 rounded text-sm flex items-center gap-2 hover:bg-white transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <polyline points="6 9 6 2 18 2 18 9"/>
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
              <rect x="6" y="14" width="12" height="8"/>
            </svg>
            {language === "en" ? "Print All" : "Imprimir Todo"}
          </button>
          <button
            onClick={printComments}
            className="px-3 py-2 bg-white/90 text-gray-800 rounded text-sm flex items-center gap-2 hover:bg-white transition"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {language === "en" ? "Print Comments" : "Imprimir Comentarios"}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      {hero && (
        <div className="py-12 text-center" style={{ backgroundColor: `${primaryColor}10` }}>
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4" style={{ color: primaryColor }}>
              {hero.mainTitle}
            </h1>
            {hero.subtitle && (
              <p className="text-xl text-gray-700 mb-4">{hero.subtitle}</p>
            )}
            {hero.stampText && (
              <div className="inline-block px-6 py-2 border-2 rotate-[-5deg]" style={{ borderColor: primaryColor, color: primaryColor }}>
                <span className="font-bold text-lg">{hero.stampText}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Layout with Vertical Sidebar */}
      <div className="flex">
        
        {/* Vertical Sidebar Navigation */}
        <aside 
          className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-gray-900 text-white transition-all duration-300 sticky top-[140px] h-[calc(100vh-140px)] overflow-y-auto no-print`}
        >
          <div className="p-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="w-full text-left mb-4 text-gray-400 hover:text-white text-sm"
            >
              {sidebarCollapsed ? '→' : '← Collapse'}
            </button>
            
            <nav className="space-y-1">
              {visibleTabs.map((tab) => (
                <button
                  key={tab.tabNumber}
                  onClick={() => setActiveTab(tab.tabNumber)}
                  className={`w-full text-left px-3 py-2 rounded transition text-sm ${
                    activeTab === tab.tabNumber
                      ? 'text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.tabNumber ? primaryColor : undefined,
                  }}
                >
                  {sidebarCollapsed ? (
                    <span className="font-bold">{tab.tabNumber}</span>
                  ) : (
                    <span>{tab.tabNumber}. {tab.tabTitle}</span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          {currentTab && (
            <div>
              <h2 className="text-3xl font-bold mb-6" style={{ color: primaryColor }}>
                {currentTab.tabTitle}
              </h2>

              {/* Tab 8: Team Section */}
              {activeTab === 8 && (
                <div className="mb-8">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: language === "es" && currentTab.htmlContentEs 
                        ? currentTab.htmlContentEs 
                        : currentTab.htmlContent || "" 
                    }} 
                    className="prose max-w-none mb-8"
                  />
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {teamMembers?.filter(m => m.isVisible).map((member) => (
                      <Card key={member.id}>
                        <CardContent className="pt-6">
                          {member.photoUrl && (
                            <img 
                              src={member.photoUrl} 
                              alt={member.name} 
                              className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                            />
                          )}
                          <h3 className="text-xl font-bold text-center mb-1">{member.name}</h3>
                          {member.title && (
                            <p className="text-center text-gray-600 mb-3">{member.title}</p>
                          )}
                          {member.bio && (
                            <p className="text-sm text-gray-700 mb-3">
                              {language === "es" && member.bioEs ? member.bioEs : member.bio}
                            </p>
                          )}
                          {member.yearsExperience && (
                            <p className="text-sm text-gray-600 mb-2">
                              <strong>{language === "en" ? "Experience:" : "Experiencia:"}</strong> {member.yearsExperience} {language === "en" ? "years" : "años"}
                            </p>
                          )}
                          {member.keySkills && (
                            <p className="text-sm text-gray-600">
                              <strong>{language === "en" ? "Skills:" : "Habilidades:"}</strong> {member.keySkills}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 11: Experience Map */}
              {activeTab === 11 && (
                <ExperienceMapSection 
                  projects={projects || []} 
                  primaryColor={primaryColor}
                  language={language}
                  apiKey={settingsMap.google_maps_api_key}
                />
              )}

              {/* Other Tabs: Regular Content */}
              {activeTab !== 8 && activeTab !== 11 && (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: language === "es" && currentTab.htmlContentEs 
                      ? currentTab.htmlContentEs 
                      : currentTab.htmlContent || "" 
                  }} 
                  className="prose max-w-none"
                />
              )}

              {/* Comments Section */}
              <div className="mt-12 border-t pt-8">
                <h3 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                  {language === "en" ? "Comments" : "Comentarios"}
                </h3>

                {/* Comment Form */}
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <div>
                        <Label htmlFor="authorName">{language === "en" ? "Name" : "Nombre"} *</Label>
                        <Input
                          id="authorName"
                          value={commentForm.authorName}
                          onChange={(e) => setCommentForm({ ...commentForm, authorName: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="authorEmail">{language === "en" ? "Email" : "Correo"}</Label>
                        <Input
                          id="authorEmail"
                          type="email"
                          value={commentForm.authorEmail}
                          onChange={(e) => setCommentForm({ ...commentForm, authorEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="commentText">{language === "en" ? "Comment" : "Comentario"} *</Label>
                        <Textarea
                          id="commentText"
                          value={commentForm.commentText}
                          onChange={(e) => setCommentForm({ ...commentForm, commentText: e.target.value })}
                          rows={4}
                          required
                        />
                      </div>
                      <Button type="submit" disabled={addCommentMutation.isPending}>
                        {addCommentMutation.isPending ? (language === "en" ? "Submitting..." : "Enviando...") : (language === "en" ? "Submit Comment" : "Enviar Comentario")}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Existing Comments */}
                <div className="space-y-4">
                  {comments?.map((comment: any) => (
                    <Card key={comment.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold">{comment.authorName}</p>
                            {comment.authorEmail && (
                              <p className="text-sm text-gray-600">{comment.authorEmail}</p>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="text-gray-700">{comment.commentText}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Experience Map Section Component with Google Maps
function ExperienceMapSection({ 
  projects, 
  primaryColor, 
  language,
  apiKey 
}: { 
  projects: any[]; 
  primaryColor: string; 
  language: "en" | "es";
  apiKey?: string;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [entityFilter, setEntityFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("all");

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey || typeof google !== 'undefined') return;
    
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = initMap;
    document.head.appendChild(script);
  }, [apiKey]);

  const initMap = () => {
    if (!mapRef.current) return;
    
    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 2,
      center: { lat: 5, lng: 0 },
      mapTypeId: 'terrain',
      styles: [
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#a3ccff" }]
        },
        {
          featureType: "landscape",
          elementType: "geometry",
          stylers: [{ color: "#f5f5f5" }]
        }
      ]
    });
    
    setMap(mapInstance);
  };

  // Update markers when filters change
  useEffect(() => {
    if (!map) return;
    
    // Clear existing markers
    markers.forEach(m => m.setMap(null));
    
    const filteredProjects = projects.filter(p => {
      if (entityFilter !== "all" && p.entity !== entityFilter) return false;
      if (serviceFilter !== "all") {
        try {
          const services = JSON.parse(p.services || "[]");
          if (!services.includes(serviceFilter)) return false;
        } catch {
          return false;
        }
      }
      return p.isVisible && p.latitude && p.longitude;
    });
    
    const infoWindow = new google.maps.InfoWindow();
    const newMarkers: google.maps.Marker[] = [];
    
    filteredProjects.forEach(project => {
      const markerColor = project.entity === 'EPCM' ? primaryColor : '#2563eb';
      
      const marker = new google.maps.Marker({
        position: { 
          lat: parseFloat(project.latitude), 
          lng: parseFloat(project.longitude) 
        },
        map: map,
        title: project.projectName,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 0.9,
          strokeColor: "#ffffff",
          strokeWeight: 2
        }
      });
      
      marker.addListener('click', () => {
        const content = `
          <div style="max-width: 300px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px; color: ${markerColor};">${project.projectName}</h3>
            <p style="margin: 4px 0;"><strong>Client:</strong> ${project.client || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Location:</strong> ${project.location}</p>
            <p style="margin: 4px 0;"><strong>Value:</strong> ${project.projectValue || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Year:</strong> ${project.projectYear || 'N/A'}</p>
            <p style="margin: 4px 0;"><strong>Entity:</strong> 
              <span style="background: ${markerColor}; color: white; padding: 2px 8px; border-radius: 4px;">
                ${project.entity}
              </span>
            </p>
          </div>
        `;
        infoWindow.setContent(content);
        infoWindow.open(map, marker);
      });
      
      newMarkers.push(marker);
    });
    
    setMarkers(newMarkers);
  }, [map, projects, entityFilter, serviceFilter, primaryColor]);

  const entities = Array.from(new Set(projects.map(p => p.entity).filter(Boolean)));
  const allServices = projects.flatMap(p => {
    try { return JSON.parse(p.services || "[]"); } 
    catch { return []; }
  });
  const services = Array.from(new Set(allServices));

  const filteredProjects = projects.filter(p => {
    if (!p.isVisible) return false;
    if (entityFilter !== "all" && p.entity !== entityFilter) return false;
    if (serviceFilter !== "all") {
      try {
        const projectServices = JSON.parse(p.services || "[]");
        if (!projectServices.includes(serviceFilter)) return false;
      } catch {
        return false;
      }
    }
    return true;
  });

  return (
    <div>
      <div 
        dangerouslySetInnerHTML={{ __html: "<p>Explore our portfolio of successful projects across various industries and sectors. Use the filters to view projects by entity or service type.</p>" }} 
        className="prose max-w-none mb-6"
      />
      
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div>
          <Label className="block text-sm font-medium mb-1">
            {language === "en" ? "Entity" : "Entidad"}
          </Label>
          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">{language === "en" ? "All Entities" : "Todas"}</option>
            {entities.map(e => (
              <option key={e} value={e}>{e}</option>
            ))}
          </select>
        </div>
        <div>
          <Label className="block text-sm font-medium mb-1">
            {language === "en" ? "Service" : "Servicio"}
          </Label>
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="all">{language === "en" ? "All Services" : "Todos"}</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Google Map */}
      {apiKey ? (
        <div 
          ref={mapRef} 
          className="w-full h-[500px] rounded-lg shadow-lg mb-8"
          style={{ background: '#e5e7eb' }}
        />
      ) : (
        <div className="w-full h-[500px] rounded-lg shadow-lg mb-8 bg-gray-200 flex items-center justify-center">
          <p className="text-gray-600">{language === "en" ? "Map requires Google Maps API key" : "El mapa requiere clave API de Google Maps"}</p>
        </div>
      )}

      {/* Project Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProjects.map((project) => (
          <Card key={project.id}>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold mb-2" style={{ color: primaryColor }}>
                {project.projectName}
              </h3>
              {project.client && (
                <p className="text-sm text-gray-700 mb-1">
                  <strong>{language === "en" ? "Client:" : "Cliente:"}</strong> {project.client}
                </p>
              )}
              <p className="text-sm text-gray-700 mb-1">
                <strong>{language === "en" ? "Location:" : "Ubicación:"}</strong> {project.location}
              </p>
              {project.projectValue && (
                <p className="text-sm text-gray-700 mb-1">
                  <strong>{language === "en" ? "Value:" : "Valor:"}</strong> {project.projectValue}
                </p>
              )}
              {project.projectYear && (
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{language === "en" ? "Year:" : "Año:"}</strong> {project.projectYear}
                </p>
              )}
              {project.entity && (
                <span 
                  className="inline-block px-3 py-1 rounded text-white text-sm font-semibold"
                  style={{ backgroundColor: project.entity === 'EPCM' ? primaryColor : '#2563eb' }}
                >
                  {project.entity}
                </span>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
