import React, { useState } from 'react';
import { 
  Upload, 
  Image as ImageIcon, 
  Trash2, 
  Plus, 
  Loader2,
  Heart
} from 'lucide-react';

interface MediaManagerProps {
  onImageUpload: (sectionId: string, imageType: 'background' | 'couple', file: File) => Promise<string>;
  isUploading: boolean;
  invitationId: string;
  media: Array<{
    id: string;
    title?: string;
    description?: string;
    file_url: string;
    media_type: string;
    created_at: string;
  }>;
  onRefreshMedia: () => void;
}

const MediaManager: React.FC<MediaManagerProps> = ({ 
  onImageUpload, 
  isUploading, 
  invitationId,
  media = [],
  onRefreshMedia
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadType, setUploadType] = useState<'gallery' | 'background'>('gallery');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [showUploadForm, setShowUploadForm] = useState(false);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle image upload
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      await onImageUpload('gallery', 'background', selectedFile);
      setSelectedFile(null);
      setTitle('');
      setDescription('');
      setShowUploadForm(false);
      onRefreshMedia();
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Gallery Header */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#131837] flex items-center">
            <ImageIcon className="h-5 w-5 mr-2 text-[#D4A5A5]" />
            Galerie d'images
          </h3>
          
          <button
            onClick={() => setShowUploadForm(!showUploadForm)}
            className="px-3 py-1.5 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors text-sm flex items-center"
          >
            {showUploadForm ? (
              <>
                <Trash2 className="h-4 w-4 mr-1" />
                <span>Annuler</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1" />
                <span>Ajouter une image</span>
              </>
            )}
          </button>
        </div>
        
        {showUploadForm ? (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#D4A5A5] transition-colors">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                {selectedFile ? `Fichier sélectionné: ${selectedFile.name}` : 'Glissez une image ou cliquez pour parcourir'}
              </p>
              <p className="text-sm text-gray-500 mb-4">PNG, JPG jusqu'à 5MB</p>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                id="gallery-upload"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              <label
                htmlFor="gallery-upload"
                className={`inline-block px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors cursor-pointer ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Choisir une image
              </label>
            </div>
            
            {selectedFile && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Titre de l'image
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Notre photo de couple"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Description (optionnelle)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                    placeholder="Une description de cette image..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#131837] mb-2">
                    Type d'image
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as any)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
                  >
                    <option value="gallery">Image de galerie</option>
                    <option value="background">Image de fond</option>
                  </select>
                </div>
                
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile}
                  className="w-full py-3 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span>Téléchargement en cours...</span>
                    </div>
                  ) : (
                    'Télécharger l\'image'
                  )}
                </button>
              </>
            )}
          </div>
        ) : (
          <>
            {media.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">Aucune image</h4>
                <p className="text-gray-500 mb-4">Ajoutez des images pour personnaliser votre invitation</p>
                <button
                  onClick={() => setShowUploadForm(true)}
                  className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2 inline-block" />
                  Ajouter une image
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {media.map((item) => (
                  <div key={item.id} className="group relative rounded-lg overflow-hidden border border-gray-200">
                    <img 
                      src={item.file_url} 
                      alt={item.title || 'Image'} 
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <button className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors">
                          <ImageIcon className="h-4 w-4 text-gray-700" />
                        </button>
                        <button className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    {item.title && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-xs truncate">
                        {item.title}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Galerie d'images prédéfinies */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4">
          Images prédéfinies
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Fleurs roses', url: 'https://images.pexels.com/photos/1070850/pexels-photo-1070850.jpeg' },
            { name: 'Feuillage vert', url: 'https://images.pexels.com/photos/1072179/pexels-photo-1072179.jpeg' },
            { name: 'Marbre blanc', url: 'https://images.pexels.com/photos/1323712/pexels-photo-1323712.jpeg' },
            { name: 'Texture dorée', url: 'https://images.pexels.com/photos/1509534/pexels-photo-1509534.jpeg' },
            { name: 'Fleurs blanches', url: 'https://images.pexels.com/photos/931177/pexels-photo-931177.jpeg' },
            { name: 'Roses rouges', url: 'https://images.pexels.com/photos/56866/garden-rose-red-pink-56866.jpeg' },
            { name: 'Eucalyptus', url: 'https://images.pexels.com/photos/4505161/pexels-photo-4505161.jpeg' },
            { name: 'Anneaux dorés', url: 'https://images.pexels.com/photos/256737/pexels-photo-256737.jpeg' }
          ].map((image, index) => (
            <button
              key={index}
              className="relative group overflow-hidden rounded-lg border-2 border-gray-200 hover:border-[#D4A5A5] transition-colors"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-24 object-cover group-hover:scale-110 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200 flex items-center justify-center">
                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {image.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MediaManager;