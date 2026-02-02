"use client";

import { useState, useRef } from "react";
import { Plus, Loader2, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { buildKnowledgeBase } from "@/service/knowledgeBase";

interface CreateKBDialogProps {
  onSuccess: () => void;
}

export function CreateKBDialog({ onSuccess }: CreateKBDialogProps) {
  const [open, setOpen] = useState(false);
  const [kbName, setKbName] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArray]);
      // Reset input value to allow selecting same file again if removed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!kbName.trim()) {
        alert("Please enter a knowledge base name");
        return;
    }
    if (selectedFiles.length === 0) {
        alert("Please select at least one file");
        return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("name", kbName);
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await buildKnowledgeBase(formData);
      setOpen(false);
      setKbName("");
      setSelectedFiles([]);
      onSuccess();
    } catch (error) {
      console.error("Failed to upload files:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors h-40">
          <Plus className="w-10 h-10 text-gray-400" />
          <span className="mt-2 text-sm text-gray-500 font-medium">Add Knowledge Base</span>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Knowledge Base</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpload} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">Knowledge Base Name</label>
            <Input
              id="name"
              placeholder="Enter name..."
              value={kbName}
              onChange={(e) => setKbName(e.target.value)}
              disabled={uploading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="files" className="text-sm font-medium">Upload Documents</label>
            <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
            >
                <Plus className="w-6 h-6 mx-auto text-gray-400" />
                <span className="text-xs text-gray-500">Click to add files (.md, .txt)</span>
                <input
                    id="files"
                    type="file"
                    multiple
                    accept=".md,.txt"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploading}
                />
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className="max-h-32 overflow-y-auto space-y-2 border rounded-md p-2 bg-gray-50 text-sm">
              {selectedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-white p-2 rounded border group">
                  <div className="flex items-center space-x-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate" title={file.name}>{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(index)}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <Button type="submit" disabled={uploading || !kbName || selectedFiles.length === 0} className="w-full">
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Create Knowledge Base"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
