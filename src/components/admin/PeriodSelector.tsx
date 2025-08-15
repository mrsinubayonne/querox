
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PeriodSelectorProps {
  value: 'monthly' | 'quarterly' | 'yearly';
  onChange: (value: 'monthly' | 'quarterly' | 'yearly') => void;
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({ value, onChange }) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sélectionner la période" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="monthly">Mensuel</SelectItem>
        <SelectItem value="quarterly">Trimestriel</SelectItem>
        <SelectItem value="yearly">Annuel</SelectItem>
      </SelectContent>
    </Select>
  );
};

export default PeriodSelector;
