import React, { useState, useRef, useEffect } from 'react';
import { WeddingData } from '../../lib/database';
import { useDatabase } from '../../hooks/useDatabase';
import { saveWeddingData } from '../../lib/database';

interface InvitationEditModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (details: WeddingData) => void;
  initialDetails: WeddingData;
}

const steps = [
  { label: 'Couple', color: 'text-secondary' },
  { label: 'Date & Lieux', color: 'text-secondary' },
  { label: 'Textes Invitation', color: 'text-secondary' },
  { label: 'Boissons', color: 'text-secondary' },
  { label: 'Résumé', color: 'text-primary' }
];

const InvitationEditModal: React.FC<InvitationEditModalProps> = ({ open, onClose, onSave, initialDetails }) => {
  const [details, setDetails] = useState<WeddingData>(initialDetails);
  const [step, setStep] = useState(0);
  const [alcoholicDrinks, setAlcoholicDrinks] = useState<string[]>(['Bière', 'Vin rouge', 'Vin blanc', 'Champagne', 'Whisky', 'Vodka']);
  const [nonAlcoholicDrinks, setNonAlcoholicDrinks] = useState<string[]>(['Eau', 'Jus de fruits', 'Soda', 'Café', 'Thé', 'Jus de gingembre']);
  const [showDrinkModal, setShowDrinkModal] = useState(false);
  const [drinkType, setDrinkType] = useState<'alcoholic' | 'nonAlcoholic'>('alcoholic');
  const [newDrinkName, setNewDrinkName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const drinkInputRef = useRef<HTMLInputElement>(null);
  const { loadWeddingData } = useDatabase();

  // Charger les données existantes depuis la base de données ou utiliser les données passées
  const loadExistingData = async () => {
    try {
      // Si on a des données initiales complètes, les utiliser
      if (initialDetails && Object.keys(initialDetails).length > 0) {
        setDetails(initialDetails);
        
        // Charger les boissons depuis les données initiales
        if (initialDetails.alcoholic_drinks) {
          try {
            const alcoholic = JSON.parse(initialDetails.alcoholic_drinks);
            if (Array.isArray(alcoholic)) {
              setAlcoholicDrinks(alcoholic);
            }
          } catch (e) {
            console.warn('Erreur lors du parsing des boissons alcoolisées:', e);
          }
        }
        
        if (initialDetails.non_alcoholic_drinks) {
          try {
            const nonAlcoholic = JSON.parse(initialDetails.non_alcoholic_drinks);
            if (Array.isArray(nonAlcoholic)) {
              setNonAlcoholicDrinks(nonAlcoholic);
            }
          } catch (e) {
            console.warn('Erreur lors du parsing des boissons non-alcoolisées:', e);
          }
        }
      } else {
        // Sinon, charger depuis la base de données
        const existingData = await loadWeddingData();
        if (existingData) {
          setDetails(existingData.weddingDetails as unknown as WeddingData);
          setAlcoholicDrinks(existingData.drinkOptions.alcoholic ?? ['Bière', 'Vin rouge', 'Vin blanc', 'Champagne', 'Whisky', 'Vodka']);
          setNonAlcoholicDrinks(existingData.drinkOptions.nonAlcoholic ?? ['Eau', 'Jus de fruits', 'Soda', 'Café', 'Thé', 'Jus de gingembre']);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données existantes:', error);
      // En cas d'erreur, utiliser les valeurs par défaut
      setToast('Erreur lors du chargement des données existantes');
      setTimeout(() => setToast(null), 2500);
    }
  };

  useEffect(() => {
    if (open && firstInputRef.current) {
      firstInputRef.current.focus();
    }
    if (open) {
      setDetails(initialDetails);
      setStep(0);
      loadExistingData();
    }
  }, [open, initialDetails]);

  useEffect(() => {
    if (showDrinkModal && drinkInputRef.current) {
      drinkInputRef.current.focus();
    }
  }, [showDrinkModal]);

  if (!open) return null;

  const nextStep = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      await saveWeddingData({
        ...details,
        alcoholic_drinks: JSON.stringify(alcoholicDrinks),
        non_alcoholic_drinks: JSON.stringify(nonAlcoholicDrinks)
      });
      onSave({
        ...details,
        alcoholic_drinks: JSON.stringify(alcoholicDrinks),
        non_alcoholic_drinks: JSON.stringify(nonAlcoholicDrinks)
      });
      onClose();
      setToast('Invitation mise à jour avec succès !');
      setTimeout(() => setToast(null), 2500);
    } catch (error) {
      setToast('Erreur lors de la sauvegarde: ' + (error instanceof Error ? error.message : 'Erreur inconnue'));
      setTimeout(() => setToast(null), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const addAlcoholicDrink = () => {
    setShowDrinkModal(true);
    setDrinkType('alcoholic');
    setNewDrinkName('');
  };

  const removeAlcoholicDrink = (index: number) => {
    setAlcoholicDrinks(prev => prev.filter((_, i) => i !== index));
  };

  const addNonAlcoholicDrink = () => {
    setShowDrinkModal(true);
    setDrinkType('nonAlcoholic');
    setNewDrinkName('');
  };

  const removeNonAlcoholicDrink = (index: number) => {
    setNonAlcoholicDrinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddDrink = () => {
    if (newDrinkName.trim()) {
      if (drinkType === 'alcoholic') {
        setAlcoholicDrinks(prev => [...prev, newDrinkName.trim()]);
      } else {
        setNonAlcoholicDrinks(prev => [...prev, newDrinkName.trim()]);
      }
      setNewDrinkName('');
      setShowDrinkModal(false);
    }
  };

  const handleCancelDrink = () => {
    setNewDrinkName('');
    setShowDrinkModal(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDrink();
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-2xl shadow-2xl p-2 xs:p-4 sm:p-8 w-full max-w-[98vw] xs:max-w-md sm:max-w-lg mx-2 xs:mx-4 border border-gray-100 animate-fade-in relative max-h-[95vh] overflow-y-auto transition-all duration-300">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-neutral-400 hover:text-secondary text-2xl font-bold focus:outline-none"
            aria-label="Fermer"
          >
            ×
          </button>
          
          {/* Steps raffinés */}
          <div className="flex items-center justify-center mb-2 mt-2">
            {steps.map((s, idx) => (
              <div key={s.label} className="flex items-center">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs border-2 ${step === idx ? 'bg-secondary text-white border-secondary scale-110 shadow-secondary shadow' : 'bg-neutral-100 text-neutral-400 border-neutral-200'} transition-all duration-200`}>{idx + 1}</div>
                {idx < steps.length - 1 && <div className="w-4 h-0.5 bg-neutral-200 mx-1 rounded" />}
              </div>
            ))}
          </div>
          
          <div className="text-center mb-4 mt-2 font-serif text-lg font-semibold tracking-wide">
            <span className={steps[step].color}>{steps[step].label}</span>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Étape 1 : Couple */}
            {step === 0 && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="form-label mb-1">Nom du marié</label>
                    <input
                      ref={firstInputRef}
                      type="text"
                      value={details.groom_name}
                      onChange={e => setDetails(prev => ({ ...prev, groom_name: e.target.value }))}
                      className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>
                  <div>
                    <label className="form-label mb-1">Nom de la mariée</label>
                    <input
                      type="text"
                      value={details.bride_name}
                      onChange={e => setDetails(prev => ({ ...prev, bride_name: e.target.value }))}
                      className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="form-label mb-1">Photo du couple (URL)</label>
                  <input
                    type="url"
                    value={details.couple_photo}
                    onChange={e => setDetails(prev => ({ ...prev, couple_photo: e.target.value }))}
                    className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}

            {/* Étape 2 : Date & Lieux */}
            {step === 1 && (
              <div className="space-y-6">
                {/* Section Date */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-primary mb-4">📅 Date du mariage</h3>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-3">
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Jour</label>
                      <input
                        type="text"
                        value={details.wedding_day}
                        onChange={e => setDetails(prev => ({ ...prev, wedding_day: e.target.value }))}
                        className="form-input w-full px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="09"
                      />
                    </div>
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Mois</label>
                      <input
                        type="text"
                        value={details.wedding_month}
                        onChange={e => setDetails(prev => ({ ...prev, wedding_month: e.target.value }))}
                        className="form-input w-full px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="NOVEMBRE"
                      />
                    </div>
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Année</label>
                      <input
                        type="text"
                        value={details.wedding_year}
                        onChange={e => setDetails(prev => ({ ...prev, wedding_year: e.target.value }))}
                        className="form-input w-full px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="2024"
                      />
                    </div>
                    <div className="col-span-2 xs:col-span-1">
                      <label className="form-label mb-1 text-xs sm:text-sm">Jour semaine</label>
                      <input
                        type="text"
                        value={details.wedding_day_of_week}
                        onChange={e => setDetails(prev => ({ ...prev, wedding_day_of_week: e.target.value }))}
                        className="form-input w-full px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="SAMEDI"
                      />
                    </div>
                    <div className="col-span-2 xs:col-span-1">
                      <label className="form-label mb-1 text-xs sm:text-sm">Heure</label>
                      <input
                        type="text"
                        value={details.wedding_time}
                        onChange={e => setDetails(prev => ({ ...prev, wedding_time: e.target.value }))}
                        className="form-input w-full px-2 sm:px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="15:30"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Cérémonie */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-primary mb-4">⛪ Cérémonie</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="form-label mb-1 text-xs sm:text-sm">Heure</label>
                        <input
                          type="text"
                          value={details.ceremony_time}
                          onChange={e => setDetails(prev => ({ ...prev, ceremony_time: e.target.value }))}
                          className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                          placeholder="15h30"
                        />
                      </div>
                      <div>
                        <label className="form-label mb-1 text-xs sm:text-sm">Lieu</label>
                        <input
                          type="text"
                          value={details.ceremony_venue}
                          onChange={e => setDetails(prev => ({ ...prev, ceremony_venue: e.target.value }))}
                          className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                          placeholder="Église ciel ouvert"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Adresse</label>
                      <input
                        type="text"
                        value={details.ceremony_address}
                        onChange={e => setDetails(prev => ({ ...prev, ceremony_address: e.target.value }))}
                        className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="Av. KONGAWI n°12, Q/Kinsuka-pecheur, C/Ngaliema"
                      />
                    </div>
                  </div>
                </div>

                {/* Section Réception */}
                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-primary mb-4">🍾 Réception</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="form-label mb-1 text-xs sm:text-sm">Heure</label>
                        <input
                          type="text"
                          value={details.reception_time}
                          onChange={e => setDetails(prev => ({ ...prev, reception_time: e.target.value }))}
                          className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                          placeholder="20h00"
                        />
                      </div>
                      <div>
                        <label className="form-label mb-1 text-xs sm:text-sm">Lieu</label>
                        <input
                          type="text"
                          value={details.reception_venue}
                          onChange={e => setDetails(prev => ({ ...prev, reception_venue: e.target.value }))}
                          className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                          placeholder="Salle de fête food market"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Adresse</label>
                      <input
                        type="text"
                        value={details.reception_address}
                        onChange={e => setDetails(prev => ({ ...prev, reception_address: e.target.value }))}
                        className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        placeholder="Av.Nguma, Réf. église Catholique saint Luc"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Étape 3 : Textes Invitation */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="form-label mb-1">Message d'accueil</label>
                  <input
                    type="text"
                    value={details.welcome_message}
                    onChange={e => setDetails(prev => ({ ...prev, welcome_message: e.target.value }))}
                    className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Titre de l'invitation</label>
                  <input
                    type="text"
                    value={details.invitation_title}
                    onChange={e => setDetails(prev => ({ ...prev, invitation_title: e.target.value }))}
                    className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Citation d'amour</label>
                  <textarea
                    value={details.invitation_love_quote}
                    onChange={e => setDetails(prev => ({ ...prev, invitation_love_quote: e.target.value }))}
                    className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Message principal</label>
                  <textarea
                    value={details.invitation_main_message}
                    onChange={e => setDetails(prev => ({ ...prev, invitation_main_message: e.target.value }))}
                    className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="form-label mb-1">Message de date</label>
                  <input
                    type="text"
                    value={details.invitation_date_message}
                    onChange={e => setDetails(prev => ({ ...prev, invitation_date_message: e.target.value }))}
                    className="form-input w-full px-4 py-2 border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                  />
                </div>
              </div>
            )}

            {/* Étape 4 : Boissons */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Textes des préférences */}
                <div className="bg-purple-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-primary mb-4">📝 Textes des préférences</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Titre</label>
                      <input
                        type="text"
                        value={details.preferences_title}
                        onChange={e => setDetails(prev => ({ ...prev, preferences_title: e.target.value }))}
                        className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Sous-titre</label>
                      <input
                        type="text"
                        value={details.preferences_subtitle}
                        onChange={e => setDetails(prev => ({ ...prev, preferences_subtitle: e.target.value }))}
                        className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Description</label>
                      <textarea
                        value={details.preferences_description}
                        onChange={e => setDetails(prev => ({ ...prev, preferences_description: e.target.value }))}
                        className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="form-label mb-1 text-xs sm:text-sm">Limitation</label>
                      <input
                        type="text"
                        value={details.preferences_limitation}
                        onChange={e => setDetails(prev => ({ ...prev, preferences_limitation: e.target.value }))}
                        className="form-input w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg focus:ring-2 focus:ring-secondary"
                      />
                    </div>
                  </div>
                </div>

                {/* Boissons alcoolisées */}
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">🍷 Boissons alcoolisées</h3>
                    <button
                      type="button"
                      onClick={addAlcoholicDrink}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(alcoholicDrinks) && alcoholicDrinks.map((drink, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">{drink}</span>
                        <button
                          type="button"
                          onClick={() => removeAlcoholicDrink(index)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Boissons non-alcoolisées */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-primary">🥤 Boissons non-alcoolisées</h3>
                    <button
                      type="button"
                      onClick={addNonAlcoholicDrink}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      + Ajouter
                    </button>
                  </div>
                  <div className="space-y-2">
                    {Array.isArray(nonAlcoholicDrinks) && nonAlcoholicDrinks.map((drink, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                        <span className="text-sm">{drink}</span>
                        <button
                          type="button"
                          onClick={() => removeNonAlcoholicDrink(index)}
                          className="text-blue-500 hover:text-blue-700 text-sm"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Étape 5 : Résumé */}
            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-primary mb-4">📋 Résumé de votre invitation</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div><b>Couple :</b> {details.groom_name} & {details.bride_name}</div>
                  <div><b>Date :</b> {details.wedding_day_of_week} {details.wedding_day} {details.wedding_month} {details.wedding_year} à {details.wedding_time}</div>
                  <div><b>Cérémonie :</b> {details.ceremony_time} - {details.ceremony_venue}</div>
                  <div><b>Réception :</b> {details.reception_time} - {details.reception_venue}</div>
                  <div><b>Titre invitation :</b> {details.invitation_title}</div>
                  <div><b>Message principal :</b> {details.invitation_main_message}</div>
                  <div><b>Préférences :</b> {details.preferences_title}, {details.preferences_subtitle}, {details.preferences_description}, {details.preferences_limitation}</div>
                  <div><b>Boissons alcoolisées :</b> {Array.isArray(alcoholicDrinks) ? alcoholicDrinks.join(', ') : 'Erreur de chargement'}</div>
                  <div><b>Boissons non-alcoolisées :</b> {Array.isArray(nonAlcoholicDrinks) ? nonAlcoholicDrinks.join(', ') : 'Erreur de chargement'}</div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={prevStep}
                disabled={step === 0}
                className="px-4 py-2 text-secondary border border-secondary rounded-lg hover:bg-secondary hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-light transition-colors"
                >
                  Suivant
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sauvegarde...</span>
                    </>
                  ) : (
                    <span>Sauvegarder</span>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Modal personnalisé pour l'ajout de boissons */}
      {showDrinkModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4 border border-gray-100 animate-fade-in">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-primary mb-2">
                Ajouter une boisson {drinkType === 'alcoholic' ? 'alcoolisée' : 'non-alcoolisée'}
              </h3>
              <p className="text-gray-600 text-sm">
                Entrez le nom de la nouvelle boisson à ajouter à votre liste
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de la boisson
                </label>
                <input
                  ref={drinkInputRef}
                  type="text"
                  value={newDrinkName}
                  onChange={(e) => setNewDrinkName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
                  placeholder={`Ex: ${drinkType === 'alcoholic' ? 'Rhum, Gin, Tequila' : 'Limonade, Smoothie, Thé glacé'}`}
                  autoFocus
                />
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCancelDrink}
                  className="flex-1 px-4 py-3 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleAddDrink}
                  disabled={!newDrinkName.trim()}
                  className="flex-1 px-4 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-light disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-6 py-3 rounded-lg shadow-lg bg-green-600 text-white font-semibold text-base transition-all duration-300 animate-fade-in">
          {toast}
        </div>
      )}
    </>
  );
};

export default InvitationEditModal; 