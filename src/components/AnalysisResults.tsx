import React from 'react';
import { AlertCircle, Brain, Target, Calendar, ChevronRight } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';
import SimilarCases from './SimilarCases';

export default function AnalysisResults() {
  const { analysis } = useAnalysis();
  
  if (!analysis.prediction) {
    return null;
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-display font-semibold text-gray-900">AI Analysis Results</h2>
        <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-50 rounded-full">Analysis Complete</span>
      </div>
      
      <div className="space-y-8">
        <div className="border-b border-gray-100 pb-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Tumor Classification</h3>
          <div className="space-y-3">
            {Object.entries(analysis.confidenceScores).map(([label, score]) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                  <span className="text-sm font-medium text-gray-900">
                    {label.charAt(0).toUpperCase() + label.slice(1)}
                  </span>
                </div>
                <div className="flex items-center">
                  <div className="w-32 h-2 bg-gray-100 rounded-full mr-3">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${score * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {(score * 100).toFixed(1)}%
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
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-900">Critical Findings</h4>
                <p className="mt-1 text-sm text-gray-600">Mass effect on surrounding structures</p>
                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-lg">
                  <p className="text-xs text-red-700">Immediate attention required</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}