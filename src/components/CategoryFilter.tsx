
import React from 'react';
import { Utensils, Soup, Cake, Wine, MenuSquare } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const getCategoryIcon = (category: string) => {
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes('entrée')) return <Soup className="w-8 h-8 mb-2" />;
  if (normalizedCategory.includes('plat')) return <Utensils className="w-8 h-8 mb-2" />;
  if (normalizedCategory.includes('dessert')) return <Cake className="w-8 h-8 mb-2" />;
  if (normalizedCategory.includes('boisson')) return <Wine className="w-8 h-8 mb-2" />;
  if (normalizedCategory.includes('tous')) return <MenuSquare className="w-8 h-8 mb-2" />;
  return <Utensils className="w-8 h-8 mb-2" />;
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="w-full">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((category) => (
          <button
            key={category}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl text-center transition-all duration-300 transform hover:-translate-y-1 group
              ${
                activeCategory === category
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-white text-gray-700 hover:bg-emerald-50 shadow-md"
              }
            `}
            onClick={() => onCategoryChange(category)}
          >
            <div className={`transition-colors duration-300 ${activeCategory !== category ? 'group-hover:text-emerald-600' : ''}`}>
              {getCategoryIcon(category)}
            </div>
            <span className="font-semibold text-sm">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
