
import React from 'react';
import TransactionCard from './TransactionCard';

interface Transaction {
  id: number;
  title: string;
  date: string;
  amount: number;
  isPositive: boolean;
  status: string;
  icon: React.ReactNode;
}

interface AccountingTransactionsTabProps {
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  onTransactionDetails: (transaction: Transaction) => void;
}

const AccountingTransactionsTab: React.FC<AccountingTransactionsTabProps> = ({
  transactions,
  formatCurrency,
  onTransactionDetails
}) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-gray-900">
        Transactions récentes ({transactions.length})
      </h2>
      
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <TransactionCard
            key={transaction.id}
            transaction={transaction}
            formatCurrency={formatCurrency}
            onViewDetails={() => onTransactionDetails(transaction)}
          />
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Aucune transaction trouvée</p>
        </div>
      )}
    </div>
  );
};

export default AccountingTransactionsTab;
