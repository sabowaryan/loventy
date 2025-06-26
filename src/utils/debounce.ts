/**
 * Crée une version debounced d'une fonction.
 * La fonction debounced retarde son exécution jusqu'à ce que le délai spécifié
 * se soit écoulé depuis la dernière fois qu'elle a été invoquée.
 * 
 * @param func La fonction à debouncer
 * @param wait Le délai en millisecondes
 * @returns Une nouvelle fonction qui applique le debouncing
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: Parameters<T>) {
    const context = this;
    
    const later = () => {
      timeout = null;
      func.apply(context, args);
    };
    
    // Annuler le timeout précédent et en créer un nouveau
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}