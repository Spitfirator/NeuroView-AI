import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define types
export interface Study {
  id: string;
  date: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  findings: string;
  thumbnailUrl: string;
  analysisData?: any;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  lastVisit: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  address: string;
  insurance: string;
  policyNumber: string;
  emergencyContact: string;
  medicalHistory: string[];
  medications: string[];
  allergies: string[];
  status: 'scheduled' | 'in-progress' | 'completed';
  condition: string;
  studies: Study[];
}

// Patient form data interface
export interface PatientFormData {
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email: string;
  address: string;
  insuranceProvider: string;
  policyNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

// Context type
interface PatientContextType {
  patients: Patient[];
  getPatient: (id: string) => Patient | undefined;
  addStudy: (patientId: string, study: Omit<Study, 'id'>) => Promise<void>;
  removeStudy: (patientId: string, studyId: string) => Promise<void>;
  addPatient: (patientData: PatientFormData) => Promise<void>;
  updateStudyAnalysis: (patientId: string, studyId: string, analysisData: any) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

// API URL
const API_BASE_URL = 'http://localhost:8000';

// Create context
const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Provider component
export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add this function to transform the API response to match your frontend model
  const transformPatient = (apiPatient: any): Patient => {
    return {
      id: apiPatient.id,
      name: apiPatient.name,
      age: apiPatient.age,
      gender: apiPatient.gender,
      lastVisit: apiPatient.last_visit,
      dateOfBirth: apiPatient.date_of_birth,
      phone: apiPatient.phone,
      email: apiPatient.email,
      address: apiPatient.address,
      insurance: apiPatient.insurance,
      policyNumber: apiPatient.policy_number,
      emergencyContact: apiPatient.emergency_contact,
      medicalHistory: apiPatient.medical_history || [],
      medications: apiPatient.medications || [],
      allergies: apiPatient.allergies || [],
      status: apiPatient.status as 'scheduled' | 'in-progress' | 'completed',
      condition: apiPatient.condition,
      studies: (apiPatient.studies || []).map((apiStudy: any) => ({
        id: apiStudy.id,
        date: apiStudy.date,
        type: apiStudy.type,
        status: apiStudy.status as 'scheduled' | 'in-progress' | 'completed',
        findings: apiStudy.findings,
        thumbnailUrl: apiStudy.thumbnail_url,
        analysisData: apiStudy.analysis_data
      }))
    };
  };

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/patients`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }
        
        const data = await response.json();
        console.log('API returned patients:', data);
        
        // Transform the data to match our frontend model
        const transformedPatients = data.map(transformPatient);
        console.log('Transformed patients:', transformedPatients);
        
        setPatients(transformedPatients);
        setError(null);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to load patients. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const getPatient = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  const addStudy = async (patientId: string, study: Omit<Study, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Transform from camelCase to snake_case for API
      const apiStudy = {
        type: study.type,
        date: study.date,
        status: study.status,
        findings: study.findings,
        thumbnail_url: study.thumbnailUrl
      };
      
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/studies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiStudy),
      });

      if (!response.ok) {
        throw new Error('Failed to add study');
      }

      const newApiStudy = await response.json();
      
      // Transform the returned study to frontend format
      const newStudy = {
        id: newApiStudy.id,
        date: newApiStudy.date,
        type: newApiStudy.type,
        status: newApiStudy.status as 'scheduled' | 'in-progress' | 'completed',
        findings: newApiStudy.findings,
        thumbnailUrl: newApiStudy.thumbnail_url
      };
      
      // Update local state
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === patientId) {
            return {
              ...patient,
              studies: [...patient.studies, newStudy]
            };
          }
          return patient;
        });
      });
      
      setError(null);
    } catch (err) {
      console.error('Error adding study:', err);
      setError('Failed to add study. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removeStudy = async (patientId: string, studyId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/studies/${studyId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to remove study');
      }

      // Update local state
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === patientId) {
            return {
              ...patient,
              studies: patient.studies.filter(study => study.id !== studyId)
            };
          }
          return patient;
        });
      });
      
      setError(null);
    } catch (err) {
      console.error('Error removing study:', err);
      setError('Failed to remove study. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const addPatient = async (patientData: PatientFormData) => {
    try {
      setIsLoading(true);
      
      // Calculate age based on date of birth
      const birthDate = new Date(patientData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      // Format emergency contact
      const emergencyContact = `${patientData.emergencyContactName} - ${patientData.emergencyContactPhone}`;
      
      // Create a new patient object for the API (snake_case)
      const apiPatient = {
        name: patientData.fullName,
        age,
        gender: patientData.gender.charAt(0).toUpperCase() + patientData.gender.slice(1),
        last_visit: today.toISOString().split('T')[0], // Today's date
        date_of_birth: patientData.dateOfBirth,
        phone: patientData.phone,
        email: patientData.email,
        address: patientData.address,
        insurance: patientData.insuranceProvider,
        policy_number: patientData.policyNumber,
        emergency_contact: emergencyContact,
        medical_history: [],
        medications: [],
        allergies: [],
        status: 'scheduled',
        condition: 'Initial Consultation'
      };
      
      const response = await fetch(`${API_BASE_URL}/patients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiPatient),
      });

      if (!response.ok) {
        throw new Error('Failed to add patient');
      }

      const createdApiPatient = await response.json();
      
      // Transform the API response to match frontend model
      const createdPatient = transformPatient(createdApiPatient);
      
      // Update local state
      setPatients(prevPatients => [...prevPatients, createdPatient]);
      setError(null);
    } catch (err) {
      console.error('Error adding patient:', err);
      setError('Failed to add patient. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateStudyAnalysis = async (patientId: string, studyId: string, analysisData: any) => {
    try {
      setIsLoading(true);
      
      console.log('Saving analysis data:', analysisData);  // Debug log
      
      const response = await fetch(`${API_BASE_URL}/patients/${patientId}/studies/${studyId}/analysis`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(analysisData),
      });

      if (!response.ok) {
        throw new Error('Failed to update study analysis');
      }

      const result = await response.json();
      
      // Update local state
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === patientId) {
            return {
              ...patient,
              studies: patient.studies.map(study => {
                if (study.id === studyId) {
                  return {
                    ...study,
                    status: result.status as 'scheduled' | 'in-progress' | 'completed',
                    analysisData: {
                      prediction: analysisData.prediction,
                      confidenceScores: analysisData.confidenceScores || {},
                      gradcamUrl: analysisData.gradcamUrl || '',
                      timestamp: analysisData.timestamp
                    }
                  };
                }
                return study;
              })
            };
          }
          return patient;
        });
      });
      
      setError(null);
      return result;
    } catch (err) {
      console.error('Error updating study analysis:', err);
      setError('Failed to update study analysis. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PatientContext.Provider value={{ 
      patients, 
      getPatient, 
      addStudy, 
      removeStudy, 
      addPatient,
      updateStudyAnalysis,
      isLoading,
      error
    }}>
      {children}
    </PatientContext.Provider>
  );
};

// Custom hook to use the patient context
export const usePatients = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatients must be used within a PatientProvider');
  }
  return context;
};