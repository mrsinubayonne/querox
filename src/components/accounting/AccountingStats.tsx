
import React from 'react';
import StatsCard from './StatsCard';

interface StatData {
  title: string;
  value: string;
  currency: string;
  change: string;
  isPositive: boolean;
  icon: string;
}

interface AccountingStatsProps {
  stats: StatData[];
  onStatClick: (stat: StatData) => void;
}

const AccountingStats: React.FC<AccountingStatsProps> = ({ stats, onStatClick }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <StatsCard
          key={index}
          stat={stat}
          onClick={() => onStatClick(stat)}
        />
      ))}
    </div>
  );
};

export default AccountingStats;
