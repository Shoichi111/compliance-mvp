"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Handle user login and role-based redirect
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TEMPORARY: Demo login without Firebase for testing
      if (email === "admin@demo.com" && password === "demo123") {
        toast.success("Welcome, Admin!");
        router.push("/admin");
        return;
      }
      
      if (email === "alice@advisor.com" && password === "demo123") {
        toast.success("Welcome, Advisor!");
        router.push("/advisor");
        return;
      }
      
      if (email === "apex@construction.com" && password === "demo123") {
        toast.success("Welcome, Subcontractor!");
        router.push("/subcontractor");
        return;
      }

      // If not demo credentials, try Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Get user data from Firestore to determine role
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userRole = userData.role;

        // Role-based redirect logic
        switch (userRole) {
          case "admin":
            router.push("/admin");
            toast.success("Welcome, Admin!");
            break;
          case "advisor":
            router.push("/advisor");
            toast.success("Welcome, Advisor!");
            break;
          case "subcontractor":
            router.push("/subcontractor");
            toast.success("Welcome, Subcontractor!");
            break;
          default:
            toast.error("Invalid user role. Please contact administrator.");
            await auth.signOut();
        }
      } else {
        toast.error("User data not found. Please contact administrator.");
        await auth.signOut();
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Invalid email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        boxSizing: 'border-box'
      }}
    >
      <div 
        style={{ 
          width: '100%', 
          maxWidth: '440px',
          margin: '0 auto'
        }}
      >
        <Card 
          style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            border: 'none',
            overflow: 'hidden'
          }}
        >
          <CardContent style={{ padding: '48px' }}>
            {/* Logo and Header */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: '#6366f1',
                  borderRadius: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px'
                }}
              >
                <svg 
                  style={{ 
                    width: '32px', 
                    height: '32px', 
                    color: 'white' 
                  }} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
                  />
                </svg>
              </div>
              <h1 
                style={{
                  fontSize: '28px',
                  fontWeight: '700',
                  color: '#1f2937',
                  marginBottom: '8px',
                  lineHeight: '1.2'
                }}
              >
                Safety Compliance
              </h1>
              <p 
                style={{
                  fontSize: '16px',
                  color: '#6b7280',
                  margin: '0'
                }}
              >
                Construction Management Platform
              </p>
            </div>
            {/* Form Section */}
            <form onSubmit={handleLogin} style={{ marginBottom: '32px' }}>
              <div style={{ marginBottom: '24px' }}>
                <label 
                  htmlFor="email"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="user@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '32px' }}>
                <label 
                  htmlFor="password"
                  style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '8px'
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => {
                    e.target.style.outline = 'none';
                    e.target.style.borderColor = '#6366f1';
                    e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '500',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoading ? 0.7 : 1
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) {
                    e.currentTarget.style.backgroundColor = '#6366f1';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <Loader2 style={{ width: '16px', height: '16px', marginRight: '8px', display: 'inline-block' }} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          
            {/* Demo Credentials Section */}
            <div 
              style={{
                paddingTop: '32px',
                borderTop: '1px solid #f3f4f6',
                marginTop: '32px'
              }}
            >
              <h3 
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <svg 
                  style={{ 
                    width: '16px', 
                    height: '16px', 
                    marginRight: '8px',
                    color: '#6366f1'
                  }} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Demo Credentials
              </h3>
              
              <div 
                style={{
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  padding: '20px'
                }}
              >
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Admin:</span>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>admin@demo.com</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Advisor:</span>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>alice@advisor.com</span>
                  </div>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#6b7280' }}>Subcontractor:</span>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' }}>apex@construction.com</span>
                  </div>
                </div>
                
                <p style={{ 
                  fontSize: '12px', 
                  color: '#9ca3af', 
                  textAlign: 'center',
                  margin: '0',
                  paddingTop: '12px',
                  borderTop: '1px solid #e5e7eb'
                }}>
                  All demo passwords: Use the password provided during setup
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}