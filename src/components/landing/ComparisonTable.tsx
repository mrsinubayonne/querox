
import React from 'react';
import { Check, X } from "lucide-react";
import { featureComparison } from './pricingData';

const ComparisonTable: React.FC = () => {
  const renderFeatureValue = (value: any) => {
    if (value === true) return <Check className="h-5 w-5 text-green-500 mx-auto" />;
    if (value === false) return <X className="h-5 w-5 text-red-500 mx-auto" />;
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <div className="mt-20">
      <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
        Comparaison détaillée des fonctionnalités
      </h3>
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Fonctionnalités
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Starter
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 bg-primary/10">
                  Professionnel
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                  Enterprise VIP
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {featureComparison.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.feature}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderFeatureValue(item.starter)}
                  </td>
                  <td className="px-6 py-4 text-center bg-primary/5">
                    {renderFeatureValue(item.pro)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    {renderFeatureValue(item.enterprise)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ComparisonTable;
