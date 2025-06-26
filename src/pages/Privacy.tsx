import React, { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SeoHead from '../components/SeoHead';

const Privacy: React.FC = () => {
  usePageTitle('Politique de confidentialité');
  const [content, setContent] = useState<string>('Chargement...');

  useEffect(() => {
    fetch('/markdown/privacy.md')
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
        pagePath="/privacy" 
        overrides={{
          title: "Politique de confidentialité | Loventy",
          description: "Consultez notre politique de confidentialité pour comprendre comment nous collectons, utilisons et protégeons vos données personnelles sur Loventy.",
          keywords: "politique de confidentialité, protection des données, RGPD, vie privée, données personnelles, Loventy"
        }}
      />
      <div className="min-h-screen bg-accent py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <h1 className="text-3xl font-bold text-primary mb-8 font-serif">Politique de confidentialité</h1>
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

export default Privacy;