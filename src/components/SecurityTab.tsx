
import React from 'react';
import { Button } from "@/components/ui/button";
import { LogOut, Key } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

export const SecurityTab: React.FC = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vous déconnecter",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 p-6 bg-card rounded-lg border border-border">
      <h2 className="text-lg font-medium">Sécurité</h2>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Gérez vos paramètres de sécurité et de confidentialité.
        </p>
        
        <div className="space-y-3">
          <Button variant="outline" className="flex items-center gap-2 w-fit">
            <Key className="h-4 w-4" />
            Changer le mot de passe
          </Button>
          
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            className="flex items-center gap-2 w-fit"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};
