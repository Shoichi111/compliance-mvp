"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Download, FileText, AlertCircle, CheckCircle, Calendar } from "lucide-react";

interface Project {
  id: string;
  projectName: string;
  subcontractorIds: string[];
}

interface Submission {
  id: string;
  projectId: string;
  projectName?: string;
  subcontractorId: string;
  subcontractorEmail?: string;
  month: number;
  year: number;
  status: string;
  submittedAt: any;
  completionPercentage: number;
  documents: any[];
}

export default function AdvisorDashboard() {
  const [user] = useAuthState(auth);
  const [projects, setProjects] = useState<Project[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAdvisorData();
    }
  }, [user]);

  const fetchAdvisorData = async () => {
    try {
      // Fetch projects assigned to this advisor
      const projectsQuery = query(
        collection(db, "projects"),
        where("assignedAdvisorId", "==", user?.uid)
      );
      const projectsSnapshot = await getDocs(projectsQuery);
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      // Fetch submissions for assigned projects
      if (projectsData.length > 0) {
        const projectIds = projectsData.map(p => p.id);
        const submissionsSnapshot = await getDocs(collection(db, "submissions"));
        const submissionsData = submissionsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter((submission: any) => projectIds.includes(submission.projectId)) as Submission[];

        // Add project names and subcontractor emails to submissions
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const enrichedSubmissions = submissionsData.map(submission => {
          const project = projectsData.find(p => p.id === submission.projectId);
          const subcontractor = users.find(u => u.id === submission.subcontractorId);
          return {
            ...submission,
            projectName: project?.projectName,
            subcontractorEmail: subcontractor?.email
          };
        });

        setSubmissions(enrichedSubmissions);
      }

      setProjects(projectsData);
    } catch (error) {
      console.error("Error fetching advisor data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string, completionPercentage: number) => {
    if (status === "Submitted") {
      return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Submitted</Badge>;
    } else if (completionPercentage > 0) {
      return <Badge variant="secondary">In Progress ({completionPercentage}%)</Badge>;
    } else {
      return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Not Submitted</Badge>;
    }
  };

  const getMonthName = (month: number) => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return months[month - 1] || month;
  };

  const handleDownloadDocument = (docPath: string, fileName: string) => {
    // TODO: Implement Firebase Storage download
    toast.info("Document download feature will be implemented with Firebase Storage");
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

  return (
    <div className="px-4 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Advisor Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Monitor compliance submissions for your assigned projects
        </p>
      </div>

      {/* Project Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Projects</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.length}</div>
            <p className="text-xs text-muted-foreground">
              Projects under your supervision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissions.length}</div>
            <p className="text-xs text-muted-foreground">
              Safety reports received
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {submissions.filter(s => s.status === "Not Submitted").length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting submission
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects List */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Assigned Projects</CardTitle>
          <CardDescription>Projects you are supervising</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No projects assigned to you yet
            </p>
          ) : (
            <div className="space-y-2">
              {projects.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{project.projectName}</span>
                  <Badge variant="outline">
                    {project.subcontractorIds.length} Subcontractor(s)
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Submissions</CardTitle>
          <CardDescription>
            Safety compliance submissions from your projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <p className="text-center py-8 text-gray-500">
              No submissions found for your projects
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Subcontractor</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((submission) => (
                  <TableRow key={submission.id}>
                    <TableCell className="font-medium">{submission.projectName}</TableCell>
                    <TableCell>{submission.subcontractorEmail}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                        {getMonthName(submission.month)} {submission.year}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(submission.status, submission.completionPercentage)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {submission.documents.map((doc, index) => (
                          <Button
                            key={index}
                            variant="outline"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleDownloadDocument(doc.storagePath, doc.originalFileName)}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            {doc.docType}
                          </Button>
                        ))}
                        {submission.documents.length === 0 && (
                          <span className="text-gray-500 text-sm">No documents</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {submission.submittedAt?.toDate?.()?.toLocaleDateString() || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}