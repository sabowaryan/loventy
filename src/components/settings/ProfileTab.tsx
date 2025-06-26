import React, { useState, useEffect } from 'react';
import { Camera, Save, Loader2, User as UserIcon } from 'lucide-react';
import { User } from '../../types/auth';
import { supabase } from '../../lib/supabase';

interface ProfileTabProps {
  user: User | null;
  onSave: (data: any) => Promise<void>;
  isLoading: boolean;
}

const ProfileTab: React.FC<ProfileTabProps> = ({ user, onSave, isLoading }) => {
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    bio: '',
    website: '',
    location: '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        avatarUrl: user.avatarUrl || ''
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setSelectedFile(file);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Upload the file to Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          onUploadProgress: (progress) => {
            const percent = Math.round((progress.loaded / progress.total) * 100);
            setUploadProgress(percent);
          }
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = await supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);

      if (urlData) {
        setProfileData(prev => ({
          ...prev,
          avatarUrl: urlData.publicUrl
        }));
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(profileData);
  };

  return (
    <div className="space-y-8">
      {/* Photo de profil */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Photo de profil</h3>
        
        <div className="flex items-center space-x-6">
          <div className="relative">
            {profileData.avatarUrl ? (
              <img
                src={profileData.avatarUrl}
                alt="Photo de profil"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
              />
            ) : (
              <div className="w-24 h-24 bg-[#D4A5A5]/10 rounded-full flex items-center justify-center border-4 border-gray-100">
                <UserIcon className="h-12 w-12 text-[#D4A5A5]" />
              </div>
            )}
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-[#D4A5A5] rounded-full flex items-center justify-center text-white hover:bg-[#D4A5A5]/90 transition-colors cursor-pointer">
              <Camera className="h-4 w-4" />
            </label>
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileChange}
              disabled={isUploading || isLoading}
            />
          </div>
          
          <div className="flex-1">
            <h4 className="font-medium text-[#1E1E1E] mb-2">Changer votre photo</h4>
            <p className="text-sm text-gray-600 mb-4">
              JPG, PNG ou GIF. Taille maximale de 5MB.
            </p>
            {isUploading ? (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-[#D4A5A5] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">Téléchargement: {uploadProgress}%</p>
              </div>
            ) : (
              <div className="flex space-x-3">
                <label 
                  htmlFor="avatar-upload"
                  className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors text-sm cursor-pointer"
                >
                  Télécharger
                </label>
                {profileData.avatarUrl && (
                  <button 
                    type="button"
                    onClick={() => setProfileData(prev => ({ ...prev, avatarUrl: '' }))}
                    className="px-4 py-2 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Informations personnelles */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1E1E1E] mb-6">Informations personnelles</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Prénom
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={profileData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Nom
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={profileData.lastName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={profileData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors bg-gray-50"
              disabled={true}
              title="L'adresse email ne peut pas être modifiée"
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={profileData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              placeholder="+33 6 12 34 56 78"
              disabled={isLoading}
            />
          </div>
          
          <div className="md:col-span-2">
            <label htmlFor="bio" className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              placeholder="Parlez-nous de vous..."
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="website" className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Site web
            </label>
            <input
              type="url"
              id="website"
              name="website"
              value={profileData.website}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              placeholder="https://votre-site.com"
              disabled={isLoading}
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-[#1E1E1E] mb-2">
              Localisation
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={profileData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5]/20 focus:border-[#D4A5A5] transition-colors"
              placeholder="Paris, France"
              disabled={isLoading}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-3 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Sauvegarde...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                <span>Sauvegarder</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;