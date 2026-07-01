INSERT INTO public.profiles (id, email, selected_outlet_id)
VALUES ('d09c7d84-8360-410a-8770-d6122bb2ff51', 'pupina.sebastiao2@kimbenza-cg.com', 'd101f64b-cefc-434f-bc68-a80ec5f13d77')
ON CONFLICT (id) DO UPDATE SET selected_outlet_id = EXCLUDED.selected_outlet_id;