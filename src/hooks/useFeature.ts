import { useDevCycle, useFeatureFlag } from '../contexts/DevCycleContext';

/**
 * Hook personnalisé pour travailler avec les fonctionnalités DevCycle
 */
export const useFeature = () => {
  const { isFeatureEnabled, getVariableValue } = useDevCycle();
  
  /**
   * Vérifie si une fonctionnalité est activée
   * @param key Clé de la fonctionnalité
   * @param defaultValue Valeur par défaut si la fonctionnalité n'est pas configurée
   */
  const isEnabled = (key: string, defaultValue: boolean = false): boolean => {
    return useFeatureFlag(key, defaultValue);
  };
  
  /**
   * Récupère la valeur d'une variable de fonctionnalité
   * @param key Clé de la variable
   * @param defaultValue Valeur par défaut si la variable n'est pas configurée
   */
  const getVariable = <T,>(key: string, defaultValue: T): T => {
    return getVariableValue<T>(key, defaultValue);
  };
  
  return {
    isEnabled,
    getVariable
  };
};