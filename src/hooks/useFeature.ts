/**
 * Hook personnalisé pour travailler avec les fonctionnalités
 */
export const useFeature = () => {
  /**
   * Vérifie si une fonctionnalité est activée
   * @param key Clé de la fonctionnalité
   * @param defaultValue Valeur par défaut si la fonctionnalité n'est pas configurée
   */
  const isEnabled = (key: string, defaultValue: boolean = false): boolean => {
    // Valeurs par défaut pour les fonctionnalités
    const features: Record<string, boolean> = {
      'premium-templates': true,
      'advanced-analytics': true,
      'custom-domain': true,
      'beta-features': false,
      'enable_events': true
    };
    
    return features[key] || defaultValue;
  };
  
  /**
   * Récupère la valeur d'une variable de fonctionnalité
   * @param key Clé de la variable
   * @param defaultValue Valeur par défaut si la variable n'est pas configurée
   */
  const getVariable = <T,>(key: string, defaultValue: T): T => {
    // Valeurs par défaut pour les variables
    const variables: Record<string, any> = {
      'max-invitations': 25,
      'max-guests': 300,
      'theme-color': '#D4A5A5',
      'welcome-message': 'Bienvenue sur Loventy',
      'dashboard_tips': [
        {
          title: "Personnalisez vos invitations",
          text: "Ajoutez votre photo de couple pour un rendu plus personnel",
          type: "info"
        },
        {
          title: "Suivez les réponses",
          text: "Relancez gentiment les invités qui n'ont pas encore répondu",
          type: "success"
        }
      ]
    };
    
    return variables[key] !== undefined ? variables[key] : defaultValue;
  };
  
  return {
    isEnabled,
    getVariable
  };
};

// Fonction utilitaire pour vérifier les feature flags
export const useFeatureFlag = (featureKey: string, defaultValue: boolean = false): boolean => {
  const { isEnabled } = useFeature();
  return isEnabled(featureKey, defaultValue);
};