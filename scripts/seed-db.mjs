import { drizzle } from "drizzle-orm/mysql2";
import { proposalSettings, heroSection, tabsContent, teamMembers, projects } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    // ============= Settings =============
    console.log("📝 Seeding settings...");
    await db.insert(proposalSettings).values([
      { settingKey: "password", settingValue: "demo2024" },
      { settingKey: "notification_email", settingValue: "admin@example.com" },
      { settingKey: "primary_color", settingValue: "#E65100" },
      { settingKey: "logo1_url", settingValue: "" },
      { settingKey: "logo2_url", settingValue: "" },
      { settingKey: "logo3_url", settingValue: "" },
      { settingKey: "logo4_url", settingValue: "" },
    ]).onDuplicateKeyUpdate({ set: { settingValue: "" } });

    // ============= Hero Section =============
    console.log("🎯 Seeding hero section...");
    await db.insert(heroSection).values({
      mainTitle: "Professional Services Proposal",
      subtitle: "Comprehensive Solution for Your Project Needs",
      stampText: "ISSUED FOR DISCUSSION",
    });

    // ============= Tabs Content =============
    console.log("📑 Seeding 12 tabs...");
    const tabsData = [
      {
        tabNumber: 0,
        tabTitle: "Who We Are",
        htmlContent: `<h2>Who We Are</h2>
<p>We are a leading professional services firm with decades of experience delivering exceptional results across multiple industries. Our team combines technical expertise with innovative thinking to solve complex challenges.</p>
<p>Our core values include integrity, excellence, and collaboration. We work closely with our clients to understand their unique needs and deliver tailored solutions that exceed expectations.</p>`,
        isVisible: true,
      },
      {
        tabNumber: 1,
        tabTitle: "Executive Summary",
        htmlContent: `<h2>Executive Summary</h2>
<p>This proposal outlines our comprehensive approach to delivering high-quality professional services for your organization. We bring together industry-leading expertise, proven methodologies, and a commitment to excellence.</p>
<h3>Key Highlights</h3>
<ul>
<li>Experienced team with proven track record</li>
<li>Innovative solutions tailored to your needs</li>
<li>Competitive pricing and flexible engagement models</li>
<li>Commitment to quality and timely delivery</li>
</ul>`,
        isVisible: true,
      },
      {
        tabNumber: 2,
        tabTitle: "Background",
        htmlContent: `<h2>Background</h2>
<p>Understanding the context and requirements of your project is fundamental to our approach. We have conducted thorough research and analysis to ensure our proposal addresses your specific needs.</p>
<h3>Project Context</h3>
<p>Your organization is seeking a partner who can deliver comprehensive professional services while maintaining the highest standards of quality and efficiency.</p>`,
        isVisible: true,
      },
      {
        tabNumber: 3,
        tabTitle: "Scope",
        htmlContent: `<h2>Scope of Work</h2>
<p>Our proposed scope encompasses all aspects necessary to successfully deliver your project requirements.</p>
<h3>Included Services</h3>
<ul>
<li>Initial consultation and requirements analysis</li>
<li>Detailed planning and design</li>
<li>Implementation and execution</li>
<li>Quality assurance and testing</li>
<li>Documentation and knowledge transfer</li>
<li>Ongoing support and maintenance</li>
</ul>`,
        isVisible: true,
      },
      {
        tabNumber: 4,
        tabTitle: "Approach",
        htmlContent: `<h2>Our Approach</h2>
<p>We follow a structured, proven methodology that ensures successful project delivery while maintaining flexibility to adapt to changing requirements.</p>
<h3>Methodology</h3>
<ol>
<li><strong>Discovery Phase:</strong> Understand requirements and constraints</li>
<li><strong>Planning Phase:</strong> Develop detailed project plan and timeline</li>
<li><strong>Execution Phase:</strong> Implement solutions with regular checkpoints</li>
<li><strong>Review Phase:</strong> Quality assurance and stakeholder feedback</li>
<li><strong>Delivery Phase:</strong> Final handover and documentation</li>
</ol>`,
        isVisible: true,
      },
      {
        tabNumber: 5,
        tabTitle: "Schedule",
        htmlContent: `<h2>Project Schedule</h2>
<p>We propose the following timeline for project delivery:</p>
<table border="1" cellpadding="8">
<thead>
<tr>
<th>Phase</th>
<th>Duration</th>
<th>Key Deliverables</th>
</tr>
</thead>
<tbody>
<tr>
<td>Discovery</td>
<td>2 weeks</td>
<td>Requirements document, Project plan</td>
</tr>
<tr>
<td>Design</td>
<td>3 weeks</td>
<td>Design specifications, Prototypes</td>
</tr>
<tr>
<td>Implementation</td>
<td>8 weeks</td>
<td>Working solution, Progress reports</td>
</tr>
<tr>
<td>Testing & QA</td>
<td>2 weeks</td>
<td>Test reports, Bug fixes</td>
</tr>
<tr>
<td>Deployment</td>
<td>1 week</td>
<td>Live system, Documentation</td>
</tr>
</tbody>
</table>`,
        isVisible: true,
      },
      {
        tabNumber: 6,
        tabTitle: "Deliverables",
        htmlContent: `<h2>Project Deliverables</h2>
<p>We commit to delivering the following outputs:</p>
<h3>Documentation</h3>
<ul>
<li>Requirements specification document</li>
<li>Technical design documentation</li>
<li>User guides and training materials</li>
<li>System administration manuals</li>
</ul>
<h3>Technical Deliverables</h3>
<ul>
<li>Fully functional system/solution</li>
<li>Source code and configuration files</li>
<li>Test results and quality reports</li>
<li>Deployment scripts and procedures</li>
</ul>`,
        isVisible: true,
      },
      {
        tabNumber: 7,
        tabTitle: "Requirements",
        htmlContent: `<h2>Requirements</h2>
<p>To ensure successful project delivery, we require the following from your organization:</p>
<h3>Client Responsibilities</h3>
<ul>
<li>Timely access to key stakeholders for requirements gathering</li>
<li>Provision of necessary system access and credentials</li>
<li>Timely feedback on deliverables and milestones</li>
<li>Designated project liaison for communication</li>
</ul>
<h3>Technical Requirements</h3>
<ul>
<li>Access to development/staging environments</li>
<li>Relevant documentation and existing system information</li>
<li>Approval processes and sign-off procedures</li>
</ul>`,
        isVisible: true,
      },
      {
        tabNumber: 8,
        tabTitle: "Team",
        htmlContent: `<h2>Our Team</h2>
<p>Meet the experienced professionals who will be working on your project. Our team brings together diverse expertise and a proven track record of successful project delivery.</p>`,
        isVisible: true,
      },
      {
        tabNumber: 9,
        tabTitle: "Assumptions",
        htmlContent: `<h2>Project Assumptions</h2>
<p>This proposal is based on the following assumptions:</p>
<ul>
<li>Project scope as defined in this document remains stable</li>
<li>Client will provide timely feedback and approvals</li>
<li>Necessary resources and access will be available as required</li>
<li>No major changes to regulatory or compliance requirements during project</li>
<li>Standard business hours apply unless otherwise agreed</li>
<li>Payment terms will be honored according to agreed schedule</li>
</ul>
<h3>Change Management</h3>
<p>Any changes to scope, timeline, or deliverables will be managed through a formal change request process with appropriate impact assessment and approval.</p>`,
        isVisible: true,
      },
      {
        tabNumber: 10,
        tabTitle: "Commercial",
        htmlContent: `<h2>Commercial Terms</h2>
<h3>Investment</h3>
<p>Our proposed fee structure is designed to provide excellent value while ensuring the highest quality of service delivery.</p>
<table border="1" cellpadding="8">
<thead>
<tr>
<th>Item</th>
<th>Cost</th>
</tr>
</thead>
<tbody>
<tr>
<td>Professional Services</td>
<td>$XXX,XXX</td>
</tr>
<tr>
<td>Project Management</td>
<td>$XX,XXX</td>
</tr>
<tr>
<td>Quality Assurance</td>
<td>$XX,XXX</td>
</tr>
<tr>
<td><strong>Total Investment</strong></td>
<td><strong>$XXX,XXX</strong></td>
</tr>
</tbody>
</table>
<h3>Payment Terms</h3>
<ul>
<li>30% upon contract signing</li>
<li>40% upon completion of design phase</li>
<li>30% upon final delivery and acceptance</li>
</ul>`,
        isVisible: true,
      },
      {
        tabNumber: 11,
        tabTitle: "Experience Map",
        htmlContent: `<h2>Our Experience</h2>
<p>Explore our portfolio of successful projects across various industries and sectors. Use the filters to view projects by entity or service type.</p>`,
        isVisible: true,
      },
    ];

    for (const tab of tabsData) {
      await db.insert(tabsContent).values(tab).onDuplicateKeyUpdate({ 
        set: { 
          tabTitle: tab.tabTitle,
          htmlContent: tab.htmlContent,
          isVisible: tab.isVisible 
        } 
      });
    }

    // ============= Team Members =============
    console.log("👥 Seeding team members...");
    await db.insert(teamMembers).values([
      {
        name: "John Smith",
        title: "Senior Project Manager",
        bio: "John brings over 15 years of experience in managing complex projects across multiple industries. His expertise in stakeholder management and risk mitigation ensures successful project delivery.",
        photoUrl: "",
        yearsExperience: 15,
        keySkills: "Project Management, Risk Management, Stakeholder Engagement",
        sortOrder: 1,
        isVisible: true,
      },
      {
        name: "Sarah Johnson",
        title: "Lead Technical Architect",
        bio: "Sarah is a seasoned technical architect with deep expertise in system design and integration. She has successfully delivered numerous enterprise-scale solutions.",
        photoUrl: "",
        yearsExperience: 12,
        keySkills: "System Architecture, Cloud Solutions, Integration",
        sortOrder: 2,
        isVisible: true,
      },
      {
        name: "Michael Chen",
        title: "Senior Business Analyst",
        bio: "Michael excels at translating business requirements into technical specifications. His analytical skills and attention to detail ensure that solutions meet client needs.",
        photoUrl: "",
        yearsExperience: 10,
        keySkills: "Requirements Analysis, Process Improvement, Documentation",
        sortOrder: 3,
        isVisible: true,
      },
    ]);

    // ============= Projects =============
    console.log("🏗️ Seeding projects...");
    await db.insert(projects).values([
      {
        projectName: "Enterprise System Modernization",
        entity: "EPCM",
        client: "Global Manufacturing Corp",
        location: "New York",
        country: "USA",
        latitude: "40.7128",
        longitude: "-74.0060",
        projectValue: "$2.5M",
        projectYear: "2023",
        services: '["System Design", "Implementation", "QS"]',
        description: "Complete modernization of legacy enterprise systems with cloud migration and process optimization.",
        sortOrder: 1,
        isVisible: true,
      },
      {
        projectName: "Digital Transformation Initiative",
        entity: "AXTON",
        client: "Financial Services Inc",
        location: "London",
        country: "UK",
        latitude: "51.5074",
        longitude: "-0.1278",
        projectValue: "$3.2M",
        projectYear: "2023",
        services: '["Planning", "Implementation", "Training"]',
        description: "End-to-end digital transformation including process automation and staff training programs.",
        sortOrder: 2,
        isVisible: true,
      },
      {
        projectName: "Infrastructure Upgrade Program",
        entity: "EPCM",
        client: "Tech Solutions Ltd",
        location: "Sydney",
        country: "Australia",
        latitude: "-33.8688",
        longitude: "151.2093",
        projectValue: "$1.8M",
        projectYear: "2022",
        services: '["QS", "Project Management", "Implementation"]',
        description: "Major infrastructure upgrade with focus on security, scalability, and performance optimization.",
        sortOrder: 3,
        isVisible: true,
      },
    ]);

    console.log("✅ Database seeding completed successfully!");
    console.log("\n📋 Default credentials:");
    console.log("   Password: demo2024");
    console.log("   Admin email: admin@example.com");
    console.log("\n🔗 Access the application:");
    console.log("   Proposal: /proposal");
    console.log("   Admin: /admin");
    
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
