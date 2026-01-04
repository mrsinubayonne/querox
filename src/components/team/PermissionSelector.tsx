import React from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  UtensilsCrossed, 
  Users, 
  Receipt, 
  Package, 
  CalendarDays, 
  BarChart3, 
  Settings, 
  UserCog,
  LayoutGrid,
  Calculator,
  Calendar,
  Globe,
  QrCode,
  FileText,
  CreditCard
} from 'lucide-react';

export interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

interface PermissionSelectorProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (permissionIds: string[]) => void;
  loading?: boolean;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  orders: { label: 'Commandes', icon: ShoppingCart, color: 'text-blue-600' },
  menu: { label: 'Menu', icon: UtensilsCrossed, color: 'text-orange-600' },
  customers: { label: 'Clients', icon: Users, color: 'text-green-600' },
  invoices: { label: 'Factures', icon: Receipt, color: 'text-purple-600' },
  inventory: { label: 'Inventaire', icon: Package, color: 'text-amber-600' },
  reservations: { label: 'Réservations', icon: CalendarDays, color: 'text-pink-600' },
  analytics: { label: 'Statistiques', icon: BarChart3, color: 'text-indigo-600' },
  settings: { label: 'Paramètres', icon: Settings, color: 'text-gray-600' },
  team: { label: 'Équipe', icon: UserCog, color: 'text-red-600' },
  tables: { label: 'Tables', icon: LayoutGrid, color: 'text-cyan-600' },
  accounting: { label: 'Comptabilité', icon: Calculator, color: 'text-emerald-600' },
  events: { label: 'Événements', icon: Calendar, color: 'text-violet-600' },
  website: { label: 'Site Web', icon: Globe, color: 'text-sky-600' },
  qrcodes: { label: 'QR Codes', icon: QrCode, color: 'text-lime-600' },
  reports: { label: 'Rapports', icon: FileText, color: 'text-rose-600' },
  debtors: { label: 'Débiteurs', icon: CreditCard, color: 'text-teal-600' },
};

export const PermissionSelector: React.FC<PermissionSelectorProps> = ({
  permissions,
  selectedPermissions,
  onChange,
  loading = false
}) => {
  // Group permissions by category
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const togglePermission = (permissionId: string) => {
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter(id => id !== permissionId));
    } else {
      onChange([...selectedPermissions, permissionId]);
    }
  };

  const toggleCategory = (category: string) => {
    const categoryPermissions = groupedPermissions[category] || [];
    const categoryIds = categoryPermissions.map(p => p.id);
    const allSelected = categoryIds.every(id => selectedPermissions.includes(id));
    
    if (allSelected) {
      onChange(selectedPermissions.filter(id => !categoryIds.includes(id)));
    } else {
      const newSelected = [...selectedPermissions];
      categoryIds.forEach(id => {
        if (!newSelected.includes(id)) {
          newSelected.push(id);
        }
      });
      onChange(newSelected);
    }
  };

  const selectAll = () => {
    onChange(permissions.map(p => p.id));
  };

  const selectNone = () => {
    onChange([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick actions */}
      <div className="flex gap-2">
        <Button type="button" variant="ghost" size="sm" onClick={selectAll} className="text-xs">
          Tout sélectionner
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={selectNone} className="text-xs">
          Tout désélectionner
        </Button>
      </div>

      {/* Permission groups */}
      <div className="space-y-3 border rounded-md p-3 max-h-64 overflow-y-auto">
        {Object.entries(groupedPermissions).map(([category, perms]) => {
          const config = CATEGORY_CONFIG[category] || { 
            label: category, 
            icon: Settings, 
            color: 'text-gray-600' 
          };
          const Icon = config.icon;
          const categoryIds = perms.map(p => p.id);
          const selectedCount = categoryIds.filter(id => selectedPermissions.includes(id)).length;
          const allSelected = selectedCount === categoryIds.length;

          return (
            <div key={category} className="space-y-2">
              <div 
                className="flex items-center gap-2 cursor-pointer hover:bg-muted p-1 rounded"
                onClick={() => toggleCategory(category)}
              >
                <Icon className={`w-4 h-4 ${config.color}`} />
                <span className="font-medium text-sm">{config.label}</span>
                <Badge variant="secondary" className="text-xs ml-auto">
                  {selectedCount}/{categoryIds.length}
                </Badge>
                <Checkbox checked={allSelected} />
              </div>
              
              <div className="ml-6 space-y-1">
                {perms.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-center gap-2 p-1 hover:bg-muted/50 rounded cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedPermissions.includes(perm.id)}
                      onCheckedChange={() => togglePermission(perm.id)}
                    />
                    <span className="text-sm">{perm.description}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected count */}
      <p className="text-xs text-muted-foreground">
        {selectedPermissions.length} permission{selectedPermissions.length > 1 ? 's' : ''} sélectionnée{selectedPermissions.length > 1 ? 's' : ''}
      </p>
    </div>
  );
};
