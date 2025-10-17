import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderItem {
  id: string;
  quantity: number;
}

interface OrderRequest {
  restaurantUserId: string;
  items: OrderItem[];
  customerName: string;
  customerPhone: string;
  orderType: 'sur_place' | 'emporter' | 'livrer';
  tableNumber?: string;
  deliveryAddress?: string;
  notes?: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const orderRequest: OrderRequest = await req.json();

    console.log('🔍 Validating order request:', {
      restaurantUserId: orderRequest.restaurantUserId,
      itemCount: orderRequest.items.length,
      orderType: orderRequest.orderType,
    });

    // Validation: Check required fields
    if (!orderRequest.restaurantUserId || !orderRequest.items || orderRequest.items.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!orderRequest.customerName || !orderRequest.customerPhone || !orderRequest.orderType) {
      return new Response(
        JSON.stringify({ error: 'Customer information incomplete' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validation: Check order type specific requirements
    if (orderRequest.orderType === 'sur_place' && !orderRequest.tableNumber) {
      return new Response(
        JSON.stringify({ error: 'Table number required for dine-in orders' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (orderRequest.orderType === 'livrer' && !orderRequest.deliveryAddress) {
      return new Response(
        JSON.stringify({ error: 'Delivery address required for delivery orders' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch menu items from database to validate prices
    const itemIds = orderRequest.items.map(item => item.id);
    const { data: menuItems, error: fetchError } = await supabase
      .from('menu_items')
      .select('id, name, price')
      .in('id', itemIds);

    if (fetchError) {
      console.error('❌ Error fetching menu items:', fetchError);
      return new Response(
        JSON.stringify({ error: 'Failed to validate menu items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!menuItems || menuItems.length !== itemIds.length) {
      console.error('❌ Some menu items not found');
      return new Response(
        JSON.stringify({ error: 'Invalid menu items in order' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate total price server-side
    let totalAmount = 0;
    const validatedItems = orderRequest.items.map(orderItem => {
      const menuItem = menuItems.find(m => m.id === orderItem.id);
      if (!menuItem) {
        throw new Error(`Menu item ${orderItem.id} not found`);
      }

      // Validate quantity
      if (orderItem.quantity < 1 || orderItem.quantity > 100) {
        throw new Error(`Invalid quantity for item ${menuItem.name}`);
      }

      const itemTotal = Number(menuItem.price) * orderItem.quantity;
      totalAmount += itemTotal;

      return {
        id: menuItem.id,
        name: menuItem.name,
        price: Number(menuItem.price),
        quantity: orderItem.quantity,
      };
    });

    console.log('✅ Order validated. Total amount:', totalAmount);

    // Insert validated order into database
    const orderPayload = {
      user_id: orderRequest.restaurantUserId,
      customer_name: orderRequest.customerName,
      customer_phone: orderRequest.customerPhone,
      notes: orderRequest.notes || null,
      items: validatedItems,
      total_amount: totalAmount,
      status: 'pending',
      order_type: orderRequest.orderType,
      table_number: orderRequest.orderType === 'sur_place' ? orderRequest.tableNumber : null,
      delivery_address: orderRequest.orderType === 'livrer' ? orderRequest.deliveryAddress : null,
    };

    const { data: order, error: insertError } = await supabase
      .from('orders')
      .insert([orderPayload])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Error inserting order:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('✅ Order created successfully:', order.id);

    return new Response(
      JSON.stringify({
        success: true,
        order: {
          id: order.id,
          total_amount: totalAmount,
          items: validatedItems,
        },
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('💥 Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
