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
    <div>
      {/* Perfect Page Header */}
      <div className="page-header">
        <h1 className="page-title">User Management</h1>
        <p className="page-subtitle">
          Create and manage advisors and subcontractors
        </p>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="create">Create User</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="card">
            <div className="card-title">Registered Users</div>
            <div className="data-table">
              {loading ? (
                <div className="empty-state">
                  <div className="empty-icon">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                  <p>Loading users...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="table-header">Email</TableHead>
                      <TableHead className="table-header">Role</TableHead>
                      <TableHead className="table-header">Company</TableHead>
                      <TableHead className="table-header">Status</TableHead>
                      <TableHead className="table-header">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="empty-state">
                            <div className="empty-icon">
                              <User className="h-8 w-8" />
                            </div>
                            <p>No users found</p>
                            <p style={{ fontSize: '14px', marginTop: '8px' }}>Create your first user in the Create User tab</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="table-row">
                          <TableCell className="table-cell font-medium">{user.email}</TableCell>
                          <TableCell className="table-cell">{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="table-cell">{user.companyName || "-"}</TableCell>
                          <TableCell className="table-cell">
                            <span className={`badge ${user.status === "active" ? "badge-success" : "badge-info"}`}>
                              {user.status}
                            </span>
                          </TableCell>
                          <TableCell className="table-cell">
                            {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <div className="card">
            <div className="card-title">Create New User</div>
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

                <button 
                  type="submit" 
                  disabled={creating || !newUser.role}
                  className="btn btn-primary"
                  style={{
                    backgroundColor: creating || !newUser.role ? 'var(--gray-300)' : 'var(--success)',
                    color: creating || !newUser.role ? 'var(--gray-500)' : 'white',
                    cursor: creating || !newUser.role ? 'not-allowed' : 'pointer'
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
                </button>
              </form>

          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}