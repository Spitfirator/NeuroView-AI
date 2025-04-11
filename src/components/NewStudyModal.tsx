import React, { useState } from 'react';
import { X, Calendar, Clock } from 'lucide-react';

interface NewStudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studyData: {
    type: string;
    date: string;
    findings: string;
    status: 'scheduled' | 'in-progress';
    thumbnailUrl: string;
  }) => void;
  patientName: string;
}

interface StudyFormData {
  type: string;
  date: string;
  time: string;
  description: string;
  status: 'scheduled' | 'in-progress';
}

const initialFormData: StudyFormData = {
  type: '',
  date: new Date().toISOString().split('T')[0],
  time: new Date().toTimeString().slice(0, 5),
  description: '',
  status: 'scheduled'
};

export default function NewStudyModal({ isOpen, onClose, onSave, patientName }: NewStudyModalProps) {
  const [formData, setFormData] = useState<StudyFormData>(initialFormData);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Transform the form data to match what the API expects
    const studyData = {
      type: formData.type,
      date: `${formData.date}T${formData.time}`, // Combine date and time
      findings: formData.description, // Map description to findings
      status: formData.status,
      thumbnailUrl: getThumbnailForStudyType(formData.type), // Generate a thumbnail URL based on study type
    };

    onSave(studyData);
    setFormData(initialFormData);
    onClose();
  };

  // Helper function to provide sample thumbnail URLs based on study type
  const getThumbnailForStudyType = (type: string): string => {
    const thumbnails = {
      'MRI': 'https://placehold.co/200x200/e2f1ff/003380?text=MRI',
      'CT Scan': 'https://placehold.co/200x200/f1f1f1/666666?text=CT+Scan',
      'X-Ray': 'https://placehold.co/200x200/f5f5f5/333333?text=X-Ray',
      'Ultrasound': 'https://placehold.co/200x200/e6f7ff/005599?text=Ultrasound',
    };

    return thumbnails[type] || 'https://placehold.co/200x200/eeeeee/999999?text=Medical+Image';
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-[600px] shadow-lg rounded-xl bg-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-semibold text-gray-900">New Study</h2>
            <p className="text-sm text-gray-500">Patient: {patientName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Study Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select study type</option>
                <option value="MRI">MRI</option>
                <option value="CT Scan">CT Scan</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Ultrasound">Ultrasound</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="h-4 w-4 inline-block mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="h-4 w-4 inline-block mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                required
                className="w-full rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter study description and any relevant notes..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn"
            >
              Create Study
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}