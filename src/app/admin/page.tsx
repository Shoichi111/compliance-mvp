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

  const StatCard = ({ title, value, description, icon: Icon }: any) => {
    return (
      <div className="metric-card">
        <div className="metric-icon">
          <Icon className="h-5 w-5" />
        </div>
        <div className="metric-content">
          <p className="metric-label">{title}</p>
          <p className="metric-value">
            {stats.loading ? (
              <span style={{ color: 'var(--gray-400)' }}>--</span>
            ) : (
              value
            )}
          </p>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--gray-500)', margin: '4px 0 0 0' }}>
            {description}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div>
      {/* Professional Page Header */}
      <div className="page-header">
        <div className="flex items-center space-x-4">
          <div className="metric-icon">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">
              Monitor compliance across all projects and manage system users
            </p>
          </div>
        </div>
      </div>

      {/* Professional Metrics Grid */}
      <div className="metrics-grid">
        <StatCard
          title="Active Users"
          value={stats.totalUsers}
          description="Total registered users"
          icon={Users}
        />
        <StatCard
          title="Active Projects"
          value={stats.totalProjects}
          description="Projects in progress"
          icon={Building2}
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          description="Safety reports submitted"
          icon={FileText}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingSubmissions}
          description="Awaiting submission"
          icon={AlertCircle}
        />
      </div>

      {/* Professional Status Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-6)' }}>
        <div className="card">
          <h3 className="card-title">Compliance Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--gray-700)' }}>
                On Track
              </span>
              <span className="badge badge-success">
                <CheckCircle style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                {stats.totalProjects - stats.overdue}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--gray-700)' }}>
                At Risk
              </span>
              <span className="badge badge-error">
                <AlertCircle style={{ width: '12px', height: '12px', marginRight: '4px' }} />
                {stats.overdue}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '500', color: 'var(--gray-700)' }}>
                Completion Rate
              </span>
              <span style={{ fontSize: 'var(--text-sm)', fontWeight: '600', color: 'var(--gray-900)' }}>
                {stats.totalProjects > 0 
                  ? Math.round(((stats.totalProjects - stats.overdue) / stats.totalProjects) * 100)
                  : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Recent Activity</h3>
          {stats.loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div style={{ height: '16px', background: 'var(--gray-200)', borderRadius: '4px' }}></div>
              <div style={{ height: '16px', background: 'var(--gray-200)', borderRadius: '4px', width: '75%' }}></div>
              <div style={{ height: '16px', background: 'var(--gray-200)', borderRadius: '4px', width: '50%' }}></div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-600)' }}>
                No recent activity
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--gray-500)' }}>
                Users and submissions will appear here
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}