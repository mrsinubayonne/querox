import React from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Share2, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface InvitationShareOptionsProps {
  accessCode: string;
  invitationToken: string;
  memberName?: string;
  memberEmail?: string;
}

export const InvitationShareOptions: React.FC<InvitationShareOptionsProps> = ({
  accessCode,
  invitationToken,
  memberName,
  memberEmail
}) => {
  const { toast } = useToast();
  const baseUrl = 'https://querox.me';
  const invitationLink = `${baseUrl}/team-join?token=${invitationToken}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copié !",
      description: `${type} copié dans le presse-papier`
    });
  };

  const shareViaWhatsApp = () => {
    const message = `Bonjour${memberName ? ` ${memberName}` : ''} ! 🎉\n\n` +
      `Vous avez été invité(e) à rejoindre notre équipe Querox.\n\n` +
      `🔗 Lien d'invitation: ${invitationLink}\n\n` +
      `Ou connectez-vous directement:\n` +
      `📧 Email: ${memberEmail || 'votre email'}\n` +
      `🔑 Code d'accès: ${accessCode}\n` +
      `🌐 URL: ${baseUrl}/team-login\n\n` +
      `Bienvenue dans l'équipe ! 👋`;
    
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-4 mt-4">
      {/* Access Code Section */}
      <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-blue-900">
            🔑 Code d'accès
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(accessCode, "Code d'accès")}
            className="h-7"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copier
          </Button>
        </div>
        <code className="block px-4 py-3 bg-white text-blue-700 rounded font-mono text-lg font-bold text-center border border-blue-300">
          {accessCode}
        </code>
      </div>

      {/* Invitation Link Section */}
      <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-purple-900">
            🔗 Lien d'invitation
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(invitationLink, "Lien d'invitation")}
            className="h-7"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copier
          </Button>
        </div>
        <div className="px-3 py-2 bg-white rounded border border-purple-300 text-xs text-purple-700 break-all">
          {invitationLink}
        </div>
      </div>

      {/* Share Actions */}
      <div className="flex gap-2">
        <Button
          onClick={shareViaWhatsApp}
          className="flex-1 bg-green-600 hover:bg-green-700"
        >
          <Send className="w-4 h-4 mr-2" />
          Partager via WhatsApp
        </Button>
      </div>

      {/* Instructions */}
      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs text-gray-700 font-medium mb-2">📋 Instructions pour le membre:</p>
        <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
          <li>Cliquer sur le lien d'invitation OU</li>
          <li>Aller sur <strong>/team-login</strong></li>
          <li>Saisir l'email: <strong>{memberEmail || '(à définir)'}</strong></li>
          <li>Saisir le code d'accès: <strong>{accessCode}</strong></li>
        </ul>
      </div>
    </div>
  );
};
