import React, { useState, useEffect } from 'react';
import AdminPanel from './Dashboard';
import { useDatabase } from '../../hooks/useDatabase';
import { WeddingDetails, GuestInfo, DrinkOptions, WeddingTexts } from '../../data/weddingData';

export default function MySpacePage() {
  const [weddingDetails, setWeddingDetails] = useState<WeddingDetails | null>(null);
  const [guestInfo, setGuestInfo] = useState<GuestInfo | null>(null);
  const [drinkOptions, setDrinkOptions] = useState<DrinkOptions | null>(null);
  const [weddingTexts, setWeddingTexts] = useState<WeddingTexts | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { loadWeddingData } = useDatabase();

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await loadWeddingData();
        if (data) {
          setWeddingDetails(data.weddingDetails);
          setGuestInfo(data.guestInfo);
          setDrinkOptions(data.drinkOptions);
          setWeddingTexts(data.weddingTexts);
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [loadWeddingData]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!weddingDetails || !guestInfo || !drinkOptions || !weddingTexts) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="mb-8">
            <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Données non trouvées
            </h1>
            <p className="text-gray-600 mb-6">
              Aucune donnée de mariage n'a été trouvée dans la base locale. 
              Veuillez initialiser les données ou importer une base existante.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition-colors"
            >
              Recharger la page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminPanel
      weddingDetails={weddingDetails as any}
      onSave={() => {}}
      onPreview={() => {}}
    />
  );
} 