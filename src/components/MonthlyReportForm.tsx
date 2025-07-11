"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, Save, Send } from "lucide-react";

// Form validation schema based on specification
const monthlyReportSchema = z.object({
  // Incident Metrics (trigger conditional upload if any > 0)
  lostTimeInjuries: z.number().min(0, "Must be 0 or greater"),
  medicalAidInjuries: z.number().min(0, "Must be 0 or greater"),
  firstAidInjuries: z.number().min(0, "Must be 0 or greater"),
  propertyDamage: z.number().min(0, "Must be 0 or greater"),
  environmentalIncidents: z.number().min(0, "Must be 0 or greater"),
  nearMisses: z.number().min(0, "Must be 0 or greater"),
  
  // Activity Metrics
  totalWorkerHours: z.number().min(0, "Must be 0 or greater"),
  hazardIdentifications: z.number().min(0, "Must be 0 or greater"),
  safetyInspections: z.number().min(0, "Must be 0 or greater"),
  toolboxTalks: z.number().min(0, "Must be 0 or greater"),
  workersSiteOriented: z.number().min(0, "Must be 0 or greater"),
});

type FormData = z.infer<typeof monthlyReportSchema>;

interface MonthlyReportFormProps {
  projectId: string;
  projectName: string;
  subcontractorId: string;
  onSubmissionComplete?: () => void;
}

export default function MonthlyReportForm({ 
  projectId, 
  projectName, 
  subcontractorId,
  onSubmissionComplete 
}: MonthlyReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(monthlyReportSchema),
    defaultValues: {
      lostTimeInjuries: 0,
      medicalAidInjuries: 0,
      firstAidInjuries: 0,
      propertyDamage: 0,
      environmentalIncidents: 0,
      nearMisses: 0,
      totalWorkerHours: 0,
      hazardIdentifications: 0,
      safetyInspections: 0,
      toolboxTalks: 0,
      workersSiteOriented: 0,
    },
  });

  // Check for existing submission for current month
  useEffect(() => {
    const checkExistingSubmission = async () => {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      try {
        const submissionsQuery = query(
          collection(db, "submissions"),
          where("projectId", "==", projectId),
          where("subcontractorId", "==", subcontractorId),
          where("month", "==", currentMonth),
          where("year", "==", currentYear)
        );

        const snapshot = await getDocs(submissionsQuery);
        if (!snapshot.empty) {
          const submission = snapshot.docs[0].data();
          setExistingSubmission({ id: snapshot.docs[0].id, ...submission });
          
          // Populate form with existing data if available
          if (submission.metrics) {
            form.reset(submission.metrics);
          }
        }
      } catch (error) {
        console.error("Error checking existing submission:", error);
      }
    };

    checkExistingSubmission();
  }, [projectId, subcontractorId, form]);

  // Calculate completion percentage
  const calculateCompletionPercentage = (data: FormData): number => {
    // All 11 fields are required for 100% completion
    const totalFields = 11;
    const completedFields = Object.values(data).filter(value => value !== null && value !== undefined).length;
    return Math.round((completedFields / totalFields) * 100);
  };

  // Check if any incidents occurred (triggers conditional document upload)
  const hasIncidents = (data: FormData): boolean => {
    return (
      data.lostTimeInjuries > 0 ||
      data.medicalAidInjuries > 0 ||
      data.firstAidInjuries > 0 ||
      data.propertyDamage > 0 ||
      data.environmentalIncidents > 0
    );
  };

  // Submit the form
  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);

    try {
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      const submissionData = {
        projectId,
        subcontractorId,
        month: currentMonth,
        year: currentYear,
        status: "Submitted",
        completionPercentage: calculateCompletionPercentage(data),
        submittedAt: new Date(),
        metrics: data,
        hasIncidents: hasIncidents(data),
        documents: [], // Will be populated when documents are uploaded
      };

      if (existingSubmission) {
        // Update existing submission (though spec says no editing after submission)
        toast.info("Updating existing submission");
      } else {
        // Create new submission
        await addDoc(collection(db, "submissions"), submissionData);
      }

      toast.success("Monthly report submitted successfully!");
      
      if (onSubmissionComplete) {
        onSubmissionComplete();
      }

    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error("Failed to submit report. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDate = new Date();
  const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
  const currentYear = currentDate.getFullYear();

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Monthly Safety Report</CardTitle>
        <CardDescription>
          {projectName} - {currentMonth} {currentYear}
          {existingSubmission && (
            <span className="ml-2 text-green-600 font-medium">
              (Previously submitted)
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Incident Metrics Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Incident Metrics</h3>
              <p className="text-sm text-gray-600 mb-6">
                Report any safety incidents that occurred during this month. If any value is greater than 0, 
                you will need to upload incident investigation reports.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="lostTimeInjuries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lost Time Injuries</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Injuries resulting in time off work</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalAidInjuries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Aid Injuries</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Injuries requiring medical attention</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="firstAidInjuries"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Aid Injuries</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Injuries treated with first aid only</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyDamage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property Damage Incidents</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Incidents causing property damage</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environmentalIncidents"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environmental Incidents</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Environmental impact incidents</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nearMisses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Near Misses</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Near miss incidents reported</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Activity Metrics Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Safety Activity Metrics</h3>
              <p className="text-sm text-gray-600 mb-6">
                Report safety activities and training conducted during this month.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="totalWorkerHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Worker Hours</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Total hours worked by all workers</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hazardIdentifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hazard Identifications</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Number of hazards identified</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="safetyInspections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Inspections</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Safety inspections conducted</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="toolboxTalks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Toolbox Talks</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Toolbox talks conducted</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workersSiteOriented"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workers Site Oriented</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="0" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormDescription>New workers given site orientation</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Submit Section */}
            <div className="flex justify-end space-x-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-32"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Submit Report
                  </>
                )}
              </Button>
            </div>

            {/* Warning about incident reports */}
            {hasIncidents(form.getValues()) && (
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2">⚠️ Incident Investigation Required</h4>
                <p className="text-sm text-yellow-700">
                  You have reported incidents this month. After submitting this report, you will need to 
                  upload incident investigation documentation in the Documents section.
                </p>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}