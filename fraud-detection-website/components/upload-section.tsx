"use client"

import type React from "react"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, FileText, AlertCircle } from "lucide-react"
import { useState } from "react"

interface UploadSectionProps {
  onUpload?: (filename: string) => void
}

export function UploadSection({ onUpload }: UploadSectionProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      if (file.type === "text/csv" || file.name.endsWith(".csv")) {
        setUploadedFile(file)
        onUpload?.(file.name)
      }
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedFile(file)
      onUpload?.(file.name)
    }
  }

  const handleAnalyze = async () => {
    setIsProcessing(true)
    // Simulate analysis
    setTimeout(() => setIsProcessing(false), 2000)
  }

  return (
    <div className="space-y-6">
      <Card
        className={`border-2 border-dashed p-12 text-center cursor-pointer transition-all ${
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input type="file" accept=".csv" onChange={handleChange} className="hidden" id="file-input" />
        <label htmlFor="file-input" className="cursor-pointer block">
          <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            {uploadedFile ? "File Ready" : "Drop your CSV file here"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {uploadedFile
              ? `Selected: ${uploadedFile.name} (${(uploadedFile.size / 1024).toFixed(2)} KB)`
              : "or click to browse your files"}
          </p>
          {!uploadedFile && <p className="text-sm text-muted-foreground">Supported formats: CSV | Max size: 100MB</p>}
        </label>
      </Card>

      {uploadedFile && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border border-border">
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-primary flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-foreground">{uploadedFile.name}</h4>
                <p className="text-sm text-muted-foreground mt-1">{(uploadedFile.size / 1024).toFixed(2)} KB</p>
                <p className="text-sm text-muted-foreground mt-2">Ready for analysis</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-border bg-muted/30">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">Expected Output</p>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Fraud probability scores
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Pattern analysis
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    Risk classifications
                  </li>
                </ul>
              </div>
              <Button
                onClick={handleAnalyze}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={isProcessing}
              >
                {isProcessing ? "Analyzing..." : "Start Analysis"}
              </Button>
            </div>
          </Card>
        </div>
      )}

      <Card className="p-4 bg-muted/50 border border-border flex gap-3">
        <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="text-sm text-foreground">
          Your data is encrypted and processed securely. We never store your uploaded files.
        </div>
      </Card>
    </div>
  )
}
