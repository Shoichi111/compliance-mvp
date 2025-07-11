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
    <div className="p-8 max-w-7xl mx-auto">
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
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Registered Users</h3>
            {loading ? (
              <div className="text-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
                <p>Loading users...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead className="font-semibold text-gray-700 py-4">Email</TableHead>
                      <TableHead className="font-semibold text-gray-700">Role</TableHead>
                      <TableHead className="font-semibold text-gray-700">Company</TableHead>
                      <TableHead className="font-semibold text-gray-700">Status</TableHead>
                      <TableHead className="font-semibold text-gray-700">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5}>
                          <div className="text-center py-12 text-gray-500">
                            <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-gray-400">
                              <User className="h-8 w-8" />
                            </div>
                            <p>No users found</p>
                            <p className="text-sm mt-2">Create your first user in the Create User tab</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((user) => (
                        <TableRow key={user.id} className="hover:bg-gray-50 transition-colors">
                          <TableCell className="font-medium text-gray-800 py-4">{user.email}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell className="text-gray-600">{user.companyName || "-"}</TableCell>
                          <TableCell>
                            <span className={`text-xs font-semibold px-2 py-1 rounded ${user.status === "active" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>
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
              </div>
            )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
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
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 inline-flex items-center gap-2 ${
                    creating || !newUser.role 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-md'
                  }`}
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