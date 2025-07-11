"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusCard } from "@/components/ui/StatusCard";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
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

  const metrics = [
    {
      label: 'Active Users',
      value: stats.loading ? '--' : stats.totalUsers,
      icon: <Users className="w-6 h-6" />,
      trend: { value: '+12%', isPositive: true },
      iconColor: 'primary' as const
    },
    {
      label: 'Active Projects',
      value: stats.loading ? '--' : stats.totalProjects,
      icon: <Building2 className="w-6 h-6" />,
      trend: { value: '+5%', isPositive: true },
      iconColor: 'success' as const
    },
    {
      label: 'Total Submissions',
      value: stats.loading ? '--' : stats.totalSubmissions,
      icon: <FileText className="w-6 h-6" />,
      trend: { value: '-3%', isPositive: false },
      iconColor: 'warning' as const
    },
    {
      label: 'Pending Reviews',
      value: stats.loading ? '--' : stats.pendingSubmissions,
      icon: <AlertCircle className="w-6 h-6" />,
      trend: { value: '+8%', isPositive: true },
      iconColor: 'error' as const
    }
  ];

  return (
    <>
      <PageHeader 
        title="Admin Dashboard"
        subtitle="Monitor compliance across all projects and manage system users"
      />

      <div className="grid gap-6">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatusCard title="Compliance Status">
            <StatusCard.Item
              label="On Track"
              value={`${stats.totalProjects - stats.overdue} Projects`}
              variant="success"
              icon={<CheckCircle className="w-3 h-3" />}
            />
            <StatusCard.Item
              label="At Risk"
              value={`${stats.overdue} Projects`}
              variant="warning"
              icon={<AlertCircle className="w-3 h-3" />}
            />
            <StatusCard.Item
              label="Completion Rate"
              value={`${stats.totalProjects > 0 
                ? Math.round(((stats.totalProjects - stats.overdue) / stats.totalProjects) * 100)
                : 0}%`}
              variant="info"
              icon={<TrendingUp className="w-3 h-3" />}
            />
          </StatusCard>

          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {stats.loading ? (
              <LoadingSpinner />
            ) : (
              <EmptyState
                icon={<BarChart3 className="w-8 h-8 text-gray-400" />}
                title="No recent activity"
                description="Users and submissions will appear here"
              />
            )}
          </Card>
        </div>
      </div>
    </>
  );
}