
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export class GroqService {
  async generateResponse(messages: ChatMessage[]): Promise<string> {
    try {
      console.log('Calling Groq API through Edge Function with', messages.length, 'messages...');
      
      const { data, error } = await supabase.functions.invoke('chat-groq', {
        body: { messages }
      });

      if (error) {
        console.error('Edge function error:', error);
        
        // More specific error handling based on error type
        if (error.message?.includes('Clé API Groq non configurée')) {
          throw new Error('La clé API Groq n\'est pas configurée. Veuillez vérifier vos paramètres.');
        } else if (error.message?.includes('invalide')) {
          throw new Error('Clé API Groq invalide. Veuillez vérifier votre clé API.');
        } else if (error.message?.includes('Limite de requêtes')) {
          throw new Error('Limite de requêtes atteinte. Veuillez attendre un moment avant de réessayer.');
        }
        
        throw new Error(error.message || 'Erreur lors de l\'appel à la fonction');
      }

      if (data?.error) {
        console.error('API error returned:', data.error);
        throw new Error(data.error);
      }

      const response = data?.content || 'Désolé, je n\'ai pas pu générer de réponse.';
      console.log('Successfully received response from Groq API');
      
      return response;
    } catch (error) {
      console.error('Erreur lors de l\'appel au service Groq:', error);
      
      // Provide user-friendly error messages
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch') || error.message.includes('network')) {
          throw new Error('Problème de connexion. Veuillez vérifier votre connexion internet et réessayer.');
        }
        throw new Error(error.message);
      }
      
      throw new Error('Impossible de contacter Tonton Rox. Veuillez réessayer.');
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
