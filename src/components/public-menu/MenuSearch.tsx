
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface MenuSearchProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

const MenuSearch: React.FC<MenuSearchProps> = ({
  searchTerm,
  onSearchTermChange
}) => {
  return (
    <div className="relative mb-8 max-w-lg mx-auto">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
      <Input
        type="search"
        placeholder="Rechercher un plat..."
        className="w-full pl-12 pr-4 py-3 text-base rounded-full bg-white shadow-sm border-gray-200 focus:ring-emerald-500 focus:border-emerald-500"
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
    </div>
  );
};

export default MenuSearch;
