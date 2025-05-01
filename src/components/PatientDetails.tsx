import React, { useState } from 'react';
import { ChevronLeft, Clock, FileText, Plus, UploadCloud, Brain, ChevronRight, Trash2 } from 'lucide-react';
import { usePatients } from '../context/PatientContext';
import NewStudyModal from './NewStudyModal';
import { useAnalysis } from '../context/AnalysisContext';

interface PatientDetailsProps {
  patientId: string;
  onBack: () => void;
  onStudySelect: (studyId: string) => void;
}

export default function PatientDetails({ patientId, onBack, onStudySelect }: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'studies' | 'reports'>('overview');
  const [isNewStudyModalOpen, setIsNewStudyModalOpen] = useState(false);

  // Get patient data from context
  const { getPatient, addStudy, removeStudy } = usePatients();
  const { setCurrentStudy, updateAnalysisState } = useAnalysis();
  const patient = getPatient(patientId);

  // Handle if patient not found
  if (!patient) {
    return (
      <div className="py-12 text-center">
        <h2 className="text-xl font-medium text-gray-900">Patient not found</h2>
        <button
          onClick={onBack}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
        >
          Return to Patient List
        </button>
      </div>
    );
  }

  const handleAddStudy = (studyData: {
    type: string;
    date: string;
    findings: string;
    status: 'scheduled' | 'in-progress' | 'completed';
    thumbnailUrl: string;
  }) => {
    addStudy(patientId, studyData);
    setIsNewStudyModalOpen(false);
  };

  const handleRemoveStudy = (studyId: string) => {
    if (confirm("Are you sure you want to remove this study?")) {
      removeStudy(patientId, studyId);
    }
  };

  const handleStudySelect = (studyId: string) => {
    const study = patient.studies.find(s => s.id === studyId);
    if (study) {
      console.log(`Setting current study: Patient ID ${patientId}, Study ID ${studyId}`);
      console.log('Found study:', study);

      // Create an update object for the analysis state
      const analysisUpdate: any = {};

      // Check for analysis data with either property name
      const analysisData = study.analysisData || study.analysis_data;

      // Debug log to see what's in the study
      console.log('Study object:', study);
      console.log('Analysis data from study:', analysisData);

      // First, check if there is analysis data saved with the study
      if (analysisData) {
        console.log('Loading saved analysis data:', analysisData);

        // Restore analysis data fields
        analysisUpdate.prediction = analysisData.prediction || null;
        analysisUpdate.confidenceScores = analysisData.confidenceScores || {};

        // Use the stored base64 image if available, otherwise use the thumbnail
        analysisUpdate.originalImageBase64 = analysisData.originalImage || null;
        analysisUpdate.imageUrl = analysisData.originalImage || study.thumbnailUrl || null;

        // Handle gradcam data
        analysisUpdate.gradcam = analysisData.gradcam || null;
        analysisUpdate.gradcamUrl = analysisData.gradcamUrl || null;

        // Keep track of the uploaded file names
        analysisUpdate.uploadedFileNames = analysisData.uploadedFileNames || [];
        analysisUpdate.uploadedFiles = []; // Reset the file objects as we can't recreate them

        analysisUpdate.timestamp = analysisData.timestamp || null;

        // Restore processing time information if available
        if (analysisData.processingDuration) {
          analysisUpdate.processingStartTime = analysisData.processingStartTime || null;
          analysisUpdate.processingEndTime = analysisData.processingEndTime || null;
          analysisUpdate.processingDuration = analysisData.processingDuration || null;
          analysisUpdate.currentElapsedTime = analysisData.currentElapsedTime || analysisData.processingDuration || null;
          console.log('Restored processing time:', analysisUpdate.processingDuration, 'ms');
        }

        // Restore radiologist's diagnosis and approval status if available
        // Check if radiologistDiagnosis exists and is not null
        if (analysisData.radiologistDiagnosis !== undefined && analysisData.radiologistDiagnosis !== null) {
          analysisUpdate.radiologistDiagnosis = analysisData.radiologistDiagnosis;
          console.log('Restored radiologist diagnosis:', analysisData.radiologistDiagnosis);
        } else {
          console.log('No radiologist diagnosis found in saved data');
        }

        // Check if approvalStatus exists and is not null
        if (analysisData.approvalStatus !== undefined && analysisData.approvalStatus !== null) {
          analysisUpdate.approvalStatus = analysisData.approvalStatus;
          analysisUpdate.approvalTimestamp = analysisData.approvalTimestamp || null;
          analysisUpdate.approvalNotes = analysisData.approvalNotes || null;
          console.log('Restored approval status:', analysisData.approvalStatus);
        } else {
          console.log('No approval status found in saved data');
        }
      }
      else {
        console.log('No analysis data found for this study');
        // Initialize with empty analysis data
        analysisUpdate.imageUrl = study.thumbnailUrl || null;
        analysisUpdate.prediction = null;
        analysisUpdate.confidenceScores = {};
        analysisUpdate.gradcam = null;
        analysisUpdate.gradcamUrl = null;
        analysisUpdate.uploadedFiles = [];
        analysisUpdate.uploadedFileNames = [];
        analysisUpdate.timestamp = null;
        analysisUpdate.processingStartTime = null;
        analysisUpdate.processingEndTime = null;
        analysisUpdate.processingDuration = null;
        analysisUpdate.currentElapsedTime = null;
      }

      console.log('Updating analysis state with:', analysisUpdate);

      // Update everything at once to avoid state synchronization issues
      updateAnalysisState(analysisUpdate);

      // Set the current study context
      setCurrentStudy(patientId, studyId);

      // Navigate to study view
      onStudySelect(studyId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div>
            <h1 className="text-2xl font-display font-semibold text-gray-900">{patient.name}</h1>
            <p className="text-sm text-gray-500">Patient ID: {patient.id}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            className="btn"
            onClick={() => setIsNewStudyModalOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Study
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['overview', 'studies', 'reports'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`
                  px-6 py-3 text-sm font-medium border-b-2 whitespace-nowrap
                  ${activeTab === tab
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                  <dl className="mt-3 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{patient.dateOfBirth}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Phone</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{patient.phone}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{patient.email}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Address</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{patient.address}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Insurance Information</h3>
                  <dl className="mt-3 space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Provider</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{patient.insurance}</dd>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                      <dd className="text-sm text-gray-900 col-span-2">{patient.policyNumber}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
                  <p className="mt-2 text-sm text-gray-600">{patient.emergencyContact}</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Medical History</h3>
                  <ul className="mt-3 space-y-2">
                    {patient.medicalHistory.map((item, index) => (
                      <li key={index} className="text-sm text-gray-600">{item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Current Medications</h3>
                  <ul className="mt-3 space-y-2">
                    {patient.medications.map((med, index) => (
                      <li key={index} className="text-sm text-gray-600">{med}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
                  <ul className="mt-3 space-y-2">
                    {patient.allergies.length > 0 ? (
                      patient.allergies.map((allergy, index) => (
                        <li key={index} className="text-sm text-gray-600">{allergy}</li>
                      ))
                    ) : (
                      <li className="text-sm text-gray-600">No known allergies</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'studies' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Recent Studies</h3>
                <button
                  className="btn"
                  onClick={() => setIsNewStudyModalOpen(true)}
                >
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Add New Study
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {patient.studies.length > 0 ? (
                  patient.studies.map((study) => (
                    <div
                      key={study.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div
                        className="flex items-center space-x-4 flex-1 cursor-pointer"
                        onClick={() => handleStudySelect(study.id)}
                      >
                        <div className="h-20 w-20 rounded-lg overflow-hidden bg-gray-200">
                          <img
                            src={study.thumbnailUrl}
                            alt={`Study ${study.id} thumbnail`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <Brain className="h-4 w-4 text-blue-600" />
                            <h4 className="text-sm font-medium text-gray-900">{study.type}</h4>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Date: {study.date}</p>
                          <p className="text-sm text-gray-600 mt-1">Findings: {study.findings}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          study.status === 'completed' ? 'bg-green-100 text-green-800' :
                          study.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {study.status.charAt(0).toUpperCase() + study.status.slice(1)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the parent onClick
                            handleRemoveStudy(study.id);
                          }}
                          className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 bg-gray-50 rounded-lg">
                    <Brain className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No studies available</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding a new study.</p>
                    <button
                      onClick={() => setIsNewStudyModalOpen(true)}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                      Add New Study
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Medical Reports</h3>
                <button className="btn">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </button>
              </div>

              {patient.studies.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {patient.studies.map((study) => (
                    <div
                      key={study.id}
                      className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-gray-900">{study.type} Report</span>
                        </div>
                        <span className="text-sm text-gray-500">{study.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{study.findings}</p>
                      <div className="flex items-center space-x-3">
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Report</button>
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Download PDF</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No reports available</h3>
                  <p className="mt-1 text-sm text-gray-500">Reports will appear here after studies are conducted.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Study Modal */}
      <NewStudyModal
        isOpen={isNewStudyModalOpen}
        onClose={() => setIsNewStudyModalOpen(false)}
        onSave={handleAddStudy}
        patientName={patient.name}
      />
    </div>
  );
}
