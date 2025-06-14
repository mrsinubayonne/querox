
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Plus, Menu, Search, Filter } from 'lucide-react';

interface AccountingHeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearch: () => void;
  onFilter: () => void;
  onExport: () => void;
  onNewTransaction: () => void;
}

const AccountingHeader: React.FC<AccountingHeaderProps> = ({
  searchTerm,
  onSearchChange,
  onSearch,
  onFilter,
  onExport,
  onNewTransaction
}) => {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="sm" className="p-1.5">
          <Menu size={18} />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Comptabilité</h1>
      </div>
      <div className="flex space-x-2">
        <div className="flex items-center space-x-2">
          <Input
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-48 text-xs"
          />
          <Button variant="outline" size="sm" onClick={onSearch}>
            <Search size={14} />
          </Button>
          <Button variant="outline" size="sm" onClick={onFilter}>
            <Filter size={14} />
          </Button>
        </div>
        <Button variant="outline" className="flex items-center space-x-2 text-xs px-3 py-2" onClick={onExport}>
          <Download size={14} />
          <span>Exporter</span>
        </Button>
        <Button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-xs px-3 py-2" onClick={onNewTransaction}>
          <Plus size={14} />
          <span>Nouvelle transaction</span>
        </Button>
      </div>
    </div>
  );
};

export default AccountingHeader;
