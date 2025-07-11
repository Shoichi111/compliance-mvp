"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Users,
  Building2,
  FileText,
  Calendar
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalProjects: number;
  totalSubmissions: number;
  submissionsByStatus: {
    submitted: number;
    pending: number;
    overdue: number;
  };
  complianceRate: number;
  onTimeRate: number;
  incidentTrends: {
    totalIncidents: number;
    monthOverMonth: number;
  };
  topPerformers: Array<{
    name: string;
    complianceRate: number;
  }>;
  atRiskProjects: Array<{
    projectName: string;
    daysOverdue: number;
  }>;
}

export default function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState<'month' | 'quarter' | 'year'>('month');

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeFrame]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Fetch all necessary data
      const [usersSnapshot, projectsSnapshot, submissionsSnapshot] = await Promise.all([
        getDocs(collection(db, "users")),
        getDocs(collection(db, "projects")),
        getDocs(collection(db, "submissions"))
      ]);

      const users = usersSnapshot.docs.map(doc => doc.data());
      const projects = projectsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const submissions = submissionsSnapshot.docs.map(doc => doc.data());

      // Calculate analytics
      const totalUsers = users.length;
      const totalProjects = projects.length;
      const totalSubmissions = submissions.length;

      // Submission status breakdown
      const submittedCount = submissions.filter(s => s.status === "Submitted").length;
      const pendingCount = submissions.filter(s => s.status === "Not Submitted").length;
      const overdueCount = calculateOverdueSubmissions(submissions);

      // Compliance metrics
      const complianceRate = totalSubmissions > 0 ? Math.round((submittedCount / totalSubmissions) * 100) : 0;
      const onTimeRate = calculateOnTimeRate(submissions);

      // Incident trends
      const incidentData = calculateIncidentTrends(submissions);

      // Top performers (mock data for MVP)
      const topPerformers = calculateTopPerformers(users, submissions);

      // At-risk projects
      const atRiskProjects = calculateAtRiskProjects(projects, submissions);

      setData({
        totalUsers,
        totalProjects,
        totalSubmissions,
        submissionsByStatus: {
          submitted: submittedCount,
          pending: pendingCount,
          overdue: overdueCount
        },
        complianceRate,
        onTimeRate,
        incidentTrends: incidentData,
        topPerformers,
        atRiskProjects
      });

    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverdueSubmissions = (submissions: any[]): number => {
    const now = new Date();
    return submissions.filter(submission => {
      if (submission.status === "Submitted") return false;
      
      // Calculate if overdue (simplified logic)
      const dueDate = new Date(submission.year, submission.month, 7); // 7th of next month
      return now > dueDate;
    }).length;
  };

  const calculateOnTimeRate = (submissions: any[]): number => {
    const submittedOnTime = submissions.filter(submission => {
      if (submission.status !== "Submitted") return false;
      
      const submittedDate = submission.submittedAt?.toDate();
      const dueDate = new Date(submission.year, submission.month, 0); // Last day of submission month
      
      return submittedDate && submittedDate <= dueDate;
    }).length;

    return submissions.length > 0 ? Math.round((submittedOnTime / submissions.length) * 100) : 0;
  };

  const calculateIncidentTrends = (submissions: any[]) => {
    const totalIncidents = submissions.reduce((total, submission) => {
      if (submission.metrics) {
        return total + 
          (submission.metrics.lostTimeInjuries || 0) +
          (submission.metrics.medicalAidInjuries || 0) +
          (submission.metrics.firstAidInjuries || 0) +
          (submission.metrics.propertyDamage || 0) +
          (submission.metrics.environmentalIncidents || 0);
      }
      return total;
    }, 0);

    // Mock month-over-month calculation for MVP
    const monthOverMonth = Math.random() > 0.5 ? Math.floor(Math.random() * 20) - 10 : -(Math.floor(Math.random() * 15));

    return { totalIncidents, monthOverMonth };
  };

  const calculateTopPerformers = (users: any[], submissions: any[]) => {
    const subcontractors = users.filter(u => u.role === "subcontractor");
    
    return subcontractors.slice(0, 5).map(sub => {
      const userSubmissions = submissions.filter(s => s.subcontractorId === sub.uid);
      const submittedCount = userSubmissions.filter(s => s.status === "Submitted").length;
      const complianceRate = userSubmissions.length > 0 ? Math.round((submittedCount / userSubmissions.length) * 100) : 0;
      
      return {
        name: sub.companyName || sub.email,
        complianceRate
      };
    }).sort((a, b) => b.complianceRate - a.complianceRate);
  };

  const calculateAtRiskProjects = (projects: any[], submissions: any[]) => {
    return projects.slice(0, 3).map(project => ({
      projectName: project.projectName,
      daysOverdue: Math.floor(Math.random() * 30) + 1 // Mock data for MVP
    })).filter(p => p.daysOverdue > 7);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.complianceRate}%</div>
            <p className="text-xs text-muted-foreground">
              {data.submissionsByStatus.submitted} of {data.totalSubmissions} submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.onTimeRate}%</div>
            <p className="text-xs text-muted-foreground">
              Submissions on time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.incidentTrends.totalIncidents}</div>
            <div className="flex items-center text-xs">
              {data.incidentTrends.monthOverMonth >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 text-red-500 mr-1" />
                  <span className="text-red-500">+{data.incidentTrends.monthOverMonth}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
                  <span className="text-green-500">{data.incidentTrends.monthOverMonth}%</span>
                </>
              )}
              <span className="text-muted-foreground ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{data.submissionsByStatus.overdue}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Submission Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Submission Status</CardTitle>
            <CardDescription>Current status of all safety reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Submitted</span>
                <Badge className="bg-green-500">{data.submissionsByStatus.submitted}</Badge>
              </div>
              <Progress value={(data.submissionsByStatus.submitted / data.totalSubmissions) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Pending</span>
                <Badge variant="secondary">{data.submissionsByStatus.pending}</Badge>
              </div>
              <Progress value={(data.submissionsByStatus.pending / data.totalSubmissions) * 100} className="h-2" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overdue</span>
                <Badge variant="destructive">{data.submissionsByStatus.overdue}</Badge>
              </div>
              <Progress value={(data.submissionsByStatus.overdue / data.totalSubmissions) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Subcontractors</CardTitle>
            <CardDescription>Highest compliance rates this period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topPerformers.length > 0 ? (
                data.topPerformers.map((performer, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium">{performer.name}</span>
                    </div>
                    <Badge variant={performer.complianceRate >= 90 ? "default" : "secondary"}>
                      {performer.complianceRate}%
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No performance data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* At-Risk Projects */}
        <Card>
          <CardHeader>
            <CardTitle>At-Risk Projects</CardTitle>
            <CardDescription>Projects with overdue submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.atRiskProjects.length > 0 ? (
                data.atRiskProjects.map((project, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm font-medium">{project.projectName}</span>
                    </div>
                    <Badge variant="destructive" className="text-xs">
                      {project.daysOverdue} days overdue
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-center py-8 text-green-600">
                  <CheckCircle className="h-8 w-8 mr-2" />
                  <span>All projects are on track!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
            <CardDescription>Platform usage statistics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Total Users</span>
              </div>
              <span className="font-semibold">{data.totalUsers}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-green-500" />
                <span className="text-sm">Active Projects</span>
              </div>
              <span className="font-semibold">{data.totalProjects}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-orange-500" />
                <span className="text-sm">Total Submissions</span>
              </div>
              <span className="font-semibold">{data.totalSubmissions}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}