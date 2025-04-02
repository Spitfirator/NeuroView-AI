import React from 'react';
import { Users, Brain, BarChart as ChartBar, Calendar, Settings, HelpCircle, BookOpen } from 'lucide-react';

interface SidebarProps {
  selectedView: 'patients' | 'analysis' | 'calendar' | 'studies';
  onViewChange: (view: 'patients' | 'analysis' | 'calendar' | 'studies') => void;
}

export default function Sidebar({ selectedView, onViewChange }: SidebarProps) {
  const navigation = [
    { name: 'Patients', icon: Users, view: 'patients' as const },
    { name: 'Calendar', icon: Calendar, view: 'calendar' as const },
    { name: 'Studies', icon: BookOpen, view: 'studies' as const },
    { name: 'Statistics', icon: ChartBar, view: 'statistics' as const },
  ];

  const secondaryNavigation = [
    { name: 'Settings', icon: Settings },
    { name: 'Help', icon: HelpCircle },
  ];

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:z-10 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
        <nav className="flex flex-1 flex-col py-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => (
                  <li key={item.name}>
                    <button
                      onClick={() => onViewChange(item.view)}
                      className={`
                        group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold w-full
                        ${selectedView === item.view
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                        }
                      `}
                    >
                      <item.icon
                        className={`h-6 w-6 shrink-0 ${
                          selectedView === item.view ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
                        }`}
                      />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <div className="text-xs font-semibold leading-6 text-gray-400">Settings</div>
              <ul role="list" className="-mx-2 mt-2 space-y-1">
                {secondaryNavigation.map((item) => (
                  <li key={item.name}>
                    <button
                      className="group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold text-gray-700 hover:text-blue-600 hover:bg-gray-50 w-full"
                    >
                      <item.icon className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-blue-600" />
                      {item.name}
                    </button>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
} 