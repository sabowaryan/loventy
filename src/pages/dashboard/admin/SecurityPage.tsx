/**
 * Page d'administration de la sécurité
 * Wrapper pour le SecurityDashboard avec gestion d'erreurs
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import SecurityDashboard from '../../../components/admin/SecurityDashboard';
import ErrorBoundary from '../../../components/ErrorBoundary';

const SecurityPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Sécurité et Audit - Administration | Loventy</title>
        <meta name="description" content="Tableau de bord de sécurité et d'audit pour les administrateurs Loventy" />
      </Helmet>
      
      <ErrorBoundary>
        <SecurityDashboard />
      </ErrorBoundary>
    </>
  );
};

export default SecurityPage;