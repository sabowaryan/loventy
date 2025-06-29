import React from 'react';
import { 
  Type, 
  Palette, 
  Calendar, 
  Brain, 
  MessageSquare, 
  Users, 
  Heart, 
  Music, 
  Share2, 
  FileText, 
  Info, 
  CheckSquare, 
  DollarSign,
  Image as ImageIcon,
  Settings,
  Layers,
  Layout
} from 'lucide-react';

interface EditorSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeSection: string;
  setActiveSection: (section: string) => void;
}

const EditorSidebar: React.FC<EditorSidebarProps> = ({ 
  activeTab, 
  setActiveTab,
  activeSection,
  setActiveSection
}) => {
  // Définition des catégories principales
  const mainCategories = [
    { id: 'content', name: 'Contenu', icon: Type },
    { id: 'design', name: 'Design', icon: Palette },
    { id: 'interactive', name: 'Interactif', icon: Brain },
    { id: 'settings', name: 'Paramètres', icon: Settings }
  ];

  // Définition des sections par catégorie
  const sectionsByCategory = {
    content: [
      { id: 'details', name: 'Informations générales', icon: Type, description: 'Détails de base' },
      { id: 'welcome', name: 'Message de bienvenue', icon: Heart, description: 'Message et citation' },
      { id: 'events', name: 'Programme', icon: Calendar, description: 'Déroulé des événements' },
      { id: 'contact', name: 'Contact & Liens', icon: Share2, description: 'Coordonnées et liens' },
      { id: 'policies', name: 'Politiques', icon: FileText, description: 'Enfants et cadeaux' },
      { id: 'additional', name: 'Infos supplémentaires', icon: Info, description: 'Transport et hébergement' },
      { id: 'rsvp', name: 'RSVP', icon: CheckSquare, description: 'Confirmation présence' },
      { id: 'honeymoon', name: 'Cagnotte lune de miel', icon: DollarSign, description: 'Cagnotte pour voyage' },
    ],
    design: [
      { id: 'theme', name: 'Thème et couleurs', icon: Palette, description: 'Style visuel' },
      { id: 'layout', name: 'Mise en page', icon: Layers, description: 'Structure des sections' },
      { id: 'section-design', name: 'Design par section', icon: Layout, description: 'Contrôle détaillé des sections' }, // New section
      { id: 'media', name: 'Médias', icon: ImageIcon, description: 'Photos et images' },
    ],
    interactive: [
      { id: 'music', name: 'Musique', icon: Music, description: 'Playlist et suggestions' },
      { id: 'quiz', name: 'Quiz', icon: Brain, description: 'Questions interactives' },
      { id: 'social', name: 'Mur social', icon: Users, description: 'Partage des invités' },
    ],
    settings: [
      { id: 'advanced', name: 'Paramètres avancés', icon: Settings, description: 'Options avancées' },
    ]
  };

  // Obtenir les sections de la catégorie active
  const getActiveSections = () => {
    return sectionsByCategory[activeTab as keyof typeof sectionsByCategory] || [];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Catégories principales */}
      <div className="border-b border-gray-100">
        <nav className="flex">
          {mainCategories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                setActiveTab(category.id);
                // Sélectionner la première section de cette catégorie par défaut
                const sections = sectionsByCategory[category.id as keyof typeof sectionsByCategory];
                if (sections && sections.length > 0) {
                  setActiveSection(sections[0].id);
                }
              }}
              className={`flex-1 flex flex-col items-center py-4 px-2 text-sm font-medium transition-colors ${
                activeTab === category.id
                  ? 'text-[#D4A5A5] border-b-2 border-[#D4A5A5]'
                  : 'text-gray-500 hover:text-[#131837] hover:bg-gray-50'
              }`}
            >
              <category.icon className="h-5 w-5 mb-1" />
              <span className="text-xs">{category.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Sections de la catégorie active */}
      <div className="p-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
          Sections
        </h3>
        <nav className="space-y-1">
          {getActiveSections().map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                activeSection === section.id
                  ? 'bg-[#D4A5A5]/10 text-[#D4A5A5]'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-[#D4A5A5]'
              }`}
            >
              <section.icon className="h-4 w-4 mr-3 flex-shrink-0" />
              <span className="truncate">{section.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default EditorSidebar;
