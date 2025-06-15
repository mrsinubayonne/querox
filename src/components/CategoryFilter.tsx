
import React from 'react';

interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const categoryImages: { [key: string]: string } = {
  'tous': 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max',
  'entrée': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max',
  'plat': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max',
  'dessert': 'https://images.unsplash.com/photo-1551024601-bec78c8449ee?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max',
  'boisson': 'https://images.unsplash.com/photo-1497515114629-48446e82f853?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max',
  'default': 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=400&fit=max'
};

const getCategoryImage = (category: string) => {
  const normalizedCategory = category.toLowerCase();
  
  if (normalizedCategory.includes('entrée')) return categoryImages['entrée'];
  if (normalizedCategory.includes('plat')) return categoryImages['plat'];
  if (normalizedCategory.includes('dessert')) return categoryImages['dessert'];
  if (normalizedCategory.includes('boisson')) return categoryImages['boisson'];
  if (normalizedCategory.includes('tous')) return categoryImages['tous'];
  
  return categoryImages['default'];
};


const CategoryFilter: React.FC<CategoryFilterProps> = ({ 
  categories, 
  activeCategory, 
  onCategoryChange 
}) => {
  return (
    <div className="w-full">
      <div className="flex items-center space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => onCategoryChange(category)}
            className={`flex-shrink-0 w-24 h-28 text-center rounded-xl overflow-hidden transition-all duration-300 focus:outline-none group shadow-md
              ${activeCategory === category ? 'ring-4 ring-emerald-500 ring-offset-2 ring-offset-emerald-50/50' : 'ring-1 ring-gray-200 hover:ring-emerald-300'}
            `}
          >
            <div className="relative w-full h-20 overflow-hidden">
              <img 
                src={getCategoryImage(category)} 
                alt={category} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
            <div className={`w-full h-8 flex items-center justify-center font-semibold text-sm transition-colors duration-200
              ${activeCategory === category ? 'bg-emerald-600 text-white' : 'bg-white text-gray-800'}
            `}>
              <span className="whitespace-nowrap">{category}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
