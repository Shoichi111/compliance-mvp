"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Building2, 
  Users, 
  BarChart3, 
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  // Handle admin logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: BarChart3 },
    { name: "Users", href: "/admin/users", icon: Users },
    { name: "Projects", href: "/admin/projects", icon: Building2 },
  ];

  return (
    <div className="flex h-screen page-container">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
        </div>
      )}

      {/* Professional Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ 
          background: 'var(--bg-primary)',
          borderRight: '1px solid var(--gray-200)',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}
      >
        {/* Clean Sidebar Header */}
        <div 
          className="flex items-center justify-between p-6" 
          style={{ borderBottom: '1px solid var(--gray-200)' }}
        >
          <div className="flex items-center space-x-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 
                className="text-lg font-bold"
                style={{ color: 'var(--gray-900)' }}
              >
                Admin Portal
              </h2>
              <p 
                className="text-xs"
                style={{ color: 'var(--gray-600)' }}
              >
                Safety Compliance
              </p>
            </div>
          </div>
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" style={{ color: 'var(--gray-600)' }} />
          </button>
        </div>

        {/* Clean Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = typeof window !== 'undefined' && window.location.pathname === item.href;
            return (
              <a
                key={item.name}
                href={item.href}
                className={`nav-item flex items-center px-4 py-3 text-sm font-medium rounded-lg ${isActive ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            );
          })}
        </nav>

        {/* Clean Sidebar Footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--gray-200)' }}>
          <button
            className="btn btn-secondary w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-0">
        {/* Mobile Header */}
        <div className="lg:hidden header flex items-center px-4 py-3">
          <button
            className="btn btn-secondary p-2"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="content-wrapper">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}