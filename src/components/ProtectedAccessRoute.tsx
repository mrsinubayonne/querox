import React, { useState, useEffect } from 'react';
import { useAccessCodes } from '@/hooks/useAccessCodes';
import AccessCodePrompt from './AccessCodePrompt';
import { Loader2 } from 'lucide-react';

interface ProtectedAccessRouteProps {
  children: React.ReactNode;
  type: 'accounting' | 'management';
  title: string;
  description: string;
}

const ProtectedAccessRoute: React.FC<ProtectedAccessRouteProps> = ({
  children,
  type,
  title,
  description,
}) => {
  const [showPrompt, setShowPrompt] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const { verifyCode, loading } = useAccessCodes();

  const handleVerify = async (code: string): Promise<boolean> => {
    const isValid = await verifyCode(code, type);
    if (isValid) {
      setIsVerified(true);
      setShowPrompt(false);
      // Store verification in session
      sessionStorage.setItem(`access_verified_${type}`, 'true');
    }
    return isValid;
  };

  useEffect(() => {
    // Check if already verified in this session
    const verified = sessionStorage.getItem(`access_verified_${type}`);
    if (verified === 'true') {
      setIsVerified(true);
      setShowPrompt(false);
    }
  }, [type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <>
        <div className="flex items-center justify-center h-screen bg-muted/30">
          <div className="text-center space-y-4 p-8">
            <div className="text-6xl">🔒</div>
            <h2 className="text-2xl font-bold">Accès protégé</h2>
            <p className="text-muted-foreground">
              Veuillez entrer votre code d'accès pour continuer
            </p>
          </div>
        </div>
        <AccessCodePrompt
          open={showPrompt}
          onOpenChange={setShowPrompt}
          onVerify={handleVerify}
          title={title}
          description={description}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default ProtectedAccessRoute;
