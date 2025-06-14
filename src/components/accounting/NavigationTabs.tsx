
import React from 'react';

interface Tab {
  id: string;
  label: string;
  active: boolean;
}

interface NavigationTabsProps {
  tabs: Tab[];
  onTabChange: (tabId: string) => void;
}

const NavigationTabs: React.FC<NavigationTabsProps> = ({ tabs, onTabChange }) => {
  return (
    <div className="flex space-x-6 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`pb-2 px-1 text-xs font-medium border-b-2 transition-colors ${
            tab.active 
              ? 'border-black text-black' 
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default NavigationTabs;
