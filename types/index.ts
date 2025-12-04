export type PotSize = 'small' | 'medium' | 'large' | 'xlarge';
export type SpiceLevel = 'mild' | 'medium' | 'hot' | 'fire';

export interface IngredientType {
  id: string;
  name: string;
  icon: string;
  category: 'protein' | 'vegetable' | 'seasoning';
}

export interface CalculatorInput {
  numGuests: number;
  potSize: PotSize;
  spiceLevel: SpiceLevel;
  selectedIngredients: string[];
}

export interface IngredientRatio {
  id: string;
  ingredient_type: string;
  base_ratio_per_person: number;
  unit: string;
  reduction_factor: number;
  notes: string;
}

export interface CalculatedIngredient {
  ingredient: string;
  quantity: number;
  unit: string;
  displayText: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  sub_category: string | null;
  price: number;
  unit: string;
  image_url: string | null;
  description: string;
  in_stock: boolean;
  featured: boolean;
}

export interface ShoppingListItem {
  product: Product;
  quantity: number;
  totalPrice: number;
}

export interface SavedList {
  id: string;
  list_name: string;
  num_guests: number;
  pot_size: string;
  spice_level: string;
  selected_ingredients: any;
  calculated_products: any;
  created_at: string;
}
