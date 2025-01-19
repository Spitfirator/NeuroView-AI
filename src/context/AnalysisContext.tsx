import React, { createContext, useContext, useState } from 'react';

interface AnalysisState {
  prediction: string | null;
  confidenceScores: Record<string, number>;
  imageUrl: string | null;
  gradcam: {
    heatmap: string;
    superimposed: string;
  } | null;
}

interface AnalysisContextType {
  analysis: AnalysisState;
  updateAnalysis: (data: any) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    prediction: null,
    confidenceScores: {},
    imageUrl: null,
    gradcam: null,
  });

  const updateAnalysis = (data: any) => {
    setAnalysis({
      prediction: data.prediction,
      confidenceScores: data.confidence_scores,
      imageUrl: data.imageUrl,
      gradcam: data.gradcam || null,
    });
  };

  return (
    <AnalysisContext.Provider value={{ analysis, updateAnalysis }}>
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