
import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      {categories.map((category) => (
        <button
          key={category}
          className={`px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 flex-1 text-center
            ${
              activeCategory === category
                ? "bg-white text-emerald-600 shadow"
                : "text-gray-600 hover:bg-gray-200"
            }
          `}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
