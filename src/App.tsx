import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import Header from './components/Header';
import ImageViewer from './components/ImageViewer';
import AnalysisResults from './components/AnalysisResults';
import UploadPanel from './components/UploadPanel';
import PatientList from './components/PatientList';
import PatientDetails from './components/PatientDetails';
import { AnalysisProvider, useAnalysis } from './context/AnalysisContext';
import { PatientProvider } from './context/PatientContext';
import GradCAMViewer from './components/GradCAMViewer';
import AIAssistant from './components/AIAssistant';

// This component uses useAnalysis, so it must be rendered inside AnalysisProvider
interface MainContentProps {
  onReturn: () => void;
}

function MainContent({ onReturn }: MainContentProps) {
  const { analysis } = useAnalysis();
  const hasImage = analysis.imageUrl != null;
  const hasAnalysisResults = analysis.prediction != null;

  if (!hasImage) {
    return (
      <div className="max-w-md mx-auto">
        {onReturn && (
          <div className="mb-4">
            <button
              onClick={onReturn}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Return to Patient
            </button>
          </div>
        )}
        <UploadPanel />
      </div>
    );
  }

  if (!hasAnalysisResults) {
    return (
      <div className="max-w-md mx-auto">
        {onReturn && (
          <div className="mb-4">
            <button
              onClick={onReturn}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
            >
              <ChevronLeft className="h-5 w-5 mr-1" />
              Return to Patient
            </button>
          </div>
        )}
        <div className="card p-4 mb-6">
          <div className="aspect-square w-full">
            <img
              src={analysis.imageUrl || ''}
              alt="Study Thumbnail"
              className="w-full h-full object-contain"
            />
          </div>
          <p className="text-center text-gray-500 mt-4">
            This study has no analysis data yet. Upload an MRI scan to begin analysis.
          </p>
        </div>
        <UploadPanel />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {onReturn && (
        <div className="mb-4">
          <button
            onClick={onReturn}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Return to Patient
          </button>
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageViewer />
        <GradCAMViewer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <AnalysisResults onReturn={onReturn} />
          <AIAssistant />
        </div>
        <div className="lg:col-span-1">
          <UploadPanel />
        </div>
      </div>
    </div>
  );
}

// Create a separate component for patient-related content
interface PatientContentProps {
  selectedView: 'patients' | 'analysis' | 'calendar' | 'studies';
  selectedPatientId: string | null;
  handleBackToPatients: () => void;
  handlePatientSelect: (patientId: string) => void;
  handleStudySelect: (studyId: string) => void;
}

function PatientContent({ selectedView, selectedPatientId, handleBackToPatients, handlePatientSelect, handleStudySelect }: PatientContentProps) {
  return (
    <>
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
    </>
  );
}

function App() {
  const [selectedView, setSelectedView] = useState<'patients' | 'analysis' | 'calendar' | 'studies'>('patients');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<'patients' | 'analysis' | 'calendar' | 'studies'>('patients');

  // Handle patient selection
  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    console.log(`Selected patient: ${patientId}`);
  };

  // Handle going back to patient list
  const handleBackToPatients = () => {
    setSelectedPatientId(null);
  };

  // This function will be used inside AnalysisProvider's scope
  const handleStudySelectWithAnalysis = (studyId: string) => {
    console.log(`Selected study: ${studyId} for patient: ${selectedPatientId}`);
    setPreviousView(selectedView); // Store the current view before changing
    setSelectedView('analysis');
  };

  // Handle returning from analysis to previous view
  const handleReturnFromAnalysis = () => {
    console.log(`Returning to previous view: ${previousView}`);
    setSelectedView(previousView);
  };

  return (
    <PatientProvider>
      <AnalysisProvider>
        <div className="min-h-screen bg-slate-50">
          <Header />

          <main>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {selectedView === 'analysis' && <MainContent onReturn={handleReturnFromAnalysis} />}

              <PatientContent
                selectedView={selectedView}
                selectedPatientId={selectedPatientId}
                handleBackToPatients={handleBackToPatients}
                handlePatientSelect={handlePatientSelect}
                handleStudySelect={handleStudySelectWithAnalysis}
              />
            </div>
          </main>
        </div>
      </AnalysisProvider>
    </PatientProvider>
  );
}

export default App;