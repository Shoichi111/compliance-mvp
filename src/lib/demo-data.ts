// Demo Test Data for Compliance Management Platform
// This file contains sample data for testing and demonstration purposes

export const DEMO_USERS = {
  admin: {
    email: "admin@demo.com",
    password: "Admin123!",
    role: "admin"
  },
  advisors: [
    {
      email: "alice@advisor.com", 
      password: "Advisor123!",
      role: "advisor",
      name: "Alice Johnson"
    },
    {
      email: "bob@advisor.com",
      password: "Advisor123!", 
      role: "advisor",
      name: "Bob Smith"
    }
  ],
  subcontractors: [
    {
      email: "apex@construction.com",
      password: "Sub123!",
      role: "subcontractor", 
      companyName: "Apex Construction",
      contact: "John Miller"
    },
    {
      email: "stark@electrical.com",
      password: "Sub123!",
      role: "subcontractor",
      companyName: "Stark Electrical", 
      contact: "Tony Stark"
    },
    {
      email: "wayne@plumbing.com", 
      password: "Sub123!",
      role: "subcontractor",
      companyName: "Wayne Plumbing",
      contact: "Bruce Wayne"
    }
  ]
};

export const DEMO_PROJECTS = [
  {
    projectName: "Downtown Tower Construction",
    assignedAdvisor: "alice@advisor.com",
    subcontractors: ["apex@construction.com", "stark@electrical.com"],
    description: "45-story commercial tower in downtown core"
  },
  {
    projectName: "Highway Expansion Project", 
    assignedAdvisor: "bob@advisor.com",
    subcontractors: ["wayne@plumbing.com", "apex@construction.com"],
    description: "Major highway infrastructure upgrade"
  },
  {
    projectName: "Medical Center Renovation",
    assignedAdvisor: "alice@advisor.com", 
    subcontractors: ["stark@electrical.com"],
    description: "Complete renovation of regional medical facility"
  }
];

export const DEMO_SUBMISSIONS = [
  {
    projectName: "Downtown Tower Construction",
    subcontractor: "apex@construction.com",
    month: 11,
    year: 2024,
    status: "Submitted",
    completionPercentage: 100,
    metrics: {
      totalWorkerHours: 1250,
      lostTimeInjuries: 0,
      medicalAidInjuries: 1,
      firstAidInjuries: 2, 
      propertyDamage: 0,
      environmentalIncidents: 0,
      nearMisses: 3,
      hazardIdentifications: 15,
      safetyInspections: 8,
      toolboxTalks: 4,
      workersSiteOriented: 5
    },
    hasIncidents: true, // Due to medical aid and first aid injuries
    documentsUploaded: [
      "Daily Hazard Assessments (FLRA/PWHA)",
      "Safety Inspection Reports", 
      "Toolbox Talk Attendance Sheet",
      "Equipment Pre-Use Inspection Forms",
      "Incident Investigation Report"
    ]
  },
  {
    projectName: "Highway Expansion Project",
    subcontractor: "wayne@plumbing.com", 
    month: 11,
    year: 2024,
    status: "Not Submitted",
    completionPercentage: 45,
    metrics: {
      totalWorkerHours: 890,
      lostTimeInjuries: 0,
      medicalAidInjuries: 0,
      firstAidInjuries: 0,
      propertyDamage: 0, 
      environmentalIncidents: 0,
      nearMisses: 1,
      hazardIdentifications: 8,
      safetyInspections: 3,
      toolboxTalks: 2,
      workersSiteOriented: 3
    },
    hasIncidents: false,
    documentsUploaded: [
      "Daily Hazard Assessments (FLRA/PWHA)",
      "Safety Inspection Reports"
    ]
  },
  {
    projectName: "Medical Center Renovation",
    subcontractor: "stark@electrical.com",
    month: 10, 
    year: 2024,
    status: "Submitted",
    completionPercentage: 100,
    metrics: {
      totalWorkerHours: 720,
      lostTimeInjuries: 0,
      medicalAidInjuries: 0,
      firstAidInjuries: 1,
      propertyDamage: 1,
      environmentalIncidents: 0, 
      nearMisses: 2,
      hazardIdentifications: 12,
      safetyInspections: 6,
      toolboxTalks: 3,
      workersSiteOriented: 2
    },
    hasIncidents: true, // Due to first aid injury and property damage
    documentsUploaded: [
      "Daily Hazard Assessments (FLRA/PWHA)",
      "Safety Inspection Reports",
      "Toolbox Talk Attendance Sheet", 
      "Equipment Pre-Use Inspection Forms",
      "Incident Investigation Report"
    ]
  }
];

export const DEMO_ANNUAL_DOCS_STATUS = [
  {
    subcontractor: "apex@construction.com", 
    year: 2024,
    status: "Complete",
    completionPercentage: 100,
    documentsSubmitted: 18
  },
  {
    subcontractor: "stark@electrical.com",
    year: 2024, 
    status: "Incomplete",
    completionPercentage: 67,
    documentsSubmitted: 12
  },
  {
    subcontractor: "wayne@plumbing.com",
    year: 2024,
    status: "Incomplete", 
    completionPercentage: 33,
    documentsSubmitted: 6
  }
];

// Demo scenario workflows for testing
export const DEMO_SCENARIOS = {
  
  // Scenario 1: New admin setup
  adminSetup: {
    title: "Initial Admin Setup",
    steps: [
      "Navigate to /setup-admin",
      "Create admin account with admin@demo.com / Admin123!",
      "Verify login redirect to /admin dashboard",
      "Confirm dashboard shows empty state (no users/projects)"
    ]
  },

  // Scenario 2: Complete user and project setup
  fullSetup: {
    title: "Complete System Setup", 
    steps: [
      "Login as admin",
      "Create 2 advisors using demo data",
      "Create 3 subcontractors using demo data", 
      "Create 3 projects with advisor/subcontractor assignments",
      "Verify all users can log in with correct role redirects"
    ]
  },

  // Scenario 3: Subcontractor workflow
  subcontractorFlow: {
    title: "Monthly Report Submission",
    steps: [
      "Login as apex@construction.com",
      "Navigate to Monthly Reports tab",
      "Fill out safety metrics form with demo data", 
      "Upload 5 required documents",
      "Submit complete report",
      "Verify submission shows as 'Complete' in history"
    ]
  },

  // Scenario 4: Advisor workflow  
  advisorFlow: {
    title: "Advisor Review Process",
    steps: [
      "Login as alice@advisor.com",
      "View assigned projects on dashboard",
      "Review submitted reports from subcontractors",
      "Download uploaded safety documents", 
      "Verify compliance status tracking"
    ]
  },

  // Scenario 5: Admin analytics
  adminAnalytics: {
    title: "System-wide Analytics",
    steps: [
      "Login as admin",
      "Navigate to Analytics tab",
      "Review compliance rates and KPIs", 
      "Check at-risk projects and overdue submissions",
      "Verify incident trend calculations"
    ]
  },

  // Scenario 6: Annual documents
  annualDocs: {
    title: "Annual Documentation Upload",
    steps: [
      "Login as subcontractor",
      "Navigate to Annual Documents tab",
      "Upload documents in all 3 categories",
      "Add expiry dates for WSIB and Insurance",
      "Mark as submitted when 100% complete"
    ]
  }
};

// Test data validation helpers
export class DemoDataValidator {
  
  static validateUserData() {
    const issues = [];
    
    // Check email formats
    const allEmails = [
      DEMO_USERS.admin.email,
      ...DEMO_USERS.advisors.map(a => a.email),
      ...DEMO_USERS.subcontractors.map(s => s.email)
    ];
    
    allEmails.forEach(email => {
      if (!email.includes('@') || !email.includes('.')) {
        issues.push(`Invalid email format: ${email}`);
      }
    });

    // Check password strength
    const allPasswords = [
      DEMO_USERS.admin.password,
      ...DEMO_USERS.advisors.map(a => a.password),
      ...DEMO_USERS.subcontractors.map(s => s.password)  
    ];
    
    allPasswords.forEach(password => {
      if (password.length < 6) {
        issues.push(`Password too short: ${password}`);
      }
    });

    return issues;
  }

  static validateProjectData() {
    const issues = [];
    
    DEMO_PROJECTS.forEach(project => {
      if (!project.projectName || project.projectName.length < 3) {
        issues.push(`Invalid project name: ${project.projectName}`);
      }
      
      if (!project.subcontractors || project.subcontractors.length === 0) {
        issues.push(`No subcontractors assigned to: ${project.projectName}`);
      }
    });

    return issues;
  }

  static validateSubmissionData() {
    const issues = [];
    
    DEMO_SUBMISSIONS.forEach(submission => {
      // Check required metrics exist
      const metrics = submission.metrics;
      const requiredFields = [
        'totalWorkerHours', 'lostTimeInjuries', 'medicalAidInjuries',
        'firstAidInjuries', 'propertyDamage', 'environmentalIncidents', 
        'nearMisses', 'hazardIdentifications', 'safetyInspections',
        'toolboxTalks', 'workersSiteOriented'
      ];
      
      requiredFields.forEach(field => {
        if (metrics[field] === undefined || metrics[field] < 0) {
          issues.push(`Invalid ${field} in submission for ${submission.projectName}`);
        }
      });

      // Validate incident logic
      const hasIncidentMetrics = 
        metrics.lostTimeInjuries > 0 ||
        metrics.medicalAidInjuries > 0 || 
        metrics.firstAidInjuries > 0 ||
        metrics.propertyDamage > 0 ||
        metrics.environmentalIncidents > 0;
        
      if (hasIncidentMetrics !== submission.hasIncidents) {
        issues.push(`Incident flag mismatch for ${submission.projectName}`);
      }
    });

    return issues;
  }

  static runAllValidations() {
    return {
      userIssues: this.validateUserData(),
      projectIssues: this.validateProjectData(), 
      submissionIssues: this.validateSubmissionData()
    };
  }
}

export default {
  DEMO_USERS,
  DEMO_PROJECTS,
  DEMO_SUBMISSIONS, 
  DEMO_ANNUAL_DOCS_STATUS,
  DEMO_SCENARIOS,
  DemoDataValidator
};