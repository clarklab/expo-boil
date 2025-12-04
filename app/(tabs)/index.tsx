import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Flame, ChefHat, Plus, Minus } from 'lucide-react-native';
import { IngredientRatio } from '@/types';
import { getIngredientRatios, calculateIngredients, getIngredientsList, generateShoppingList } from '@/lib/calculations';
import { router } from 'expo-router';
import { useCalculator } from '@/contexts/CalculatorContext';

const POT_SIZES = [
  { id: 'small', label: '< 6', gallons: 6 },
  { id: 'medium', label: '10', gallons: 10 },
  { id: 'large', label: '14', gallons: 14 },
  { id: 'xlarge', label: '18+', gallons: 18 },
];

const SPICE_LEVELS = [
  { id: 'mild', label: 'Mild', flames: 1 },
  { id: 'medium', label: 'Medium', flames: 2 },
  { id: 'hot', label: 'Hot', flames: 3 },
  { id: 'fire', label: 'Fire!', flames: 4 },
];

export default function CalculatorScreen() {
  const {
    calculatorInput,
    setCalculatorInput,
    calculatedIngredients,
    setCalculatedIngredients,
    setShoppingList,
  } = useCalculator();

  const [ratios, setRatios] = useState<Record<string, IngredientRatio>>({});

  const { numGuests, potSize, spiceLevel, selectedIngredients } = calculatorInput;
  const ingredients = getIngredientsList();

  useEffect(() => {
    loadRatios();
  }, []);

  useEffect(() => {
    if (Object.keys(ratios).length > 0) {
      performCalculation();
    }
  }, [numGuests, potSize, spiceLevel, selectedIngredients, ratios]);

  async function loadRatios() {
    const loadedRatios = await getIngredientRatios();
    setRatios(loadedRatios);
  }

  async function performCalculation() {
    const results = await calculateIngredients(calculatorInput, ratios);
    setCalculatedIngredients(results);

    const shopping = await generateShoppingList(results);
    setShoppingList(shopping);
  }

  function toggleIngredient(ingredientId: string) {
    const newIngredients = selectedIngredients.includes(ingredientId)
      ? selectedIngredients.filter(id => id !== ingredientId)
      : [...selectedIngredients, ingredientId];

    setCalculatorInput({ ...calculatorInput, selectedIngredients: newIngredients });
  }

  function incrementGuests() {
    if (numGuests < 50) {
      setCalculatorInput({ ...calculatorInput, numGuests: numGuests + 1 });
    }
  }

  function decrementGuests() {
    if (numGuests > 1) {
      setCalculatorInput({ ...calculatorInput, numGuests: numGuests - 1 });
    }
  }

  function setPotSizeWrapper(size: 'small' | 'medium' | 'large' | 'xlarge') {
    setCalculatorInput({ ...calculatorInput, potSize: size });
  }

  function setSpiceLevelWrapper(level: 'mild' | 'medium' | 'hot' | 'fire') {
    setCalculatorInput({ ...calculatorInput, spiceLevel: level });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>Cajun Step</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Users size={24} color="#DC2626" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Number of People</Text>
          </View>
          <View style={styles.counterCard}>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={decrementGuests}
              activeOpacity={0.7}>
              <Minus size={32} color="#DC2626" strokeWidth={3} />
            </TouchableOpacity>
            <View style={styles.counterDisplay}>
              <Users size={28} color="#DC2626" strokeWidth={2.5} />
              <Text style={styles.counterValue}>{numGuests}</Text>
            </View>
            <TouchableOpacity
              style={styles.counterButton}
              onPress={incrementGuests}
              activeOpacity={0.7}>
              <Plus size={32} color="#DC2626" strokeWidth={3} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ChefHat size={24} color="#DC2626" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Size of Pot (Gallons)</Text>
          </View>
          <View style={styles.buttonRow}>
            {POT_SIZES.map(size => (
              <TouchableOpacity
                key={size.id}
                style={[styles.optionButton, potSize === size.id && styles.optionButtonActive]}
                onPress={() => setPotSizeWrapper(size.id as any)}
                activeOpacity={0.7}>
                <Text style={[styles.optionText, potSize === size.id && styles.optionTextActive]}>
                  {size.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Flame size={24} color="#DC2626" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>Spice Level</Text>
          </View>
          <View style={styles.buttonRow}>
            {SPICE_LEVELS.map(level => (
              <TouchableOpacity
                key={level.id}
                style={[styles.spiceButton, spiceLevel === level.id && styles.spiceButtonActive]}
                onPress={() => setSpiceLevelWrapper(level.id as any)}
                activeOpacity={0.7}>
                <View style={styles.flameContainer}>
                  {Array.from({ length: level.flames }).map((_, i) => (
                    <Flame
                      key={i}
                      size={level.flames === 1 ? 28 : 20}
                      color={spiceLevel === level.id ? '#FFFFFF' : '#DC2626'}
                      strokeWidth={2.5}
                      fill={spiceLevel === level.id ? '#FFFFFF' : '#DC2626'}
                    />
                  ))}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ChefHat size={24} color="#DC2626" strokeWidth={2.5} />
            <Text style={styles.sectionTitle}>What are we cooking?</Text>
          </View>
          <View style={styles.ingredientsGrid}>
            {ingredients.map(ingredient => {
              const isSelected = selectedIngredients.includes(ingredient.id);
              const calculatedItem = calculatedIngredients.find(c => c.ingredient === ingredient.id);

              return (
                <TouchableOpacity
                  key={ingredient.id}
                  style={[styles.ingredientCard, isSelected && styles.ingredientCardActive]}
                  onPress={() => toggleIngredient(ingredient.id)}
                  activeOpacity={0.7}>
                  <View style={styles.ingredientContent}>
                    <View style={[styles.checkbox, isSelected && styles.checkboxActive]}>
                      {isSelected && <View style={styles.checkmark} />}
                    </View>
                    <Text style={styles.ingredientIcon}>{ingredient.icon}</Text>
                    <Text style={[styles.ingredientName, isSelected && styles.ingredientNameActive]}>
                      {ingredient.name}
                    </Text>
                  </View>
                  {isSelected && calculatedItem && (
                    <Text style={styles.ingredientQuantity}>
                      {calculatedItem.quantity.toFixed(1)} {calculatedItem.unit}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <TouchableOpacity
          style={styles.shoppingButton}
          onPress={() => router.push('/shopping-list')}
          activeOpacity={0.8}>
          <Text style={styles.shoppingButtonText}>View Shopping List</Text>
          <ChefHat size={24} color="#FFFFFF" strokeWidth={2.5} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    backgroundColor: '#DC2626',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 50,
    height: 50,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  counterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  counterButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#DC2626',
  },
  counterDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  counterValue: {
    fontSize: 48,
    fontWeight: '800',
    color: '#DC2626',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  optionButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#991B1B',
  },
  optionText: {
    fontSize: 22,
    fontWeight: '700',
    color: '#6B7280',
  },
  optionTextActive: {
    color: '#FFFFFF',
  },
  spiceButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 12,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    minHeight: 80,
  },
  spiceButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#991B1B',
  },
  flameContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsGrid: {
    gap: 12,
  },
  ingredientCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 3,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  ingredientCardActive: {
    backgroundColor: '#FEE2E2',
    borderColor: '#DC2626',
  },
  ingredientContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  checkmark: {
    width: 16,
    height: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  ingredientIcon: {
    fontSize: 32,
  },
  ingredientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    flex: 1,
  },
  ingredientNameActive: {
    color: '#1F2937',
  },
  ingredientQuantity: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  shoppingButton: {
    backgroundColor: '#DC2626',
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  shoppingButtonText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
