
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  isPositive: boolean;
  status: string;
  icon: React.ReactNode;
}

interface TransactionCardProps {
  transaction: Transaction;
  onViewDetails: () => void;
  formatCurrency: (amount: number) => string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onViewDetails, formatCurrency }) => {
  return (
    <Card className="bg-white border-0 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg">
              {transaction.icon}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{transaction.title}</h3>
              <p className="text-xs text-gray-500">{transaction.date}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className={`text-sm font-semibold ${
              transaction.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(transaction.amount)}
            </span>
            <Badge 
              className={`text-xs ${
                transaction.status === 'confirmé' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {transaction.status}
            </Badge>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onViewDetails}
            >
              Détails
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TransactionCard;
