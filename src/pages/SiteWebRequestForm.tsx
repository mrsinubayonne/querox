
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
  objectifs: z
    .array(z.string())
    .min(1, "Sélectionnez au moins un objectif"),
  objectifAutre: z.string().optional(),
  fonctionnalites: z.array(z.string()).optional(),
  // elementsDisponibles: z.object({ logo: z.enum(["Oui", "Non"]), menu: z.enum(["Oui", "Non"]), photos: z.enum(["Oui", "Non"]), }), // supprimé
  // exemples: z.string().optional(), // supprimé
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
      objectifs: [],
      objectifAutre: "",
      fonctionnalites: [],
      // elementsDisponibles: { logo: "Non", menu: "Non", photos: "Non" }, // supprimé
      // exemples: "", // supprimé
      gestionSite: undefined,
      notes: "",
    },
  });

  const objectifs = OBJECTIFS;
  const fonctionnalites = FONCTIONNALITES;

  // const elementsDisponibles = ELEMENTS_DISPONIBLES; // supprimé

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
          name="objectifs"
          render={() => (
            <FormItem>
              <FormLabel>
                Quel est l’objectif principal de votre site ?
              </FormLabel>
              <div className="flex flex-col gap-2 mt-2">
                {objectifs.map(obj => (
                  <FormField
                    key={obj}
                    control={form.control}
                    name="objectifs"
                    render={({ field }) => (
                      <FormItem
                        key={obj}
                        className="flex flex-row items-center gap-2 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value.includes(obj)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, obj]);
                              } else {
                                field.onChange(field.value.filter((v: string) => v !== obj));
                              }
                            }}
                          />
                        </FormControl>
                        <span className="text-sm">
                          {obj}
                        </span>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              {form.watch('objectifs').includes("Autre") && (
                <FormField
                  control={form.control}
                  name="objectifAutre"
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormLabel>Autre : précisez</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre objectif" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fonctionnalites"
          render={() => (
            <FormItem>
              <FormLabel>
                Souhaitez-vous ajouter des fonctionnalités spécifiques ?
              </FormLabel>
              <div className="flex flex-col gap-2 mt-2">
                {fonctionnalites.map(fn => (
                  <FormField
                    key={fn}
                    control={form.control}
                    name="fonctionnalites"
                    render={({ field }) => (
                      <FormItem
                        key={fn}
                        className="flex flex-row items-center gap-2 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(fn)}
                            onCheckedChange={(checked) => {
                              if (!field.value) return field.onChange([fn]);
                              if (checked) {
                                field.onChange([...field.value, fn]);
                              } else {
                                field.onChange(field.value.filter((v: string) => v !== fn));
                              }
                            }}
                          />
                        </FormControl>
                        <span className="text-sm">
                          {fn}
                        </span>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </FormItem>
          )}
        />

        {/* QUESTIONS SUPPRIMEES */}
        {/* 
        <div>
          <FormLabel>
            Avez-vous déjà ces éléments ?
          </FormLabel>
          <div className="flex flex-col gap-2 mt-2">
            {elementsDisponibles.map((el) => (
              <FormField
                key={el.name}
                control={form.control}
                name={`elementsDisponibles.${el.name}` as any}
                render={({ field }) => (
                  <FormItem
                    key={el.name}
                    className="flex flex-row items-center gap-4"
                  >
                    <span className="w-44">{el.label} :</span>
                    <div className="flex flex-row gap-4">
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={el.name}
                          value="Oui"
                          checked={field.value === 'Oui'}
                          onChange={() => field.onChange("Oui")}
                          className="mr-1"
                        />
                        Oui
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="radio"
                          name={el.name}
                          value="Non"
                          checked={field.value === 'Non'}
                          onChange={() => field.onChange("Non")}
                          className="mr-1"
                        />
                        Non
                      </label>
                    </div>
                  </FormItem>
                )}
              />
            ))}
          </div>
        </div>
        */}

        {/* 
        <FormField
          control={form.control}
          name="exemples"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Avez-vous des exemples de sites que vous aimez ou un style souhaité ?
                <span className="font-normal"> (lien(s) ou description : moderne, traditionnel…)</span>
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Lien(s), style général recherché..."
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        */}

        <FormField
          control={form.control}
          name="gestionSite"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Souhaitez-vous gérer le site vous-même après sa mise en ligne ou nous confier la gestion ?
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

