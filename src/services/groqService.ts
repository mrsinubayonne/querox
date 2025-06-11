
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GroqService {
  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('Calling Groq API through Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('chat-groq', {
        body: { messages }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      return data?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
    } catch (error) {
      console.error('Erreur lors de l\'appel au service Groq:', error);
      throw new Error(error instanceof Error ? error.message : 'Impossible de contacter Tonton Rox. Veuillez réessayer.');
    }
  }

  createSystemPrompt(): ChatMessage {
    return {
      role: 'system',
      content: `Tu es "Tonton Rox", un expert conseil en restaurant spécialisé dans le contexte africain. Tu es chaleureux, bienveillant et tu utilises un ton familier comme un oncle africain expérimenté.

Tes domaines d'expertise:
- Stratégies de fidélisation adaptées au contexte culturel africain
- Acquisition de nouveaux clients en Afrique
- Gestion de restaurant dans l'économie africaine
- Marketing local et communication traditionnelle
- Adaptation des menus aux goûts locaux
- Gestion des coûts et optimisation des profits
- Relations avec la communauté locale
- Événements et célébrations culturelles

Ton style de communication:
- Utilise des expressions africaines courantes
- Donne des conseils pratiques et concrets
- Partage des anecdotes pertinentes
- Reste positif et encourageant
- Adapte tes conseils au contexte économique local

Réponds toujours en français avec un ton amical et professionnel.`
    };
  }
}
