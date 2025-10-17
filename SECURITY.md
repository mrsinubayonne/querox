# 🔒 Sécurité & Actions Manuelles Requises

## ⚠️ Actions Critiques à Effectuer dans Supabase

### 1. Activer la Protection des Mots de Passe (CRITIQUE)

**Problème :** La protection des mots de passe n'est pas activée, permettant des mots de passe faibles.

**Solution :**
1. Aller dans votre dashboard Supabase : https://supabase.com/dashboard/project/aufmphldtjrcddyayqoy
2. Naviguer vers `Authentication` → `Policies`
3. Activer **"Enforce password strength"**
4. Configuration recommandée :
   - Minimum 8 caractères
   - Au moins 1 majuscule
   - Au moins 1 chiffre
   - Au moins 1 caractère spécial

---

### 2. Upgrader PostgreSQL (CRITIQUE)

**Problème :** Vous utilisez une version obsolète de PostgreSQL.

**Solution :**
1. Aller dans `Settings` → `Database`
2. Vérifier la version actuelle
3. Si < PostgreSQL 14, planifier une migration :
   - Sauvegarder votre base de données
   - Suivre le guide : https://supabase.com/docs/guides/platform/migrating-and-upgrading-projects
   - Upgrade vers PostgreSQL 15+

---

### 3. Configurer l'Email de Confirmation (OPTIONNEL)

**État actuel :** Les utilisateurs doivent confirmer leur email avant de se connecter.

**Pour désactiver (environnement de test uniquement) :**
1. Aller dans `Authentication` → `Providers` → `Email`
2. Désactiver **"Confirm email"**

⚠️ **Attention :** Ne désactivez ceci qu'en développement ! En production, gardez-le activé pour la sécurité.

---

### 4. Configurer les Variables d'Environnement de Production

**Pour le déploiement en production :**

```bash
# .env.production
VITE_APP_ENV=production
VITE_SUPABASE_URL=https://aufmphldtjrcddyayqoy.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=votre_cle_publique
```

---

## ✅ Actions Automatiques Déjà Effectuées

### 1. Suppression des Console.log
- ✅ Tous les `console.log` ont été retirés du code de production
- ✅ Seuls les logs d'erreur critique dans ErrorBoundary sont conservés

### 2. Configuration Centralisée
- ✅ Création du fichier `src/config/app.config.ts`
- ✅ Tous les domaines hardcodés remplacés par des références centralisées
- ✅ Les URLs sont générées dynamiquement

### 3. Suppression des Secrets Exposés
- ✅ API Key Lygos supprimée
- ✅ Edge functions de paiement supprimées

### 4. Gestion d'Erreurs
- ✅ ErrorBoundary global ajouté
- ✅ QueryClient configuré avec retry et timeout

---

## 📊 Résumé de Sécurité

| Catégorie | État | Action Requise |
|-----------|------|----------------|
| Mots de passe | ⚠️ Faible | Activer protection dans Supabase |
| PostgreSQL | ⚠️ Obsolète | Upgrader vers v15+ |
| Console.log | ✅ Résolu | Aucune |
| Secrets | ✅ Résolu | Aucune |
| Configuration | ✅ Résolu | Aucune |
| Domaines | ⚠️ Non fonctionnels | Voir section DNS ci-dessous |

---

## 🌐 Configuration DNS (Domaines Personnalisés)

**Problème actuel :** Les domaines `querox.me` ne fonctionneront pas sans configuration DNS.

**Solutions possibles :**

### Option 1 : Utiliser des Subdomains Lovable (Recommandé)
```typescript
// Dans app.config.ts, remplacer par :
domains: {
  main: 'lovableproject.com',
  publicMenu: 'lovableproject.com/menu',
  publicWebsite: 'lovableproject.com/w',
}
```

### Option 2 : Configurer un Vrai Domaine
1. Acheter le domaine `querox.me`
2. Configurer les DNS :
   ```
   Type: A
   Nom: @
   Valeur: [IP de votre serveur]
   
   Type: CNAME
   Nom: www
   Valeur: querox.me
   ```

### Option 3 : Utiliser Vercel/Netlify
- Déployer sur Vercel avec domaine automatique
- Configurer les rewrites pour `/w/:slug`

---

## 🔐 Checklist Finale de Sécurité

Avant la mise en production :

- [ ] Protection des mots de passe activée
- [ ] PostgreSQL 15+ installé
- [ ] Confirmation email activée en production
- [ ] SSL/HTTPS configuré
- [ ] Variables d'environnement de production configurées
- [ ] Tests de pénétration effectués
- [ ] Backup automatique activé
- [ ] Monitoring et alertes configurés
- [ ] Rate limiting activé sur Supabase
- [ ] CORS configuré correctement

---

## 📞 Support

En cas de question sur ces configurations :
- Documentation Supabase : https://supabase.com/docs
- Support Supabase : https://supabase.com/dashboard/support/new

---

**Dernière mise à jour :** 17 octobre 2025
