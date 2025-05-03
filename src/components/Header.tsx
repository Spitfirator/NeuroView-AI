import React from 'react';
import {Bell, Settings, User, Search } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center h-16 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center">
            <div className="flex items-center flex-shrink-0">
              <img
                src="/images/NeuroViewAI_logo.png"
                alt="NeuroView AI Logo"
                className="h-12"
              />
              <span className="ml-2.5 text-xl font-display font-semibold text-gray-900">NeuroView AI</span>
            </div>
            <div className="hidden lg:flex lg:ml-10">
              <div className="flex space-x-4">
                <a href="#" className="px-3 py-2 text-sm font-medium text-gray-900">Dashboard</a>
                <a href="#" className="px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-900">Research Study</a>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="flex-1 min-w-0 md:px-2 lg:px-0 xl:col-span-6">
              <div className="flex items-center px-6 py-4 md:max-w-3xl md:mx-auto lg:max-w-none lg:mx-0 xl:px-0">
                <div className="w-full">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="search"
                      className="block w-full rounded-md border-0 bg-gray-50 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-500 sm:text-sm sm:leading-6"
                      placeholder="Search patients or studies..."
                    />
                  </div>
                </div>
              </div>
            </div>

            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-50">
              <Bell className="h-6 w-6" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-500 rounded-lg hover:bg-gray-50">
              <Settings className="h-6 w-6" />
            </button>
            <div className="flex items-center">
              <div className="relative ml-3">
                <div className="flex items-center space-x-3">
                  <div className="flex flex-col items-end">
                    <span className="text-sm font-semibold text-gray-900">Dr. Neuroradiologist</span>
                    <span className="text-xs text-gray-500">Neuroradiologist</span>
                  </div>
                  <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}