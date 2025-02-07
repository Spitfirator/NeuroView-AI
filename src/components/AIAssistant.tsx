import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface Diagnosis {
  approved: boolean | null;
  tumorType: string | null;
  notes: string;
}

export default function AIAssistant() {
  const { analysis } = useAnalysis();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello, I can help analyze the MRI scans and provide detailed diagnostic insights. What would you like to know about the current case?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    approved: null,
    tumorType: analysis.prediction || null,
    notes: '',
  });
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        role: 'assistant',
        content: 'Based on the MRI scans, I observe a well-defined mass in the right temporal lobe measuring approximately 2.8 x 3.1 cm. The lesion shows characteristic features consistent with a glioma, including irregular enhancement patterns and surrounding edema. The location and imaging characteristics suggest a high-grade glioma (WHO grade III or IV). I recommend immediate neurosurgical consultation and consideration for stereotactic biopsy to confirm the diagnosis.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
      setShowDiagnosisForm(true);
    }, 1000);
  };

  const handleDiagnosisApproval = (approved: boolean) => {
    setDiagnosis(prev => ({ 
      ...prev, 
      approved,
      tumorType: analysis.prediction || null 
    }));
    if (!approved) {
      setShowDiagnosisForm(true);
    }
  };

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-display font-semibold text-gray-900">AI Diagnostic Assistant</h2>
          </div>
          {diagnosis.approved !== null && (
            <div className="flex items-center space-x-2">
              {diagnosis.approved ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Diagnosis Approved
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  <XCircle className="h-4 w-4 mr-1" />
                  Diagnosis Rejected
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="h-[400px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'assistant'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <span className="text-xs opacity-70 mt-1 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
              </div>
            </div>
          )}

          {showDiagnosisForm && diagnosis.approved === null && (
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-4">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-medium text-blue-900">Verify Diagnosis</h3>
              </div>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDiagnosisApproval(true)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Diagnosis
                  </button>
                  <button
                    onClick={() => handleDiagnosisApproval(false)}
                    className="flex-1 inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Diagnosis
                  </button>
                </div>
              </div>
            </div>
          )}

          {showDiagnosisForm && diagnosis.approved === false && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Correct Diagnosis</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tumor Type
                  </label>
                  <select
                    value={diagnosis.tumorType || ''}
                    onChange={(e) => setDiagnosis(prev => ({ ...prev, tumorType: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select tumor type</option>
                    <option value="glioma">Glioma</option>
                    <option value="meningioma">Meningioma</option>
                    <option value="pituitary">Pituitary</option>
                    <option value="no-tumor">No Tumor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={diagnosis.notes}
                    onChange={(e) => setDiagnosis(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your diagnostic notes..."
                  />
                </div>
                <button
                  onClick={() => setShowDiagnosisForm(false)}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Submit Correction
                </button>
              </div>
            </div>
          )}
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the diagnosis..."
              className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="btn px-4 py-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}