import React, { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SeoHead from '../components/SeoHead';

const Cookies: React.FC = () => {
  usePageTitle('Politique de cookies');
  const [content, setContent] = useState<string>('Chargement...');

  useEffect(() => {
    fetch('/markdown/cookies.md')
      .then(response => response.text())
      .then(text => setContent(text))
      .catch(error => {
        console.error('Erreur lors du chargement du contenu:', error);
        setContent('Erreur lors du chargement du contenu. Veuillez réessayer plus tard.');
      });
  }, []);

  return (
    <>
      <SeoHead 
        pagePath="/cookies" 
        overrides={{
          title: "Politique de cookies | Loventy",
          description: "Découvrez comment Loventy utilise les cookies pour améliorer votre expérience sur notre plateforme d'invitations de mariage.",
          keywords: "politique de cookies, cookies, traceurs, RGPD, confidentialité web, Loventy"
        }}
      />
      <div className="min-h-screen bg-accent py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <h1 className="text-3xl font-bold text-primary mb-8 font-serif">Politique de cookies</h1>
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cookies;