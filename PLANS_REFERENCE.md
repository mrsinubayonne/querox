# Référence des Plans d'Abonnement Querox

Ce document définit la nomenclature standardisée des plans d'abonnement dans toute l'application.

## Plans Disponibles

### 1. Plan Starter
- **Identifiant technique**: `starter`
- **Nom commercial**: "Starter"
- **Prix**: 59€/mois (620€/an)
- **Limites**:
  - 1 point de vente
  - 2 profils utilisateurs
  - 3 membres d'équipe

### 2. Plan Professionnel
- **Identifiant technique**: `premium`
- **Nom commercial**: "Professionnel"
- **Prix**: 99€/mois (1040€/an)
- **Limites**:
  - 2 points de vente
  - 5 profils utilisateurs
  - 10 membres d'équipe

### 3. Plan Entreprise
- **Identifiant technique**: `pro`
- **Nom commercial**: "Entreprise"
- **Prix**: 139€/mois (1460€/an)
- **Limites**:
  - 3 points de vente
  - 10 profils utilisateurs
  - 50 membres d'équipe

### 4. Plan Business
- **Identifiant technique**: `business`
- **Nom commercial**: "Business"
- **Prix**: Sur devis
- **Limites**:
  - 5 points de vente
  - 15 profils utilisateurs
  - 100 membres d'équipe

### 5. Plan Licence
- **Identifiant technique**: `licence`
- **Nom commercial**: "LICENCE QUEROX"
- **Prix**: Sur devis
- **Limites**: Illimitées (999)

### 6. Admin
- **Identifiant technique**: `admin`
- **Usage**: Comptes administrateurs système uniquement
- **Limites**: Illimitées (999)

## ⚠️ IMPORTANT - Noms Dépréciés

Les identifiants suivants NE DOIVENT PLUS être utilisés dans le code :
- ❌ `basic` → Utiliser `starter`
- ❌ `entreprise` → Utiliser `pro`

## Mise à Jour de la Base de Données

Si des utilisateurs ont des plans avec les anciens identifiants, exécuter :

```sql
-- Mettre à jour les anciens identifiants vers les nouveaux
UPDATE subscribers 
SET subscription_tier = 'starter' 
WHERE subscription_tier = 'basic';

UPDATE subscribers 
SET subscription_tier = 'pro' 
WHERE subscription_tier = 'entreprise';
```

## Fichiers Concernés

Les fichiers suivants utilisent ces identifiants et doivent être cohérents :
- `src/hooks/useOutlets.ts` - OUTLET_LIMITS
- `src/hooks/useTeamMembers.ts` - TEAM_LIMITS
- `src/hooks/useUserProfiles.ts` - getProfileLimit()
- `src/components/landing/pricingData.ts` - plans[]
- `src/hooks/useAdminRevenue.ts` - fetchSubscribersByPlan()
