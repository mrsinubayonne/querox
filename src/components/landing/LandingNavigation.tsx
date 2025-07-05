
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { User, LogOut } from 'lucide-react';

const LandingNavigation: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/78a2d79c-a1fb-4c60-a0db-7800ea5d0fa0.png" 
              alt="QUEROX Logo" 
              className="h-12 w-auto mr-3"
            />
            <h1 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
              QUEROX
            </h1>
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a href="#features" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                Fonctionnalités
              </a>
              <a href="#pricing" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                Tarifs
              </a>
              <a href="#contact" className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-semibold transition-colors">
                Contact
              </a>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm text-gray-700 font-medium">
                    {user.user_metadata?.full_name || user.email}
                  </span>
                </div>
                <Button onClick={() => navigate('/menus')} size="sm" className="bg-purple-600 hover:bg-purple-700">
                  Dashboard
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </Button>
              </div>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={() => navigate('/auth')} className="border-purple-600 text-purple-600 hover:bg-purple-50">
                  Connexion
                </Button>
                <Button size="sm" onClick={() => navigate('/auth')} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-lg">
                  🚀 Essai Gratuit 3 Jours
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavigation;
