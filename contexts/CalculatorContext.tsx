import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CalculatorInput, CalculatedIngredient, ShoppingListItem } from '@/types';

interface CalculatorContextType {
  calculatorInput: CalculatorInput;
  setCalculatorInput: (input: CalculatorInput) => void;
  calculatedIngredients: CalculatedIngredient[];
  setCalculatedIngredients: (ingredients: CalculatedIngredient[]) => void;
  shoppingList: ShoppingListItem[];
  setShoppingList: (list: ShoppingListItem[]) => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [calculatorInput, setCalculatorInput] = useState<CalculatorInput>({
    numGuests: 10,
    potSize: 'medium',
    spiceLevel: 'medium',
    selectedIngredients: ['shrimp'],
  });
  const [calculatedIngredients, setCalculatedIngredients] = useState<CalculatedIngredient[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);

  return (
    <CalculatorContext.Provider
      value={{
        calculatorInput,
        setCalculatorInput,
        calculatedIngredients,
        setCalculatedIngredients,
        shoppingList,
        setShoppingList,
      }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (context === undefined) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
