
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AccountingBudgetTabProps {
  onConfigureBudget: () => void;
}

const AccountingBudgetTab: React.FC<AccountingBudgetTabProps> = ({ onConfigureBudget }) => {
  return (
    <Card className="p-6">
      <div className="text-center text-gray-500">
        <h3 className="text-lg font-semibold mb-2">Budget prévisionnel</h3>
        <p className="text-sm mb-4">Planifiez et suivez votre budget prévisionnel</p>
        <Button onClick={onConfigureBudget}>
          Configurer le budget
        </Button>
      </div>
    </Card>
  );
};

export default AccountingBudgetTab;
