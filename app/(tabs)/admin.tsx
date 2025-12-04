import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Settings, Plus, Edit, Trash2, X } from 'lucide-react-native';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

const CATEGORIES = ['protein', 'seasoning', 'sauce', 'vegetable', 'equipment'];

export default function AdminScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: 'protein',
    sub_category: '',
    price: '',
    unit: '',
    description: '',
    in_stock: true,
    featured: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('category');

    if (error) {
      console.error('Error loading products:', error);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }

  function openAddModal() {
    setEditingProduct(null);
    setFormData({
      name: '',
      brand: '',
      category: 'protein',
      sub_category: '',
      price: '',
      unit: '',
      description: '',
      in_stock: true,
      featured: false,
    });
    setModalVisible(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand,
      category: product.category,
      sub_category: product.sub_category || '',
      price: product.price.toString(),
      unit: product.unit,
      description: product.description,
      in_stock: product.in_stock,
      featured: product.featured,
    });
    setModalVisible(true);
  }

  async function saveProduct() {
    if (!formData.name || !formData.brand || !formData.price || !formData.unit) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const productData = {
      name: formData.name,
      brand: formData.brand,
      category: formData.category,
      sub_category: formData.sub_category || null,
      price: parseFloat(formData.price),
      unit: formData.unit,
      description: formData.description,
      in_stock: formData.in_stock,
      featured: formData.featured,
    };

    if (editingProduct) {
      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', editingProduct.id);

      if (error) {
        Alert.alert('Error', 'Failed to update product');
        console.error(error);
        return;
      }
      Alert.alert('Success', 'Product updated successfully');
    } else {
      const { error } = await supabase.from('products').insert(productData);

      if (error) {
        Alert.alert('Error', 'Failed to create product');
        console.error(error);
        return;
      }
      Alert.alert('Success', 'Product created successfully');
    }

    setModalVisible(false);
    loadProducts();
  }

  async function deleteProduct(id: string) {
    Alert.alert('Delete Product', 'Are you sure you want to delete this product?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('products').delete().eq('id', id);

          if (error) {
            Alert.alert('Error', 'Failed to delete product');
            console.error(error);
          } else {
            loadProducts();
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Settings size={32} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.headerTitle}>Admin Panel</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal} activeOpacity={0.8}>
          <Plus size={24} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.addButtonText}>Add New Product</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading products...</Text>
          </View>
        ) : (
          <View style={styles.productsContainer}>
            {products.map(product => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productHeader}>
                  <View style={styles.productBadge}>
                    <Text style={styles.productBadgeText}>{product.category}</Text>
                  </View>
                  {product.featured && (
                    <View style={styles.featuredBadge}>
                      <Text style={styles.featuredText}>Featured</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productBrand}>{product.brand}</Text>
                <Text style={styles.productDescription}>{product.description}</Text>

                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>${product.price.toFixed(2)}</Text>
                  <Text style={styles.productUnit}>per {product.unit}</Text>
                  <Text
                    style={[styles.stockStatus, !product.in_stock && styles.outOfStock]}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </Text>
                </View>

                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(product)}
                    activeOpacity={0.7}>
                    <Edit size={18} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => deleteProduct(product.id)}
                    activeOpacity={0.7}>
                    <Trash2 size={18} color="#FFFFFF" strokeWidth={2.5} />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X size={24} color="#6B7280" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.formScroll}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Fresh Gulf Shrimp"
                value={formData.name}
                onChangeText={text => setFormData({ ...formData, name: text })}
              />

              <Text style={styles.label}>Brand *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Cajun Two Step"
                value={formData.brand}
                onChangeText={text => setFormData({ ...formData, brand: text })}
              />

              <Text style={styles.label}>Category *</Text>
              <View style={styles.optionsRow}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.optionChip,
                      formData.category === cat && styles.optionChipActive,
                    ]}
                    onPress={() => setFormData({ ...formData, category: cat })}>
                    <Text
                      style={[
                        styles.optionChipText,
                        formData.category === cat && styles.optionChipTextActive,
                      ]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Sub-Category</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., shrimp, crawfish"
                value={formData.sub_category}
                onChangeText={text => setFormData({ ...formData, sub_category: text })}
              />

              <Text style={styles.label}>Price *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 8.99"
                value={formData.price}
                onChangeText={text => setFormData({ ...formData, price: text })}
                keyboardType="decimal-pad"
              />

              <Text style={styles.label}>Unit *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., lb, oz, each"
                value={formData.unit}
                onChangeText={text => setFormData({ ...formData, unit: text })}
              />

              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Product description"
                value={formData.description}
                onChangeText={text => setFormData({ ...formData, description: text })}
                multiline
                numberOfLines={3}
              />

              <View style={styles.checkboxRow}>
                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({ ...formData, in_stock: !formData.in_stock })
                  }>
                  <View
                    style={[
                      styles.checkboxBox,
                      formData.in_stock && styles.checkboxBoxActive,
                    ]}>
                    {formData.in_stock && <View style={styles.checkboxCheck} />}
                  </View>
                  <Text style={styles.checkboxLabel}>In Stock</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.checkbox}
                  onPress={() =>
                    setFormData({ ...formData, featured: !formData.featured })
                  }>
                  <View
                    style={[
                      styles.checkboxBox,
                      formData.featured && styles.checkboxBoxActive,
                    ]}>
                    {formData.featured && <View style={styles.checkboxCheck} />}
                  </View>
                  <Text style={styles.checkboxLabel}>Featured</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={saveProduct}>
                <Text style={styles.saveButtonText}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  addButton: {
    backgroundColor: '#DC2626',
    marginHorizontal: 20,
    marginTop: 24,
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
  addButtonText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
  productsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#F3F4F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  productHeader: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  productBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  productBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    textTransform: 'uppercase',
  },
  featuredBadge: {
    backgroundColor: '#FCD34D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  productDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#DC2626',
  },
  productUnit: {
    fontSize: 14,
    color: '#6B7280',
  },
  stockStatus: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  outOfStock: {
    color: '#EF4444',
    backgroundColor: '#FEE2E2',
  },
  productActions: {
    flexDirection: 'row',
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  optionChipActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  optionChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  optionChipTextActive: {
    color: '#FFFFFF',
  },
  checkboxRow: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
    marginBottom: 24,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxBoxActive: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  checkboxCheck: {
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  checkboxLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  saveButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 40,
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
