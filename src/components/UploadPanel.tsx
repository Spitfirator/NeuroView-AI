import React, { useState } from 'react';
import { Upload, FileText, X, Plus } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export default function UploadPanel() {
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { updateAnalysis } = useAnalysis();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileUpload({ target: { files: droppedFiles } } as any);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    selectedFiles.forEach(file => {
      console.log(`File: ${file.name}`);
      console.log(`Raw size in bytes: ${file.size}`);
      console.log(`Formatted size: ${formatFileSize(file.size)}`);
    });
    setFiles(prev => [...prev, ...selectedFiles]);

    // Upload first file for prediction
    if (selectedFiles.length > 0) {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', selectedFiles[0]);

      // Create URL for the uploaded image
      const imageUrl = URL.createObjectURL(selectedFiles[0]);

      try {
        // Make sure this matches your FastAPI server port (usually 8000)
        const response = await fetch('http://localhost:8000/predict', {
          method: 'POST',
          body: formData,
          // Add these headers explicitly
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        console.log('Prediction response:', result); // Debug log
        
        if (result.success) {
          updateAnalysis({
            ...result,
            imageUrl: imageUrl // Add the image URL to the analysis data
          });
        } else {
          console.error('Prediction failed:', result.error);
          alert('Failed to analyze the image. Please try again.');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('Failed to upload the image. Please make sure the backend server is running on port 8000.');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removeFile = (indexToRemove: number) => {
    setFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div 
          className={`border-2 border-dashed rounded-lg p-6 bg-gray-50 
            hover:bg-gray-50/80 transition-colors duration-200 
            ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}
          onClick={() => !isUploading && document.getElementById('file-upload')?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 bg-white rounded-full flex items-center justify-center shadow-inner-sm">
              <Upload className="h-6 w-6" />
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">Upload MRI Scans</h3>
              <p className="mt-1 text-sm text-gray-500">
                {isUploading ? 'Analyzing image...' : 'Drag and drop an MRI scan or click to browse'}
              </p>
            </div>
            <button 
              className={`mt-4 btn ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isUploading}
            >
              {isUploading ? 'Analyzing...' : 'Browse Files'}
            </button>
          </div>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
            multiple
            disabled={isUploading}
          />
        </div>
      </div>

      {files.length > 0 && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium text-gray-900">Uploaded Files</h4>
            <button 
              className="btn-secondary"
              onClick={() => document.getElementById('file-upload')?.click()}
              disabled={isUploading}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Files
            </button>
          </div>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors duration-200">
                <div className="flex items-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="ml-3">
                    <span className="text-sm font-medium text-gray-900 block">{file.name}</span>
                    <span className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • Uploaded just now
                    </span>
                  </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
