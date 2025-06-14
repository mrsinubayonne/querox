
import React from "react";
import { useForm } from "react-hook-form";
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

const formSchema = z.object({
  restaurantName: z.string().min(2, "Nom requis"),
  ownerName: z.string().min(2, "Prénom/Nom requis"),
  phone: z.string().min(9, "Numéro requis"),
  email: z.string().email("Email invalide"),
  style: z.string().min(2, "Style/descriptif requis"),
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
      ownerName: "",
      phone: "",
      email: "",
      style: "",
      notes: "",
    },
  });

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit)}
        autoComplete="off"
      >
        <FormField
          control={form.control}
          name="restaurantName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nom du restaurant</FormLabel>
              <FormControl>
                <Input placeholder="Ex : Le Bistrot du Coin" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ownerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Votre prénom et nom</FormLabel>
              <FormControl>
                <Input placeholder="Ex : Jean Dupont" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 flex-col md:flex-row">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Téléphone</FormLabel>
                <FormControl>
                  <Input placeholder="06..." type="tel" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="contact@email.com" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="style"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Style ou ambiance souhaitée</FormLabel>
              <FormControl>
                <Input placeholder="Ex : Moderne, traditionnel, couleurs, logo..." {...field} />
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
                  placeholder="Ce qui est important pour vous, ou liens utiles"
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

