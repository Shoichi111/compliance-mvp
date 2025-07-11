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

  const StatCard = ({ title, value, description, icon: Icon, type, change }: any) => {
    return (
      <div className="metric-card">
        <div className="metric-header">
          <div className={`metric-icon ${type}`}>
            <Icon className="h-6 w-6" />
          </div>
          <span className={`metric-change ${change && change > 0 ? 'positive' : 'negative'}`}>
            {change ? `${change > 0 ? '+' : ''}${change}%` : '+0%'}
          </span>
        </div>
        <p className="metric-label">{title}</p>
        <p className="metric-value">
          {stats.loading ? '--' : value}
        </p>
      </div>
    );
  };

  return (
    <div>
      {/* Perfect Page Header */}
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">
          Monitor compliance across all projects and manage system users
        </p>
      </div>

      {/* Perfect Metrics Grid */}
      <div className="metrics-grid">
        <StatCard
          title="Active Users"
          value={stats.totalUsers}
          icon={Users}
          type="users"
          change={12}
        />
        <StatCard
          title="Active Projects"
          value={stats.totalProjects}
          icon={Building2}
          type="projects"
          change={5}
        />
        <StatCard
          title="Total Submissions"
          value={stats.totalSubmissions}
          icon={FileText}
          type="submissions"
          change={-3}
        />
        <StatCard
          title="Pending Reviews"
          value={stats.pendingSubmissions}
          icon={AlertCircle}
          type="reviews"
          change={8}
        />
      </div>

      {/* Perfect Status Grid */}
      <div className="status-grid">
        <div className="status-card">
          <h3 className="status-card-title">Compliance Status</h3>
          <div className="status-item">
            <span className="status-label">On Track</span>
            <span className="status-value on-track">
              {stats.totalProjects - stats.overdue} Projects
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">At Risk</span>
            <span className="status-value at-risk">
              {stats.overdue} Projects
            </span>
          </div>
          <div className="status-item">
            <span className="status-label">Completion Rate</span>
            <span className="status-value percentage">
              {stats.totalProjects > 0 
                ? Math.round(((stats.totalProjects - stats.overdue) / stats.totalProjects) * 100)
                : 0}%
            </span>
          </div>
        </div>

        <div className="status-card">
          <h3 className="status-card-title">Recent Activity</h3>
          {stats.loading ? (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p>Loading...</p>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <svg width="32" height="32" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p>No recent activity</p>
              <p style={{ fontSize: '14px', marginTop: '8px' }}>Users and submissions will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}