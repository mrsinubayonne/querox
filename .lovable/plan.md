## Objectif
Corriger 3 points liés à la gestion d'équipe / plan de salle.

---

### 1. Code restaurant invisible (capture: "—" affiché)
**Cause** : `RestaurantCodeCard` lit `profiles.restaurant_code` avec `user.id`. Quand le compte connecté est un **membre d'équipe**, `user.id` n'est pas l'`owner` — la requête ne retourne rien (RLS + ligne inexistante). Les codes existent bien en base pour les propriétaires.

**Correctif** : dans `src/components/team/RestaurantCodeCard.tsx`, résoudre l'`ownerId` via `useAuth()` :
```ts
const { user, isTeamMember, teamMemberSession } = useAuth();
const ownerId = isTeamMember ? teamMemberSession?.ownerId : user?.id;
// .eq('id', ownerId)
```
Ajout d'un fallback : si `restaurant_code` est null pour un owner, appeler la RPC existante de génération (ou re-trigger via update no-op) puis recharger.

---

### 2. Une seule salle par point de vente
**Règle métier** : 1 `floor_plan_zone` max par `outlet_id`.

**Frontend** (`src/components/tables/FloorPlanView.tsx`) :
- Masquer le bouton "Salle" (ajouter) et l'onglet `Tabs` des salles dès qu'une zone existe.
- L'unique zone porte automatiquement le nom du point de vente (récupéré via `useOutletContext`/outlets) — pas de prompt.
- Conserver Renommer / Supprimer (pour reset).
- Au premier accès si aucune zone : auto-création silencieuse (plus de bouton "Créer ma première salle").

**Backend** : ajouter un index unique partiel pour garantir l'invariant :
```sql
CREATE UNIQUE INDEX floor_plan_zones_one_per_outlet
  ON public.floor_plan_zones(outlet_id);
```
(Si plusieurs zones existent déjà pour un outlet, garder la plus ancienne et migrer les tables vers elle avant l'index.)

---

### 3. Export PDF/Image du plan de salle dans Rapports
**Emplacement** : `src/pages/RapportsJournaliers.tsx` — ajouter une carte "Plan de salle" avec bouton **"Générer aperçu PDF"** et **"Télécharger image PNG"**.

**Implémentation** (100% client, compatible offline) :
- Nouveau composant `src/components/tables/FloorPlanSnapshot.tsx` : rend le plan en lecture seule à partir des données de `useFloorPlan` (zones + tables + sessions courantes) dans un conteneur off-screen identifiable (`id="floor-plan-snapshot"`).
- Nouveau util `src/utils/floorPlanExport.ts` :
  - `exportFloorPlanPNG()` : `html2canvas` → blob PNG → `URL.createObjectURL` → download.
  - `exportFloorPlanPDF()` : `html2canvas` → `jsPDF` A4 paysage → ajoute en-tête (nom restaurant, date DD-MM-YY, point de vente, légende statuts) → `pdf.save()`.
- Imports **dynamiques** (`await import('jspdf')`, `await import('html2canvas')`) pour ne pas alourdir le bundle (cohérent avec la politique existante).
- Inclure dans l'image : titre PDV, date, légende couleurs (Libre/Occupée/Attente/Payée), n° de chaque table + couverts.
- Fonctionne offline : html2canvas + jsPDF tournent en local ; les données viennent du cache React/Zustand.

**Dépendance** : `html2canvas` n'est pas installé → `bun add html2canvas` ; `jspdf` est déjà présent (utilisé pour factures).

---

### Détails techniques
| Fichier | Action |
|---|---|
| `src/components/team/RestaurantCodeCard.tsx` | Utiliser `ownerId`, ajouter fallback regénération |
| Migration SQL | Index unique partiel sur `floor_plan_zones(outlet_id)` après dédoublonnage |
| `src/components/tables/FloorPlanView.tsx` | Suppression onglets/bouton zone, auto-création, nom = PDV |
| `src/components/tables/FloorPlanSnapshot.tsx` (NEW) | Rendu lecture seule pour export |
| `src/utils/floorPlanExport.ts` (NEW) | Génération PNG/PDF dynamique |
| `src/pages/RapportsJournaliers.tsx` | Nouvelle carte "Plan de salle" avec 2 boutons |
| `package.json` | + `html2canvas` |

---

### Hors scope
- Multilingue (déjà reporté).
- Modification du système de permissions du plan de salle (inchangé).
