import React from 'react';
import ErrorPage from './ErrorPage';

const Error500: React.FC = () => {
  return (
    <ErrorPage 
      statusCode={500}
      title="Erreur serveur"
      message="Une erreur inattendue s'est produite sur nos serveurs. Nous travaillons à résoudre le problème. Veuillez réessayer plus tard."
    />
  );
};

export default Error500;