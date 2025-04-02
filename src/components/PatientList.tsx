import React, { useState } from 'react';
import { Search, Plus, Filter, ChevronRight, Users, FileText, AlertCircle, BarChart, Clock } from 'lucide-react';
import { usePatients } from '../context/PatientContext';

interface PatientListProps {
  onPatientSelect: (id: string) => void;
}

interface Appointment {
  id: string;
  patientName: string;
  dateTime: string;
  details?: string;
}

const upcomingAppointments: Appointment[] = [
  {
    id: '1',
    patientName: 'Sarah Johnson',
    dateTime: '2024-03-15 09:00',
    details: 'Follow-up MRI'
  },
  {
    id: '2',
    patientName: 'Michael Chen',
    dateTime: '2024-03-16 10:30',
    details: 'Initial Consultation'
  },
  {
    id: '3',
    patientName: 'Emma Davis',
    dateTime: '2024-03-15 14:15',
    details: 'Post-op Review'
  },
  {
    id: '4',
    patientName: 'Robert Wilson',
    dateTime: '2024-03-17 11:00',
    details: 'Annual Check-up'
  }
];

export default function PatientList({ onPatientSelect }: PatientListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get patients from context
  const { patients } = usePatients();
  
  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => 
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.condition.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-gray-900">Patients</h1>
        <button className="btn">
          <Plus className="h-4 w-4 mr-2" />
          New Patient
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-sm font-medium text-gray-500">Today's Patients</h3>
            </div>
            <span className="text-2xl font-semibold text-gray-900">24</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-orange-600" />
              <h3 className="text-sm font-medium text-gray-500">Pending Reports</h3>
            </div>
            <span className="text-2xl font-semibold text-gray-900">8</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <h3 className="text-sm font-medium text-gray-500">Critical Cases</h3>
            </div>
            <span className="text-2xl font-semibold text-gray-900">3</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart className="h-5 w-5 text-green-600" />
              <h3 className="text-sm font-medium text-gray-500">Completed Today</h3>
            </div>
            <span className="text-2xl font-semibold text-gray-900">13</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn-secondary"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white rounded-lg border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2">
              <option value="">All</option>
              <option value="scheduled">Scheduled</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2">
              <option value="">All</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age Range</label>
            <select className="w-full rounded-md border border-gray-300 shadow-sm px-3 py-2">
              <option value="">All</option>
              <option value="0-18">0-18</option>
              <option value="19-30">19-30</option>
              <option value="31-50">31-50</option>
              <option value="51+">51+</option>
            </select>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {filteredPatients.length > 0 ? (
              <ul role="list" className="divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <li
                    key={patient.id}
                    className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                    onClick={() => onPatientSelect(patient.id)}
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-lg font-semibold text-blue-600">
                                {patient.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                              {patient.age} years • {patient.gender}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-sm text-gray-900">{patient.condition}</div>
                            <div className="text-sm text-gray-500">Last visit: {patient.lastVisit}</div>
                          </div>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              patient.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : patient.status === 'in-progress'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {patient.status.charAt(0).toUpperCase() + patient.status.slice(1)}
                          </span>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No patients found</h3>
                <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
            <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</a>
          </div>
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <Clock className="h-5 w-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{appointment.patientName}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(appointment.dateTime).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </p>
                  {appointment.details && (
                    <p className="text-sm text-gray-500 mt-1">{appointment.details}</p>
                  )}
                </div>
                <div className="flex-shrink-0">
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700">Details</a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}