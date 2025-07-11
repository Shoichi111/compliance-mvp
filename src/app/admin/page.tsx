"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { PageHeader } from "@/components/ui/PageHeader";
import { MetricCard } from "@/components/ui/MetricCard";
import { StatusCard } from "@/components/ui/StatusCard";
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
    <div className="p-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Admin Dashboard"
        subtitle="Monitor compliance across all projects and manage system users"
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        <StatusCard title="Recent Activity">
          {stats.loading ? (
            <div className="empty-state">
              <div className="empty-icon">
                <BarChart3 className="w-8 h-8" />
              </div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <BarChart3 className="w-8 h-8" />
              </div>
              <p>No recent activity</p>
              <p className="text-sm mt-2">Users and submissions will appear here</p>
            </div>
          )}
        </StatusCard>
      </div>
    </div>
  );
}