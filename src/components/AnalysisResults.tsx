import { useEffect, useState } from 'react';
import { AlertCircle, Brain, Target, Calendar, ChevronRight, Download, Share2, Save, Clock, ChevronLeft, CheckCircle, HelpCircle } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

// define tumour type colours
const TUMOR_COLORS = {
  glioma: 'bg-blue-600',
  meningioma: 'bg-blue-400',
  pituitary: 'bg-blue-300',
  notumor: 'bg-green-500'
} as const;

// define the desired order
const TUMOR_ORDER = ['glioma', 'meningioma', 'pituitary', 'notumor'] as const;

interface AnalysisResultsProps {
  onReturn?: () => void;
}

export default function AnalysisResults({ onReturn }: AnalysisResultsProps) {
  const { analysis, saveAnalysisToPatient, currentPatientId, currentStudyId, stopProcessingTimer, setRadiologistDiagnosis } = useAnalysis();


  const handleExport = () => {
    // need to implement for future, not for the report
    console.log('Exporting report...');
  };

  const handleShare = () => {
    // same here
    console.log('Opening share dialog...');
  };

  const handleSaveAnalysis = async () => {
    try {
      await saveAnalysisToPatient();
      // show success notification
      alert('Analysis saved successfully to patient record!');
    } catch (error: any) {
      console.error('Failed to save analysis:', error);
      // show error notification
      alert(`Failed to save analysis: ${error.message || 'Unknown error'}`);
    }
  };



  // track the previous prediction
  const [prevPrediction, setPrevPrediction] = useState<string | null>(null);

  useEffect(() => {
    console.log('Analysis state in AnalysisResults:', analysis);
    console.log('Confidence scores:', analysis.confidenceScores);
    console.log('Processing duration:', analysis.processingDuration);
    console.log('Current elapsed time:', analysis.currentElapsedTime);

    // if we have prediction results but no processing end time, stop the timer
    if (analysis.prediction && !analysis.processingEndTime) {
      stopProcessingTimer();
    }

    // check if this is a new prediction -> for subsequent MRI scans if for example the radiologist uploaded the wrong one, can still change
    const isNewPrediction = analysis.prediction && analysis.prediction !== prevPrediction;

    if (isNewPrediction) {
      console.log('New prediction detected:', analysis.prediction);
      console.log('Previous prediction was:', prevPrediction);
      setPrevPrediction(analysis.prediction);

      // make sure the timer is stopped for the new prediction
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

              {/* add status indicator showing patient/study link */}
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
          {/* implement this after diss */}
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
              <h3 className="text-sm font-medium text-gray-500">Tumour Classification</h3>
              <div className="flex items-center">
                {analysis.currentElapsedTime !== null && (
                  <div className="mr-4 text-sm text-gray-600 flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span title={`Processing started at: ${new Date(analysis.processingStartTime || 0).toLocaleTimeString()}
${analysis.processingEndTime ? `Processing completed at: ${new Date(analysis.processingEndTime).toLocaleTimeString()}` : 'Processing in progress...'}`}>
                      {((analysis.currentElapsedTime || 0) / 1000).toFixed(2)}s
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* prominent display of the predicted tumour type */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-sm font-medium text-gray-700">
                  {analysis.radiologistDiagnosis && analysis.radiologistDiagnosis !== analysis.prediction
                    ? "Diagnosis:"
                    : "AI Predicted Tumour Type:"}
                </h4>

                {/* status indicator */}
                {analysis.radiologistDiagnosis ? (
                  <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    analysis.radiologistDiagnosis === analysis.prediction
                      ? 'bg-green-100 text-green-800'
                      : 'bg-purple-100 text-purple-800'
                  }`}>
                    {analysis.radiologistDiagnosis === analysis.prediction
                      ? <CheckCircle className="h-3 w-3 mr-1" />
                      : <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                    }
                    {analysis.radiologistDiagnosis === analysis.prediction
                      ? 'Confirmed by Radiologist'
                      : 'Radiologist Assessment'
                    }
                  </div>
                ) : (
                  <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <HelpCircle className="h-3 w-3 mr-1" />
                    Awaiting Assessment
                  </div>
                )}
              </div>

              <div className="flex items-center mt-3">
                {/* show the radiologist's diagnosis if available and different from AI, otherwise show AI prediction */}
                <span className={`w-3 h-3 ${
                  analysis.radiologistDiagnosis && analysis.radiologistDiagnosis !== analysis.prediction
                    ? TUMOR_COLORS[analysis.radiologistDiagnosis as keyof typeof TUMOR_COLORS]
                    : TUMOR_COLORS[analysis.prediction as keyof typeof TUMOR_COLORS]
                } rounded-full mr-2`}></span>
                <span className="text-lg font-semibold text-gray-900">
                  {analysis.radiologistDiagnosis && analysis.radiologistDiagnosis !== analysis.prediction
                    ? (analysis.radiologistDiagnosis === 'notumor' ? 'No detectable Tumour' : analysis.radiologistDiagnosis.charAt(0).toUpperCase() + analysis.radiologistDiagnosis.slice(1))
                    : (analysis.prediction === 'notumor' ? 'No detectable Tumour' : analysis.prediction?.charAt(0).toUpperCase() + analysis.prediction?.slice(1))
                  }
                </span>

                {/* only show confidence for AI prediction */}
                {(!analysis.radiologistDiagnosis || analysis.radiologistDiagnosis === analysis.prediction) && (
                  <span className="ml-3 text-sm font-medium text-gray-700">
                    ({((analysis.confidenceScores[analysis.prediction as string] || 0) * 100).toFixed(1)}% AI confidence)
                  </span>
                )}
              </div>


            </div>

            <div className="flex justify-between items-center mb-3 mt-6">
              <h4 className="text-sm font-medium text-gray-700">Classification Breakdown:</h4>
              <div className="text-xs text-blue-600 font-medium flex items-center">
                <span className="w-2 h-2 bg-purple-500 rounded-full mr-1"></span>
                Click to select your diagnosis
              </div>
            </div>
            <div className="space-y-3">
              {TUMOR_ORDER.map(label => (
                <div
                  key={label}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors duration-200 ${
                    label === analysis.prediction
                      ? 'bg-blue-50 border border-blue-100'
                      : label === analysis.radiologistDiagnosis
                        ? 'bg-purple-50 border border-purple-100'
                        : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setRadiologistDiagnosis(label)}
                >
                  <div className="flex items-center space-x-2">
                    <span className={`w-2 h-2 ${TUMOR_COLORS[label]} rounded-full`}></span>
                    <span className="text-sm font-medium text-gray-900">
                      {label === 'notumor' ? 'No detectable Tumour' : label.charAt(0).toUpperCase() + label.slice(1)}
                    </span>
                    <div className="flex space-x-1">
                      {label === analysis.prediction && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">AI Prediction</span>
                      )}
                      {label === analysis.radiologistDiagnosis && (
                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Radiologist's Choice</span>
                      )}
                    </div>
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
              {/* need to implement that in the future — part of disucssion section, currently hardcoded */}
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
                  {/* change icon colour based on tumor presence */}
                  <AlertCircle className={`h-5 w-5 ${analysis.prediction && analysis.prediction !== 'notumor' ? 'text-red-500' : 'text-green-500'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Critical Findings</h4>
                  {/* change message based on tumor presence */}
                  <p className="mt-1 text-sm text-gray-600">
                    {analysis.prediction && analysis.prediction !== 'notumor'
                      ? 'Mass effect on surrounding structures'
                      : 'No mass effect on surrounding structures'}
                  </p>
                  {/* change alert box based on tumour presence */}
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

        {/* add save button at the bottom when linked to patient */}
        {currentPatientId && currentStudyId && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              {analysis.radiologistDiagnosis ? (
                <div className={`flex items-center ${
                  analysis.radiologistDiagnosis === analysis.prediction ? 'text-green-600' : 'text-purple-600'
                }`}>
                  {analysis.radiologistDiagnosis === analysis.prediction
                    ? <CheckCircle className="h-4 w-4 mr-1" />
                    : <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  }
                  <span>
                    {analysis.radiologistDiagnosis === analysis.prediction
                      ? 'AI diagnosis approved by radiologist'
                      : `AI diagnosis rejected. Radiologist's diagnosis: ${analysis.radiologistDiagnosis === 'notumor' ? 'No detectable Tumour' : analysis.radiologistDiagnosis.charAt(0).toUpperCase() + analysis.radiologistDiagnosis.slice(1)}`
                    }
                  </span>
                </div>
              ) : (
                <div className="text-orange-600 flex items-center">
                  <HelpCircle className="h-4 w-4 mr-1" />
                  <span>Please select your diagnosis from the classification breakdown</span>
                </div>
              )}
            </div>
            <button
              onClick={handleSaveAnalysis}
              disabled={!analysis.radiologistDiagnosis}
              className={`flex items-center ${
                !analysis.radiologistDiagnosis
                  ? 'btn-disabled'
                  : 'btn'
              }`}
              title={
                !analysis.radiologistDiagnosis
                  ? 'Please select your diagnosis from the classification breakdown'
                  : 'Save analysis to patient record'
              }
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