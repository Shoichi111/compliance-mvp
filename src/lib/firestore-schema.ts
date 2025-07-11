// Firestore Database Schema and Utility Functions
// This file defines the data structure and helper functions for Firestore collections

import { Timestamp } from "firebase/firestore";

// User document structure
export interface User {
  uid: string;                          // Firebase Auth UID (document ID)
  email: string;                        // User email address
  role: "admin" | "advisor" | "subcontractor";  // User role
  companyName?: string;                 // Required for subcontractors
  status: "active" | "inactive";       // Account status
  createdAt: Timestamp;                 // Account creation date
}

// Project document structure
export interface Project {
  projectId: string;                    // Auto-generated document ID
  projectName: string;                  // Project display name
  assignedAdvisorId: string;            // UID of assigned advisor
  subcontractorIds: string[];           // Array of assigned subcontractor UIDs
  createdAt: Timestamp;                 // Project creation date
}

// Monthly submission document structure
export interface Submission {
  submissionId: string;                 // Auto-generated document ID
  projectId: string;                    // Reference to project
  subcontractorId: string;              // UID of submitting subcontractor
  month: number;                        // Month (1-12)
  year: number;                         // Year (e.g., 2024)
  status: "Submitted" | "Not Submitted"; // Submission status
  completionPercentage: number;         // 0-100
  submittedAt?: Timestamp;              // When submitted
  hasIncidents: boolean;                // Whether incidents were reported
  
  // Monthly safety metrics (all required)
  metrics: {
    // Incident Metrics
    totalWorkerHours: number;           // Total worker hours
    lostTimeInjuries: number;           // Lost time injuries
    medicalAidInjuries: number;         // Medical aid injuries  
    firstAidInjuries: number;           // First aid injuries
    propertyDamage: number;             // Property damage incidents
    environmentalIncidents: number;     // Environmental incidents
    nearMisses: number;                 // Near miss incidents
    
    // Activity Metrics
    hazardIdentifications: number;      // Hazards identified
    safetyInspections: number;          // Safety inspections conducted
    toolboxTalks: number;               // Toolbox talks held
    workersSiteOriented: number;        // Workers given site orientation
  };
  
  // Document references
  documents: DocumentReference[];
}

// Annual documents collection structure
export interface AnnualDocument {
  docId: string;                        // Auto-generated document ID
  subcontractorId: string;              // UID of subcontractor
  year: number;                         // Year (e.g., 2025)
  status: "Complete" | "Incomplete";    // Completion status
  completionPercentage: number;         // 0-100
  submittedAt?: Timestamp;              // When completed
  documents: DocumentReference[];       // Array of uploaded documents
}

// Document reference structure (used in submissions and annual docs)
export interface DocumentReference {
  docType: string;                      // Type of document
  storagePath: string;                  // Firebase Storage path
  downloadURL: string;                  // Public download URL
  originalFileName: string;             // Original file name
  fileSize: number;                     // File size in bytes
  uploadedAt: Timestamp;                // Upload timestamp
  expiryDate?: string;                  // For documents that expire (WSIB, Insurance)
}

// Collection names (constants for consistency)
export const COLLECTIONS = {
  USERS: "users",
  PROJECTS: "projects", 
  SUBMISSIONS: "submissions",
  ANNUAL_DOCUMENTS: "annualDocuments"
} as const;

// Required monthly document types
export const MONTHLY_DOCUMENT_TYPES = [
  "Daily Hazard Assessments (FLRA/PWHA)",
  "Safety Inspection Reports", 
  "Toolbox Talk Attendance Sheet",
  "Equipment Pre-Use Inspection Forms",
  "Incident Investigation Report" // Conditional - only if incidents > 0
] as const;

// Required annual document types (18 total)
export const ANNUAL_DOCUMENT_TYPES = [
  // Policies and Procedures (6)
  "Health & Safety Policy Statement",
  "Violence and Harassment Policy Statement", 
  "Full Violence and Harassment Policy and Procedure",
  "Hazard Identification and Risk Assessment Procedure",
  "Incident and Accident Reporting and Investigation Procedure",
  "Emergency Response Plan",
  
  // Training and Records (6)
  "Five (5) samples of recent Daily Hazard Assessments",
  "Supervisor Training Records",
  "Three (3) samples of recent Job Site Inspections", 
  "Valid WSIB Clearance Certificate", // needsExpiry: true
  "Current Company Health and Safety Manual",
  "Proof of Liability Insurance", // needsExpiry: true
  
  // Compliance and Safety (6)
  "Signed Acknowledgement of Site Rules",
  "Training Certificates for Workers",
  "Fit for Duty Policy", 
  "Disciplinary Policy for Health and Safety Violations",
  "Minutes from Recent Safety Meeting/JHSC Meeting",
  "List of All Workers Assigned to the project"
] as const;

// Documents that require expiry dates
export const DOCUMENTS_WITH_EXPIRY = [
  "Valid WSIB Clearance Certificate",
  "Proof of Liability Insurance"
] as const;

// Business rule validations
export class ComplianceRules {
  
  // Check if monthly submission is allowed for given month/year
  static canSubmitForMonth(month: number, year: number): boolean {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Can submit for current month and previous month only
    if (year === currentYear) {
      return month === currentMonth || month === currentMonth - 1;
    } else if (year === currentYear - 1 && currentMonth === 1) {
      return month === 12; // Can submit December of previous year in January
    }
    
    return false;
  }
  
  // Check if annual documents are due
  static areAnnualDocumentsDue(): boolean {
    const now = new Date();
    return now.getMonth() === 0; // January (0-indexed)
  }
  
  // Calculate if submission is overdue
  static isSubmissionOverdue(month: number, year: number): boolean {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    
    // Overdue if it's more than 7 days past the month end
    const submissionDueDate = new Date(year, month, 7); // 7th of next month
    return now > submissionDueDate;
  }
  
  // Calculate at-risk status (overdue > 7 days)
  static isAtRisk(month: number, year: number): boolean {
    const now = new Date();
    const overdueDate = new Date(year, month, 7); // 7th of next month
    const atRiskDate = new Date(overdueDate.getTime() + (7 * 24 * 60 * 60 * 1000)); // +7 days
    
    return now > atRiskDate;
  }
  
  // Calculate completion percentage
  static calculateCompletionPercentage(
    metricsProvided: number, 
    documentsProvided: number,
    totalDocumentsRequired: number
  ): number {
    const totalMetrics = 11; // 11 required metric fields
    const metricsPercentage = (metricsProvided / totalMetrics) * 50; // 50% weight
    const documentsPercentage = (documentsProvided / totalDocumentsRequired) * 50; // 50% weight
    
    return Math.round(metricsPercentage + documentsPercentage);
  }
}

// Firestore Security Rules Template
export const FIRESTORE_SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Users collection - users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Admins can read all users
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Projects collection - role-based access
    match /projects/{projectId} {
      // Admins can read/write all projects
      allow read, write: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Advisors can read projects they're assigned to
      allow read: if request.auth != null && 
        resource.data.assignedAdvisorId == request.auth.uid;
      
      // Subcontractors can read projects they're assigned to
      allow read: if request.auth != null && 
        request.auth.uid in resource.data.subcontractorIds;
    }
    
    // Submissions collection - subcontractors can only access their own
    match /submissions/{submissionId} {
      // Subcontractors can read/write their own submissions
      allow read, write: if request.auth != null && 
        resource.data.subcontractorId == request.auth.uid;
      
      // Advisors can read submissions for their projects
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/projects/$(resource.data.projectId)) &&
        get(/databases/$(database)/documents/projects/$(resource.data.projectId)).data.assignedAdvisorId == request.auth.uid;
      
      // Admins can read all submissions
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Annual documents collection - subcontractors can only access their own
    match /annualDocuments/{docId} {
      allow read, write: if request.auth != null && 
        resource.data.subcontractorId == request.auth.uid;
      
      // Admins can read all annual documents
      allow read: if request.auth != null && 
        exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}`;

// Firebase Storage Security Rules Template
export const STORAGE_SECURITY_RULES = `
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Submissions folder - organized by project/subcontractor/month_year
    match /submissions/{projectId}/{subcontractorId}/{monthYear}/{fileName} {
      // Subcontractors can upload to their own folders
      allow write: if request.auth != null && request.auth.uid == subcontractorId;
      
      // Subcontractors and advisors can read from assigned project folders
      allow read: if request.auth != null && (
        request.auth.uid == subcontractorId ||
        // Add advisor check here - requires Firestore lookup
        true // Simplified for MVP
      );
      
      // File size and type validation
      allow write: if request.resource.size < 10 * 1024 * 1024 && // 10MB max
        request.resource.contentType.matches('image/.*|application/pdf|application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    
    // Annual documents folder
    match /annual/{subcontractorId}/{year}/{fileName} {
      allow read, write: if request.auth != null && request.auth.uid == subcontractorId;
      
      // File validation
      allow write: if request.resource.size < 10 * 1024 * 1024 &&
        request.resource.contentType.matches('image/.*|application/pdf|application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
  }
}`;

export default {
  COLLECTIONS,
  MONTHLY_DOCUMENT_TYPES,
  ANNUAL_DOCUMENT_TYPES,
  DOCUMENTS_WITH_EXPIRY,
  ComplianceRules,
  FIRESTORE_SECURITY_RULES,
  STORAGE_SECURITY_RULES
};