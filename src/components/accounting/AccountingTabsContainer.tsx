
import React from 'react';
import NavigationTabs from './NavigationTabs';
import AccountingTransactionsTab from './AccountingTransactionsTab';
import AccountingReportsTab from './AccountingReportsTab';
import AccountingBudgetTab from './AccountingBudgetTab';

interface Transaction {
  id: string;
  title: string;
  date: string;
  amount: number;
  isPositive: boolean;
  status: string;
  icon: React.ReactNode;
}

interface Tab {
  id: string;
  label: string;
  active: boolean;
}

interface AccountingTabsContainerProps {
  activeTab: string;
  tabs: Tab[];
  transactions: Transaction[];
  formatCurrency: (amount: number) => string;
  onTabChange: (tabId: string) => void;
  onTransactionDetails: (transaction: Transaction) => void;
  onGenerateReport: () => void;
  onConfigureBudget: () => void;
}

const AccountingTabsContainer: React.FC<AccountingTabsContainerProps> = ({
  activeTab,
  tabs,
  transactions,
  formatCurrency,
  onTabChange,
  onTransactionDetails,
  onGenerateReport,
  onConfigureBudget
}) => {
  return (
    <>
      <NavigationTabs tabs={tabs} onTabChange={onTabChange} />

      {activeTab === 'transactions' && (
        <AccountingTransactionsTab
          transactions={transactions}
          formatCurrency={formatCurrency}
          onTransactionDetails={onTransactionDetails}
        />
      )}

      {activeTab === 'rapports' && (
        <AccountingReportsTab onGenerateReport={onGenerateReport} />
      )}

      {activeTab === 'budget' && (
        <AccountingBudgetTab onConfigureBudget={onConfigureBudget} />
      )}
    </>
  );
};

export default AccountingTabsContainer;
