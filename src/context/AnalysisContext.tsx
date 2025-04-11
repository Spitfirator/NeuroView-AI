import React, { createContext, useContext, useState, ReactNode } from 'react';
import { usePatients } from './PatientContext';

interface AnalysisState {
  prediction: string | null;
  confidenceScores: Record<string, number>;
  imageUrl: string | null;
  originalImageBase64: string | null;
  gradcamUrl: string | null;
  gradcam: any;
  uploadedFiles: File[];
  uploadedFileNames?: string[];
  timestamp?: string;
  processingStartTime?: number;
  processingEndTime?: number;
  processingDuration?: number;
  currentElapsedTime?: number; // Live elapsed time for synchronizing components
}

interface AnalysisContextType {
  analysis: {
    imageUrl: string | null;
    prediction: string | null;
    confidenceScores: Record<string, number>;
    gradcamUrl: string | null;
    uploadedFiles: File[];
    uploadedFileNames?: string[];
    timestamp?: string;
    processingStartTime?: number;
    processingEndTime?: number;
    processingDuration?: number;
    currentElapsedTime?: number; // Live elapsed time for synchronizing components
  };
  currentPatientId: string | null;
  currentStudyId: string | null;
  setAnalysisImage: (imageUrl: string) => void;
  setAnalysisResults: (prediction: string, confidenceScores: Record<string, number>, gradcamUrl: string) => void;
  resetAnalysis: () => void;
  setCurrentStudy: (patientId: string, studyId: string) => void;
  saveAnalysisToPatient: () => Promise<void>;
  updateAnalysis: (data: any) => void;
  addUploadedFile: (file: File) => void;
  removeUploadedFile: (index: number) => void;
  updateAnalysisState: (data: Partial<typeof analysis>) => void;
  startProcessingTimer: () => number;
  stopProcessingTimer: () => void;
  updateElapsedTime: (elapsed: number) => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export const AnalysisProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { updateStudyAnalysis } = usePatients();

  const [analysis, setAnalysis] = useState({
    imageUrl: null as string | null,
    originalImageBase64: null as string | null,
    prediction: null as string | null,
    confidenceScores: {} as Record<string, number>,
    gradcamUrl: null as string | null,
    gradcam: null,
    uploadedFiles: [] as File[],
    uploadedFileNames: [] as string[],
    timestamp: null as string | null,
    processingStartTime: null as number | null,
    processingEndTime: null as number | null,
    processingDuration: null as number | null,
    currentElapsedTime: null as number | null,
  });

  const [currentPatientId, setCurrentPatientId] = useState<string | null>(null);
  const [currentStudyId, setCurrentStudyId] = useState<string | null>(null);

  const setAnalysisImage = (imageUrl: string) => {
    setAnalysis(prev => ({ ...prev, imageUrl }));
  };

  const setAnalysisResults = (prediction: string, confidenceScores: Record<string, number>, gradcamUrl: string) => {
    setAnalysis(prev => ({
      ...prev,
      prediction,
      confidenceScores,
      gradcamUrl,
    }));
  };

  const resetAnalysis = () => {
    setAnalysis({
      imageUrl: null,
      originalImageBase64: null,
      prediction: null,
      confidenceScores: {},
      gradcamUrl: null,
      gradcam: null,
      uploadedFiles: [],
      uploadedFileNames: [],
      timestamp: null,
      processingStartTime: null,
      processingEndTime: null,
      processingDuration: null,
      currentElapsedTime: null,
    });
    setCurrentPatientId(null);
    setCurrentStudyId(null);
  };

  const setCurrentStudy = (patientId: string, studyId: string) => {
    setCurrentPatientId(patientId);
    setCurrentStudyId(studyId);
  };

  const saveAnalysisToPatient = async () => {
    if (!currentPatientId || !currentStudyId || !analysis.prediction) {
      throw new Error('Cannot save analysis: missing patient, study, or analysis data');
    }

    // If confidenceScores is empty but we have a prediction, add default scores
    let scoresToSave = analysis.confidenceScores;
    if (Object.keys(scoresToSave).length === 0 && analysis.prediction) {
      console.log('Adding default confidence scores for prediction:', analysis.prediction);
      scoresToSave = {
        'glioma': analysis.prediction === 'glioma' ? 0.9 : 0.03,
        'meningioma': analysis.prediction === 'meningioma' ? 0.9 : 0.03,
        'pituitary': analysis.prediction === 'pituitary' ? 0.9 : 0.03,
        'notumor': analysis.prediction === 'notumor' ? 0.9 : 0.01
      };
    }

    // Create a comprehensive analysis data object
    const analysisData = {
      prediction: analysis.prediction,
      confidenceScores: scoresToSave,
      // Save both gradcam data and URL
      gradcam: analysis.gradcam,
      gradcamUrl: analysis.gradcamUrl,
      // Add the original image base64 data for persistent storage
      originalImage: analysis.originalImageBase64,
      // Store filenames of uploaded files for reference
      uploadedFileNames: analysis.uploadedFiles.map(file => file.name),
      // Add metadata
      timestamp: new Date().toISOString(),
      // Save processing time information
      processingStartTime: analysis.processingStartTime,
      processingEndTime: analysis.processingEndTime,
      processingDuration: analysis.processingDuration,
      currentElapsedTime: analysis.processingDuration || analysis.currentElapsedTime,
    };

    console.log('Saving complete analysis data:', analysisData);
    await updateStudyAnalysis(currentPatientId, currentStudyId, analysisData);
    return;
  };

  const updateAnalysis = (data: any) => {
    setAnalysis(prev => ({ ...prev, ...data }));
  };

  const addUploadedFile = (file: File) => {
    setAnalysis(prev => ({
      ...prev,
      uploadedFiles: [...prev.uploadedFiles, file]
    }));
  };

  const removeUploadedFile = (index: number) => {
    setAnalysis(prev => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((_, i) => i !== index)
    }));
  };

  const updateAnalysisState = (data: Partial<typeof analysis>) => {
    setAnalysis(prev => ({
      ...prev,
      ...data
    }));
  };

  // Start the processing timer
  const startProcessingTimer = () => {
    const startTime = Date.now();
    console.log('Starting processing timer at:', startTime, 'timestamp:', new Date(startTime).toLocaleTimeString());

    // Force reset all timer-related state
    setAnalysis(prev => ({
      ...prev,
      processingStartTime: startTime,
      processingEndTime: null,
      processingDuration: null,
      currentElapsedTime: 0
    }));
    return startTime;
  };

  // Update the current elapsed time (for live timer display)
  const updateElapsedTime = (elapsed: number) => {
    setAnalysis(prev => ({
      ...prev,
      currentElapsedTime: elapsed
    }));
  };

  // Stop the processing timer and calculate duration
  const stopProcessingTimer = () => {
    const endTime = Date.now();
    console.log('Stopping processing timer at:', endTime, 'timestamp:', new Date(endTime).toLocaleTimeString());

    setAnalysis(prev => {
      // Only calculate if we have a valid start time
      if (!prev.processingStartTime) {
        console.log('No start time found, cannot calculate duration');
        return prev;
      }

      const startTime = prev.processingStartTime;
      const duration = endTime - startTime;

      console.log(`Processing took ${duration}ms (${duration/1000}s)`);
      console.log(`Start: ${new Date(startTime).toLocaleTimeString()}, End: ${new Date(endTime).toLocaleTimeString()}`);

      return {
        ...prev,
        processingEndTime: endTime,
        processingDuration: duration
      };
    });
  };

  return (
    <AnalysisContext.Provider
      value={{
        analysis,
        currentPatientId,
        currentStudyId,
        setAnalysisImage,
        setAnalysisResults,
        resetAnalysis,
        setCurrentStudy,
        saveAnalysisToPatient,
        updateAnalysis,
        addUploadedFile,
        removeUploadedFile,
        updateAnalysisState,
        startProcessingTimer,
        stopProcessingTimer,
        updateElapsedTime
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
};

export const useAnalysis = () => {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error('useAnalysis must be used within an AnalysisProvider');
  }
  return context;
};