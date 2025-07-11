"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  Users, 
  FileText, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  BarChart3
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalSubmissions: 0,
    pendingSubmissions: 0,
    overdue: 0,
    loading: true
  });

  // Fetch dashboard statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const usersSnapshot = await getDocs(collection(db, "users"));
        const totalUsers = usersSnapshot.size;

        // Get total projects count
        const projectsSnapshot = await getDocs(collection(db, "projects"));
        const totalProjects = projectsSnapshot.size;

        // Get submissions statistics
        const submissionsSnapshot = await getDocs(collection(db, "submissions"));
        const totalSubmissions = submissionsSnapshot.size;

        // Count pending submissions
        const pendingQuery = query(
          collection(db, "submissions"), 
          where("status", "==", "Not Submitted")
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pendingSubmissions = pendingSnapshot.size;

        // For demo: calculate overdue (submissions older than 30 days)
        const overdue = Math.floor(Math.random() * 5); // Mock data for demo

        setStats({
          totalUsers,
          totalProjects,
          totalSubmissions,
          pendingSubmissions,
          overdue,
          loading: false
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats(prev => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, description, icon: Icon, variant = "default", color = "blue" }: any) => {
    const getColorStyles = (color: string) => {
      switch (color) {
        case 'blue':
          return { bg: '#dbeafe', iconColor: '#2563eb' };
        case 'green':
          return { bg: '#dcfce7', iconColor: '#16a34a' };
        case 'orange':
          return { bg: '#fed7aa', iconColor: '#ea580c' };
        case 'red':
          return { bg: '#fecaca', iconColor: '#dc2626' };
        default:
          return { bg: '#f1f5f9', iconColor: '#64748b' };
      }
    };
    
    const colorStyles = getColorStyles(color);
    
    return (
      <Card 
        className="transition-all duration-200 hover:shadow-xl hover:scale-105"
        style={{
          backgroundColor: 'white',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          border: '1px solid #e2e8f0',
          padding: '1.5rem'
        }}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-semibold" style={{ color: '#64748b' }}>{title}</CardTitle>
          <div 
            className="p-2 rounded-lg"
            style={{ backgroundColor: colorStyles.bg }}
          >
            <Icon className="h-5 w-5" style={{ color: colorStyles.iconColor }} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold" style={{ color: '#1e293b' }}>
            {stats.loading ? <Skeleton className="h-8 w-16" /> : value}
          </div>
          <p className="text-xs" style={{ color: '#64748b' }}>{description}</p>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div 
        className="p-6 rounded-lg shadow-lg mb-6"
        style={{
          background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
          color: 'white'
        }}
      >
        <div className="flex items-center space-x-4">
          <div 
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            <BarChart3 className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
            <p className="mt-1" style={{ color: '#dbeafe' }}>
              Monitor compliance across all projects and manage system users
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList 
          className="shadow-sm"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '0.5rem',
            padding: '0.25rem'
          }}
        >
          <TabsTrigger 
            value="overview"
            style={{
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="analytics"
            style={{
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Analytics
          </TabsTrigger>
          <TabsTrigger 
            value="reports"
            style={{
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* KPI Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Active Users"
              value={stats.totalUsers}
              description="Total registered users"
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Active Projects"
              value={stats.totalProjects}
              description="Projects in progress"
              icon={Building2}
              color="green"
            />
            <StatCard
              title="Total Submissions"
              value={stats.totalSubmissions}
              description="Safety reports submitted"
              icon={FileText}
              color="orange"
            />
            <StatCard
              title="Pending Reviews"
              value={stats.pendingSubmissions}
              description="Awaiting submission"
              icon={AlertCircle}
              color="red"
            />
          </div>

          {/* Status Overview */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Current month compliance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">On Track</span>
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    {stats.totalProjects - stats.overdue}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">At Risk</span>
                  <Badge variant="destructive">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {stats.overdue}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm font-medium">
                    {stats.totalProjects > 0 
                      ? Math.round(((stats.totalProjects - stats.overdue) / stats.totalProjects) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activity</CardDescription>
              </CardHeader>
              <CardContent>
                {stats.loading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <div className="space-y-3 text-sm">
                    <p className="text-gray-600">No recent activity</p>
                    <p className="text-gray-500">Users and submissions will appear here</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Detailed compliance analytics and trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Analytics charts will be implemented here</p>
                  <p className="text-sm">Chart library integration coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>Generate and download compliance reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Report generation system</p>
                  <p className="text-sm">PDF and Excel exports coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}