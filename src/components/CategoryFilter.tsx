
import React from 'react';
import { Utensils, Soup, Cake, Wine, MenuSquare } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const getCategoryIcon = (category: string) => {
  const iconProps = { className: "w-4 h-4" }; // smaller icons
  const normalizedCategory = category.toLowerCase();
  if (normalizedCategory.includes('entrée')) return <Soup {...iconProps} />;
  if (normalizedCategory.includes('plat')) return <Utensils {...iconProps} />;
  if (normalizedCategory.includes('dessert')) return <Cake {...iconProps} />;
  if (normalizedCategory.includes('boisson')) return <Wine {...iconProps} />;
  if (normalizedCategory.includes('tous')) return <MenuSquare {...iconProps} />;
  return <Utensils {...iconProps} />;
};

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 overflow-x-auto pb-2 -mx-2 px-2">
        {categories.map((category) => (
          <button
            key={category}
            className={`flex-shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-colors duration-200 focus:outline-none
              ${
                activeCategory === category
                  ? "bg-emerald-600 text-white shadow"
                  : "bg-white text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
              }
            `}
            onClick={() => onCategoryChange(category)}
          >
            {getCategoryIcon(category)}
            <span className="whitespace-nowrap">{category}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
