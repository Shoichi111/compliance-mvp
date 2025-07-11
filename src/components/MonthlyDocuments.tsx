"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import FileUpload from "./FileUpload";
import { AlertCircle, CheckCircle, FileText } from "lucide-react";

// Required monthly documents from specification
const MONTHLY_DOCUMENTS = [
  {
    name: "Daily Hazard Assessments (FLRA/PWHA)",
    required: true,
    description: "Field Level Risk Assessments and Pre-Work Hazard Assessments"
  },
  {
    name: "Safety Inspection Reports",
    required: true,
    description: "Regular site safety inspection documentation"
  },
  {
    name: "Toolbox Talk Attendance Sheet",
    required: true,
    description: "Record of safety meetings and attendees"
  },
  {
    name: "Equipment Pre-Use Inspection Forms",
    required: true,
    description: "Pre-use equipment safety checks"
  },
  {
    name: "Incident Investigation Report",
    required: false, // CONDITIONAL: only if incidents > 0
    description: "Required only if incidents were reported this month",
    conditional: true
  }
];

interface MonthlyDocumentsProps {
  projectId: string;
  subcontractorId: string;
  month: number;
  year: number;
  hasIncidents: boolean;
  onDocumentsChange?: (documents: any[]) => void;
}

export default function MonthlyDocuments({
  projectId,
  subcontractorId,
  month,
  year,
  hasIncidents,
  onDocumentsChange
}: MonthlyDocumentsProps) {
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);

  // Filter documents based on whether incidents occurred
  const requiredDocuments = MONTHLY_DOCUMENTS.filter(doc => {
    if (doc.conditional) {
      return hasIncidents; // Only show incident report if incidents occurred
    }
    return true;
  });

  // Handle file upload completion
  const handleUploadComplete = (documentType: string, fileData: any) => {
    setUploadedDocuments(prev => {
      const updated = prev.filter(doc => doc.docType !== documentType);
      updated.push(fileData);
      
      if (onDocumentsChange) {
        onDocumentsChange(updated);
      }
      
      return updated;
    });
  };

  // Calculate completion status
  const totalRequired = requiredDocuments.length;
  const totalUploaded = uploadedDocuments.length;
  const completionPercentage = totalRequired > 0 ? Math.round((totalUploaded / totalRequired) * 100) : 0;

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month - 1] || month;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Monthly Documents - {getMonthName(month)} {year}</span>
            <Badge variant={completionPercentage === 100 ? "default" : "secondary"}>
              {totalUploaded}/{totalRequired} Complete
            </Badge>
          </CardTitle>
          <CardDescription>
            Upload the required monthly safety documentation for this reporting period
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

      {/* Incident Report Alert */}
      {hasIncidents && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            <strong>Incident Investigation Required:</strong> You reported incidents this month, 
            so an Incident Investigation Report is required in addition to the standard documents.
          </AlertDescription>
        </Alert>
      )}

      {/* Document Upload Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {requiredDocuments.map((document, index) => {
          const isUploaded = uploadedDocuments.some(doc => doc.docType === document.name);
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">{document.name}</h3>
                {document.conditional && (
                  <Badge variant="outline" className="text-xs">
                    Conditional
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{document.description}</p>
              
              <FileUpload
                documentType={document.name}
                projectId={projectId}
                subcontractorId={subcontractorId}
                month={month}
                year={year}
                onUploadComplete={(fileData) => handleUploadComplete(document.name, fileData)}
              />
            </div>
          );
        })}
      </div>

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <h4 className="font-medium text-blue-800 mb-2">Document Upload Guidelines:</h4>
              <ul className="text-blue-700 space-y-1">
                <li>• All documents must be uploaded before submitting your monthly report</li>
                <li>• Accepted formats: PDF, PNG, JPEG, DOCX (max 10MB each)</li>
                <li>• Ensure documents are legible and complete</li>
                <li>• Incident reports are only required if you reported incidents this month</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}