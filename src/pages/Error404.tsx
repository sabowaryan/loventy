import React from 'react';
import ErrorPage from './ErrorPage';

const Error404: React.FC = () => {
  return (
    <ErrorPage 
      statusCode={404}
      title="Page introuvable"
      message="La page que vous recherchez n'existe pas ou a été déplacée. Vérifiez l'URL ou retournez à l'accueil."
    />
  );
};

export default Error404;