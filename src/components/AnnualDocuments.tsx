"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUpload from "./FileUpload";
import { Calendar, CheckCircle, FileText, AlertTriangle } from "lucide-react";

// Annual documents from specification (18 required)
const ANNUAL_DOCUMENTS = [
  { name: "Health & Safety Policy Statement", required: true, needsExpiry: false },
  { name: "Violence and Harassment Policy Statement", required: true, needsExpiry: false },
  { name: "Full Violence and Harassment Policy and Procedure", required: true, needsExpiry: false },
  { name: "Hazard Identification and Risk Assessment Procedure", required: true, needsExpiry: false },
  { name: "Incident and Accident Reporting and Investigation Procedure", required: true, needsExpiry: false },
  { name: "Emergency Response Plan", required: true, needsExpiry: false },
  { name: "Five (5) samples of recent Daily Hazard Assessments", required: true, needsExpiry: false },
  { name: "Supervisor Training Records", required: true, needsExpiry: false },
  { name: "Three (3) samples of recent Job Site Inspections", required: true, needsExpiry: false },
  { name: "Valid WSIB Clearance Certificate", required: true, needsExpiry: true },
  { name: "Current Company Health and Safety Manual", required: true, needsExpiry: false },
  { name: "Proof of Liability Insurance", required: true, needsExpiry: true },
  { name: "Signed Acknowledgement of Site Rules", required: true, needsExpiry: false },
  { name: "Training Certificates for Workers", required: true, needsExpiry: false },
  { name: "Fit for Duty Policy", required: true, needsExpiry: false },
  { name: "Disciplinary Policy for Health and Safety Violations", required: true, needsExpiry: false },
  { name: "Minutes from Recent Safety Meeting/JHSC Meeting", required: true, needsExpiry: false },
  { name: "List of All Workers Assigned to the project", required: true, needsExpiry: false }
];

interface AnnualDocumentsProps {
  subcontractorId: string;
  year: number;
  onDocumentsChange?: (documents: any[]) => void;
}

export default function AnnualDocuments({
  subcontractorId,
  year,
  onDocumentsChange
}: AnnualDocumentsProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [expiryDates, setExpiryDates] = useState<{ [key: string]: string }>({});

  // Handle file upload completion
  const handleUploadComplete = (documentType: string, fileData: any) => {
    setUploadedDocuments(prev => {
      const updated = prev.filter(doc => doc.docType !== documentType);
      const documentWithExpiry = {
        ...fileData,
        expiryDate: expiryDates[documentType] || null
      };
      updated.push(documentWithExpiry);
      
      if (onDocumentsChange) {
        onDocumentsChange(updated);
      }
      
      return updated;
    });
  };

  // Handle expiry date change
  const handleExpiryDateChange = (documentType: string, date: string) => {
    setExpiryDates(prev => ({
      ...prev,
      [documentType]: date
    }));

    // Update existing uploaded document if any
    setUploadedDocuments(prev => {
      const updated = prev.map(doc => 
        doc.docType === documentType 
          ? { ...doc, expiryDate: date }
          : doc
      );
      
      if (onDocumentsChange) {
        onDocumentsChange(updated);
      }
      
      return updated;
    });
  };

  // Calculate completion status
  const totalRequired = ANNUAL_DOCUMENTS.length;
  const totalUploaded = uploadedDocuments.length;
  const completionPercentage = totalRequired > 0 ? Math.round((totalUploaded / totalRequired) * 100) : 0;

  // Check if document is uploaded
  const isDocumentUploaded = (documentName: string) => {
    return uploadedDocuments.some(doc => doc.docType === documentName);
  };

  // Get current year context
  const currentYear = new Date().getFullYear();
  const isCurrentYear = year === currentYear;
  const isDue = isCurrentYear && new Date().getMonth() === 0; // January

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Annual Safety Documents - {year}</span>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {totalUploaded}/{totalRequired} Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload all required annual safety documentation (due in January each year)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{completionPercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>
            </div>
            {completionPercentage === 100 && (
              <CheckCircle className="w-6 h-6 text-green-500" />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Due Date Alert */}
      {isDue && completionPercentage < 100 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Action Required:</strong> Annual documents are due in January. 
            Please upload all required documents to maintain compliance.
          </AlertDescription>
        </Alert>
      )}

      {/* Document Categories */}
      <div className="space-y-8">
        {/* Policies and Procedures */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Policies and Procedures (6 documents)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {ANNUAL_DOCUMENTS.slice(0, 6).map((document, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{document.name}</h4>
                  {isDocumentUploaded(document.name) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <FileUpload
                  documentType={document.name}
                  projectId="annual" // Special project ID for annual docs
                  subcontractorId={subcontractorId}
                  month={1} // January
                  year={year}
                  onUploadComplete={(fileData) => handleUploadComplete(document.name, fileData)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Training and Records */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-green-600" />
            Training and Records (6 documents)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {ANNUAL_DOCUMENTS.slice(6, 12).map((document, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{document.name}</h4>
                  <div className="flex items-center space-x-2">
                    {document.needsExpiry && (
                      <Badge variant="outline" className="text-xs">Expiry Required</Badge>
                    )}
                    {isDocumentUploaded(document.name) && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                </div>
                
                {/* Expiry Date Input for documents that need it */}
                {document.needsExpiry && (
                  <div className="space-y-2">
                    <Label htmlFor={`expiry-${index}`} className="text-xs">Expiry Date</Label>
                    <Input
                      id={`expiry-${index}`}
                      type="date"
                      value={expiryDates[document.name] || ""}
                      onChange={(e) => handleExpiryDateChange(document.name, e.target.value)}
                      className="text-sm"
                    />
                  </div>
                )}
                
                <FileUpload
                  documentType={document.name}
                  projectId="annual"
                  subcontractorId={subcontractorId}
                  month={1}
                  year={year}
                  onUploadComplete={(fileData) => handleUploadComplete(document.name, fileData)}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Compliance and Safety */}
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-600" />
            Compliance and Safety (6 documents)
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {ANNUAL_DOCUMENTS.slice(12, 18).map((document, index) => (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{document.name}</h4>
                  {isDocumentUploaded(document.name) && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <FileUpload
                  documentType={document.name}
                  projectId="annual"
                  subcontractorId={subcontractorId}
                  month={1}
                  year={year}
                  onUploadComplete={(fileData) => handleUploadComplete(document.name, fileData)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="pt-6">
          <div className="flex">
            <Calendar className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-medium text-yellow-800 mb-2">Annual Document Guidelines:</h4>
              <ul className="text-yellow-700 space-y-1">
                <li>• All 18 documents must be uploaded by January 31st each year</li>
                <li>• Some documents require expiry dates (WSIB, Insurance)</li>
                <li>• Subcontractors onboarded mid-year submit annual docs next January</li>
                <li>• Annual documents are submitted once per company, not per project</li>
                <li>• Ensure all documents are current and valid for the reporting year</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Section */}
      {completionPercentage === 100 && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
                <div>
                  <h4 className="font-medium text-green-800">All Documents Uploaded</h4>
                  <p className="text-sm text-green-600">
                    Your {year} annual safety documentation is complete
                  </p>
                </div>
              </div>
              <Button className="bg-green-600 hover:bg-green-700">
                Mark as Submitted
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}