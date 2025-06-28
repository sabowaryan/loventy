import React from 'react';
import { useFeatureFlag } from '../contexts/DevCycleContext';

const ExampleFeatureFlag: React.FC = () => {
  // Vérifier si la fonctionnalité est activée
  const isNewFeatureEnabled = useFeatureFlag('new_feature', false);
  
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Exemple de Feature Flag</h3>
      
      {isNewFeatureEnabled ? (
        <div className="p-3 bg-green-100 text-green-800 rounded">
          <p>🎉 La nouvelle fonctionnalité est activée !</p>
          <p className="text-sm mt-1">Cette fonctionnalité est contrôlée par DevCycle.</p>
        </div>
      ) : (
        <div className="p-3 bg-gray-100 text-gray-800 rounded">
          <p>La nouvelle fonctionnalité n'est pas encore disponible.</p>
          <p className="text-sm mt-1">Activez-la dans votre dashboard DevCycle.</p>
        </div>
      )}
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Pour activer cette fonctionnalité, configurez le feature flag 'new_feature' dans votre dashboard DevCycle.</p>
      </div>
    </div>
  );
};

export default ExampleFeatureFlag;