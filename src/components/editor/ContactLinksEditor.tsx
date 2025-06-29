import React from 'react';
import { 
  Share2, 
  Phone, 
  Mail, 
  Link as LinkIcon, 
  User, 
  Gift
} from 'lucide-react';
import { ExtendedInvitationData } from '../../types/models';

interface ContactLinksEditorProps {
  invitationData: ExtendedInvitationData;
  onInputChange: (field: string, value: any) => void;
}

const ContactLinksEditor: React.FC<ContactLinksEditorProps> = ({ 
  invitationData, 
  onInputChange 
}) => {
  return (
    <div className="space-y-8">
      {/* Contact et liens */}
      <div className="bg-white rounded-xl p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-[#131837] mb-4 flex items-center">
          <Share2 className="h-5 w-5 mr-2 text-[#D4A5A5]" />
          Contact et liens
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <User className="inline h-4 w-4 mr-1" />
              Personne à contacter
            </label>
            <input
              type="text"
              value={invitationData.contactPersonName || ''}
              onChange={(e) => onInputChange('contactPersonName', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="Marie (témoin)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Phone className="inline h-4 w-4 mr-1" />
              Téléphone de contact
            </label>
            <input
              type="tel"
              value={invitationData.phoneContact || ''}
              onChange={(e) => onInputChange('phoneContact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="+33 6 12 34 56 78"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Mail className="inline h-4 w-4 mr-1" />
              Email de contact
            </label>
            <input
              type="email"
              value={invitationData.emailContact || ''}
              onChange={(e) => onInputChange('emailContact', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="sarah.alex@email.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <LinkIcon className="inline h-4 w-4 mr-1" />
              Site web du mariage
            </label>
            <input
              type="url"
              value={invitationData.weddingWebsite || ''}
              onChange={(e) => onInputChange('weddingWebsite', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="https://sarah-alex-wedding.com"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#131837] mb-2">
              <Gift className="inline h-4 w-4 mr-1" />
              Liste de mariage
            </label>
            <input
              type="url"
              value={invitationData.registryLink || ''}
              onChange={(e) => onInputChange('registryLink', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#D4A5A5] focus:border-transparent"
              placeholder="https://liste-mariage.fr/sarah-alex"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactLinksEditor;