/**
 * Composant de test pour vérifier l'intégration des fonctionnalités de sécurité
 * À utiliser uniquement en développement
 */

import React, { useState } from 'react';
import { Shield, TestTube, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useSecurity } from '../auth/SecurityProvider';
import { useAuth } from '../../contexts/AuthContext';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

const SecurityTest: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { 
    isSessionActive, 
    showSessionWarning, 
    timeUntilExpiry, 
    extendSession,
    isLocked,
    remainingAttempts,
    remainingTime,
    recordLoginAttempt,
    formatRemainingTime,
    logAction
  } = useSecurity();
  const { user } = useAuth();

  const runSecurityTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    try {
      // Test 1: Vérifier que le SecurityProvider est disponible
      results.push({
        name: 'SecurityProvider disponible',
        status: 'success',
        message: 'Le contexte de sécurité est correctement initialisé'
      });

      // Test 2: Vérifier la session active
      results.push({
        name: 'Session sécurisée',
        status: isSessionActive ? 'success' : 'warning',
        message: `Session ${isSessionActive ? 'active' : 'inactive'}, temps restant: ${timeUntilExpiry}s`
      });

      // Test 3: Vérifier les tentatives de connexion
      results.push({
        name: 'Protection contre force brute',
        status: isLocked ? 'warning' : 'success',
        message: isLocked 
          ? `Compte verrouillé, temps restant: ${formatRemainingTime(remainingTime)}`
          : `${remainingAttempts} tentatives restantes`
      });

      // Test 4: Test de l'audit log
      try {
        await logAction('security_test', { 
          test_type: 'integration_test',
          timestamp: new Date().toISOString()
        });
        results.push({
          name: 'Système d\'audit',
          status: 'success',
          message: 'Log d\'audit enregistré avec succès'
        });
      } catch (error) {
        results.push({
          name: 'Système d\'audit',
          status: 'error',
          message: `Erreur lors de l'enregistrement: ${error}`
        });
      }

      // Test 5: Test d'enregistrement de tentative de connexion
      try {
        await recordLoginAttempt('test@example.com', true, '127.0.0.1');
        results.push({
          name: 'Enregistrement tentatives',
          status: 'success',
          message: 'Tentative de connexion enregistrée'
        });
      } catch (error) {
        results.push({
          name: 'Enregistrement tentatives',
          status: 'error',
          message: `Erreur lors de l'enregistrement: ${error}`
        });
      }

      // Test 6: Vérifier l'utilisateur connecté
      results.push({
        name: 'Authentification utilisateur',
        status: user ? 'success' : 'warning',
        message: user ? `Utilisateur connecté: ${user.email}` : 'Aucun utilisateur connecté'
      });

      // Test 7: Test d'extension de session
      try {
        extendSession();
        results.push({
          name: 'Extension de session',
          status: 'success',
          message: 'Session étendue avec succès'
        });
      } catch (error) {
        results.push({
          name: 'Extension de session',
          status: 'error',
          message: `Erreur lors de l'extension: ${error}`
        });
      }

    } catch (error) {
      results.push({
        name: 'Test général',
        status: 'error',
        message: `Erreur générale: ${error}`
      });
    }

    setTestResults(results);
    setIsRunning(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <TestTube className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test d'intégration sécurité</h1>
                <p className="text-gray-600">Vérification des fonctionnalités de sécurité</p>
              </div>
            </div>
            
            <button
              onClick={runSecurityTests}
              disabled={isRunning}
              className={`
                flex items-center px-4 py-2 rounded-lg font-medium transition-colors
                ${isRunning
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
                }
              `}
            >
              <TestTube className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              {isRunning ? 'Tests en cours...' : 'Lancer les tests'}
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Informations sur l'état actuel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-2">Session</h3>
              <p className="text-sm text-blue-700">
                {isSessionActive ? 'Active' : 'Inactive'}
                {showSessionWarning && ' (Avertissement affiché)'}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Temps restant: {timeUntilExpiry}s
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Tentatives</h3>
              <p className="text-sm text-green-700">
                {isLocked ? 'Verrouillé' : 'Déverrouillé'}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {isLocked 
                  ? `Temps restant: ${formatRemainingTime(remainingTime)}`
                  : `${remainingAttempts} tentatives restantes`
                }
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-2">Utilisateur</h3>
              <p className="text-sm text-purple-700">
                {user ? 'Connecté' : 'Non connecté'}
              </p>
              <p className="text-xs text-purple-600 mt-1 truncate">
                {user?.email || 'Aucun utilisateur'}
              </p>
            </div>
          </div>

          {/* Résultats des tests */}
          {testResults.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Résultats des tests</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(result.status)}`}
                  >
                    <div className="flex items-start space-x-3">
                      {getStatusIcon(result.status)}
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{result.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Résumé */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Résumé</h3>
                <div className="flex space-x-6 text-sm">
                  <span className="text-green-600">
                    ✓ {testResults.filter(r => r.status === 'success').length} réussis
                  </span>
                  <span className="text-yellow-600">
                    ⚠ {testResults.filter(r => r.status === 'warning').length} avertissements
                  </span>
                  <span className="text-red-600">
                    ✗ {testResults.filter(r => r.status === 'error').length} erreurs
                  </span>
                </div>
              </div>
            </div>
          )}

          {testResults.length === 0 && !isRunning && (
            <div className="text-center py-8">
              <TestTube className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Cliquez sur "Lancer les tests" pour vérifier l'intégration</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecurityTest;