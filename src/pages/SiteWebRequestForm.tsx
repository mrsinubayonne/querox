
import React from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Palette } from "lucide-react";

// Objectifs proposés
const OBJECTIFS = [
  "Présenter le menu",
  "Prendre des réservations",
  "Permettre les commandes en ligne",
  "Informer / attirer de nouveaux clients",
  "Autre",
];

// Fonctionnalités proposées
const FONCTIONNALITES = [
  "Réservation en ligne",
  "Paiement en ligne",
  "Formulaire de contact",
  "Galerie photo",
  "Avis clients",
  "Carte Google Maps",
];

// Nouveau schéma : ajout champ "color"
const formSchema = z.object({
  restaurantName: z.string().min(2, "Nom requis"),
  address: z.string().min(5, "Adresse requise"),
  maintenanceManagement: z.enum(["yes", "no"], {
    required_error: "Merci de choisir si vous souhaitez la maintenance.",
  }),
  color: z.string().min(2, "Merci d’indiquer une couleur souhaitée"), // nouveau champ couleur
  notes: z.string().optional(),
});

export type SiteWebRequestFields = z.infer<typeof formSchema>;

interface SiteWebRequestFormProps {
  onSubmit: (data: SiteWebRequestFields) => void;
  loading?: boolean;
}

const SiteWebRequestForm: React.FC<SiteWebRequestFormProps> = ({
  onSubmit,
  loading,
}) => {
  const form = useForm<SiteWebRequestFields>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      restaurantName: "",
      address: "",
      maintenanceManagement: undefined,
      color: "",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-5"
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <div>
          {/* Nom du restaurant */}
          <FormField
            control={form.control}
            name="restaurantName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Quel est le nom de votre restaurant ?
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: Le Bistrot du Coin"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* Adresse */}
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Où est-il situé ? <span className="font-normal">(Adresse complète)</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Ex: 42 rue de Paris, 75000 Paris"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Couleur */}
        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                <span className="flex items-center gap-2">
                  <Palette size={18} className="text-purple-700" />
                  Quelle couleur souhaitez-vous pour votre site ?
                </span>
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: Violet, rouge, couleurs du logo..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Maintenance + Gestion */}
        <FormField
          control={form.control}
          name="maintenanceManagement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Souhaitez-vous inclure la maintenance de votre site + gestion ?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2 mt-2"
                >
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="yes" id="maintenance-yes" />
                    <label htmlFor="maintenance-yes" className="text-sm">
                      Oui <span className="text-green-600 font-semibold">(seulement 2000f supplémentaire)</span>
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="no" id="maintenance-no" />
                    <label htmlFor="maintenance-no" className="text-sm">
                      Non merci
                    </label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Notes complémentaires */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Informations complémentaires (facultatif)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Détail supplémentaire, contraintes, ou liens utiles"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          Envoyer ma demande 🚀
        </Button>
      </form>
    </Form>
  );
};

export default SiteWebRequestForm;
