import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface InvitationRequest {
  to: string
  full_name?: string
  role: string
  invitation_link: string
  owner_email?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { to, full_name, role, invitation_link, owner_email }: InvitationRequest = await req.json()

    // Si RESEND_API_KEY n'est pas configurée, on retourne quand même un succès
    // mais sans envoyer d'email (mode développement)
    if (!RESEND_API_KEY) {
      console.log('RESEND_API_KEY not configured, skipping email send')
      console.log('Would send invitation to:', to, 'with link:', invitation_link)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Email sending skipped (development mode)',
          invitation_link 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      )
    }

    const roleNames: Record<string, string> = {
      'manager': 'Manager',
      'serveur': 'Serveur',
      'caissier': 'Caissier',
      'cuisinier': 'Cuisinier',
      'livreur': 'Livreur'
    }

    const roleName = roleNames[role] || role

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .content {
              background: #f9fafb;
              padding: 30px;
              border-radius: 0 0 10px 10px;
            }
            .button {
              display: inline-block;
              background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);
              color: white;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              margin: 20px 0;
              font-weight: bold;
            }
            .info-box {
              background: white;
              border-left: 4px solid #9333ea;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .step {
              background: white;
              padding: 15px;
              margin: 10px 0;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎊 Bienvenue dans l'équipe QUEROX !</h1>
          </div>
          <div class="content">
            <p>Bonjour ${full_name || 'cher collaborateur'},</p>
            
            <p>Vous avez été invité(e) à rejoindre l'équipe${owner_email ? ` de <strong>${owner_email}</strong>` : ''} sur la plateforme <strong>QUEROX</strong> !</p>
            
            <div class="info-box">
              <p><strong>📧 Email:</strong> ${to}</p>
              <p><strong>👤 Votre rôle:</strong> ${roleName}</p>
              ${owner_email ? `<p><strong>👨‍💼 Invité par:</strong> ${owner_email}</p>` : ''}
            </div>

            <h3 style="color: #9333ea;">🔐 Configuration de votre accès</h3>
            <p>Pour commencer, vous devez <strong>définir votre propre code d'accès personnel</strong>. Voici comment procéder :</p>
            
            <div class="step">
              <strong>1️⃣ Étape 1 :</strong> Cliquez sur le bouton ci-dessous
            </div>
            <div class="step">
              <strong>2️⃣ Étape 2 :</strong> Créez un code d'accès à 6 caractères de votre choix
            </div>
            <div class="step">
              <strong>3️⃣ Étape 3 :</strong> Confirmez votre code
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitation_link}" class="button">✨ Configurer mon code d'accès</a>
            </div>

            <p style="margin-top: 20px; font-size: 14px; color: #666;">
              Ou copiez ce lien dans votre navigateur :<br>
              <code style="background: #eee; padding: 5px 10px; border-radius: 4px; display: inline-block; margin-top: 5px;">${invitation_link}</code>
            </p>

            <div class="info-box" style="margin-top: 30px; background: #fef3c7; border-left-color: #f59e0b;">
              <p style="margin: 0;"><strong>⏰ Important :</strong> Ce lien d'invitation est à usage unique. Une fois votre code configuré, vous pourrez vous connecter à tout moment sur <strong>/team-login</strong> avec votre email et votre code personnel.</p>
            </div>

            <p>Si vous rencontrez des difficultés, n'hésitez pas à contacter votre responsable.</p>
            
            <p><strong>À très bientôt sur QUEROX ! 🚀</strong></p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} QUEROX - Plateforme de gestion restaurant</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'QUEROX <onboarding@resend.dev>',
        to: [to],
        subject: `🎉 Invitation à rejoindre l'équipe QUEROX`,
        html: emailHtml,
      }),
    })

    if (res.ok) {
      const data = await res.json()
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    } else {
      const error = await res.text()
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
