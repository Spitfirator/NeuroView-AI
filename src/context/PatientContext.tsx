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
  removePatient: (patientId: string) => Promise<void>;
  updateStudyAnalysis: (patientId: string, studyId: string, analysisData: any) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

// API URLs - try both ports to support different development environments
const API_URLS = ['http://localhost:8000', 'http://localhost:8001', 'http://localhost:8002'];
let currentApiUrlIndex = 0;
let API_BASE_URL = API_URLS[currentApiUrlIndex];

// We're handling API URL switching directly in the fetch functions

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
      studies: (apiPatient.studies || []).map((apiStudy: any) => {
        // Parse analysis_data if it exists
        let analysisData = null;
        if (apiStudy.analysis_data) {
          // Make sure we're dealing with an object, not a string
          if (typeof apiStudy.analysis_data === 'string') {
            try {
              analysisData = JSON.parse(apiStudy.analysis_data);
            } catch (e) {
              console.error('Error parsing analysis data:', e);
            }
          } else {
            analysisData = apiStudy.analysis_data;
          }
        }

        return {
          id: apiStudy.id,
          date: apiStudy.date,
          type: apiStudy.type,
          status: apiStudy.status as 'scheduled' | 'in-progress' | 'completed',
          findings: apiStudy.findings,
          thumbnailUrl: apiStudy.thumbnail_url,
          analysisData: analysisData
        };
      })
    };
  };

  // Fetch patients on component mount
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setIsLoading(true);
        let response;
        let success = false;

        // Try each API URL until one works
        for (let i = 0; i < API_URLS.length; i++) {
          try {
            const currentUrl = API_URLS[i];
            console.log(`Trying to fetch patients from: ${currentUrl}`);
            response = await fetch(`${currentUrl}/patients`);

            if (response.ok) {
              // Update the current API URL if it's different
              if (currentUrl !== API_BASE_URL) {
                currentApiUrlIndex = i;
                API_BASE_URL = currentUrl;
                console.log(`Switched to working API URL: ${API_BASE_URL}`);
              }
              success = true;
              break;
            }
          } catch (err: any) {
            console.log(`Failed to connect to ${API_URLS[i]}: ${err.message || 'Unknown error'}`);
          }
        }

        if (!success || !response) {
          throw new Error('Failed to fetch patients from any API endpoint');
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

      let response;
      let success = false;

      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const currentUrl = API_URLS[i];
          console.log(`Trying to add study using: ${currentUrl}`);

          response = await fetch(`${currentUrl}/patients/${patientId}/studies`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiStudy),
          });

          if (response.ok) {
            // Update the current API URL if it's different
            if (currentUrl !== API_BASE_URL) {
              currentApiUrlIndex = i;
              API_BASE_URL = currentUrl;
              console.log(`Switched to working API URL: ${API_BASE_URL}`);
            }
            success = true;
            break;
          }
        } catch (err: any) {
          console.log(`Failed to connect to ${API_URLS[i]}: ${err.message || 'Unknown error'}`);
        }
      }

      if (!success || !response) {
        throw new Error('Failed to add study to any API endpoint');
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
    } catch (err: any) {
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
      let response;
      let success = false;

      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const currentUrl = API_URLS[i];
          console.log(`Trying to remove study using: ${currentUrl}`);

          response = await fetch(`${currentUrl}/patients/${patientId}/studies/${studyId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            // Update the current API URL if it's different
            if (currentUrl !== API_BASE_URL) {
              currentApiUrlIndex = i;
              API_BASE_URL = currentUrl;
              console.log(`Switched to working API URL: ${API_BASE_URL}`);
            }
            success = true;
            break;
          }
        } catch (err: any) {
          console.log(`Failed to connect to ${API_URLS[i]}: ${err.message || 'Unknown error'}`);
        }
      }

      if (!success || !response) {
        throw new Error('Failed to remove study from any API endpoint');
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
    } catch (err: any) {
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

      let response;
      let success = false;

      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const currentUrl = API_URLS[i];
          console.log(`Trying to add patient using: ${currentUrl}`);

          response = await fetch(`${currentUrl}/patients`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiPatient),
          });

          if (response.ok) {
            // Update the current API URL if it's different
            if (currentUrl !== API_BASE_URL) {
              currentApiUrlIndex = i;
              API_BASE_URL = currentUrl;
              console.log(`Switched to working API URL: ${API_BASE_URL}`);
            }
            success = true;
            break;
          }
        } catch (err: any) {
          console.log(`Failed to connect to ${API_URLS[i]}: ${err.message || 'Unknown error'}`);
        }
      }

      if (!success || !response) {
        throw new Error('Failed to add patient to any API endpoint');
      }

      const createdApiPatient = await response.json();

      // Transform the API response to match frontend model
      const createdPatient = transformPatient(createdApiPatient);

      // Update local state
      setPatients(prevPatients => [...prevPatients, createdPatient]);
      setError(null);
    } catch (err: any) {
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

      console.log('Saving analysis data to backend:', analysisData);

      // Create the data to be saved - include both the original image and gradcam data
      const dataToSave = {
        prediction: analysisData.prediction,
        confidenceScores: analysisData.confidenceScores,
        gradcam: analysisData.gradcam,
        // Use the correct property name that matches what's in analysisData
        originalImage: analysisData.originalImage || null,
        // Remove this if we're no longer using blob URLs
        // imageUrl: analysisData.imageUrl,
        uploadedFileNames: analysisData.uploadedFileNames || [],
        timestamp: analysisData.timestamp || new Date().toISOString(),
        // Save processing time information
        processingStartTime: analysisData.processingStartTime || null,
        processingEndTime: analysisData.processingEndTime || null,
        processingDuration: analysisData.processingDuration || null,
        currentElapsedTime: analysisData.currentElapsedTime || analysisData.processingDuration || null,
      };

      let response;
      let success = false;

      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const currentUrl = API_URLS[i];
          console.log(`Trying to update study analysis using: ${currentUrl}`);

          response = await fetch(`${currentUrl}/patients/${patientId}/studies/${studyId}/analysis`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSave),
          });

          if (response.ok) {
            // Update the current API URL if it's different
            if (currentUrl !== API_BASE_URL) {
              currentApiUrlIndex = i;
              API_BASE_URL = currentUrl;
              console.log(`Switched to working API URL: ${API_BASE_URL}`);
            }
            success = true;
            break;
          }
        } catch (err: any) {
          console.log(`Failed to connect to ${API_URLS[i]}: ${err.message || 'Unknown error'}`);
        }
      }

      if (!success || !response) {
        throw new Error('Failed to update study analysis on any API endpoint');
      }

      const result = await response.json();
      console.log('Backend response:', result);

      // Update local state
      setPatients(prevPatients => {
        return prevPatients.map(patient => {
          if (patient.id === patientId) {
            return {
              ...patient,
              studies: patient.studies.map(study => {
                if (study.id === studyId) {
                  console.log('Updating study with new analysis data');
                  return {
                    ...study,
                    status: result.status as 'scheduled' | 'in-progress' | 'completed',
                    analysisData: dataToSave  // Save the modified data with original image
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
    } catch (err: any) {
      console.error('Error updating study analysis:', err);
      setError('Failed to update study analysis. Please try again later.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const removePatient = async (patientId: string) => {
    try {
      setIsLoading(true);
      let response;
      let success = false;

      // Try each API URL until one works
      for (let i = 0; i < API_URLS.length; i++) {
        try {
          const currentUrl = API_URLS[i];
          console.log(`Trying to remove patient using: ${currentUrl}`);

          response = await fetch(`${currentUrl}/patients/${patientId}`, {
            method: 'DELETE',
          });

          if (response.ok) {
            // Update the current API URL if it's different
            if (currentUrl !== API_BASE_URL) {
              currentApiUrlIndex = i;
              API_BASE_URL = currentUrl;
              console.log(`Switched to working API URL: ${API_BASE_URL}`);
            }
            success = true;
            break;
          }
        } catch (err: any) {
          console.log(`Failed to connect to ${API_URLS[i]}: ${err.message || 'Unknown error'}`);
        }
      }

      if (!success || !response) {
        throw new Error('Failed to remove patient from any API endpoint');
      }

      // Update local state
      setPatients(prevPatients => prevPatients.filter(patient => patient.id !== patientId));

      setError(null);
    } catch (err: any) {
      console.error('Error removing patient:', err);
      setError('Failed to remove patient. Please try again later.');
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
      removePatient,
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