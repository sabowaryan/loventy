import React, { useState } from 'react';
import { 
  MessageSquare, 
  Users, 
  Image, 
  Video, 
  Smile, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff, 
  Trash2, 
  CheckCircle, 
  XCircle,
  ToggleLeft,
  Info
} from 'lucide-react';
import { SocialWallPost, SocialWallComment } from '../../types/models';

interface SocialWallEditorProps {
  enabled: boolean;
  moderationEnabled: boolean;
  posts: SocialWallPost[];
  comments: SocialWallComment[];
  onToggleEnabled: (enabled: boolean) => void;
  onToggleModeration: (enabled: boolean) => void;
  onApprovePost: (id: string) => void;
  onRejectPost: (id: string) => void;
  onDeletePost: (id: string) => void;
  onApproveComment: (id: string) => void;
  onRejectComment: (id: string) => void;
  onDeleteComment: (id: string) => void;
}

const SocialWallEditor: React.FC<SocialWallEditorProps> = ({
  enabled,
  moderationEnabled,
  posts,
  comments,
  onToggleEnabled,
  onToggleModeration,
  onApprovePost,
  onRejectPost,
  onDeletePost,
  onApproveComment,
  onRejectComment,
  onDeleteComment
}) => {
  const [activeTab, setActiveTab] = useState<'settings' | 'posts' | 'comments'>('settings');
  
  const pendingPosts = posts.filter(post => !post.is_approved);
  const approvedPosts = posts.filter(post => post.is_approved);
  const pendingComments = comments.filter(comment => !comment.is_approved);
  const approvedComments = comments.filter(comment => comment.is_approved);

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'photo':
        return <Image className="h-4 w-4 text-blue-500" />;
      case 'video':
        return <Video className="h-4 w-4 text-red-500" />;
      case 'gif':
        return <Smile className="h-4 w-4 text-purple-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Tabs */}
      <div className="bg-white rounded-xl overflow-hidden border border-gray-100">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'settings' 
                ? 'text-[#D4A5A5] border-b-2 border-[#D4A5A5]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Settings className="h-4 w-4 inline-block mr-2" />
            Paramètres
          </button>
          <button
            onClick={() => setActiveTab('posts')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'posts' 
                ? 'text-[#D4A5A5] border-b-2 border-[#D4A5A5]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline-block mr-2" />
            Publications
            {pendingPosts.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                {pendingPosts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-3 px-4 text-sm font-medium ${
              activeTab === 'comments' 
                ? 'text-[#D4A5A5] border-b-2 border-[#D4A5A5]' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageSquare className="h-4 w-4 inline-block mr-2" />
            Commentaires
            {pendingComments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                {pendingComments.length}
              </span>
            )}
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-[#131837] flex items-center">
                    <Users className="h-5 w-5 mr-2 text-[#D4A5A5]" />
                    Mur social
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Permettez à vos invités de partager des messages et des photos
                  </p>
                </div>
                <div>
                  <button
                    onClick={() => onToggleEnabled(!enabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      enabled ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
              
              {enabled && (
                <>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-[#131837] flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-[#D4A5A5]" />
                        Modération
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Approuver les publications et commentaires avant qu'ils ne soient visibles
                      </p>
                    </div>
                    <div>
                      <button
                        onClick={() => onToggleModeration(!moderationEnabled)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          moderationEnabled ? 'bg-[#D4A5A5]' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            moderationEnabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Info className="h-5 w-5 text-blue-500" />
                      </div>
                      <div className="ml-3">
                        <h5 className="text-sm font-medium text-blue-800">Fonctionnement du mur social</h5>
                        <div className="mt-2 text-sm text-blue-700 space-y-1">
                          <p>• Les invités peuvent publier des messages, photos et vidéos</p>
                          <p>• Ils peuvent également commenter et réagir aux publications</p>
                          {moderationEnabled ? (
                            <p>• Vous devez approuver chaque publication avant qu'elle ne soit visible</p>
                          ) : (
                            <p>• Les publications sont immédiatement visibles par tous</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'posts' && (
            <div className="space-y-6">
              {!enabled ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">Le mur social est désactivé</p>
                  <button
                    onClick={() => onToggleEnabled(true)}
                    className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
                  >
                    Activer le mur social
                  </button>
                </div>
              ) : (
                <>
                  {pendingPosts.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#131837] mb-3 flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-amber-500" />
                        Publications en attente ({pendingPosts.length})
                      </h4>
                      
                      <div className="space-y-3">
                        {pendingPosts.map(post => (
                          <div key={post.id} className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50">
                            <div className="p-4">
                              <div className="flex items-center mb-2">
                                <div className="bg-white p-1 rounded-full mr-2">
                                  {getPostTypeIcon(post.post_type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {post.author_name || 'Invité anonyme'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              
                              {post.post_text && (
                                <p className="text-sm text-gray-700 mb-2">{post.post_text}</p>
                              )}
                              
                              {post.media_url && (post.post_type === 'photo' || post.post_type === 'gif') && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-amber-200">
                                  <img 
                                    src={post.media_url} 
                                    alt="Media" 
                                    className="w-full h-40 object-cover"
                                  />
                                </div>
                              )}
                              
                              {post.media_url && post.post_type === 'video' && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-amber-200 bg-black aspect-video flex items-center justify-center">
                                  <Video className="h-10 w-10 text-white opacity-50" />
                                </div>
                              )}
                            </div>
                            
                            <div className="bg-amber-100 p-2 flex justify-end space-x-2">
                              <button
                                onClick={() => onRejectPost(post.id)}
                                className="px-3 py-1 bg-white text-red-600 rounded border border-red-200 text-sm font-medium hover:bg-red-50 transition-colors flex items-center"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </button>
                              <button
                                onClick={() => onApprovePost(post.id)}
                                className="px-3 py-1 bg-white text-green-600 rounded border border-green-200 text-sm font-medium hover:bg-green-50 transition-colors flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-[#131837] mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Publications approuvées ({approvedPosts.length})
                    </h4>
                    
                    {approvedPosts.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Aucune publication approuvée</p>
                    ) : (
                      <div className="space-y-3">
                        {approvedPosts.map(post => (
                          <div key={post.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-center mb-2">
                                <div className="bg-gray-100 p-1 rounded-full mr-2">
                                  {getPostTypeIcon(post.post_type)}
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {post.author_name || 'Invité anonyme'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(post.created_at).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <button
                                  onClick={() => onDeletePost(post.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              {post.post_text && (
                                <p className="text-sm text-gray-700 mb-2">{post.post_text}</p>
                              )}
                              
                              {post.media_url && (post.post_type === 'photo' || post.post_type === 'gif') && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200">
                                  <img 
                                    src={post.media_url} 
                                    alt="Media" 
                                    className="w-full h-40 object-cover"
                                  />
                                </div>
                              )}
                              
                              {post.media_url && post.post_type === 'video' && (
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-200 bg-black aspect-video flex items-center justify-center">
                                  <Video className="h-10 w-10 text-white opacity-50" />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="space-y-6">
              {!enabled ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">Le mur social est désactivé</p>
                  <button
                    onClick={() => onToggleEnabled(true)}
                    className="px-4 py-2 bg-[#D4A5A5] text-white rounded-lg hover:bg-[#D4A5A5]/90 transition-colors"
                  >
                    Activer le mur social
                  </button>
                </div>
              ) : (
                <>
                  {pendingComments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#131837] mb-3 flex items-center">
                        <Eye className="h-5 w-5 mr-2 text-amber-500" />
                        Commentaires en attente ({pendingComments.length})
                      </h4>
                      
                      <div className="space-y-3">
                        {pendingComments.map(comment => (
                          <div key={comment.id} className="border border-amber-200 rounded-lg overflow-hidden bg-amber-50">
                            <div className="p-4">
                              <div className="flex items-center mb-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {comment.author_name || 'Invité anonyme'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              
                              <p className="text-sm text-gray-700">{comment.comment_text}</p>
                            </div>
                            
                            <div className="bg-amber-100 p-2 flex justify-end space-x-2">
                              <button
                                onClick={() => onRejectComment(comment.id)}
                                className="px-3 py-1 bg-white text-red-600 rounded border border-red-200 text-sm font-medium hover:bg-red-50 transition-colors flex items-center"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </button>
                              <button
                                onClick={() => onApproveComment(comment.id)}
                                className="px-3 py-1 bg-white text-green-600 rounded border border-green-200 text-sm font-medium hover:bg-green-50 transition-colors flex items-center"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-medium text-[#131837] mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Commentaires approuvés ({approvedComments.length})
                    </h4>
                    
                    {approvedComments.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">Aucun commentaire approuvé</p>
                    ) : (
                      <div className="space-y-3">
                        {approvedComments.map(comment => (
                          <div key={comment.id} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div className="p-4">
                              <div className="flex items-center mb-2">
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {comment.author_name || 'Invité anonyme'}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString('fr-FR')}
                                  </p>
                                </div>
                                <button
                                  onClick={() => onDeleteComment(comment.id)}
                                  className="p-1 text-gray-400 hover:text-red-500"
                                  title="Supprimer"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                              
                              <p className="text-sm text-gray-700">{comment.comment_text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SocialWallEditor;