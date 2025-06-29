import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoventyLogo from '../LoventyLogo';
import BoltBadge from '../BoltBadge';


interface PublicLayoutProps {
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState('');
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
  
  // Navigation simplifiée
  const navigation = [
    { 
      name: 'Accueil', 
      href: '/'
    },
    { 
      name: 'Modèles', 
      href: '/templates'
    },
    { 
      name: 'Tarifs', 
      href: '/pricing'
    },
    {
      name: 'Témoignages',
      href: '/testimonials'
    },
    {
      name: 'Contact',
      href: '/contact'
    }
  ];

  // Gestion du scroll et détection de section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);

      // Détection de la section actuelle pour adapter le fond
      if (location.pathname === '/') {
        // Utiliser l'attribut data-section du body (défini dans Home.tsx)
        const currentSectionId = document.body.getAttribute('data-section');
        if (currentSectionId) {
          setCurrentSection(currentSectionId);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [location.pathname]);

  // Fermer le menu mobile lors du changement de route
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Empêcher le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    
    return () => {
      document.body.classList.remove('mobile-menu-open');
    };
  }, [isMobileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  const getUserDisplayName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    if (user?.firstName) {
      return user.firstName;
    }
    return user?.email?.split('@')[0] || 'Utilisateur';
  };

  const getUserInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    if (user?.firstName) {
      return user.firstName[0].toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  // Fonction pour rendre les boutons d'authentification
  const renderAuthButtons = (isMobile = false) => {
    const baseClasses = isMobile 
      ? "block px-4 py-3 text-base font-medium rounded-lg transition-all duration-200"
      : "text-sm font-medium transition-all duration-200";

    if (isLoading) {
      return (
        <div className={`flex items-center ${isMobile ? 'justify-center' : 'space-x-2'}`}>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#D4A5A5]"></div>
          {!isMobile && <span className="text-sm text-gray-600">Chargement...</span>}
        </div>
      );
    }

    if (!isAuthenticated) {
      // Utilisateurs non connectés
      if (isMobile) {
        return (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <Link
              to="/auth/login"
              className={`${baseClasses} text-gray-700 hover:text-[#D4A5A5] hover:bg-[#D4A5A5]/5 w-full`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Se connecter
            </Link>
            <Link
              to="/auth/register"
              className="block w-full py-3 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-lg text-center hover:shadow-lg transition-all duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Commencer
            </Link>
          </div>
        );
      } else {
        return (
          <div className="flex items-center space-x-4">
            <Link
              to="/auth/login"
              className={`${baseClasses} text-gray-700 hover:text-[#D4A5A5] px-3 py-2 rounded-lg hover:bg-[#D4A5A5]/10`}
            >
              Se connecter
            </Link>
            <Link
              to="/auth/register"
              className="py-2 px-4 bg-gradient-to-r from-[#D4A5A5] to-[#E16939] text-white font-medium rounded-full hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
            >
              Commencer
            </Link>
          </div>
        );
      }
    } else {
      // Utilisateurs connectés - Montrer seulement le lien Dashboard
      if (isMobile) {
        return (
          <div className="space-y-3 pt-4 border-t border-gray-200">
            <div className="px-4 py-3 flex items-center space-x-3 text-gray-700">
              <div className="w-10 h-10 bg-[#D4A5A5] rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {getUserInitials()}
                </span>
              </div>
              <div>
                <div className="font-medium">
                  {getUserDisplayName()}
                </div>
                <div className="text-sm opacity-75">
                  {user?.email}
                </div>
              </div>
            </div>
            
            <Link
              to="/dashboard"
              className={`${baseClasses} text-gray-700 hover:text-[#D4A5A5] hover:bg-[#D4A5A5]/5 w-full flex items-center space-x-2`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span>Tableau de bord</span>
            </Link>
          </div>
        );
      } else {
        return (
          <Link
            to="/dashboard"
            className="flex items-center space-x-1 px-4 py-2 bg-primary text-white rounded-full text-sm font-medium hover:bg-primary-light transition-colors duration-200"
          >
            <User className="h-4 w-4" />
            <span>Dashboard</span>
          </Link>
        );
      }
    }
  };

  return (
    <div className="min-h-screen bg-accent">
      {/* Header avec style adaptatif */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 border-b border-gray-200 transition-all duration-500 will-change-transform">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <LoventyLogo className="h-8 w-8 text-[#D4A5A5] fill-current group-hover:scale-110 transition-transform duration-300" />
              <span className="text-2xl font-bold font-serif text-gray-800 group-hover:text-[#D4A5A5] transition-colors duration-300">Loventy</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                    isActive(item.href)
                      ? "text-[#D4A5A5] bg-[#D4A5A5]/10 nav-item-active"
                      : "text-gray-700 hover:text-[#D4A5A5] hover:bg-[#D4A5A5]/5 nav-item"
                  }`}
                >
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Desktop Auth Section */}
            <div className="hidden md:flex items-center">
              {renderAuthButtons(false)}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 text-gray-700" />
              ) : (
                <Menu className="h-6 w-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Optimisé pour le défilement */}
        {isMobileMenuOpen && (
          <div 
            ref={mobileMenuRef}
            className="md:hidden bg-white mobile-menu"
            style={{
              maxHeight: 'calc(100vh - 4rem)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <div className="px-4 py-4 space-y-2">
              {/* Navigation Links */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center justify-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-200 ${
                    isActive(item.href)
                      ? 'text-[#D4A5A5] bg-[#D4A5A5]/10'
                      : 'text-gray-700 hover:text-[#D4A5A5] hover:bg-[#D4A5A5]/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Auth Section */}
              {renderAuthButtons(true)}
            </div>
          </div>
        )}
      </header>

      {/* Main Content avec padding pour le header fixe */}
      <main className="pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#131837] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <LoventyLogo className="h-8 w-8 text-[#D4A5A5] fill-current" />
                <span className="text-2xl font-bold font-serif">Loventy</span>
              </div>
              <p className="text-gray-300 text-sm mb-4">
                Créez de magnifiques invitations de mariage qui racontent votre histoire d'amour.
                Simple, élégant et mémorable.
              </p>
              <div className="flex space-x-4 mb-6">
                <a href="#" className="text-gray-300 hover:text-[#D4A5A5] transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-[#D4A5A5] transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-[#D4A5A5] transition-colors">
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produit</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/templates" className="hover:text-[#D4A5A5] transition-colors">Modèles</Link></li>
                <li><Link to="/pricing" className="hover:text-[#D4A5A5] transition-colors">Tarifs</Link></li>
                <li><Link to="/testimonials" className="hover:text-[#D4A5A5] transition-colors">Témoignages</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><Link to="/help" className="hover:text-[#D4A5A5] transition-colors">Centre d'aide</Link></li>
                <li><Link to="/contact" className="hover:text-[#D4A5A5] transition-colors">Contact</Link></li>
                <li><Link to="/privacy" className="hover:text-[#D4A5A5] transition-colors">Confidentialité</Link></li>
                <li><Link to="/terms" className="hover:text-[#D4A5A5] transition-colors">Conditions d'utilisation</Link></li>
                <li><Link to="/cookies" className="hover:text-[#D4A5A5] transition-colors">Cookies</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-3 text-sm text-gray-300">
                <li className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-[#D4A5A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:contact@loventy.org" className="hover:text-[#D4A5A5] transition-colors">contact@loventy.org</a>
                </li>
                <li className="flex items-center space-x-2">
                  <svg className="h-4 w-4 text-[#D4A5A5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+243981682933" className="hover:text-[#D4A5A5] transition-colors">+243 98 168 2933</a>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="h-4 w-4 text-[#D4A5A5] mt-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Avenue Tombalbaye, Gombe<br/>Kinshasa, RDC</span>
                </li>
              </ul>
            </div>
            <div className="mt-6 flex justify-center">
  <BoltBadge />
</div>
          </div>
          

          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row md:justify-between items-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} Loventy. Tous droits réservés.</p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link to="/privacy" className="hover:text-[#D4A5A5] transition-colors flex items-center space-x-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Confidentialité</span>
              </Link>
              <Link to="/terms" className="hover:text-[#D4A5A5] transition-colors flex items-center space-x-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Conditions</span>
              </Link>
              <Link to="/cookies" className="hover:text-[#D4A5A5] transition-colors flex items-center space-x-1">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                </svg>
                <span>Cookies</span>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;