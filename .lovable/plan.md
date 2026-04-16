

## Audit de sécurité — Explication détaillée

L'audit a révélé **13 problèmes de sécurité**, dont **5 critiques**. Voici ce que ça signifie concrètement pour QUEROX et tes clients.

---

### 🔴 Vulnérabilités critiques (à corriger en urgence)

**1. Codes d'accès stockés en clair**
- Les PIN des profils de point de vente (`outlet_profiles.access_code`), les codes admin (`user_access_codes`) et les tokens d'invitation équipe (`team_members`) sont stockés tels quels dans la base.
- **Risque** : si quelqu'un accède à la base (fuite, employé Supabase, backup volé), il voit tous les PIN en clair et peut se connecter à n'importe quel profil caissier.
- **Fix** : hasher avec `crypt()` (bcrypt) — comme un mot de passe normal.

**2. Données Stripe exposées au rôle `public`**
- La table `subscribers` (qui contient `stripe_customer_id`, emails, montants d'abonnement) est lisible par le rôle `public` au lieu de `authenticated`.
- **Risque** : un visiteur non connecté pourrait potentiellement lister tes clients payants et leurs revenus mensuels.
- **Fix** : restreindre les politiques RLS au rôle `authenticated` uniquement.

**3. Politiques RLS trop permissives (`USING true`)**
- Certaines tables (`api_rate_limits` pour service_role, et historiquement d'autres) ont des règles qui disent « tout le monde peut tout voir/faire ».
- **Risque** : contourne complètement le contrôle d'accès.
- **Fix** : remplacer par des conditions strictes (`auth.uid() = user_id`).

**4. Bucket d'images sans isolation par utilisateur**
- Le bucket Supabase `images` n'a pas de politique qui force `auth.uid()` dans le chemin du fichier.
- **Risque** : utilisateur A peut écraser/supprimer le logo de utilisateur B s'il devine le chemin.
- **Fix** : politique `storage.foldername(name)[1] = auth.uid()::text`.

**5. Élévation de privilèges possible sur `user_roles`**
- Si un utilisateur peut s'INSÉRER lui-même un rôle `admin` dans `user_roles`, c'est game over.
- **Risque** : n'importe qui devient admin de toute la plateforme.
- **Fix** : politique INSERT qui exige `is_admin()` pour pouvoir attribuer un rôle.

---

### 🟡 Avertissements (importants mais non urgents)

- **PostgreSQL obsolète** : version actuelle < 15, des CVE connues existent. Upgrade via dashboard Supabase.
- **Protection mots de passe faibles désactivée** : Supabase peut bloquer les mots de passe leakés sur HaveIBeenPwned — c'est désactivé.
- **`menus.user_id` exposé** : le champ est visible publiquement (pour le menu public), ce qui révèle l'identifiant interne du propriétaire.

---

### 🛠️ Plan de correction proposé

**Migration SQL automatique** :
1. Hasher tous les `access_code` existants avec `crypt()` + créer fonction `verify_access_code()`
2. Restreindre `subscribers` au rôle `authenticated`
3. Ajouter politique storage `images` scopée par `auth.uid()`
4. Durcir RLS sur `user_roles`, `accounting_entries`, `stock_movements`
5. Masquer `user_id` du retour public de `menus`

**Actions manuelles côté Supabase** (dashboard, je ne peux pas le faire) :
1. Activer **Leaked Password Protection** dans Authentication → Policies
2. Lancer l'upgrade PostgreSQL dans Settings → Database

---

### ⚠️ Impact pour les utilisateurs

Le hashage des codes d'accès est **irréversible** : les codes actuels deviendront invalides côté serveur. Deux options :
- **Option A** (recommandée) : on hashe les codes existants tels quels — aucun changement visible pour les utilisateurs.
- **Option B** : on force tout le monde à régénérer son code au prochain login.

Je recommande **Option A** : la migration lit chaque code en clair, le hashe, le réécrit. Personne ne s'en aperçoit, mais à partir de là tout est sécurisé.

---

### Fichiers impactés

- 1 migration SQL (hashage + RLS + storage policies)
- `src/hooks/useAccessCodes.ts` → utiliser `verify_access_code()` RPC au lieu de comparaison string
- `src/hooks/useOutletProfile.ts` → idem pour PIN profil
- `src/components/AccessCodePrompt.tsx` → adapter le flux de vérification

**Veux-tu que je lance ce plan ?** Confirme « oui » et je passe en mode implémentation.

