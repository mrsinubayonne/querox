import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CGUCGV: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header avec retour */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
          
          <div className="text-center">
            <img 
              src="/lovable-uploads/logo-querox.png" 
              alt="QUEROX Logo" 
              className="h-20 w-auto mx-auto mb-6"
            />
            <h1 className="text-4xl font-black text-foreground mb-4">
              Conditions Générales d'Utilisation (CGU) et<br />
              Conditions Générales de Vente (CGV)
            </h1>
            <p className="text-xl text-muted-foreground">
              QUEROX - Plateforme SaaS de gestion pour restaurants
            </p>
          </div>
        </div>

        {/* Contenu */}
        <div className="bg-card rounded-2xl shadow-xl p-8 space-y-8 border border-border">
          
          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-4">1. Présentation de QUEROX</h2>
            <p className="text-muted-foreground leading-relaxed">
              QUEROX est une plateforme SaaS destinée aux restaurants, offrant des outils de gestion tels que : prise de commandes, site web automatique, suivi des stocks, réservation en ligne, QR menu, gestion des clients, programme de fidélité, statistiques avancées et autres fonctionnalités professionnelles.
            </p>
            <p className="text-muted-foreground leading-relaxed mt-4">
              L'accès et l'utilisation de la plateforme impliquent l'acceptation pleine et entière des présentes CGU/CGV par le client.
            </p>
          </section>

          <div className="border-t border-border pt-8">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              CONDITIONS GÉNÉRALES D'UTILISATION (CGU)
            </h2>

            {/* Section 2 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">2. Accès au service</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Le service est accessible 24h/24, 7j/7, sauf interruptions pour maintenance ou cas de force majeure.</li>
                <li>QUEROX n'est pas responsable des interruptions liées aux fournisseurs tiers (hébergement, API, Cloudflare, etc.).</li>
                <li>L'utilisateur doit disposer d'un équipement compatible et d'une connexion internet.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">3. Création de compte</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>L'utilisateur s'engage à fournir des informations exactes.</li>
                <li>Le compte est personnel et confidentiel. Toute activité réalisée depuis celui-ci est réputée effectuée par le client.</li>
                <li>QUEROX peut suspendre ou supprimer un compte en cas d'usage frauduleux ou non conforme.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">4. Utilisation autorisée</h3>
              <p className="text-muted-foreground mb-2">L'utilisateur s'engage à :</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Ne pas tenter de contourner la sécurité de la plateforme.</li>
                <li>Ne pas utiliser le service pour des activités illégales.</li>
                <li>Respecter les réglementations locales concernant les commerces de restauration.</li>
                <li>Ne pas copier, revendre ou redistribuer le logiciel sans autorisation.</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">5. Données et confidentialité</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>QUEROX collecte uniquement les données nécessaires au fonctionnement du service.</li>
                <li>Les données commerciales du restaurant restent confidentielles et ne sont jamais revendues.</li>
                <li>L'utilisateur peut demander la suppression de son compte ou de ses données à tout moment.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">6. Propriété intellectuelle</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>QUEROX, son interface, son code et son design sont protégés.</li>
                <li>Aucune reproduction ou extraction n'est autorisée sans accord écrit.</li>
              </ul>
            </section>

            {/* Section 7 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">7. Limitation de responsabilité</h3>
              <p className="text-muted-foreground mb-2">QUEROX n'est pas responsable :</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Des pertes financières liées à une mauvaise utilisation de la plateforme.</li>
                <li>Des erreurs d'intégration dues à l'utilisateur.</li>
                <li>Des problèmes liés à l'hébergement, aux pannes internet ou aux services tiers.</li>
                <li>Des contenus ajoutés par les clients (photos, menus, descriptions, prix, etc.).</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">8. Disponibilité et maintenance</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>QUEROX peut effectuer des mises à jour pour améliorer la plateforme.</li>
                <li>Certaines fonctionnalités peuvent être modifiées ou supprimées.</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">9. Résiliation</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>L'utilisateur peut résilier à tout moment.</li>
                <li>QUEROX peut résilier en cas de non-paiement ou de non-respect des CGU.</li>
                <li>Aucun remboursement ne sera effectué pour une période déjà commencée.</li>
              </ul>
            </section>
          </div>

          <div className="border-t border-border pt-8">
            <h2 className="text-3xl font-bold text-foreground mb-6 text-center">
              CONDITIONS GÉNÉRALES DE VENTE (CGV)
            </h2>

            {/* Section 10 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">10. Prix</h3>
              <p className="text-muted-foreground mb-3">Les tarifs QUEROX sont proposés en trois formules :</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li><strong>35 000 FCFA / mois</strong> – Offre Essentielle</li>
                <li><strong>65 000 FCFA / mois</strong> – Offre Pro</li>
                <li><strong>91 000 FCFA / mois</strong> – Offre Premium</li>
              </ul>
              <p className="text-muted-foreground mt-3">
                Les prix peuvent évoluer. En cas de modification, les utilisateurs seront informés à l'avance.
              </p>
            </section>

            {/* Section 11 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">11. Modalités de paiement</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Paiement mensuel ou annuel selon l'abonnement choisi.</li>
                <li>Les paiements ne sont pas remboursables.</li>
                <li>Le non-paiement entraîne la suspension automatique du service.</li>
              </ul>
            </section>

            {/* Section 12 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">12. Renouvellement</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Les abonnements sont tacitement reconduits chaque mois.</li>
                <li>L'utilisateur peut arrêter le renouvellement à tout moment via son tableau de bord.</li>
              </ul>
            </section>

            {/* Section 13 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">13. Essai gratuit</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>QUEROX peut proposer un essai gratuit selon décision de l'entreprise.</li>
                <li>L'essai ne donne pas accès à l'intégralité des fonctionnalités.</li>
                <li>L'utilisateur doit ajouter un moyen de paiement pour activer l'abonnement après la période d'essai.</li>
              </ul>
            </section>

            {/* Section 14 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">14. Obligations du client</h3>
              <p className="text-muted-foreground mb-2">Le client s'engage à :</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Utiliser le service conformément à sa finalité.</li>
                <li>Fournir des informations exactes (prix, menus, horaires, etc.).</li>
                <li>Respecter les lois liées à son activité.</li>
              </ul>
            </section>

            {/* Section 15 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">15. Support</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>QUEROX offre un support technique par chat, email ou téléphone selon la formule.</li>
                <li>Le support couvre uniquement l'utilisation de la plateforme, pas les problèmes externes.</li>
              </ul>
            </section>

            {/* Section 16 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">16. Suspension de service</h3>
              <p className="text-muted-foreground mb-2">QUEROX peut suspendre l'accès en cas de :</p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Non-paiement.</li>
                <li>Utilisation frauduleuse.</li>
                <li>Violation des CGU/CGV.</li>
              </ul>
            </section>

            {/* Section 17 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">17. Responsabilité commerciale</h3>
              <p className="text-muted-foreground">
                QUEROX ne garantit pas le succès financier du restaurant. La plateforme fournit des outils, mais la gestion du commerce reste sous la responsabilité du client.
              </p>
            </section>

            {/* Section 18 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">18. Force majeure</h3>
              <p className="text-muted-foreground">
                QUEROX n'est pas responsable des impossibilités d'exécution liées à des événements indépendants de son contrôle (pannes réseau, catastrophes, conflits, etc.).
              </p>
            </section>

            {/* Section 19 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">19. Loi applicable</h3>
              <p className="text-muted-foreground">
                Les présentes CGU/CGV sont régies par le droit applicable du pays où est situé le siège de QUEROX.
              </p>
            </section>

            {/* Section 20 */}
            <section className="mb-8">
              <h3 className="text-xl font-bold text-foreground mb-3">20. Contact</h3>
              <p className="text-muted-foreground">
                Pour toute demande, le service support est disponible via : <a href="mailto:support@querox.com" className="text-primary hover:underline">support@querox.com</a>
              </p>
            </section>
          </div>

          {/* Footer de la page */}
          <div className="border-t border-border pt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Document mis à jour le {new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>

        {/* Bouton retour en bas */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CGUCGV;
