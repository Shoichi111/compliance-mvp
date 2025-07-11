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
      // Authenticate user with Firebase Auth
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
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: 'linear-gradient(135deg, #f1f5f9 0%, #dbeafe 50%, #f1f5f9 100%)',
        boxSizing: 'border-box'
      }}
    >
      <div style={{ width: '100%', maxWidth: '28rem' }}>
        <Card 
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: 'none',
            borderRadius: '1rem',
            overflow: 'hidden',
            background: 'white'
          }}
        >
        <CardHeader 
          className="space-y-4 p-8"
          style={{
            background: 'linear-gradient(135deg, #1e40af 0%, #1d4ed8 100%)',
            color: 'white'
          }}
        >
          <div className="flex items-center justify-center mb-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center text-white">
            Safety Compliance
          </CardTitle>
          <CardDescription className="text-center text-lg" style={{ color: '#dbeafe' }}>
            Construction Management Platform
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="email" style={{ color: '#334155', fontWeight: '500' }}>Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  height: '3rem',
                  padding: '0 1rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.outline = '2px solid rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.outline = 'none';
                }}
              />
            </div>
            <div className="space-y-3">
              <Label htmlFor="password" style={{ color: '#334155', fontWeight: '500' }}>Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  height: '3rem',
                  padding: '0 1rem',
                  border: '1px solid #cbd5e1',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  transition: 'all 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.outline = '2px solid rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#cbd5e1';
                  e.target.style.outline = 'none';
                }}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full text-white font-semibold transition-all duration-200" 
              disabled={isLoading}
              style={{
                height: '3rem',
                backgroundColor: '#1e40af',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                boxShadow: '0 4px 14px 0 rgba(30, 64, 175, 0.4)',
                border: 'none'
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1d4ed8';
                  e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(30, 64, 175, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1e40af';
                  e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(30, 64, 175, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          {/* Demo credentials info */}
          <div 
            className="mt-8 p-6 rounded-xl"
            style={{
              background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 100%)',
              border: '1px solid #e2e8f0'
            }}
          >
            <p 
              className="font-semibold mb-3 flex items-center"
              style={{ color: '#1e293b' }}
            >
              <svg className="w-4 h-4 mr-2" style={{ color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Demo Credentials:
            </p>
            <div className="space-y-2 text-sm">
              <div 
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}
              >
                <span style={{ color: '#64748b' }}>Admin:</span>
                <span className="font-mono" style={{ color: '#1e293b' }}>admin@demo.com</span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}
              >
                <span style={{ color: '#64748b' }}>Advisor:</span>
                <span className="font-mono" style={{ color: '#1e293b' }}>alice@advisor.com</span>
              </div>
              <div 
                className="flex justify-between items-center p-3 rounded-lg"
                style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}
              >
                <span style={{ color: '#64748b' }}>Subcontractor:</span>
                <span className="font-mono" style={{ color: '#1e293b' }}>apex@construction.com</span>
              </div>
              <p className="text-xs mt-3 text-center" style={{ color: '#64748b' }}>
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