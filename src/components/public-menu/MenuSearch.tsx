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
  return;
};
export default MenuSearch;