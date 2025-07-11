"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, addDoc, getDocs, doc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
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
    <>
      <PageHeader
        title="User Management"
        subtitle="Create and manage advisors and subcontractors"
      />

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="create">Create User</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card noPadding>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5}>
                        <EmptyState
                          icon={<User className="w-8 h-8 text-gray-400" />}
                          title="No users found"
                          description="Create your first user in the Create User tab"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>{user.companyName || "-"}</TableCell>
                        <TableCell>
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            user.status === "active" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {user.status}
                          </span>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>
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
                  variant="primary"
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

          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}