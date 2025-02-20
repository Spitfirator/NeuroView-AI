import React, { createContext, useContext, useState } from 'react';

interface AnalysisState {
  prediction: string | null;
  confidenceScores: Record<string, number>;
  imageUrl: string | null;
  gradcam: {
    heatmap: string;
    superimposed: string;
  } | null;
  uploadedFiles: File[];
}

interface AnalysisContextType {
  analysis: AnalysisState;
  updateAnalysis: (data: any) => void;
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (index: number) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    prediction: null,
    confidenceScores: {},
    imageUrl: null,
    gradcam: null,
    uploadedFiles: [],
  });

  const updateAnalysis = (data: any) => {
    setAnalysis(prev => ({
      ...prev,
      prediction: data.prediction,
      confidenceScores: data.confidence_scores,
      imageUrl: data.imageUrl,
      gradcam: data.gradcam || null,
    }));
  };

  const addUploadedFile = (file: File) => {
    setAnalysis(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, file],
    }));
  };

  const removeUploadedFile = (index: number) => {
    setAnalysis(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index),
    }));
  };

  return (
    <AnalysisContext.Provider value={{ 
      analysis, 
      updateAnalysis, 
      addUploadedFile, 
      removeUploadedFile 
    }}>
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
} 