
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import CategoryFilter from '@/components/CategoryFilter';

interface MenuSearchAndFilterProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const MenuSearchAndFilter: React.FC<MenuSearchAndFilterProps> = ({
  searchTerm,
  onSearchTermChange,
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Rechercher un plat..."
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              className="pl-10 h-12 text-lg border-gray-200 focus:border-orange-300 focus:ring-orange-200"
            />
          </div>
        </div>
        <div className="lg:w-auto">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={onCategoryChange}
          />
        </div>
      </div>
    </div>
  );
};

export default MenuSearchAndFilter;
