import { useState, useEffect, useRef, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { renderContent } from "@/lib/markdown";

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
  const mainContentRef = useRef<HTMLDivElement>(null);
  
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
  const { data: comments } = trpc.comments.getAll.useQuery();
  const { data: mapsConfig } = trpc.settings.getGoogleMapsApiKey.useQuery();
  
  const utils = trpc.useUtils();
  
  const addCommentMutation = trpc.commentsRouter.add.useMutation({
    onSuccess: () => {
      toast.success("Comment submitted!");
      setCommentForm({ authorName: "", authorEmail: "", commentText: "" });
      // Invalidate and refetch comments for current tab
      utils.commentsRouter.getByTab.invalidate({ tabNumber: activeTab });
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
    // Save current tab
    const savedTab = activeTab;
    
    // Create a visible container with all tabs for printing
    const printContainer = document.createElement('div');
    printContainer.id = 'print-all-container';
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    printContainer.style.top = '0';
    printContainer.style.width = '100%';
    
    visibleTabs.forEach((tab, index) => {
      const tabSection = document.createElement('div');
      tabSection.className = 'print-tab-section';
      tabSection.style.pageBreakAfter = index < visibleTabs.length - 1 ? 'always' : 'auto';
      
      const title = document.createElement('h2');
      title.textContent = `${tab.tabNumber}. ${tab.tabTitle}`;
      title.style.color = primaryColor;
      title.style.fontSize = '24pt';
      title.style.marginBottom = '16px';
      tabSection.appendChild(title);
      
      const content = document.createElement('div');
      content.className = 'prose';
      content.innerHTML = language === "es" && tab.htmlContentEs ? tab.htmlContentEs : tab.htmlContent || "";
      tabSection.appendChild(content);
      
      // Add team members for tab 8
      if (tab.tabNumber === 8 && teamMembers) {
        teamMembers.filter(m => m.isVisible).forEach(member => {
          const memberDiv = document.createElement('div');
          memberDiv.style.marginTop = '16px';
          memberDiv.style.padding = '12px';
          memberDiv.style.border = '1px solid #ddd';
          memberDiv.innerHTML = `
            <h3 style="font-size: 14pt; margin-bottom: 8px;">${member.name}</h3>
            ${member.title ? `<p style="color: #666; margin-bottom: 8px;">${member.title}</p>` : ''}
            ${member.bio ? `<p style="font-size: 10pt; margin-bottom: 8px;">${language === "es" && member.bioEs ? member.bioEs : member.bio}</p>` : ''}
            ${member.yearsExperience ? `<p style="font-size: 10pt;"><strong>${language === "en" ? "Experience:" : "Experiencia:"}</strong> ${member.yearsExperience} ${language === "en" ? "years" : "años"}</p>` : ''}
            ${member.keySkills ? `<p style="font-size: 10pt;"><strong>${language === "en" ? "Skills:" : "Habilidades:"}</strong> ${member.keySkills}</p>` : ''}
          `;
          tabSection.appendChild(memberDiv);
        });
      }
      
      // Add projects for tab 11
      if (tab.tabNumber === 11 && projects) {
        projects.filter(p => p.isVisible).forEach(project => {
          const projectDiv = document.createElement('div');
          projectDiv.style.marginTop = '16px';
          projectDiv.style.padding = '12px';
          projectDiv.style.border = '1px solid #ddd';
          projectDiv.innerHTML = `
            <h3 style="font-size: 14pt; margin-bottom: 8px;">${project.projectName}</h3>
            <p style="font-size: 10pt;"><strong>Client:</strong> ${project.client || 'N/A'}</p>
            <p style="font-size: 10pt;"><strong>Location:</strong> ${project.location}</p>
            <p style="font-size: 10pt;"><strong>Value:</strong> ${project.projectValue || 'N/A'}</p>
            <p style="font-size: 10pt;"><strong>Year:</strong> ${project.projectYear || 'N/A'}</p>
            <p style="font-size: 10pt;"><strong>Entity:</strong> ${project.entity}</p>
          `;
          tabSection.appendChild(projectDiv);
        });
      }
      
      printContainer.appendChild(tabSection);
    });
    
    document.body.appendChild(printContainer);
    
    // Add print styles
    const style = document.createElement('style');
    style.id = 'print-override';
    style.textContent = `
      @media print {
        body > *:not(#print-all-container) { display: none !important; }
        #print-all-container { display: block !important; }
        .print-tab-section { padding: 20px; }
        body, body * { font-size: 9pt !important; }
      }
    `;
    document.head.appendChild(style);
    
    window.print();
    
    // Cleanup
    document.getElementById('print-override')?.remove();
    printContainer.remove();
  };

  const printComments = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    // Fetch all comments
    const allCommentsPromises = tabs?.map(async (tab) => {
      const tabComments = await utils.commentsRouter.getByTab.fetch({ tabNumber: tab.tabNumber });
      return { tab, comments: tabComments };
    }) || [];
    
    const allTabComments = await Promise.all(allCommentsPromises);
    
    let html = `
      <html>
      <head>
        <title>Comments</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 10pt; padding: 20px; }
          .comment { border: 1px solid #ddd; padding: 15px; margin: 10px 0; border-radius: 5px; background: #f9f9f9; }
          .tab-title { font-size: 14pt; font-weight: bold; margin-top: 30px; padding-bottom: 10px; border-bottom: 2px solid ${primaryColor}; color: ${primaryColor}; }
          .comment-author { font-weight: bold; color: #333; }
          .comment-email { font-size: 9pt; color: #666; }
          .comment-date { font-size: 9pt; color: #999; float: right; }
          .comment-text { margin-top: 10px; color: #444; }
          .no-comments { font-style: italic; color: #999; margin: 10px 0; }
        </style>
      </head>
      <body>
        <h1 style="color: ${primaryColor};">Project Comments</h1>
    `;
    
    allTabComments.forEach(({ tab, comments: tabComments }) => {
      html += `<div class="tab-title">${tab.tabNumber}. ${tab.tabTitle}</div>`;
      
      if (tabComments && tabComments.length > 0) {
        tabComments.forEach((comment: any) => {
          const date = new Date(comment.createdAt).toLocaleDateString();
          html += `
            <div class="comment">
              <div>
                <span class="comment-author">${comment.authorName}</span>
                ${comment.authorEmail ? `<span class="comment-email"> (${comment.authorEmail})</span>` : ''}
                <span class="comment-date">${date}</span>
              </div>
              <div class="comment-text">${comment.commentText}</div>
            </div>
          `;
        });
      } else {
        html += '<div class="no-comments">No comments for this section</div>';
      }
    });
    
    html += '</body></html>';
    printWindow.document.write(html);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    };
    
    // Fallback for browsers that don't support onload
    setTimeout(() => {
      printWindow.print();
      printWindow.onafterprint = () => printWindow.close();
    }, 250);
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

  const backgroundType = settingsMap.background_type || "color";
  const backgroundValue = settingsMap.background_value || "#FFFFFF";
  
  const backgroundStyle = backgroundType === "image" ? {
    backgroundImage: `url(${backgroundValue})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
    animation: 'subtleMove 20s ease-in-out infinite',
  } : {
    backgroundColor: backgroundValue,
  };

  return (
    <>
      {backgroundType === "image" && (
        <style>{`
          @keyframes subtleMove {
            0%, 100% { background-position: center center; }
            50% { background-position: center calc(50% + 20px); }
          }
        `}</style>
      )}
      <div className="min-h-screen" style={backgroundStyle}>
      {/* Minimal Header with Logos, Print, and Language */}
      <header 
        className="sticky top-0 z-50 shadow-md"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-3 items-center gap-4">
            
            {/* Far Left: Logos 1 + 3 */}
            <div className="flex items-center gap-4 justify-start">
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

            {/* Center: Print Buttons + Language Toggle */}
            <div className="flex flex-col items-center gap-1 no-print">
              <div className="flex gap-3">
              <button
                onClick={printSection}
                className="px-2 py-1.5 bg-white/90 text-gray-800 rounded text-xs flex items-center gap-1 hover:bg-white transition"
                style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}
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
                className="px-2 py-1.5 bg-white/90 text-gray-800 rounded text-xs flex items-center gap-1 hover:bg-white transition"
                style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}
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
                className="px-2 py-1.5 bg-white/90 text-gray-800 rounded text-xs flex items-center gap-1 hover:bg-white transition"
                style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                {language === "en" ? "Print Comments" : "Imprimir Comentarios"}
              </button>
              </div>
              
              {/* Language Toggle below print buttons */}
              <button
                onClick={() => setLanguage(language === "en" ? "es" : "en")}
                className="px-2 py-1 rounded border border-white/30 hover:bg-white/20 transition"
                title={language === "en" ? "Switch to Spanish" : "Cambiar a Inglés"}
                style={{ transform: 'scale(0.7)', transformOrigin: 'center' }}
              >
                {language === "en" ? (
                  // Spanish Flag (show when in English)
                  <svg viewBox="0 0 60 40" className="w-6 h-4">
                    <rect width="60" height="10" fill="#AA151B"/>
                    <rect y="10" width="60" height="20" fill="#F1BF00"/>
                    <rect y="30" width="60" height="10" fill="#AA151B"/>
                  </svg>
                ) : (
                  // Union Jack image
                  <img 
                    src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg/60px-Flag_of_the_United_Kingdom_%281-2%29.svg.png" 
                    alt="UK Flag" 
                    className="w-6 h-4 object-cover"
                  />
                )}
              </button>
            </div>

            {/* Far Right: Logos */}
            <div className="flex items-center gap-4 justify-end">
              
              {/* Logos 4 + 2 */}
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
      </header>

      {/* Hero Section with Navigation Buttons */}
      {hero && (
        <div className="py-4 text-center" style={{ backgroundColor: `${primaryColor}10` }}>
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-0" style={{ color: primaryColor }}>
              {hero.mainTitle}
            </h1>
            {hero.subtitle && (
              <p className="text-base text-gray-700 mb-0">{hero.subtitle}</p>
            )}
            {hero.stampText && (
              <div className="inline-block px-5 py-1.5 border-2 mb-0 mt-1" style={{ borderColor: primaryColor, color: primaryColor }}>
                <span className="font-bold text-sm">{hero.stampText}</span>
              </div>
            )}
            
            {/* Navigation Buttons below stamp */}
            <div className="flex gap-4 justify-center mt-2 no-print">
              <button
                onClick={() => setActiveTab(0)}
                className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                  <circle cx="9" cy="7" r="4"/>
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                </svg>
                {language === "en" ? "Who we are" : "Quiénes somos"}
              </button>
              <button
                onClick={() => setActiveTab(11)}
                className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg"
                style={{ backgroundColor: primaryColor }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {language === "en" ? "Experience map" : "Mapa de experiencia"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Tab Navigation (Tabs 1-10 only) */}
      <div className="bg-gray-100 border-y border-gray-300 no-print">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop: Single row if all fit, Mobile: Two rows with horizontal scroll */}
          <div className="hidden md:flex gap-2 flex-wrap justify-center">
            {visibleTabs.filter(t => t.tabNumber >= 1 && t.tabNumber <= 10).map((tab) => (
              <button
                key={tab.tabNumber}
                onClick={() => {
                  setActiveTab(tab.tabNumber);
                  setTimeout(() => {
                    const element = mainContentRef.current;
                    if (element) {
                      const yOffset = -20; // Small offset from top
                      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.tabNumber
                    ? 'text-white shadow-md'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
                style={{
                  backgroundColor: activeTab === tab.tabNumber ? primaryColor : undefined,
                }}
              >
                {tab.tabNumber}. {tab.tabTitle}
              </button>
            ))}
          </div>
          
          {/* Mobile: Two rows with horizontal drag */}
          <div className="md:hidden space-y-2">
            {/* First Row: Tabs 1-5 */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {visibleTabs.filter(t => t.tabNumber >= 1 && t.tabNumber <= 5).map((tab) => (
                <button
                  key={tab.tabNumber}
                  onClick={() => {
                    setActiveTab(tab.tabNumber);
                    setTimeout(() => {
                      const element = mainContentRef.current;
                      if (element) {
                        const yOffset = -20;
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition flex-shrink-0 ${
                    activeTab === tab.tabNumber
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.tabNumber ? primaryColor : undefined,
                  }}
                >
                  {tab.tabNumber}. {tab.tabTitle}
                </button>
              ))}
            </div>
            
            {/* Second Row: Tabs 6-10 */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {visibleTabs.filter(t => t.tabNumber >= 6 && t.tabNumber <= 10).map((tab) => (
                <button
                  key={tab.tabNumber}
                  onClick={() => {
                    setActiveTab(tab.tabNumber);
                    setTimeout(() => {
                      const element = mainContentRef.current;
                      if (element) {
                        const yOffset = -20;
                        const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition flex-shrink-0 ${
                    activeTab === tab.tabNumber
                      ? 'text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.tabNumber ? primaryColor : undefined,
                  }}
                >
                  {tab.tabNumber}. {tab.tabTitle}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Full Width) */}
      <div className="flex">
        <div ref={mainContentRef} className="scroll-mt-4"></div>

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
                      __html: renderContent(
                        language === "es" && currentTab.htmlContentEs 
                          ? currentTab.htmlContentEs 
                          : currentTab.htmlContent
                      )
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
                  apiKey={mapsConfig?.apiKey || settingsMap.google_maps_api_key}
                />
              )}

              {/* Other Tabs: Regular Content */}
              {activeTab !== 8 && activeTab !== 11 && (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: renderContent(
                      language === "es" && currentTab.htmlContentEs 
                        ? currentTab.htmlContentEs 
                        : currentTab.htmlContent
                    )
                  }} 
                  className="prose max-w-none"
                />
              )}

              {/* Back to Top Button */}
              <div className="mt-12 flex justify-center">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg"
                  style={{ backgroundColor: primaryColor }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                    <path d="M18 15l-6-6-6 6"/>
                  </svg>
                  {language === "en" ? "Back to Top" : "Volver arriba"}
                </button>
              </div>

              {/* Comments Section */}
              <div className="mt-8 border-t pt-8">
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
    </>
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
  const [clientFilter, setClientFilter] = useState("all");

  // Load Google Maps script
  useEffect(() => {
    if (!apiKey) return;
    if (typeof google !== 'undefined' && google.maps) {
      initMap();
      return;
    }
    
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
      if (clientFilter !== "all" && p.client !== clientFilter) return false;
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
  }, [map, projects, entityFilter, clientFilter, serviceFilter, primaryColor]);

  const entities = Array.from(new Set(projects.map(p => p.entity).filter(Boolean)));
  const clients = Array.from(new Set(projects.map(p => p.client).filter(Boolean)));
  const allServices = projects.flatMap(p => {
    try { return JSON.parse(p.services || "[]"); } 
    catch { return []; }
  });
  const services = Array.from(new Set(allServices));

  const filteredProjects = projects.filter(p => {
    if (!p.isVisible) return false;
    if (entityFilter !== "all" && p.entity !== entityFilter) return false;
    if (clientFilter !== "all" && p.client !== clientFilter) return false;
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
      
      {/* Filters and Map Layout */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Left Sidebar: Entity and Client Filters */}
        <div className="w-full md:w-48 flex-shrink-0 space-y-4 md:max-h-[500px] md:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {/* Entity Filter */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              {language === "en" ? "Entity" : "Entidad"}
            </Label>
            <div className="flex flex-col gap-2">
            <button
              onClick={() => setEntityFilter("all")}
              className={`px-4 py-2 rounded transition ${
                entityFilter === "all"
                  ? "text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              style={{
                backgroundColor: entityFilter === "all" ? primaryColor : undefined,
              }}
            >
              {language === "en" ? "All" : "Todas"}
            </button>
            {entities.map(e => (
              <button
                key={e}
                onClick={() => setEntityFilter(e)}
                className={`px-3 py-1 rounded text-xs transition ${
                  entityFilter === e
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                style={{
                  backgroundColor: entityFilter === e ? primaryColor : undefined,
                }}
              >
                {e}
              </button>
            ))}
            </div>
          </div>

          {/* Client Filter */}
          <div>
            <Label className="block text-sm font-medium mb-2">
              {language === "en" ? "Client" : "Cliente"}
            </Label>
            <div className="flex flex-col gap-2">
            <button
              onClick={() => setClientFilter("all")}
              className={`px-4 py-2 rounded transition ${
                clientFilter === "all"
                  ? "text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              style={{
                backgroundColor: clientFilter === "all" ? primaryColor : undefined,
              }}
            >
              {language === "en" ? "All" : "Todos"}
            </button>
            {clients.map(c => (
              <button
                key={c}
                onClick={() => setClientFilter(c)}
                className={`px-3 py-1 rounded text-xs transition ${
                  clientFilter === c
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                style={{
                  backgroundColor: clientFilter === c ? primaryColor : undefined,
                }}
              >
                {c}
              </button>
            ))}
            </div>
          </div>
        </div>

        {/* Center: Google Map */}
        <div className="flex-1 order-first md:order-none">
          {apiKey ? (
            <div 
              ref={mapRef} 
              className="w-full h-[500px] rounded-lg shadow-lg"
              style={{ background: '#e5e7eb' }}
            />
          ) : (
            <div className="w-full h-[500px] rounded-lg shadow-lg bg-gray-200 flex items-center justify-center">
              <p className="text-gray-600">{language === "en" ? "Map requires Google Maps API key" : "El mapa requiere clave API de Google Maps"}</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Service Filter */}
        <div className="w-full md:w-48 flex-shrink-0 md:max-h-[500px] md:overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          <div>
            <Label className="block text-sm font-medium mb-2">
              {language === "en" ? "Service" : "Servicio"}
            </Label>
            <div className="flex flex-col gap-2">
            <button
              onClick={() => setServiceFilter("all")}
              className={`px-4 py-2 rounded transition ${
                serviceFilter === "all"
                  ? "text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              style={{
                backgroundColor: serviceFilter === "all" ? primaryColor : undefined,
              }}
            >
              {language === "en" ? "All" : "Todos"}
            </button>
            {services.map(s => (
              <button
                key={s}
                onClick={() => setServiceFilter(s)}
                className={`px-3 py-1 rounded text-xs transition ${
                  serviceFilter === s
                    ? "text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
                style={{
                  backgroundColor: serviceFilter === s ? primaryColor : undefined,
                }}
              >
                {s}
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>

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
