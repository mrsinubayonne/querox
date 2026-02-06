import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { order, restaurantEmail } = await req.json();
    
    console.log('📧 Sending order notification email...');
    console.log('Order ID:', order.id);
    console.log('Customer:', order.customer_name);
    console.log('Restaurant email:', restaurantEmail);

    // Format order items for email
    const itemsList = order.items.map((item: any) => 
      `<li>${item.quantity}x ${item.name} - ${item.price}€</li>`
    ).join('');

    const orderDetailsHtml = `
      <h2 style="color: #10b981;">🎉 Nouvelle Commande Reçue !</h2>
      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3>Détails de la commande</h3>
        <p><strong>Numéro:</strong> ${order.id.substring(0, 8)}</p>
        <p><strong>Client:</strong> ${order.customer_name}</p>
        <p><strong>Email:</strong> ${order.customer_email || 'Non fourni'}</p>
        <p><strong>Téléphone:</strong> ${order.customer_phone || 'Non fourni'}</p>
        ${order.order_type ? `<p><strong>Type:</strong> ${order.order_type}</p>` : ''}
        ${order.table_number ? `<p><strong>Table:</strong> ${order.table_number}</p>` : ''}
        ${order.delivery_address ? `<p><strong>Adresse:</strong> ${order.delivery_address}</p>` : ''}
      </div>
      
      <div style="background: #fff; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h3>Articles commandés</h3>
        <ul style="list-style: none; padding: 0;">
          ${itemsList}
        </ul>
        <hr style="border: 1px solid #e5e7eb; margin: 15px 0;">
        <p style="font-size: 18px; font-weight: bold;">Total: ${order.total_amount}€</p>
      </div>
      
      ${order.notes ? `
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <strong>📝 Notes:</strong> ${order.notes}
        </div>
      ` : ''}
      
      <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
        Cette commande a été passée à ${new Date(order.created_at).toLocaleString('fr-FR')}
      </p>
    `;

    // Send notification email to restaurant
    const restaurantResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Querox <notifications@querox.app>',
        to: [restaurantEmail],
        subject: `🔔 Nouvelle commande - ${order.customer_name}`,
        html: orderDetailsHtml,
      }),
    });

    if (!restaurantResponse.ok) {
      const error = await restaurantResponse.text();
      console.error('❌ Failed to send restaurant notification:', error);
      throw new Error(`Failed to send restaurant notification: ${error}`);
    }

    const restaurantData = await restaurantResponse.json();
    console.log('✅ Restaurant notification sent:', restaurantData);

    // Send confirmation email to customer if email provided
    if (order.customer_email) {
      const customerHtml = `
        <h2 style="color: #10b981;">Merci pour votre commande !</h2>
        <p>Bonjour ${order.customer_name},</p>
        <p>Nous avons bien reçu votre commande et nous la préparons avec soin.</p>
        
        <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Récapitulatif</h3>
          <ul style="list-style: none; padding: 0;">
            ${itemsList}
          </ul>
          <hr style="border: 1px solid #e5e7eb; margin: 15px 0;">
          <p style="font-size: 18px; font-weight: bold;">Total: ${order.total_amount}€</p>
        </div>
        
        <p>Vous recevrez une notification dès que votre commande sera prête.</p>
        <p style="color: #6b7280; font-size: 14px;">Merci de votre confiance !</p>
      `;

      const customerResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: 'Querox <notifications@querox.app>',
          to: [order.customer_email],
          subject: 'Confirmation de votre commande',
          html: customerHtml,
        }),
      });

      if (customerResponse.ok) {
        const customerData = await customerResponse.json();
        console.log('✅ Customer confirmation sent:', customerData);
      } else {
        console.warn('⚠️ Failed to send customer confirmation');
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully' 
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('❌ Error in send-order-notification:', error);
    return new Response(
      JSON.stringify({ 
        error: message 
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});
