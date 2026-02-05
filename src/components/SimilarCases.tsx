import React, { useState } from 'react';
import { useAnalysis } from '../context/AnalysisContext';
import { Brain, ChevronRight, X } from 'lucide-react';

// under construction, not evaluated for the dissertation 

const API_URLS = ['http://localhost:8000', 'http://localhost:8001'];

export default function SimilarCases() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [similarCases, setSimilarCases] = useState<any[]>([]);
  const { analysis } = useAnalysis();

  const fetchSimilarCases = async () => {
    if (!analysis.prediction) return;

    setIsLoading(true);
    try {
      let response;
      let success = false;

      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const currentUrl = API_URLS[i];
          console.log(`Trying to fetch similar cases using: ${currentUrl}`);

          response = await fetch(`${currentUrl}/similar-cases/${analysis.prediction}`);

          if (response.ok) {
            console.log(`Successfully connected to ${currentUrl}`);
            success = true;
            break;
          }
        } catch (err: any) {
          console.log(`Failed to connect to ${API_URLS[i]}: ${err.message || 'Unknown error'}`);
        }
      }

      if (!success || !response) {
        throw new Error('Failed to fetch similar cases from any API endpoint');
      }

      const data = await response.json();

      if (data.success) {
        setSimilarCases(data.cases);
        setIsOpen(true);
      }
    } catch (error: any) {
      console.error('Failed to fetch similar cases:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!analysis.prediction) return null;

  return (
    <>
      <div className="flex items-start space-x-3">
        <div className="mt-1">
          <Brain className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-900">Similar Cases</h4>
          <p className="mt-1 text-sm text-gray-600">
            Found {similarCases.length || '0'} similar cases in database
          </p>
          <button
            className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center"
            onClick={fetchSimilarCases}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'View cases'}
            <ChevronRight className="h-4 w-4 ml-1" />
          </button>
        </div>
      </div>

      {/* modal for displaying similar cases */}
      {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Similar Cases</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {similarCases.map((case_, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {case_.prediction}
                      </h4>
                      <p className="text-sm text-gray-500">
                        Confidence: {(case_.confidence_scores[case_.prediction] * 100).toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-500">
                        Date: {new Date(case_.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}