
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Filter } from 'lucide-react';

interface EventsHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterStatus: string;
  onSearch: () => void;
  onFilter: () => void;
  onNewEvent: () => void;
}

const EventsHeader: React.FC<EventsHeaderProps> = ({
  searchTerm,
  onSearchChange,
  filterStatus,
  onSearch,
  onFilter,
  onNewEvent
}) => {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100/50 px-8 py-6 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent">
            Événements
          </h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            Gérez les événements spéciaux de votre restaurant
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-48"
            />
            <Button variant="outline" className="shadow-sm" onClick={onSearch}>
              <Search size={16} className="mr-2" />
              Rechercher
            </Button>
          </div>
          <Button variant="outline" className="shadow-sm" onClick={onFilter}>
            <Filter size={16} className="mr-2" />
            Filtres ({filterStatus})
          </Button>
          <Button 
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 hover:from-purple-700 hover:via-pink-700 hover:to-red-700 shadow-lg shadow-purple-500/25"
            onClick={onNewEvent}
          >
            <Plus size={16} className="mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>
    </header>
  );
};

export default EventsHeader;
