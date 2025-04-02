import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ImageViewer from './components/ImageViewer';
import AnalysisResults from './components/AnalysisResults';
import UploadPanel from './components/UploadPanel';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import { AnalysisProvider } from './context/AnalysisContext';
import { PatientProvider } from './context/PatientContext';
import GradCAMViewer from './components/GradCAMViewer';
import { useAnalysis } from './context/AnalysisContext';
import AIAssistant from './components/AIAssistant';

function MainContent() {
  const { analysis } = useAnalysis();
  const hasAnalysis = analysis.imageUrl != null;

  if (!hasAnalysis) {
    return (
      <div className="max-w-md mx-auto">
        <UploadPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageViewer />
        <GradCAMViewer />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnalysisResults />
          <AIAssistant />
        </div>
        <div className="lg:col-span-1">
          <UploadPanel />
        </div>
      </div>
    </div>
  );
}

function App() {
  const [selectedView, setSelectedView] = useState<'patients' | 'analysis' | 'calendar' | 'studies'>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  
  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    console.log(`Selected patient: ${patientId}`);
  };
  
  // Handle going back to patient list
  const handleBackToPatients = () => {
    setSelectedPatientId(null);
  };
  
  // Handle study selection
  const handleStudySelect = (studyId: string) => {
    console.log(`Selected study: ${studyId}`);
    // Transition to analysis view with the selected study
    setSelectedView('analysis');
    // In a real app, you would load the study data here
  };

  return (
    <AnalysisProvider>
      <PatientProvider>
        <div className="min-h-screen bg-slate-50">
          <Header />
          <Sidebar selectedView={selectedView} onViewChange={setSelectedView} />
          
          <main className="lg:pl-72">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {selectedView === 'analysis' && <MainContent />}
              
              {selectedView === 'patients' && (
                <>
                  {selectedPatientId === null ? (
                    <PatientList onPatientSelect={handlePatientSelect} />
                  ) : (
                    <PatientDetails 
                      patientId={selectedPatientId}
                      onBack={handleBackToPatients}
                      onStudySelect={handleStudySelect}
                    />
                  )}
                </>
              )}
              
              {selectedView === 'calendar' && (
                <div className="py-12 text-center">
                  <h2 className="text-2xl font-display font-semibold text-gray-900">Calendar View</h2>
                  <p className="mt-2 text-gray-500">Scheduling and appointments would appear here.</p>
                </div>
              )}
              
              {selectedView === 'studies' && (
                <div className="py-12 text-center">
                  <h2 className="text-2xl font-display font-semibold text-gray-900">Studies Database</h2>
                  <p className="mt-2 text-gray-500">Research studies and case collections would appear here.</p>
                </div>
              )}
            </div>
          </main>
        </div>
      </PatientProvider>
    </AnalysisProvider>
  );
}

export default App;