import { CalculatorInput, CalculatedIngredient, IngredientRatio, Product, ShoppingListItem } from '@/types';
import { supabase } from './supabase';

const INGREDIENTS_LIST = [
  { id: 'crawfish', name: 'Crawfish', icon: '🦞', category: 'protein' as const },
  { id: 'shrimp', name: 'Shrimp', icon: '🦐', category: 'protein' as const },
  { id: 'crab', name: 'Crab', icon: '🦀', category: 'protein' as const },
  { id: 'sausage', name: 'Sausage', icon: '🌭', category: 'protein' as const },
  { id: 'corn', name: 'Corn', icon: '🌽', category: 'vegetable' as const },
  { id: 'potatoes', name: 'Potatoes', icon: '🥔', category: 'vegetable' as const },
  { id: 'onions', name: 'Onions', icon: '🧅', category: 'vegetable' as const },
  { id: 'garlic', name: 'Garlic', icon: '🧄', category: 'vegetable' as const },
  { id: 'lemons', name: 'Lemons', icon: '🍋', category: 'vegetable' as const },
  { id: 'seasoning', name: 'Seasoning', icon: '🌶️', category: 'seasoning' as const },
  { id: 'hot_sauce', name: 'Hot Sauce', icon: '🔥', category: 'seasoning' as const },
];

export const getIngredientsList = () => INGREDIENTS_LIST;

export async function getIngredientRatios(): Promise<Record<string, IngredientRatio>> {
  const { data, error } = await supabase
    .from('ingredient_ratios')
    .select('*');

  if (error || !data) {
    console.error('Error fetching ratios:', error);
    return {};
  }

  const ratiosMap: Record<string, IngredientRatio> = {};
  data.forEach(ratio => {
    ratiosMap[ratio.ingredient_type] = ratio;
  });

  return ratiosMap;
}

export async function calculateIngredients(
  input: CalculatorInput,
  ratios: Record<string, IngredientRatio>
): Promise<CalculatedIngredient[]> {
  const results: CalculatedIngredient[] = [];

  const selectedProteins = input.selectedIngredients.filter(id =>
    ['crawfish', 'shrimp', 'crab', 'sausage'].includes(id)
  );

  const proteinCount = selectedProteins.filter(id => id !== 'sausage').length;
  const shouldReduceProteins = proteinCount > 1;

  for (const ingredientId of input.selectedIngredients) {
    const ratio = ratios[ingredientId];
    if (!ratio) continue;

    let quantityPerPerson = ratio.base_ratio_per_person;

    if (shouldReduceProteins && ['crawfish', 'shrimp', 'crab'].includes(ingredientId)) {
      quantityPerPerson = quantityPerPerson * (1 - ratio.reduction_factor);
    }

    let totalQuantity = quantityPerPerson * input.numGuests;

    if (ingredientId === 'seasoning') {
      const gallons = getPotGallons(input.potSize);
      totalQuantity = (gallons / 10) * ratio.base_ratio_per_person;
    }

    totalQuantity = Math.ceil(totalQuantity * 10) / 10;

    const ingredient = INGREDIENTS_LIST.find(i => i.id === ingredientId);

    results.push({
      ingredient: ingredientId,
      quantity: totalQuantity,
      unit: ratio.unit,
      displayText: `${ingredient?.name}: ${formatQuantity(totalQuantity, ratio.unit)}`
    });
  }

  return results;
}

export async function generateShoppingList(
  calculatedIngredients: CalculatedIngredient[]
): Promise<ShoppingListItem[]> {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('in_stock', true);

  if (error || !products) {
    console.error('Error fetching products:', error);
    return [];
  }

  const shoppingList: ShoppingListItem[] = [];

  for (const calculated of calculatedIngredients) {
    const matchingProducts = products.filter(
      p => p.sub_category === calculated.ingredient || p.category === calculated.ingredient
    );

    if (matchingProducts.length === 0) continue;

    const featuredProduct = matchingProducts.find(p => p.featured) || matchingProducts[0];

    let productQuantity = calculated.quantity;

    if (featuredProduct.unit !== calculated.unit) {
      productQuantity = convertUnits(calculated.quantity, calculated.unit, featuredProduct.unit, calculated.ingredient);
    }

    productQuantity = Math.ceil(productQuantity);

    shoppingList.push({
      product: featuredProduct,
      quantity: productQuantity,
      totalPrice: parseFloat((productQuantity * featuredProduct.price).toFixed(2))
    });
  }

  return shoppingList.sort((a, b) => {
    const order = ['protein', 'vegetable', 'seasoning', 'sauce'];
    return order.indexOf(a.product.category) - order.indexOf(b.product.category);
  });
}

function getPotGallons(potSize: string): number {
  switch (potSize) {
    case 'small': return 6;
    case 'medium': return 10;
    case 'large': return 14;
    case 'xlarge': return 18;
    default: return 10;
  }
}

function formatQuantity(quantity: number, unit: string): string {
  if (unit === 'each' || unit === 'ears' || unit === 'cloves') {
    return `${Math.ceil(quantity)} ${unit}`;
  }
  return `${quantity.toFixed(1)} ${unit}`;
}

function convertUnits(quantity: number, fromUnit: string, toUnit: string, ingredient: string): number {
  if (fromUnit === toUnit) return quantity;

  if (ingredient === 'potatoes' && fromUnit === 'each' && toUnit === 'bag') {
    return quantity / 8;
  }

  if (ingredient === 'onions' && fromUnit === 'each' && toUnit === 'lb') {
    return quantity * 0.5;
  }

  if (ingredient === 'garlic' && fromUnit === 'cloves' && toUnit === 'bulb') {
    return quantity / 10;
  }

  if (ingredient === 'hot_sauce' && fromUnit === 'oz' && toUnit === 'bottle') {
    return quantity / 12;
  }

  return quantity;
}
