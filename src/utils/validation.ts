/**
 * Utilitaires de validation côté client
 * Validation standardisée pour tous les formulaires
 */

import React from 'react';

// Types pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Règles de validation communes
export const ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Format d\'email invalide'
  },
  password: {
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial'
  },
  phone: {
    pattern: /^[\+]?[1-9][\d]{0,15}$/,
    message: 'Numéro de téléphone invalide'
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-ZÀ-ÿ\s\-']+$/,
    message: 'Le nom ne peut contenir que des lettres, espaces, tirets et apostrophes'
  }
};

// Validation des emails
export const validateEmail = (email: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!email) {
    errors.push({
      field: 'email',
      message: 'L\'email est requis',
      code: 'REQUIRED'
    });
  } else if (!ValidationRules.email.pattern.test(email)) {
    errors.push({
      field: 'email',
      message: ValidationRules.email.message,
      code: 'INVALID_FORMAT'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des mots de passe
export const validatePassword = (password: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!password) {
    errors.push({
      field: 'password',
      message: 'Le mot de passe est requis',
      code: 'REQUIRED'
    });
  } else {
    if (password.length < ValidationRules.password.minLength) {
      errors.push({
        field: 'password',
        message: `Le mot de passe doit contenir au moins ${ValidationRules.password.minLength} caractères`,
        code: 'TOO_SHORT'
      });
    }
    
    if (!ValidationRules.password.pattern.test(password)) {
      errors.push({
        field: 'password',
        message: ValidationRules.password.message,
        code: 'WEAK_PASSWORD'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des noms
export const validateName = (name: string, fieldName: string = 'nom'): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!name) {
    errors.push({
      field: fieldName,
      message: `Le ${fieldName} est requis`,
      code: 'REQUIRED'
    });
  } else {
    if (name.length < ValidationRules.name.minLength) {
      errors.push({
        field: fieldName,
        message: `Le ${fieldName} doit contenir au moins ${ValidationRules.name.minLength} caractères`,
        code: 'TOO_SHORT'
      });
    }
    
    if (name.length > ValidationRules.name.maxLength) {
      errors.push({
        field: fieldName,
        message: `Le ${fieldName} ne peut pas dépasser ${ValidationRules.name.maxLength} caractères`,
        code: 'TOO_LONG'
      });
    }
    
    if (!ValidationRules.name.pattern.test(name)) {
      errors.push({
        field: fieldName,
        message: ValidationRules.name.message,
        code: 'INVALID_FORMAT'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des numéros de téléphone
export const validatePhone = (phone: string): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (phone && !ValidationRules.phone.pattern.test(phone)) {
    errors.push({
      field: 'phone',
      message: ValidationRules.phone.message,
      code: 'INVALID_FORMAT'
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des dates
export const validateDate = (date: string, fieldName: string = 'date'): ValidationResult => {
  const errors: ValidationError[] = [];
  
  if (!date) {
    errors.push({
      field: fieldName,
      message: `La ${fieldName} est requise`,
      code: 'REQUIRED'
    });
  } else {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      errors.push({
        field: fieldName,
        message: 'Format de date invalide',
        code: 'INVALID_FORMAT'
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation des formulaires d'événement
export const validateEventForm = (eventData: {
  title: string;
  date: string;
  location?: string;
  description?: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];
  
  // Validation du titre
  const titleValidation = validateName(eventData.title, 'titre');
  allErrors.push(...titleValidation.errors);
  
  // Validation de la date
  const dateValidation = validateDate(eventData.date);
  allErrors.push(...dateValidation.errors);
  
  // Validation de la date future
  if (eventData.date) {
    const eventDate = new Date(eventData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      allErrors.push({
        field: 'date',
        message: 'La date de l\'événement doit être dans le futur',
        code: 'PAST_DATE'
      });
    }
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Validation des formulaires d'invité
export const validateGuestForm = (guestData: {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
}): ValidationResult => {
  const allErrors: ValidationError[] = [];
  
  // Validation du prénom
  const firstNameValidation = validateName(guestData.firstName, 'prénom');
  allErrors.push(...firstNameValidation.errors);
  
  // Validation du nom
  const lastNameValidation = validateName(guestData.lastName, 'nom');
  allErrors.push(...lastNameValidation.errors);
  
  // Validation de l'email (optionnel mais doit être valide si fourni)
  if (guestData.email) {
    const emailValidation = validateEmail(guestData.email);
    allErrors.push(...emailValidation.errors);
  }
  
  // Validation du téléphone (optionnel mais doit être valide si fourni)
  if (guestData.phone) {
    const phoneValidation = validatePhone(guestData.phone);
    allErrors.push(...phoneValidation.errors);
  }
  
  // Au moins un moyen de contact requis
  if (!guestData.email && !guestData.phone) {
    allErrors.push({
      field: 'contact',
      message: 'Au moins un email ou un numéro de téléphone est requis',
      code: 'CONTACT_REQUIRED'
    });
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Sanitisation des entrées utilisateur
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Supprime les balises HTML basiques
    .replace(/javascript:/gi, '') // Supprime les tentatives de JavaScript
    .replace(/on\w+=/gi, ''); // Supprime les gestionnaires d'événements
};

// Validation générique pour les formulaires
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => ValidationResult>
): ValidationResult => {
  const allErrors: ValidationError[] = [];
  
  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator(data[field]);
    allErrors.push(...result.errors);
  });
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
};

// Hook personnalisé pour la validation en temps réel
export const useFormValidation = (
  initialData: Record<string, any>,
  validationRules: Record<string, (value: any) => ValidationResult>
) => {
  const [data, setData] = React.useState(initialData);
  const [errors, setErrors] = React.useState<ValidationError[]>([]);
  const [touched, setTouched] = React.useState<Record<string, boolean>>({});
  
  const validateField = (field: string, value: any) => {
    if (validationRules[field]) {
      const result = validationRules[field](value);
      setErrors(prev => [
        ...prev.filter(err => err.field !== field),
        ...result.errors
      ]);
    }
  };
  
  const handleChange = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (touched[field]) {
      validateField(field, value);
    }
  };
  
  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, data[field]);
  };
  
  const validateAll = () => {
    const result = validateForm(data, validationRules);
    setErrors(result.errors);
    return result.isValid;
  };
  
  return {
    data,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    isValid: errors.length === 0
  };
};