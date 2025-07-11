"use client";

import { useState, useCallback } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, FileText, X, Check } from "lucide-react";

interface FileUploadProps {
  documentType: string;
  projectId: string;
  subcontractorId: string;
  month: number;
  year: number;
  onUploadComplete: (fileData: any) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
}

export default function FileUpload({
  documentType,
  projectId,
  subcontractorId,
  month,
  year,
  onUploadComplete,
  maxSizeMB = 10,
  acceptedTypes = [".pdf", ".png", ".jpeg", ".jpg", ".docx"]
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<any>(null);

  // Validate file
  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedTypes.includes(fileExtension || "")) {
      toast.error(`File type not allowed. Accepted types: ${acceptedTypes.join(", ")}`);
      return false;
    }

    return true;
  };

  // Upload file to Firebase Storage
  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Generate unique file path
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      const fileName = `${timestamp}.${fileExtension}`;
      const storagePath = `submissions/${projectId}/${subcontractorId}/${month}_${year}/${fileName}`;
      
      const storageRef = ref(storage, storagePath);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Prepare file data
      const fileData = {
        docType: documentType,
        storagePath: storagePath,
        downloadURL: downloadURL,
        originalFileName: file.name,
        fileSize: file.size,
        uploadedAt: new Date()
      };

      setUploadedFile(fileData);
      onUploadComplete(fileData);
      toast.success(`${documentType} uploaded successfully`);

    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      uploadFile(files[0]);
    }
  }, []);

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  // Remove uploaded file
  const handleRemove = () => {
    setUploadedFile(null);
    // Note: In production, you might want to delete from Firebase Storage
  };

  if (uploadedFile) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
              </div>
              <div>
                <p className="font-medium text-green-800">{documentType}</p>
                <p className="text-sm text-green-600">{uploadedFile.originalFileName}</p>
                <p className="text-xs text-green-500">
                  {(uploadedFile.fileSize / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="text-green-700 hover:text-green-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`
      border-2 border-dashed transition-colors cursor-pointer
      ${isDragging ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"}
      ${isUploading ? "pointer-events-none" : ""}
    `}>
      <CardContent 
        className="p-6 text-center"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => !isUploading && document.getElementById(`file-${documentType}`)?.click()}
      >
        {isUploading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6 text-white animate-bounce" />
            </div>
            <div>
              <p className="font-medium text-blue-800">Uploading {documentType}...</p>
              <Progress value={uploadProgress} className="w-full mt-2" />
            </div>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium text-gray-900">{documentType}</h3>
              <p className="text-sm text-gray-600">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                {acceptedTypes.join(", ").toUpperCase()} (max {maxSizeMB}MB)
              </p>
            </div>
          </>
        )}
        
        <input
          id={`file-${documentType}`}
          type="file"
          className="hidden"
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </CardContent>
    </Card>
  );
}