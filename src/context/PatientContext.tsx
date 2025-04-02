import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define types
export interface Study {
  id: string;
  date: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed';
  findings: string;
  thumbnailUrl: string;
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

// Initial mock data
const initialPatients: Patient[] = [
  {
    id: '1',
    name: 'Sarah Thompson',
    age: 45,
    gender: 'Female',
    lastVisit: '2024-02-28',
    dateOfBirth: '1979-03-15',
    phone: '(555) 123-4567',
    email: 'sarah@example.com',
    address: '123 Main St, Anytown, USA',
    insurance: 'Healthcare Plus',
    policyNumber: 'HP123456789',
    emergencyContact: 'John Thompson (Husband) - (555) 987-6543',
    medicalHistory: ['Hypertension - Diagnosed 2020', 'Migraine - Ongoing'],
    medications: ['Lisinopril 10mg daily', 'Sumatriptan as needed'],
    allergies: ['Penicillin'],
    status: 'scheduled',
    condition: 'Follow-up MRI',
    studies: [
      {
        id: '1',
        date: '2024-03-10',
        type: 'MRI Brain',
        status: 'completed',
        findings: 'Normal study',
        thumbnailUrl: 'https://images.unsplash.com/photo-1583911860205-72f8ac8ddcbe?auto=format&fit=crop&q=80&w=200'
      }
    ]
  },
  {
    id: '2',
    name: 'Michael Chen',
    age: 62,
    gender: 'Male',
    lastVisit: '2024-02-27',
    dateOfBirth: '1962-06-10',
    phone: '(555) 234-5678',
    email: 'michael@example.com',
    address: '456 Oak St, Anytown, USA',
    insurance: 'MediCare',
    policyNumber: 'MC987654321',
    emergencyContact: 'Lisa Chen (Daughter) - (555) 876-5432',
    medicalHistory: ['Type 2 Diabetes - Diagnosed 2015', 'Hypertension - Diagnosed 2018'],
    medications: ['Metformin 1000mg twice daily', 'Amlodipine 5mg daily'],
    allergies: ['Sulfa drugs'],
    status: 'completed',
    condition: 'Post-treatment Assessment',
    studies: [
      {
        id: '2',
        date: '2024-02-15',
        type: 'MRI Brain with contrast',
        status: 'completed',
        findings: 'Small lesion detected',
        thumbnailUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&q=80&w=200'
      }
    ]
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    age: 35,
    gender: 'Female',
    lastVisit: '2024-02-26',
    dateOfBirth: '1989-11-23',
    phone: '(555) 345-6789',
    email: 'emily@example.com',
    address: '789 Pine St, Anytown, USA',
    insurance: 'BlueShield',
    policyNumber: 'BS456789123',
    emergencyContact: 'Roberto Rodriguez (Brother) - (555) 765-4321',
    medicalHistory: ['Anxiety - Ongoing'],
    medications: ['Sertraline 50mg daily'],
    allergies: [],
    status: 'in-progress',
    condition: 'Initial Screening',
    studies: []
  }
];

// Context type
interface PatientContextType {
  patients: Patient[];
  getPatient: (id: string) => Patient | undefined;
  addStudy: (patientId: string, study: Omit<Study, 'id'>) => void;
  removeStudy: (patientId: string, studyId: string) => void;
}

// Create context
const PatientContext = createContext<PatientContextType | undefined>(undefined);

// Provider component
export const PatientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(initialPatients);

  const getPatient = (id: string) => {
    return patients.find(patient => patient.id === id);
  };

  const addStudy = (patientId: string, study: Omit<Study, 'id'>) => {
    setPatients(prevPatients => {
      return prevPatients.map(patient => {
        if (patient.id === patientId) {
          // Generate a unique ID for the new study
          const newStudyId = `study-${Date.now()}`;
          
          // Add the new study to this patient
          return {
            ...patient,
            studies: [
              ...patient.studies,
              {
                ...study,
                id: newStudyId
              }
            ]
          };
        }
        return patient;
      });
    });
  };

  const removeStudy = (patientId: string, studyId: string) => {
    setPatients(prevPatients => {
      return prevPatients.map(patient => {
        if (patient.id === patientId) {
          // Remove the specified study
          return {
            ...patient,
            studies: patient.studies.filter(study => study.id !== studyId)
          };
        }
        return patient;
      });
    });
  };

  return (
    <PatientContext.Provider value={{ patients, getPatient, addStudy, removeStudy }}>
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