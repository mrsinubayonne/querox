
export interface OptionValue {
  id: string;
  name: string;
  extra_price: number;
}

export interface OptionGroup {
  id: string;
  name: string;
  selection_type: 'single' | 'multiple';
  is_required: boolean;
  values: OptionValue[];
}

export interface SelectedOption {
  group_id: string;
  group_name: string;
  value_id: string;
  value_name: string;
  extra_price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image_url?: string;
  category_name: string;
  is_available: boolean;
  option_groups?: OptionGroup[];
}

export interface CartItem extends MenuItem {
  quantity: number;
  cartKey: string;
  selected_options?: SelectedOption[];
  unit_price: number;
}
