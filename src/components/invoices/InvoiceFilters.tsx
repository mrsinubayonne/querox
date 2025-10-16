import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface InvoiceFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  onReset: () => void;
}

const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onReset
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Rechercher une facture..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={onStatusFilterChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Tous les statuts" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Tous les statuts</SelectItem>
          <SelectItem value="paid">Payées</SelectItem>
          <SelectItem value="unpaid">En attente</SelectItem>
          <SelectItem value="overdue">En retard</SelectItem>
        </SelectContent>
      </Select>

      {(searchQuery || statusFilter !== 'all') && (
        <Button variant="outline" onClick={onReset}>
          <X className="w-4 h-4 mr-2" />
          Réinitialiser
        </Button>
      )}
    </div>
  );
};

export default InvoiceFilters;
