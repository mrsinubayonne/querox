import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Mail, Lock } from 'lucide-react';

const resetSchema = z.object({
  email: z.string().email('Email invalide'),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetFormData = z.infer<typeof resetSchema>;

interface ResetPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({ open, onOpenChange }) => {
  const [loading, setLoading] = useState(false);
  const form = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      setLoading(true);

      // Call edge function to reset password directly without email
      const response = await fetch(
        `https://aufmphldtjrcddyayqoy.supabase.co/functions/v1/reset-user-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF1Zm1waGxkdGpyY2RkeWF5cW95Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2NzMwNTUsImV4cCI6MjA2NTI0OTA1NX0.MJm2BxWo43HLFpVLFsI2nw4KeFbRNJxm2O7G8L0po_Y`,
          },
          body: JSON.stringify({
            email: data.email.trim().toLowerCase(),
            newPassword: data.newPassword,
          }),
        }
      );

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      toast.success("Succès", { description: result.message });

      form.reset();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Erreur", { description: error?.message || "Impossible de réinitialiser le mot de passe" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Réinitialiser le mot de passe</DialogTitle>
          <DialogDescription>
            Entrez votre email et choisissez un nouveau mot de passe
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="email" 
                      placeholder="votre@email.com" 
                      {...field}
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Nouveau mot de passe
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Minimum 6 caractères" 
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Confirmer le mot de passe
                  </FormLabel>
                  <FormControl>
                    <Input 
                      type="password" 
                      placeholder="Confirmer le mot de passe" 
                      {...field}
                      autoComplete="new-password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi...
                  </>
                ) : (
                  'Réinitialiser'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
