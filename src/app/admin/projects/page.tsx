"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { toast } from "sonner";
import { Loader2, Plus, Building2 } from "lucide-react";

interface User {
  id: string;
  email: string;
  role: string;
  companyName?: string;
}

interface Project {
  id: string;
  projectName: string;
  assignedAdvisorId: string;
  assignedAdvisorEmail?: string;
  subcontractorIds: string[];
  subcontractorEmails?: string[];
  createdAt: any;
}

export default function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [advisors, setAdvisors] = useState<User[]>([]);
  const [subcontractors, setSubcontractors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  
  // Form state for creating new projects
  const [newProject, setNewProject] = useState({
    projectName: "",
    assignedAdvisorId: "",
    subcontractorIds: [] as string[]
  });

  // Fetch all data
  const fetchData = async () => {
    try {
      // Fetch projects
      const projectsSnapshot = await getDocs(collection(db, "projects"));
      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      // Fetch advisors
      const advisorsQuery = query(collection(db, "users"), where("role", "==", "advisor"));
      const advisorsSnapshot = await getDocs(advisorsQuery);
      const advisorsData = advisorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Fetch subcontractors
      const subcontractorsQuery = query(collection(db, "users"), where("role", "==", "subcontractor"));
      const subcontractorsSnapshot = await getDocs(subcontractorsQuery);
      const subcontractorsData = subcontractorsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as User[];

      // Add email references to projects for display
      const projectsWithEmails = projectsData.map(project => {
        const advisor = advisorsData.find(a => a.id === project.assignedAdvisorId);
        const projectSubcontractors = subcontractorsData.filter(s => 
          project.subcontractorIds.includes(s.id)
        );
        
        return {
          ...project,
          assignedAdvisorEmail: advisor?.email,
          subcontractorEmails: projectSubcontractors.map(s => s.email)
        };
      });

      setProjects(projectsWithEmails);
      setAdvisors(advisorsData);
      setSubcontractors(subcontractorsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle subcontractor selection
  const handleSubcontractorToggle = (subcontractorId: string) => {
    setNewProject(prev => ({
      ...prev,
      subcontractorIds: prev.subcontractorIds.includes(subcontractorId)
        ? prev.subcontractorIds.filter(id => id !== subcontractorId)
        : [...prev.subcontractorIds, subcontractorId]
    }));
  };

  // Create new project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const projectData = {
        projectName: newProject.projectName,
        assignedAdvisorId: newProject.assignedAdvisorId,
        subcontractorIds: newProject.subcontractorIds,
        createdAt: new Date()
      };

      await addDoc(collection(db, "projects"), projectData);
      toast.success("Project created successfully!");
      
      // Reset form
      setNewProject({
        projectName: "",
        assignedAdvisorId: "",
        subcontractorIds: []
      });

      // Refresh projects list
      fetchData();

    } catch (error) {
      console.error("Error creating project:", error);
      toast.error("Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Project Management"
        subtitle="Create projects and assign advisors and subcontractors"
      />

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">All Projects</TabsTrigger>
          <TabsTrigger value="create">Create Project</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card noPadding>
            {loading ? (
              <LoadingSpinner />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Assigned Advisor</TableHead>
                    <TableHead>Subcontractors</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState
                          icon={<Building2 className="w-8 h-8 text-gray-400" />}
                          title="No projects found"
                          description="Create your first project in the Create Project tab"
                        />
                      </TableCell>
                    </TableRow>
                  ) : (
                    projects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">{project.projectName}</TableCell>
                        <TableCell>{project.assignedAdvisorEmail || "Unassigned"}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {project.subcontractorEmails?.map((email, index) => (
                              <span key={index} className="px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {email}
                              </span>
                            )) || <span className="text-gray-500">None assigned</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-gray-500">
                          {project.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Project</h3>
              <form onSubmit={handleCreateProject} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName">Project Name</Label>
                  <Input
                    id="projectName"
                    placeholder="Downtown Tower Construction"
                    value={newProject.projectName}
                    onChange={(e) => setNewProject({...newProject, projectName: e.target.value})}
                    required
                    disabled={creating}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advisor">Assigned Advisor</Label>
                  <Select 
                    value={newProject.assignedAdvisorId} 
                    onValueChange={(value) => setNewProject({...newProject, assignedAdvisorId: value})}
                    disabled={creating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an advisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {advisors.length === 0 ? (
                        <SelectItem value="" disabled>No advisors available</SelectItem>
                      ) : (
                        advisors.map((advisor) => (
                          <SelectItem key={advisor.id} value={advisor.id}>
                            {advisor.email}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                  {advisors.length === 0 && (
                    <p className="text-sm text-gray-500">
                      Create advisors in the User Management section first
                    </p>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Assigned Subcontractors</Label>
                  {subcontractors.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No subcontractors available. Create subcontractors in the User Management section first.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-4">
                      {subcontractors.map((subcontractor) => (
                        <div key={subcontractor.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={subcontractor.id}
                            checked={newProject.subcontractorIds.includes(subcontractor.id)}
                            onCheckedChange={() => handleSubcontractorToggle(subcontractor.id)}
                            disabled={creating}
                          />
                          <Label 
                            htmlFor={subcontractor.id} 
                            className="text-sm font-normal cursor-pointer"
                          >
                            {subcontractor.email}
                            {subcontractor.companyName && (
                              <span className="text-gray-500 ml-2">({subcontractor.companyName})</span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  type="submit" 
                  disabled={creating || !newProject.projectName || !newProject.assignedAdvisorId}
                  variant="primary"
                >
                  {creating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Project...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Project
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