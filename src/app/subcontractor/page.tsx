"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { 
  FileText, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Plus,
  Upload
} from "lucide-react";

interface Project {
  id: string;
  projectName: string;
  assignedAdvisorId: string;
}

interface Submission {
  id: string;
  projectId: string;
  projectName?: string;
  month: number;
  year: number;
  status: string;
  completionPercentage: number;
  submittedAt: any;
}

interface AnnualDocument {
  id: string;
  year: number;
  status: string;
  completionPercentage: number;
  submittedAt: any;
}

export default function SubcontractorDashboard() {
  const [user] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [annualDocs, setAnnualDocs] = useState<AnnualDocument[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubcontractorData();
    }
  }, [user]);

  const fetchSubcontractorData = async () => {
    try {
      // Fetch projects where this subcontractor is assigned
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      const allProjects = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
      
      const assignedProjects = allProjects.filter(project => 
        project.subcontractorIds?.includes(user?.uid || "")
      );

      // Fetch submissions for this subcontractor
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("subcontractorId", "==", user?.uid)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submissionsData = submissionsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Submission[];

      // Add project names to submissions
      const enrichedSubmissions = submissionsData.map(submission => {
        const project = assignedProjects.find(p => p.id === submission.projectId);
        return {
          ...submission,
          projectName: project?.projectName
        };
      });

      // Fetch annual documents for this subcontractor
      const annualDocsQuery = query(
        collection(db, "annualDocuments"),
        where("subcontractorId", "==", user?.uid)
      );
      const annualDocsSnapshot = await getDocs(annualDocsQuery);
      const annualDocsData = annualDocsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AnnualDocument[];

      setProjects(assignedProjects);
      setSubmissions(enrichedSubmissions);
      setAnnualDocs(annualDocsData);
    } catch (error) {
      console.error("Error fetching subcontractor data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, completionPercentage: number) => {
    if (status === "Submitted" || status === "Complete") {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Complete</Badge>;
    } else if (completionPercentage > 0) {
      return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Not Started</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month - 1] || month;
  };

  const getCurrentMonthSubmission = () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    return submissions.find(s => s.month === currentMonth && s.year === currentYear);
  };

  const getCurrentYearAnnualDoc = () => {
    const currentYear = new Date().getFullYear();
    return annualDocs.find(doc => doc.year === currentYear);
  };

  if (loading) {
    return (
      <div className="px-4 py-6">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  const currentMonthSubmission = getCurrentMonthSubmission();
  const currentYearAnnualDoc = getCurrentYearAnnualDoc();

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Safety Compliance Portal</h1>
        <p className="text-gray-600 mt-2">
          Submit monthly reports and annual safety documentation
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">Active assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {getStatusBadge(
                currentMonthSubmission?.status || "Not Submitted",
                currentMonthSubmission?.completionPercentage || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">Monthly report status</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual Documents</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">
              {getStatusBadge(
                currentYearAnnualDoc?.status || "Incomplete",
                currentYearAnnualDoc?.completionPercentage || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">{new Date().getFullYear()} submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.length > 0 
                ? Math.round((submissions.filter(s => s.status === "Submitted").length / submissions.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">On-time submissions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monthly">Monthly Reports</TabsTrigger>
          <TabsTrigger value="annual">Annual Documents</TabsTrigger>
          <TabsTrigger value="history">Submission History</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Safety Reports</CardTitle>
              <CardDescription>
                Submit monthly safety metrics and documentation for each assigned project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {projects.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No projects assigned to you yet</p>
                  <p className="text-sm text-gray-400">Contact your administrator to get assigned to projects</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {projects.map((project) => {
                    const projectSubmission = currentMonthSubmission?.projectId === project.id 
                      ? currentMonthSubmission 
                      : null;
                    
                    return (
                      <div key={project.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">{project.projectName}</h3>
                            <p className="text-sm text-gray-500">
                              Current Month: {getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            {projectSubmission ? (
                              <>
                                {getStatusBadge(projectSubmission.status, projectSubmission.completionPercentage)}
                                {projectSubmission.completionPercentage > 0 && projectSubmission.completionPercentage < 100 && (
                                  <Progress value={projectSubmission.completionPercentage} className="w-24" />
                                )}
                              </>
                            ) : (
                              <>
                                <Badge variant="outline">Not Started</Badge>
                                <Button size="sm">
                                  <Plus className="w-4 h-4 mr-1" />
                                  Start Report
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="annual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Annual Safety Documentation</CardTitle>
              <CardDescription>
                Upload required annual safety documents (due in January each year)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium">{new Date().getFullYear()} Annual Documents</h3>
                    <p className="text-sm text-gray-500">18 required documents</p>
                  </div>
                  {currentYearAnnualDoc ? (
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(currentYearAnnualDoc.status, currentYearAnnualDoc.completionPercentage)}
                      {currentYearAnnualDoc.completionPercentage > 0 && (
                        <Progress value={currentYearAnnualDoc.completionPercentage} className="w-32" />
                      )}
                    </div>
                  ) : (
                    <Button>
                      <Upload className="w-4 h-4 mr-1" />
                      Upload Documents
                    </Button>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-2">Required Documents Include:</h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Health & Safety Policy Statement</li>
                    <li>• Violence and Harassment Policy</li>
                    <li>• Emergency Response Plan</li>
                    <li>• Valid WSIB Clearance Certificate</li>
                    <li>• Proof of Liability Insurance</li>
                    <li>• Training Certificates for Workers</li>
                    <li>• And 12 additional safety documents...</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submission History</CardTitle>
              <CardDescription>
                View your past safety report submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submissions.length === 0 ? (
                <p className="text-center py-8 text-gray-500">
                  No submissions found
                </p>
              ) : (
                <div className="space-y-3">
                  {submissions
                    .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month))
                    .map((submission) => (
                      <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{submission.projectName}</p>
                          <p className="text-sm text-gray-500">
                            {getMonthName(submission.month)} {submission.year}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          {getStatusBadge(submission.status, submission.completionPercentage)}
                          <span className="text-sm text-gray-500">
                            {submission.submittedAt?.toDate?.()?.toLocaleDateString() || "-"}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}