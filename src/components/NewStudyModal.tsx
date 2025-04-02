import React, { useState } from 'react';
import { X } from 'lucide-react';

interface NewStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (study: {
    type: string;
    date: string;
    findings: string;
    status: 'scheduled' | 'in-progress' | 'completed';
    thumbnailUrl: string;
  }) => void;
}

export default function NewStudyModal({ isOpen, onClose, onSave }: NewStudyModalProps) {
  const [studyData, setStudyData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0], // Today's date as default
    findings: '',
    status: 'scheduled' as const,
    thumbnailUrl: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?auto=format&fit=crop&q=80&w=200' // Default image
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudyData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(studyData);
    // Reset form
    setStudyData({
      type: '',
      date: new Date().toISOString().split('T')[0],
      findings: '',
      status: 'scheduled',
      thumbnailUrl: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?auto=format&fit=crop&q=80&w=200'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        
        <div className="bg-white rounded-lg shadow-xl transform transition-all w-full max-w-lg">
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Add New Study</h3>
            <button 
              onClick={onClose}
              className="rounded-md text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Study Type</label>
              <input
                type="text"
                id="type"
                name="type"
                required
                value={studyData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., MRI Brain, CT Scan, etc."
              />
            </div>
            
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                required
                value={studyData.date}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                required
                value={studyData.status}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="findings" className="block text-sm font-medium text-gray-700">Findings</label>
              <textarea
                id="findings"
                name="findings"
                rows={3}
                value={studyData.findings}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter preliminary findings..."
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700"
              >
                Save Study
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}