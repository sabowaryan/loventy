/**
 * Composant d'input avec validation intégrée
 * Affiche les erreurs de validation en temps réel
 */

import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { ValidationResult, sanitizeInput } from '../../utils/validation';

interface ValidatedInputProps {
  label: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'date';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  validator?: (value: string) => ValidationResult;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  showValidIcon?: boolean;
  sanitize?: boolean;
}

export const ValidatedInput: React.FC<ValidatedInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  onBlur,
  validator,
  placeholder,
  required = false,
  disabled = false,
  className = '',
  showValidIcon = true,
  sanitize = true
}) => {
  const [errors, setErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Validation en temps réel après que l'utilisateur ait touché le champ
  useEffect(() => {
    if (touched && validator) {
      const result = validator(value);
      setErrors(result.errors.map(err => err.message));
    }
  }, [value, validator, touched]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Sanitisation si activée
    if (sanitize && type === 'text') {
      newValue = sanitizeInput(newValue);
    }
    
    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  const isValid = touched && errors.length === 0 && value.length > 0;
  const hasErrors = touched && errors.length > 0;

  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className={`space-y-1 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      
      <div className="relative">
        <input
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${hasErrors ? 'border-red-300 bg-red-50' : ''}
            ${isValid ? 'border-green-300 bg-green-50' : ''}
            ${!touched ? 'border-gray-300' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
            ${type === 'password' ? 'pr-10' : ''}
            ${(isValid && showValidIcon) || hasErrors ? 'pr-10' : ''}
          `}
        />

        {/* Icône pour afficher/masquer le mot de passe */}
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {/* Icône de validation */}
        {type !== 'password' && touched && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {hasErrors ? (
              <AlertCircle className="w-4 h-4 text-red-500" />
            ) : isValid && showValidIcon ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : null}
          </div>
        )}
      </div>

      {/* Messages d'erreur */}
      {hasErrors && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600 flex items-center">
              <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
              {error}
            </p>
          ))}
        </div>
      )}

      {/* Indicateur de force du mot de passe */}
      {type === 'password' && value && touched && (
        <PasswordStrengthIndicator password={value} />
      )}
    </div>
  );
};

// Composant pour afficher la force du mot de passe
const PasswordStrengthIndicator: React.FC<{ password: string }> = ({ password }) => {
  const getStrength = (password: string): { score: number; label: string; color: string } => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[@$!%*?&]/.test(password)) score++;

    if (score <= 2) return { score, label: 'Faible', color: 'bg-red-500' };
    if (score <= 3) return { score, label: 'Moyen', color: 'bg-yellow-500' };
    if (score <= 4) return { score, label: 'Fort', color: 'bg-green-500' };
    return { score, label: 'Très fort', color: 'bg-green-600' };
  };

  const strength = getStrength(password);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-600">Force du mot de passe</span>
        <span className="text-xs font-medium">{strength.label}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${strength.color}`}
          style={{ width: `${(strength.score / 5) * 100}%` }}
        />
      </div>
    </div>
  );
};

export default ValidatedInput;