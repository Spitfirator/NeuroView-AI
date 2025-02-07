import React from 'react';
import Header from './components/Header';
import ImageViewer from './components/ImageViewer';
import AnalysisResults from './components/AnalysisResults';
import UploadPanel from './components/UploadPanel';
import { AnalysisProvider } from './context/AnalysisContext';
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
  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-slate-50">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <MainContent />
        </main>
      </div>
    </AnalysisProvider>
  );
}

export default App;