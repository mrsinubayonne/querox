
export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_name: string;
  is_available: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
}
