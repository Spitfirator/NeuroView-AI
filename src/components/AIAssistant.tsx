import React, { useState } from 'react';
import { MessageSquare, Send, Loader2, CheckCircle2, XCircle, AlertCircle, Bot } from 'lucide-react';
import { useAnalysis } from '../context/AnalysisContext';

// API URLs - try all ports to support different development environments
const API_URLS = ['http://localhost:8000', 'http://localhost:8001', 'http://localhost:8002'];

interface Message {
  role: 'assistant' | 'user' | 'system';
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
  const [isActivated, setIsActivated] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<Diagnosis>({
    approved: null,
    tumorType: analysis.prediction || null,
    notes: '',
  });
  const [showDiagnosisForm, setShowDiagnosisForm] = useState(false);

  // Create a system prompt string
  const getSystemPrompt = () => {
    return `You are an AI medical assistant with knowledge of medical terminology and procedures.

You are aware of the following information about the current case:
- Patient was predicted to have: ${analysis.prediction || 'Unknown'} tumor
- Classification report:
${Object.entries(analysis.confidenceScores || {})
  .map(([type, score]) => `  * ${type}: ${(score * 100).toFixed(1)}%`)
  .join('\n')}

Your role is to assist radiologists by providing general information about medical procedures, terminology, and answering questions they might have. Always maintain a professional, medical tone and clarify that you are not providing a diagnosis.`;
  };

  const activateAssistant = () => {
    // Initialize with welcome message
    setMessages([
      {
        role: 'assistant',
        content: "Hello! I'm your AI medical assistant. How can I help you today?",
        timestamp: new Date(),
      }
    ]);

    // Don't set the system prompt in the input field
    setInput('');

    setIsActivated(true);
  };

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

    try {
      // Removed image handling code

      // Get conversation history excluding system messages
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .map(({ role, content }) => ({
          role,
          content,
        }));

      // If this is the first user message, add a system message at the beginning
      if (messages.length === 1) { // Only the welcome message exists
        conversationHistory.unshift({
          role: 'system',
          content: getSystemPrompt()
        });
      }

      // Add the current user message
      conversationHistory.push({
        role: 'user',
        content: input,
      });

      let response;
      let success = false;

      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const currentUrl = API_URLS[i];
          console.log(`Trying to chat using: ${currentUrl}`);

          response = await fetch(`${currentUrl}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: conversationHistory,
              max_tokens: 500,
            }),
          });

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
        throw new Error('Failed to get AI response from any API endpoint');
      }

      const data = await response.json();

      const aiResponse: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'I apologize, but I encountered an error processing your request. Please try again.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      setShowDiagnosisForm(true);
    }
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

  const formatMessage = (content: string) => {
    // Split the message by newlines and handle lists
    return content.split('\n').map((line, index) => {
      // Handle bullet points
      if (line.startsWith('- ')) {
        return (
          <li key={index} className="ml-4 list-disc">
            {line.substring(2)}
          </li>
        );
      }
      // Handle numbered lists
      if (line.match(/^\d+\./)) {
        return (
          <li key={index} className="ml-4 list-decimal">
            {line.substring(line.indexOf('.') + 2)}
          </li>
        );
      }
      // Handle confidence scores
      if (line.startsWith('  * ')) {
        return (
          <li key={index} className="ml-8 list-none">
            <span className="font-mono">{line}</span>
          </li>
        );
      }
      // Handle headers (lines ending with ':')
      if (line.endsWith(':')) {
        return (
          <p key={index} className="font-semibold mt-2 mb-1">
            {line}
          </p>
        );
      }
      // Regular paragraphs
      return line ? (
        <p key={index} className="mb-2">
          {line}
        </p>
      ) : (
        <br key={index} />
      );
    });
  };

  if (!isActivated) {
    return (
      <div className="card backdrop-blur-sm bg-white/70 hover:bg-white/80 transition-all duration-300">
        <div className="p-6 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-lg font-display font-semibold text-gray-900">AI Medical Assistant</h2>
          <p className="text-gray-500 max-w-md">
            Get assistance with medical questions. For ethical reasons, the AI doesn't directly analyze MRI scans or provide diagnoses, it only knows the predicted tumor type. It's here to assist radiologists with general information and answer questions about procedures and terminology.
          </p>
          <button
            onClick={activateAssistant}
            className="btn px-6 py-2"
          >
            Activate AI Assistant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-display font-semibold text-gray-900">AI Medical Assistant</h2>
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
                className={`max-w-[80%] rounded-lg p-4 ${
                  message.role === 'assistant'
                    ? 'bg-gray-100 text-gray-900'
                    : 'bg-blue-600 text-white'
                }`}
              >
                <div className="prose prose-sm">
                  {formatMessage(message.content)}
                </div>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-600 border-t-transparent"></div>
                </div>
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
          <div className="space-y-2">
            <div className="flex space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a medical question..."
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
          </div>
        </form>
      </div>
    </div>
  );
}