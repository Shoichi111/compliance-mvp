"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

export default function SetupAdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Create the initial admin user
  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Add user document to Firestore with admin role
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: email,
        role: "admin",
        status: "active",
        createdAt: new Date(),
      });

      toast.success("Admin account created successfully!");
      
      // Auto-login and redirect to admin dashboard
      setTimeout(() => {
        router.push("/admin");
      }, 1500);

    } catch (error: any) {
      console.error("Admin creation error:", error);
      
      // Handle specific Firebase errors
      if (error.code === "auth/email-already-in-use") {
        toast.error("An account with this email already exists.");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters.");
      } else {
        toast.error("Failed to create admin account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-red-600">
            Admin Setup (One-Time)
          </CardTitle>
          <CardDescription className="text-center">
            Create the initial administrator account for the compliance platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Important:</strong> This route should be deleted before deployment to production. 
              Only use this to create the initial admin account.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button 
              onClick={() => {
                setEmail("admin@demo.com");
                setPassword("demo123");
                handleCreateAdmin({ preventDefault: () => {} } as React.FormEvent);
              }}
              className="w-full bg-green-600 hover:bg-green-700" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Demo Users...
                </>
              ) : (
                "🚀 Create ALL Demo Users (Quick Setup)"
              )}
            </Button>
            
            <div className="text-center text-sm text-gray-600">
              This will create: admin@demo.com, alice@advisor.com, apex@construction.com
              <br />
              All with password: <strong>demo123</strong>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Security Notice:</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• This page creates the initial admin account</li>
              <li>• Delete this route before production deployment</li>
              <li>• Use a strong, unique password</li>
              <li>• Additional admins can be created from the admin dashboard</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}