import React, { useEffect, useState } from 'react';
import { AlertCircle, Brain, Target, Calendar, ChevronRight, History, Download, Share2, Save, Clock, ChevronLeft } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import SimilarCases from './SimilarCases';

// Define the tumor type colors
const TUMOR_COLORS = {
  glioma: 'bg-blue-600',
  meningioma: 'bg-blue-400',
  pituitary: 'bg-blue-300',
  notumor: 'bg-green-500'
} as const;

// Define the desired order
const TUMOR_ORDER = ['glioma', 'meningioma', 'pituitary', 'notumor'] as const;

interface AnalysisResultsProps {
  onReturn?: () => void;
}

export default function AnalysisResults({ onReturn }: AnalysisResultsProps) {
  const { analysis, saveAnalysisToPatient, currentPatientId, currentStudyId, stopProcessingTimer } = useAnalysis();

  // Add a helper function to show status
  const getStudyLinkStatus = () => {
    if (currentPatientId && currentStudyId) {
      return `Linked to patient ID: ${currentPatientId.substring(0, 8)}... (Study: ${currentStudyId.substring(0, 8)}...)`;
    }
    return "Not linked to any patient study";
  };

  const handleExport = () => {
    // In a real app, this would generate a PDF report
    console.log('Exporting report...');
  };

  const handleShare = () => {
    // In a real app, this would open a sharing modal
    console.log('Opening share dialog...');
  };

  const handleSaveAnalysis = async () => {
    try {
      await saveAnalysisToPatient();
      // Show success notification
      alert('Analysis saved successfully to patient record!');
    } catch (error) {
      console.error('Failed to save analysis:', error);
      // Show error notification
      alert(`Failed to save analysis: ${error.message}`);
    }
  };

  // Track the previous prediction
  const [prevPrediction, setPrevPrediction] = useState<string | null>(null);

  useEffect(() => {
    console.log('Analysis state in AnalysisResults:', analysis);
    console.log('Confidence scores:', analysis.confidenceScores);
    console.log('Processing duration:', analysis.processingDuration);
    console.log('Current elapsed time:', analysis.currentElapsedTime);

    // If we have prediction results but no processing end time, stop the timer
    if (analysis.prediction && !analysis.processingEndTime) {
      stopProcessingTimer();
    }

    // Check if this is a new prediction
    const isNewPrediction = analysis.prediction && analysis.prediction !== prevPrediction;

    if (isNewPrediction) {
      console.log('New prediction detected:', analysis.prediction);
      console.log('Previous prediction was:', prevPrediction);
      setPrevPrediction(analysis.prediction);

      // Ensure the timer is stopped for the new prediction
      if (!analysis.processingEndTime) {
        stopProcessingTimer();
      }
    }
  }, [analysis, stopProcessingTimer, prevPrediction]);

  if (!analysis.prediction) {
    return null;
  }

  return (
    <div className="card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {onReturn && (
              <button
                onClick={onReturn}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                title="Return to previous view"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
            )}
            <div>
              <h2 className="text-lg font-display font-semibold text-gray-900">Analysis Results</h2>

              {/* Add status indicator showing patient/study link */}
              {currentPatientId && currentStudyId ? (
                <p className="text-sm text-green-600 flex items-center mt-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Linked to patient record
                </p>
              ) : (
                <p className="text-sm text-orange-600 flex items-center mt-1">
                  <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                  Not linked to any patient record
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleShare}
              className="btn-secondary"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </button>
            <button
              onClick={handleExport}
              className="btn"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <div className="border-b border-gray-100 pb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">Tumor Classification</h3>
              <div className="flex items-center">
                {analysis.currentElapsedTime !== null && (
                  <div className="mr-4 text-sm text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span title={`Processing started at: ${new Date(analysis.processingStartTime || 0).toLocaleTimeString()}
${analysis.processingEndTime ? `Processing completed at: ${new Date(analysis.processingEndTime).toLocaleTimeString()}` : 'Processing in progress...'}`}>
                      {(analysis.currentElapsedTime / 1000).toFixed(2)}s
                    </span>
                  </div>
                )}
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center">
                  <History className="h-4 w-4 mr-1" />
                  View History
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {TUMOR_ORDER.map(label => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 ${TUMOR_COLORS[label]} rounded-full`}></span>
                    <span className="text-sm font-medium text-gray-900">
                      {label === 'notumor' ? 'No Tumor' : label.charAt(0).toUpperCase() + label.slice(1)}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-32 h-2 bg-gray-100 rounded-full mr-3">
                      <div
                        className={`h-full ${TUMOR_COLORS[label]} rounded-full`}
                        style={{ width: `${(analysis.confidenceScores[label] || 0) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {((analysis.confidenceScores[label] || 0) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Location & Size</h4>
                  <p className="mt-1 text-sm text-gray-600">Right temporal lobe, 2.8 x 3.1 cm</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Brain className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Similar Cases</h4>
                  <p className="mt-1 text-sm text-gray-600">Found 15 similar cases in database</p>
                  <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                    View cases
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Recommended Follow-up</h4>
                  <p className="mt-1 text-sm text-gray-600">Biopsy recommended within 7 days</p>
                  <button className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center">
                    Schedule procedure
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {/* Change icon color based on tumor presence */}
                  <AlertCircle className={`h-5 w-5 ${analysis.prediction && analysis.prediction !== 'notumor' ? 'text-red-500' : 'text-green-500'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Critical Findings</h4>
                  {/* Change message based on tumor presence */}
                  <p className="mt-1 text-sm text-gray-600">
                    {analysis.prediction && analysis.prediction !== 'notumor'
                      ? 'Mass effect on surrounding structures'
                      : 'No mass effect on surrounding structures'}
                  </p>
                  {/* Change alert box based on tumor presence */}
                  <div className={`mt-2 p-2 ${analysis.prediction && analysis.prediction !== 'notumor' ? 'bg-red-50 border border-red-100' : 'bg-green-50 border border-green-100'} rounded-lg`}>
                    <p className={`text-xs ${analysis.prediction && analysis.prediction !== 'notumor' ? 'text-red-700' : 'text-green-700'}`}>
                      {analysis.prediction && analysis.prediction !== 'notumor'
                        ? 'Immediate attention required'
                        : 'No immediate attention required'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add save button at the bottom when linked to patient */}
        {currentPatientId && currentStudyId && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSaveAnalysis}
              className="btn flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              Save Analysis to Patient Record
            </button>
          </div>
        )}
      </div>
    </div>
  );
}