import React from 'react';
import { Heart } from 'lucide-react';

interface InvitationLayoutProps {
  children: React.ReactNode;
  showHeader?: boolean;
}

const InvitationLayout: React.FC<InvitationLayoutProps> = ({ 
  children, 
  showHeader = true 
}) => {
  return (
    <div className="min-h-screen gradient-hero">
      {showHeader && (
        <header className="bg-white/80 backdrop-blur-sm border-b border-primary/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center items-center h-16">
              <div className="flex items-center space-x-2">
                <Heart className="h-6 w-6 text-secondary fill-current" />
                <span className="text-lg font-bold text-primary font-serif">Loventy</span>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {children}
        </div>
      </main>

      <footer className="bg-white/50 backdrop-blur-sm border-t border-primary/20 py-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Heart className="h-4 w-4 text-secondary fill-current" />
            <span className="text-sm font-medium text-primary font-serif">Loventy</span>
          </div>
          <p className="text-xs text-gray-500">
            Créez vos propres invitations sur{' '}
            <a 
              href="/" 
              className="text-secondary hover:text-secondary/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              loventy.org
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default InvitationLayout;