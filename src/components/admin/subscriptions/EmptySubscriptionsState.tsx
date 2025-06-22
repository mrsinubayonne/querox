
import React from 'react';
import { Mail } from 'lucide-react';

const EmptySubscriptionsState: React.FC = () => {
  return (
    <div className="text-center py-12 text-gray-500">
      <Mail className="w-12 h-12 mx-auto mb-4 text-gray-300" />
      <h3 className="text-lg font-medium mb-2">Aucun abonnement trouvé</h3>
      <p>Utilisez le formulaire ci-dessus pour créer le premier abonnement.</p>
    </div>
  );
};

export default EmptySubscriptionsState;
