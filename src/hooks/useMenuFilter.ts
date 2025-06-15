
import { useState, useMemo } from 'react';
import { MenuItem } from '@/types/menu';

export const useMenuFilter = (menuItems: MenuItem[]) => {
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredItems = useMemo(() => {
    let filtered = menuItems;

    if (activeCategory !== 'Tous') {
      filtered = filtered.filter(item => item.category_name === activeCategory);
    }

    if (searchTerm.trim() !== '') {
      const lowercasedTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(lowercasedTerm) ||
        (item.description && item.description.toLowerCase().includes(lowercasedTerm))
      );
    }

    return filtered;
  }, [menuItems, activeCategory, searchTerm]);

  const categories = useMemo(() => {
    return ['Tous', ...Array.from(new Set(menuItems.map(item => item.category_name)))];
  }, [menuItems]);

  const groupedItems = useMemo(() => {
    return filteredItems.reduce((acc, item) => {
      const category = item.category_name || 'Autres';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);
  }, [filteredItems]);

  return {
    filteredItems,
    activeCategory,
    setActiveCategory,
    searchTerm,
    setSearchTerm,
    categories,
    groupedItems,
  };
};

