import { useState, useMemo, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { renderContent } from "@/lib/markdown";

export default function Proposal() {
  const params = useParams();
  const slug = params.slug || 'default';
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  
  // Fetch document by slug
  const { data: document } = trpc.documents.getBySlug.useQuery({ slug });
  const documentId = document?.id || 1;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === document?.password) {
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
            <CardTitle className="text-center">Public Access</CardTitle>
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
                Access Document
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <ProposalContent documentId={documentId} />;
}

function ProposalContent({ documentId }: { documentId: number }) {
  // Navigation
  const [activeTab, setActiveTab] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const tabButtonsRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  
  // Language
  const [language, setLanguage] = useState<"en" | "es">("en");
  
  // Map
  const mapRef = useRef<HTMLDivElement>(null);
  
  // Data queries
  const { data: settings } = trpc.settings.getAll.useQuery({ documentId });
  const { data: hero } = trpc.hero.get.useQuery({ documentId });
  const { data: tabs } = trpc.tabs.getAll.useQuery({ documentId });
  const { data: teamMembers } = trpc.team.getAll.useQuery({ documentId });
  const { data: projects } = trpc.projects.getAll.useQuery({ documentId });
  const { data: comments } = trpc.commentsRouter.getAll.useQuery({ documentId });
  
  // Debug: Log projects data immediately after fetch
  useEffect(() => {
    console.log('[Proposal Debug] documentId:', documentId);
    console.log('[Proposal Debug] projects data:', projects);
    console.log('[Proposal Debug] projects length:', projects?.length);
    if (projects && projects.length > 0) {
      console.log('[Proposal Debug] First project:', projects[0]);
    }
  }, [documentId, projects]);
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
  const secondaryColor = settingsMap.secondary_color || "#fff76b";
  const contrastColor = settingsMap.contrast_color || "#ffffff";
  const visibleTabs = tabs?.filter(t => t.isVisible) || [];
  
  // Get current tab
  const currentTab = visibleTabs.find(t => t.tabNumber === activeTab);
  
  // Process Notion placeholders for current tab
  const { data: processedContent } = trpc.notionData.processMarkdown.useQuery(
    {
      markdown: language === "es" && currentTab?.htmlContentEs 
        ? currentTab.htmlContentEs 
        : currentTab?.htmlContent || "",
      notionUrls: {
        db1: currentTab?.notionDatabaseUrl || undefined,
        db2: currentTab?.notionDatabaseUrl2 || undefined,
        db3: currentTab?.notionDatabaseUrl3 || undefined,
      },
    },
    {
      enabled: !!currentTab, // Only run when currentTab exists
    }
  );
  
  // Use processed content if available, otherwise fallback to original
  const tabContent = processedContent?.processedMarkdown || 
    (language === "es" && currentTab?.htmlContentEs ? currentTab.htmlContentEs : currentTab?.htmlContent || "");

  // Set first visible tab as active on load
  useEffect(() => {
    if (visibleTabs.length > 0 && activeTab === 0) {
      setActiveTab(visibleTabs[0].tabNumber);
    }
  }, [visibleTabs, activeTab]);



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
      title.textContent = `${tab.tabTitle}`;
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
      
      // Add projects for tab 200 (Experience Map)
      if (tab.tabNumber === 1200 && projects) {
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
      html += `<div class="tab-title">${tab.tabTitle}</div>`;
      
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
      <div className="min-h-screen" style={{ backgroundColor: settingsMap.background_color || '#f5f5f5' }}>
      {/* Minimal Header with Logos, Print, and Language */}
      <header 
        ref={headerRef}
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
                  className="h-16 max-w-[180px] object-contain" 
                />
              )}
              {settingsMap.logo3_url && (
                <img 
                  src={settingsMap.logo3_url} 
                  alt="Logo 3" 
                  className="h-16 max-w-[180px] object-contain" 
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
                  className="h-16 max-w-[180px] object-contain" 
                />
              )}
              {settingsMap.logo2_url && (
                <img 
                  src={settingsMap.logo2_url} 
                  alt="Logo 2" 
                  className="h-16 max-w-[180px] object-contain" 
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - always renders for consistent layout */}
      <div className="py-4 text-center" style={{ backgroundColor: `${primaryColor}10` }}>
        <div className="container mx-auto px-4">
          {hero?.mainTitle && (
            <h1 className="text-3xl font-bold mb-0" style={{ color: primaryColor }}>
              {hero.mainTitle}
            </h1>
          )}
          {hero?.subtitle && (
            <p className="text-base mb-0" style={{ color: secondaryColor }}>{hero.subtitle}</p>
          )}
          {hero?.stampText && (
            <div className="inline-block px-5 py-1.5 border-3 mb-0 mt-1" style={{ borderColor: contrastColor, backgroundColor: 'transparent', color: contrastColor, borderWidth: '3px' }}>
              <span className="font-bold text-sm">{hero.stampText}</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons for Tab A (100) and Tab B (200) */}
      {(visibleTabs.some(t => t.tabNumber === 1100) || visibleTabs.some(t => t.tabNumber === 1200)) && (
        <div className="py-4 text-center" style={{ backgroundColor: `${primaryColor}10` }}>
          <div className="container mx-auto px-4">
            <div className="flex gap-4 justify-center no-print">
              {/* Dynamic hero buttons for tabs 11xx and 12xx (ordered by ID) */}
              {visibleTabs
                .filter(t => t.tabNumber >= 1100 && t.tabNumber < 1300)
                .sort((a, b) => a.tabNumber - b.tabNumber)
                .map((tab) => (
                  <button
                    key={tab.tabNumber}
                    onClick={() => {
                      setActiveTab(tab.tabNumber);
                      setTimeout(() => {
                        const tabButtons = tabButtonsRef.current;
                        const header = headerRef.current;
                        if (tabButtons && header) {
                          // Scroll to tab buttons row, accounting for sticky header
                          const headerHeight = header.offsetHeight;
                          const tabButtonsTop = tabButtons.offsetTop;
                          window.scrollTo({ top: tabButtonsTop - headerHeight, behavior: 'smooth' });
                        }
                      }, 100);
                    }}
                    className="px-6 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition flex items-center gap-2 shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                      {tab.tabNumber >= 1100 && tab.tabNumber < 1200 ? (
                        // Icon for "Who We Are" type tabs (11xx)
                        <>
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                          <circle cx="9" cy="7" r="4"/>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                        </>
                      ) : (
                        // Icon for "Experience Map" type tabs (12xx)
                        <>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </>
                      )}
                    </svg>
                    {tab.tabTitle}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Tab Navigation (Tabs 1-10 only) */}
      <div ref={tabButtonsRef} className="bg-gray-100 border-y border-gray-300 no-print">
        <div className="container mx-auto px-4 py-4">
          {/* Desktop: Single row if all fit, Mobile: Two rows with horizontal scroll */}
          <div className="hidden md:flex gap-2 flex-wrap justify-center">
            {visibleTabs
              .filter(t => t.tabNumber >= 100 && t.tabNumber < 1100)
              .sort((a, b) => a.tabNumber - b.tabNumber)
              .map((tab) => (
              <button
                key={tab.tabNumber}
                onClick={() => {
                  setActiveTab(tab.tabNumber);
                  setTimeout(() => {
                    const tabButtons = tabButtonsRef.current;
                    const header = headerRef.current;
                    if (tabButtons && header) {
                      // Scroll to tab buttons row, accounting for sticky header
                      const headerHeight = header.offsetHeight;
                      const tabButtonsTop = tabButtons.offsetTop;
                      window.scrollTo({ top: tabButtonsTop - headerHeight, behavior: 'smooth' });
                    }
                  }, 100);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.tabNumber
                    ? 'text-white shadow-md'
                    : 'text-gray-700 hover:opacity-90 border border-gray-300'
                }`}
                style={{
                  backgroundColor: activeTab === tab.tabNumber ? primaryColor : secondaryColor,
                }}
              >
                {tab.tabTitle}
              </button>
            ))}
          </div>
          
          {/* Mobile: Two rows with horizontal drag */}
          <div className="md:hidden space-y-2">
            {/* First Row: First half of regular tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {visibleTabs
                .filter(t => t.tabNumber >= 100 && t.tabNumber < 1100)
                .sort((a, b) => a.tabNumber - b.tabNumber)
                .slice(0, Math.ceil(visibleTabs.filter(t => t.tabNumber >= 100 && t.tabNumber < 1100).length / 2))
                .map((tab) => (
                <button
                  key={tab.tabNumber}
                  onClick={() => {
                    setActiveTab(tab.tabNumber);
                    setTimeout(() => {
                      const tabButtons = tabButtonsRef.current;
                      const header = headerRef.current;
                      if (tabButtons && header) {
                        // Scroll to tab buttons row, accounting for sticky header
                        const headerHeight = header.offsetHeight;
                        const tabButtonsTop = tabButtons.offsetTop;
                        window.scrollTo({ top: tabButtonsTop - headerHeight, behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition flex-shrink-0 ${
                    activeTab === tab.tabNumber
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:opacity-90 border border-gray-300'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.tabNumber ? primaryColor : secondaryColor,
                  }}
                >
                  {tab.tabTitle}
                </button>
              ))}
            </div>
            
            {/* Second Row: Second half of regular tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'thin' }}>
              {visibleTabs
                .filter(t => t.tabNumber >= 100 && t.tabNumber < 1100)
                .sort((a, b) => a.tabNumber - b.tabNumber)
                .slice(Math.ceil(visibleTabs.filter(t => t.tabNumber >= 100 && t.tabNumber < 1100).length / 2))
                .map((tab) => (
                <button
                  key={tab.tabNumber}
                  onClick={() => {
                    setActiveTab(tab.tabNumber);
                    setTimeout(() => {
                      const tabButtons = tabButtonsRef.current;
                      const header = headerRef.current;
                      if (tabButtons && header) {
                        // Scroll to tab buttons row, accounting for sticky header
                        const headerHeight = header.offsetHeight;
                        const tabButtonsTop = tabButtons.offsetTop;
                        window.scrollTo({ top: tabButtonsTop - headerHeight, behavior: 'smooth' });
                      }
                    }, 100);
                  }}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition flex-shrink-0 ${
                    activeTab === tab.tabNumber
                      ? 'text-white shadow-md'
                      : 'text-gray-700 hover:opacity-90 border border-gray-300'
                  }`}
                  style={{
                    backgroundColor: activeTab === tab.tabNumber ? primaryColor : secondaryColor,
                  }}
                >
                  {tab.tabTitle}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area (Full Width) */}
      <div className="flex">
        {/* Main Content Area with Per-Tab Background */}
        <main ref={mainContentRef} 
          className="flex-1 p-8 transition-all duration-300" 
          style={{
            ...(currentTab?.backgroundType === "image" && currentTab?.backgroundValue ? {
              backgroundImage: `url(${currentTab.backgroundValue})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundAttachment: 'fixed',
            } : currentTab?.backgroundType === "gradient" && currentTab?.backgroundValue ? {
              background: currentTab.backgroundValue,
            } : {
              backgroundColor: currentTab?.backgroundValue || settingsMap.background_color || '#f5f5f5',
            })
          }}
        >
          {currentTab && (
            <div>
              <h2 className="text-3xl font-bold mb-6 scroll-mt-4" style={{ color: primaryColor }}>
                {currentTab.tabTitle}
              </h2>

              {/* Tab 800: Team Section */}
              {activeTab === 800 && (
                <div className="mb-8">
                  <div 
                    dangerouslySetInnerHTML={{ 
                      __html: renderContent(tabContent, {
                        image1: currentTab.notionDatabaseUrl || undefined,
                        image2: currentTab.notionDatabaseUrl2 || undefined,
                        image3: currentTab.notionDatabaseUrl3 || undefined,
                      })
                    }} 
                    className="prose max-w-none mb-8"
                    style={{ '--contrast-color': contrastColor, '--secondary-color': secondaryColor, '--tw-prose-headings': primaryColor } as React.CSSProperties}
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
                              style={{ border: `4px solid ${contrastColor}` }}
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

              {/* Tab 1200: Experience Map */}
              {activeTab === 1200 && (
                <ExperienceMapSection 
                  projects={projects || []} 
                  primaryColor={primaryColor}
                  language={language}
                />
              )}

              {/* Other Tabs: Regular Content */}
              {activeTab !== 8 && activeTab !== 11 && (
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: renderContent(tabContent, {
                      image1: currentTab.notionDatabaseUrl || undefined,
                      image2: currentTab.notionDatabaseUrl2 || undefined,
                      image3: currentTab.notionDatabaseUrl3 || undefined,
                    })
                  }} 
                  className="prose max-w-none"
                  style={{ '--contrast-color': contrastColor, '--secondary-color': secondaryColor, '--tw-prose-headings': primaryColor } as React.CSSProperties}
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

// Experience Map Section Component with Leaflet
function ExperienceMapSection({ 
  projects, 
  primaryColor, 
  language 
}: { 
  projects: any[]; 
  primaryColor: string; 
  language: "en" | "es";
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerClusterRef = useRef<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [entityFilter, setEntityFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(0);

  // Filter visible projects with coordinates
  // Note: isVisible might be stored as 1/0 (integer) or true/false (boolean)
  const validProjects = projects.filter(p => 
    p.isVisible && // Truthy check (accepts 1 or true)
    p.latitude && 
    p.longitude
  );

  // Get unique countries for filter
  const countries = useMemo(() => {
    const uniqueCountries = [...new Set(validProjects.map(p => p.country).filter(Boolean))];
    return uniqueCountries.sort();
  }, [validProjects]);

  // Get unique entities
  const entities = useMemo(() => {
    const uniqueEntities = [...new Set(validProjects.map(p => p.entity).filter(Boolean))];
    return uniqueEntities.sort();
  }, [validProjects]);

  // Entity colors
  const ENTITY_COLORS: Record<string, string> = {
    'IPP': '#4285F4',
    'Axton': '#EA4335',
    'default': '#666666'
  };

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Check if Leaflet is loaded
    if (typeof window === 'undefined' || !(window as any).L) {
      console.error('Leaflet not loaded');
      return;
    }

    const L = (window as any).L;

    // Create map
    const map = L.map(mapRef.current).setView([0, 0], 2);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(map);

    // Create marker cluster group
    const markerCluster = L.markerClusterGroup({
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      maxClusterRadius: 50
    });

    map.addLayer(markerCluster);

    mapInstanceRef.current = map;
    markerClusterRef.current = markerCluster;

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerClusterRef.current = null;
      }
    };
  }, []);

  // Create custom icon
  const createIcon = (entity: string) => {
    if (typeof window === 'undefined' || !(window as any).L) return null;
    
    const L = (window as any).L;
    const color = ENTITY_COLORS[entity] || ENTITY_COLORS.default;
    
    return L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="
        background-color: ${color};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 5px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10]
    });
  };

  // Create popup content
  const createPopupContent = (project: any) => {
    return `
      <div style="font-family: sans-serif;">
        <h4 style="margin: 0 0 8px 0; color: #1a73e8; font-size: 15px;">${project.projectName || 'Unnamed Project'}</h4>
        <div style="margin: 4px 0; font-size: 13px;"><strong>Client:</strong> ${project.client || 'N/A'}</div>
        <div style="margin: 4px 0; font-size: 13px;"><strong>Location:</strong> ${project.location || 'N/A'}</div>
        <div style="margin: 4px 0; font-size: 13px;"><strong>Country:</strong> ${project.country || 'N/A'}</div>
        <div style="margin: 4px 0; font-size: 13px;"><strong>Entity:</strong> ${project.entity || 'N/A'}</div>
        ${project.projectYear ? `<div style="margin: 4px 0; font-size: 13px;"><strong>Year:</strong> ${project.projectYear}</div>` : ''}
        ${project.services ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 12px;"><strong>Services:</strong> ${project.services}</div>` : ''}
      </div>
    `;
  };

  // Update markers based on filters
  useEffect(() => {
    if (!mapInstanceRef.current || !markerClusterRef.current) return;
    if (typeof window === 'undefined' || !(window as any).L) return;

    const L = (window as any).L;
    const markerCluster = markerClusterRef.current;

    // Clear existing markers
    markerCluster.clearLayers();

    // Filter projects
    const filteredProjects = validProjects.filter(project => {
      const matchesSearch = !searchTerm || 
        project.projectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.services?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEntity = entityFilter === 'all' || project.entity === entityFilter;
      const matchesCountry = countryFilter === 'all' || project.country === countryFilter;

      return matchesSearch && matchesEntity && matchesCountry;
    });

    // Add markers
    filteredProjects.forEach(project => {
      const lat = parseFloat(project.latitude);
      const lng = parseFloat(project.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const marker = L.marker([lat, lng], {
        icon: createIcon(project.entity)
      });

      marker.bindPopup(createPopupContent(project));
      markerCluster.addLayer(marker);
    });

    setVisibleCount(filteredProjects.length);

    // Fit bounds if markers exist
    if (filteredProjects.length > 0 && markerCluster.getBounds().isValid()) {
      mapInstanceRef.current.fitBounds(markerCluster.getBounds().pad(0.1));
    }
  }, [validProjects, searchTerm, entityFilter, countryFilter]);

  return (
    <div style={{ width: '100%' }}>
      {/* Map Container */}
      <div style={{ position: 'relative', width: '100%', height: '600px', marginBottom: '2rem' }}>
        <div ref={mapRef} style={{ width: '100%', height: '100%', borderRadius: '8px', overflow: 'hidden' }} />
        
        {/* Controls Panel */}
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'white',
          padding: '15px',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxWidth: '280px'
        }}>
          <h3 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#333' }}>
            {language === 'es' ? 'Filtros de Proyectos' : 'Project Filters'}
          </h3>
          
          {/* Search */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666', fontWeight: 500 }}>
              {language === 'es' ? 'Buscar Proyectos' : 'Search Projects'}
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'es' ? 'Buscar por nombre, cliente...' : 'Search by name, client...'}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            />
          </div>
          
          {/* Entity Filter */}
          {entities.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666', fontWeight: 500 }}>
                {language === 'es' ? 'Entidad' : 'Entity'}
              </label>
              <select
                value={entityFilter}
                onChange={(e) => setEntityFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              >
                <option value="all">{language === 'es' ? 'Todas las Entidades' : 'All Entities'}</option>
                {entities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Country Filter */}
          {countries.length > 0 && (
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', color: '#666', fontWeight: 500 }}>
                {language === 'es' ? 'País' : 'Country'}
              </label>
              <select
                value={countryFilter}
                onChange={(e) => setCountryFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '13px'
                }}
              >
                <option value="all">{language === 'es' ? 'Todos los Países' : 'All Countries'}</option>
                {countries.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          )}
          
          {/* Stats */}
          <div style={{
            fontSize: '12px',
            color: '#888',
            paddingTop: '10px',
            borderTop: '1px solid #eee'
          }}>
            {language === 'es' 
              ? `Mostrando ${visibleCount} de ${validProjects.length} proyectos`
              : `Showing ${visibleCount} of ${validProjects.length} projects`
            }
          </div>
        </div>

        {/* Legend */}
        {entities.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '30px',
            left: '10px',
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
            zIndex: 1000
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#333' }}>
              {language === 'es' ? 'Leyenda de Entidades' : 'Entity Legend'}
            </h4>
            {entities.map(entity => (
              <div key={entity} style={{ display: 'flex', alignItems: 'center', margin: '5px 0', fontSize: '12px' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: ENTITY_COLORS[entity] || ENTITY_COLORS.default,
                  marginRight: '8px',
                  border: '2px solid white',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                }} />
                <span>{entity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', color: primaryColor }}>
          {language === 'es' ? 'Nuestra Experiencia' : 'Our Experience'}
        </h3>
        <p style={{ margin: 0, fontSize: '0.95rem', color: '#666' }}>
          {language === 'es' 
            ? 'Explore nuestro portafolio de proyectos exitosos en diversas industrias y sectores. Utilice los filtros para ver proyectos por entidad o tipo de servicio.'
            : 'Explore our portfolio of successful projects across various industries and sectors. Use the filters to view projects by entity or service type.'
          }
        </p>
      </div>
    </div>
  );
}
