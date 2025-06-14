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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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

// On retire la question sur les éléments disponibles et sur les exemples
const formSchema = z.object({
  restaurantName: z.string().min(2, "Nom requis"),
  address: z.string().min(5, "Adresse requise"),
  gestionSite: z.enum(
    ["auto", "equipe"],
    {
      required_error:
        "Choisissez une option sur la gestion du site après mise en ligne.",
    }
  ),
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
      gestionSite: undefined,
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

        <FormField
          control={form.control}
          name="gestionSite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                JE VEUX A LA PLACE CELA 
                REMPLACER CONTRE Souhaitez-vous gérer le site vous-même après sa mise en ligne ou nous confier la gestion ?
              </FormLabel>
              <FormControl>
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex flex-col gap-2 mt-2"
                >
                  <RadioGroupItem value="auto" id="auto" />
                  <label htmlFor="auto" className="ml-2 mb-2 text-sm">Je veux pouvoir modifier moi-même</label>
                  <RadioGroupItem value="equipe" id="equipe" />
                  <label htmlFor="equipe" className="ml-2 text-sm">Je préfère qu’une équipe s’en charge</label>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
