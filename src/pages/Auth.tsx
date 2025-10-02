
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignUpForm from '@/components/auth/SignUpForm';

const Auth: React.FC = () => {
  const { user, loading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Chargement...</h3>
            <p className="text-sm text-muted-foreground">Vérification de votre session</p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background flex items-center justify-center p-4">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--primary))_0.05,transparent)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,hsl(var(--primary))_0.05,transparent)] pointer-events-none"></div>
      
      <div className="relative w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <img 
              src="/lovable-uploads/a2262c2b-4c9e-4359-bc71-081861dfbd12.png" 
              alt="QUEROX Logo" 
              className="h-12 w-auto"
            />
            <h1 className="text-4xl font-black bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              QUEROX
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La solution complète pour gérer votre restaurant avec simplicité et efficacité
          </p>
        </div>

        {/* Auth Forms */}
        <div className="flex justify-center">
          {isLogin ? (
            <LoginForm onSwitchToSignUp={() => setIsLogin(false)} />
          ) : (
            <SignUpForm onSwitchToLogin={() => setIsLogin(true)} />
          )}
        </div>

        {/* Benefits */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Configuration rapide</h3>
            <p className="text-sm text-muted-foreground">Votre restaurant en ligne en moins de 5 minutes</p>
          </div>
          
          <div className="text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <h3 className="font-semibold text-foreground mb-2">Support 24/7</h3>
            <p className="text-sm text-muted-foreground">Une équipe dédiée pour vous accompagner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
