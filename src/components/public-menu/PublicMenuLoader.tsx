
import React from 'react';

const PublicMenuLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-6"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Chargement du menu...</h2>
          <p className="text-gray-500">Préparation de nos délicieux plats</p>
        </div>
      </div>
    </div>
  );
};

export default PublicMenuLoader;
