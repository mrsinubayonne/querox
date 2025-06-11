
interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

interface GeminiResponse {
  candidates: {
    content: {
      parts: { text: string }[];
    };
  }[];
}

export class GeminiService {
  private apiKey = 'AIzaSyDbzNS6iXwaLvXia4Qb8ROnVnUmvwLaYag';
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  async generateResponse(messages: GeminiMessage[]): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: messages,
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.candidates[0]?.content?.parts[0]?.text || 'Désolé, je n\'ai pas pu générer de réponse.';
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Gemini:', error);
      throw new Error('Impossible de contacter Tonton Rox. Veuillez réessayer.');
    }
  }

  createSystemPrompt(): GeminiMessage {
    return {
      role: 'user',
      parts: [{
        text: `Tu es "Tonton Rox", un expert conseil en restaurant spécialisé dans le contexte africain. Tu es chaleureux, bienveillant et tu utilises un ton familier comme un oncle africain expérimenté.

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
      }]
    };
  }
}
