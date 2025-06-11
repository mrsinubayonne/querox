
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface AccountingReportsTabProps {
  onGenerateReport: () => void;
}

const AccountingReportsTab: React.FC<AccountingReportsTabProps> = ({ onGenerateReport }) => {
  return (
    <Card className="p-6">
      <div className="text-center text-gray-500">
        <h3 className="text-lg font-semibold mb-2">Rapports mensuels</h3>
        <p className="text-sm mb-4">Générez et consultez vos rapports comptables mensuels</p>
        <Button onClick={onGenerateReport}>
          Générer rapport mensuel
        </Button>
      </div>
    </Card>
  );
};

export default AccountingReportsTab;
