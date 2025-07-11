"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2, Plus, User } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  companyName?: string;
  status: string;
  createdAt: any;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form state for creating new users
  const [newUser, setNewUser] = useState({
    email: "",
    password: "",
    role: "",
    companyName: ""
  });

  // Fetch all users from Firestore
  const fetchUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];
      
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Create new user (Advisor or Subcontractor)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUser.email, 
        newUser.password
      );
      const user = userCredential.user;

      // Create user document in Firestore
      const userData = {
        uid: user.uid,
        email: newUser.email,
        role: newUser.role,
        status: "active",
        createdAt: new Date(),
        ...(newUser.role === "subcontractor" && { companyName: newUser.companyName })
      };

      await setDoc(doc(db, "users", user.uid), userData);

      toast.success(`${newUser.role} created successfully!`);
      
      // Reset form
      setNewUser({
        email: "",
        password: "",
        role: "",
        companyName: ""
      });

      // Refresh users list
      fetchUsers();

    } catch (error: any) {
      console.error("Error creating user:", error);
      
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use");
      } else if (error.code === "auth/weak-password") {
        toast.error("Password should be at least 6 characters");
      } else {
        toast.error("Failed to create user");
      }
    } finally {
      setCreating(false);
    }
  };

  // Get role-specific badge variant
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Admin</Badge>;
      case "advisor":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Advisor</Badge>;
      case "subcontractor":
        return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Subcontractor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
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
            <User className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">User Management</h1>
            <p className="mt-1" style={{ color: '#dbeafe' }}>
              Create and manage advisors and subcontractors
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
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
            value="users"
            style={{
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            All Users
          </TabsTrigger>
          <TabsTrigger 
            value="create"
            style={{
              borderRadius: '0.375rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Create User
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card 
            style={{
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '0.75rem'
            }}
          >
            <CardHeader 
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '1.5rem'
              }}
            >
              <CardTitle 
                className="flex items-center"
                style={{ color: '#1e293b', fontSize: '1.25rem' }}
              >
                <User className="h-5 w-5 mr-2" style={{ color: '#2563eb' }} />
                Registered Users
              </CardTitle>
              <CardDescription style={{ color: '#64748b' }}>
                All users registered in the compliance platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
                  <p className="text-slate-500">Loading users...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        <TableHead className="font-semibold text-slate-700 py-4">Email</TableHead>
                        <TableHead className="font-semibold text-slate-700">Role</TableHead>
                        <TableHead className="font-semibold text-slate-700">Company</TableHead>
                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                        <TableHead className="font-semibold text-slate-700">Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12">
                            <div className="flex flex-col items-center">
                              <User className="h-12 w-12 text-slate-300 mb-4" />
                              <p className="text-slate-500 font-medium">No users found</p>
                              <p className="text-slate-400 text-sm">Create your first user in the Create User tab</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user.id} className="hover:bg-slate-50 transition-colors">
                            <TableCell className="font-medium text-slate-800 py-4">{user.email}</TableCell>
                            <TableCell>{getRoleBadge(user.role)}</TableCell>
                            <TableCell className="text-slate-600">{user.companyName || "-"}</TableCell>
                            <TableCell>
                              <Badge 
                                variant={user.status === "active" ? "default" : "secondary"}
                                className={user.status === "active" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                              >
                                {user.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-500">
                              {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card 
            style={{
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: 'none',
              borderRadius: '0.75rem'
            }}
          >
            <CardHeader 
              style={{
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e2e8f0',
                padding: '1.5rem'
              }}
            >
              <CardTitle 
                className="flex items-center"
                style={{ color: '#1e293b', fontSize: '1.25rem' }}
              >
                <Plus className="h-5 w-5 mr-2" style={{ color: '#16a34a' }} />
                Create New User
              </CardTitle>
              <CardDescription style={{ color: '#64748b' }}>
                Add advisors and subcontractors to the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateUser} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="user@company.com"
                      value={newUser.email}
                      onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                      required
                      disabled={creating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Temporary Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter temporary password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                      required
                      minLength={6}
                      disabled={creating}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="role">User Role</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(value) => setNewUser({...newUser, role: value})}
                      disabled={creating}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="advisor">Advisor</SelectItem>
                        <SelectItem value="subcontractor">Subcontractor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newUser.role === "subcontractor" && (
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Company Name</Label>
                      <Input
                        id="companyName"
                        placeholder="Construction Company Name"
                        value={newUser.companyName}
                        onChange={(e) => setNewUser({...newUser, companyName: e.target.value})}
                        required
                        disabled={creating}
                      />
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={creating || !newUser.role}
                  style={{
                    backgroundColor: '#16a34a',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontWeight: '500',
                    border: 'none',
                    boxShadow: '0 4px 14px 0 rgba(22, 163, 74, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!creating && newUser.role) {
                      e.currentTarget.style.backgroundColor = '#15803d';
                      e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(22, 163, 74, 0.5)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!creating && newUser.role) {
                      e.currentTarget.style.backgroundColor = '#16a34a';
                      e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(22, 163, 74, 0.4)';
                    }
                  }}
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating User...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create {newUser.role || "User"}
                    </>
                  )}
                </Button>
              </form>

              <div 
                className="mt-8 p-6 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                  border: '1px solid #3b82f6'
                }}
              >
                <h4 
                  className="font-semibold mb-3 flex items-center"
                  style={{ color: '#1e3a8a' }}
                >
                  <User className="h-4 w-4 mr-2" />
                  User Creation Notes:
                </h4>
                <ul className="text-sm space-y-2" style={{ color: '#1e40af' }}>
                  <li className="flex items-start">
                    <span 
                      className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                      style={{ backgroundColor: '#60a5fa' }}
                    ></span>
                    Users will receive their credentials via email (future feature)
                  </li>
                  <li className="flex items-start">
                    <span 
                      className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                      style={{ backgroundColor: '#60a5fa' }}
                    ></span>
                    Advisors can view submissions for assigned projects
                  </li>
                  <li className="flex items-start">
                    <span 
                      className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                      style={{ backgroundColor: '#60a5fa' }}
                    ></span>
                    Subcontractors can submit monthly reports and annual documents
                  </li>
                  <li className="flex items-start">
                    <span 
                      className="w-2 h-2 rounded-full mt-2 mr-3 flex-shrink-0"
                      style={{ backgroundColor: '#60a5fa' }}
                    ></span>
                    Company name is required for subcontractor accounts
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}