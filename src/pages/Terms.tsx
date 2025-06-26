import React, { useEffect, useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import SeoHead from '../components/SeoHead';

const Terms: React.FC = () => {
  usePageTitle('Conditions d\'utilisation');
  const [content, setContent] = useState<string>('Chargement...');

  useEffect(() => {
    fetch('/markdown/terms.md')
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
        pagePath="/terms" 
        overrides={{
          title: "Conditions d'utilisation | Loventy",
          description: "Consultez nos conditions d'utilisation pour comprendre les règles et obligations liées à l'utilisation de la plateforme Loventy.",
          keywords: "conditions d'utilisation, CGU, termes et conditions, mentions légales, règles d'utilisation, Loventy"
        }}
      />
      <div className="min-h-screen bg-accent py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <h1 className="text-3xl font-bold text-primary mb-8 font-serif">Conditions d'utilisation</h1>
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

export default Terms;