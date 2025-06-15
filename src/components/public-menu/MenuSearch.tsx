
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MenuSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const MenuSearch: React.FC<MenuSearchProps> = ({
  searchTerm,
  onSearchTermChange,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border p-4 mb-8 sticky top-4 z-10">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Rechercher un plat..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-12 h-12 text-base border-gray-200 focus:border-emerald-400 focus:ring-emerald-400 rounded-lg"
          />
        </div>
    </div>
  );
};

export default MenuSearch;
