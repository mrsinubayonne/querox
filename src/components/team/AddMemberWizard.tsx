import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Shield, 
  Building2, 
  ChevronRight, 
  ChevronLeft,
  ChevronDown,
  Check,
  UserCog,
  UtensilsCrossed,
  Calculator,
  ChefHat,
  Truck
} from 'lucide-react';
import { PermissionSelector, Permission } from './PermissionSelector';
import { cn } from '@/lib/utils';

interface Outlet {
  id: string;
  name: string;
  address?: string | null;
}

interface AddMemberWizardProps {
  permissions: Permission[];
  permissionsLoading: boolean;
  outlets: Outlet[];
  outletsLoading: boolean;
  onSubmit: (data: {
    fullName: string;
    email: string;
    selectedPermissions: string[];
    selectedOutlets: string[];
  }) => Promise<void>;
}

// Predefined type profiles with their default permissions
const TYPE_PROFILES = [
  {
    id: 'manager',
    name: 'Manager',
    icon: UserCog,
    color: 'bg-purple-100 text-purple-700 border-purple-300',
    description: 'Accès complet sauf paramètres sensibles',
    permissionPatterns: ['view', 'manage', 'orders', 'menu', 'customers', 'invoices', 'inventory', 'reservations', 'analytics', 'tables', 'accounting', 'events', 'reports']
  },
  {
    id: 'server',
    name: 'Serveur',
    icon: UtensilsCrossed,
    color: 'bg-blue-100 text-blue-700 border-blue-300',
    description: 'Commandes, tables et menu',
    permissionPatterns: ['orders', 'tables', 'menu:view', 'reservations:view']
  },
  {
    id: 'cashier',
    name: 'Caissier',
    icon: Calculator,
    color: 'bg-green-100 text-green-700 border-green-300',
    description: 'Factures, commandes et paiements',
    permissionPatterns: ['invoices', 'orders', 'debtors', 'tables']
  },
  {
    id: 'cook',
    name: 'Cuisinier',
    icon: ChefHat,
    color: 'bg-orange-100 text-orange-700 border-orange-300',
    description: 'Menu et inventaire',
    permissionPatterns: ['menu', 'inventory', 'orders:view']
  },
  {
    id: 'delivery',
    name: 'Livreur',
    icon: Truck,
    color: 'bg-cyan-100 text-cyan-700 border-cyan-300',
    description: 'Commandes en livraison',
    permissionPatterns: ['orders:view', 'customers:view']
  }
];

const STEPS = [
  { id: 1, title: 'Informations', icon: User },
  { id: 2, title: 'Permissions', icon: Shield },
  { id: 3, title: 'Points de vente', icon: Building2 }
];

export const AddMemberWizard: React.FC<AddMemberWizardProps> = ({
  permissions,
  permissionsLoading,
  outlets,
  outletsLoading,
  onSubmit
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedOutlets, setSelectedOutlets] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTypeProfile = (profileId: string) => {
    const profile = TYPE_PROFILES.find(p => p.id === profileId);
    if (!profile) return;

    const matchingPermissions = permissions.filter(perm => {
      const permKey = `${perm.category}:${perm.name}`.toLowerCase();
      return profile.permissionPatterns.some(pattern => {
        if (pattern.includes(':')) {
          return permKey.includes(pattern.toLowerCase());
        }
        return perm.category.toLowerCase().includes(pattern.toLowerCase()) || 
               perm.name.toLowerCase().includes(pattern.toLowerCase());
      });
    });

    setSelectedPermissions(matchingPermissions.map(p => p.id));
  };

  const toggleOutletSelection = (outletId: string) => {
    setSelectedOutlets(prev => 
      prev.includes(outletId) 
        ? prev.filter(id => id !== outletId)
        : [...prev, outletId]
    );
  };

  const selectAllOutlets = () => {
    setSelectedOutlets(outlets.map(o => o.id));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return fullName.trim() && email.trim();
      case 2:
        return selectedPermissions.length > 0;
      case 3:
        return selectedOutlets.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        fullName,
        email,
        selectedPermissions,
        selectedOutlets
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isActive && "bg-purple-600 text-white",
                  isCompleted && "bg-green-500 text-white",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}>
                  {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <span className={cn(
                  "text-xs mt-1 font-medium",
                  isActive && "text-purple-600",
                  isCompleted && "text-green-600",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}>
                  {step.title}
                </span>
              </div>
              {index < STEPS.length - 1 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  currentStep > step.id ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step content */}
      <div className="min-h-[280px]">
        {/* Step 1: Basic info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nom complet *</Label>
              <Input
                id="fullName"
                placeholder="Jean Dupont"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="email">Adresse email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@exemple.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Le membre se connectera avec cet email et son code d'accès.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Permissions */}
        {currentStep === 2 && (
          <div className="space-y-4">
            {/* Type profiles shortcuts */}
            <div>
              <Label className="mb-2 block">Profils types (raccourcis)</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TYPE_PROFILES.map((profile) => {
                  const Icon = profile.icon;
                  return (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => applyTypeProfile(profile.id)}
                      className={cn(
                        "flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105",
                        profile.color
                      )}
                    >
                      <Icon className="w-2 h-2 mb-1" />
                      <span className="font-medium text-sm">{profile.name}</span>
                      <span className="text-xs opacity-75 text-center">{profile.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex flex-col items-center gap-1 mb-3 text-muted-foreground">
                <span className="text-sm">Ou personnalisez les permissions</span>
                <ChevronDown className="w-4 h-4" />
              </div>
              <PermissionSelector
                permissions={permissions}
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                loading={permissionsLoading}
              />
            </div>
          </div>
        )}

        {/* Step 3: Outlets */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Points de vente assignés *</Label>
              {outlets.length > 1 && (
                <Button type="button" variant="ghost" size="sm" onClick={selectAllOutlets}>
                  Tout sélectionner
                </Button>
              )}
            </div>
            
            {outletsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : outlets.length === 0 ? (
              <div className="text-sm text-muted-foreground p-4 bg-muted rounded-md text-center">
                Aucun point de vente disponible. Créez d'abord un PDV.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {outlets.map((outlet) => (
                  <label 
                    key={outlet.id} 
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      selectedOutlets.includes(outlet.id) 
                        ? "border-purple-500 bg-purple-50" 
                        : "border-border hover:border-purple-300"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedOutlets.includes(outlet.id)}
                      onChange={() => toggleOutletSelection(outlet.id)}
                      className="sr-only"
                    />
                    <Building2 className={cn(
                      "w-5 h-5",
                      selectedOutlets.includes(outlet.id) ? "text-purple-600" : "text-muted-foreground"
                    )} />
                    <div className="flex-1">
                      <div className="font-medium">{outlet.name}</div>
                      {outlet.address && (
                        <div className="text-xs text-muted-foreground">{outlet.address}</div>
                      )}
                    </div>
                    {selectedOutlets.includes(outlet.id) && (
                      <Check className="w-5 h-5 text-purple-600" />
                    )}
                  </label>
                ))}
              </div>
            )}

            {selectedOutlets.length > 0 && (
              <Badge variant="secondary">
                {selectedOutlets.length} PDV sélectionné{selectedOutlets.length > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Précédent
        </Button>

        {currentStep < 3 ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Suivant
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Check className="w-4 h-4 mr-1" />
            )}
            Créer l'invitation
          </Button>
        )}
      </div>
    </div>
  );
};
