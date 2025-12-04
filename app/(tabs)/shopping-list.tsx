import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShoppingCart, Bookmark, ChevronRight } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useCalculator } from '@/contexts/CalculatorContext';

export default function ShoppingListScreen() {
  const { calculatorInput, shoppingList } = useCalculator();
  const [listName, setListName] = useState('');

  async function saveList() {
    if (!listName.trim()) {
      Alert.alert('Error', 'Please enter a name for this list');
      return;
    }

    const { error } = await supabase.from('saved_lists').insert({
      list_name: listName,
      num_guests: calculatorInput.numGuests,
      pot_size: calculatorInput.potSize,
      spice_level: calculatorInput.spiceLevel,
      selected_ingredients: calculatorInput.selectedIngredients,
      calculated_products: shoppingList.map(item => ({
        product_id: item.product.id,
        product_name: item.product.name,
        quantity: item.quantity,
        unit: item.product.unit,
        total_price: item.totalPrice,
      })),
    });

    if (error) {
      Alert.alert('Error', 'Failed to save list');
      console.error(error);
      return;
    }

    Alert.alert('Success', 'List saved successfully!');
    setListName('');
  }

  const totalCost = shoppingList.reduce((sum, item) => sum + item.totalPrice, 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <ShoppingCart size={32} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.headerTitle}>Shopping List</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {shoppingList.length === 0 ? (
              <View style={styles.emptyContainer}>
                <ShoppingCart size={64} color="#9CA3AF" strokeWidth={2} />
                <Text style={styles.emptyText}>No items in your shopping list</Text>
                <Text style={styles.emptySubtext}>
                  Add ingredients from the calculator to see products here
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.listSection}>
                  {shoppingList.map((item, index) => (
                    <View key={item.product.id} style={styles.productCard}>
                      <View style={styles.productContent}>
                        <View style={styles.productBadge}>
                          <Text style={styles.productBadgeText}>{item.product.brand}</Text>
                        </View>
                        <Text style={styles.productName}>{item.product.name}</Text>
                        <Text style={styles.productDescription}>{item.product.description}</Text>
                        <View style={styles.productDetails}>
                          <Text style={styles.productQuantity}>
                            {item.quantity} {item.product.unit}
                          </Text>
                          <Text style={styles.productPrice}>${item.totalPrice.toFixed(2)}</Text>
                        </View>
                      </View>
                      <ChevronRight size={24} color="#DC2626" strokeWidth={2.5} />
                    </View>
                  ))}
                </View>

                <View style={styles.totalCard}>
                  <Text style={styles.totalLabel}>Estimated Total</Text>
                  <Text style={styles.totalAmount}>${totalCost.toFixed(2)}</Text>
                </View>

                <View style={styles.saveSection}>
                  <Text style={styles.saveTitle}>Save this list</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter list name (e.g., Summer Crawfish Boil)"
                    placeholderTextColor="#9CA3AF"
                    value={listName}
                    onChangeText={setListName}
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={saveList}
                    activeOpacity={0.8}>
                    <Bookmark size={24} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.saveButtonText}>Save This List</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF2F2',
  },
  header: {
    backgroundColor: '#DC2626',
    paddingVertical: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  listSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productContent: {
    flex: 1,
  },
  productBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  productBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productQuantity: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
  },
  totalCard: {
    backgroundColor: '#DC2626',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  saveSection: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  saveTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
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
  saveButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
