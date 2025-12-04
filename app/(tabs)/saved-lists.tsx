import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bookmark, Trash2, Calendar, Users, ChefHat } from 'lucide-react-native';
import { SavedList } from '@/types';
import { supabase } from '@/lib/supabase';

export default function SavedListsScreen() {
  const [savedLists, setSavedLists] = useState<SavedList[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedLists();
  }, []);

  async function loadSavedLists() {
    setLoading(true);
    const { data, error } = await supabase
      .from('saved_lists')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading lists:', error);
    } else {
      setSavedLists(data || []);
    }
    setLoading(false);
  }

  async function deleteList(id: string) {
    Alert.alert('Delete List', 'Are you sure you want to delete this list?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('saved_lists').delete().eq('id', id);

          if (error) {
            Alert.alert('Error', 'Failed to delete list');
            console.error(error);
          } else {
            setSavedLists(savedLists.filter(list => list.id !== id));
          }
        },
      },
    ]);
  }

  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Bookmark size={32} color="#FFFFFF" strokeWidth={2.5} />
        <Text style={styles.headerTitle}>Saved Lists</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading saved lists...</Text>
          </View>
        ) : savedLists.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Bookmark size={64} color="#9CA3AF" strokeWidth={2} />
            <Text style={styles.emptyText}>No saved lists yet</Text>
            <Text style={styles.emptySubtext}>
              Create calculations and save them from the Shopping List screen
            </Text>
          </View>
        ) : (
          <View style={styles.listsContainer}>
            {savedLists.map(list => (
              <View key={list.id} style={styles.listCard}>
                <View style={styles.listHeader}>
                  <Text style={styles.listName}>{list.list_name}</Text>
                  <TouchableOpacity
                    onPress={() => deleteList(list.id)}
                    style={styles.deleteButton}
                    activeOpacity={0.7}>
                    <Trash2 size={20} color="#EF4444" strokeWidth={2.5} />
                  </TouchableOpacity>
                </View>

                <View style={styles.listDetails}>
                  <View style={styles.detailRow}>
                    <Users size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{list.num_guests} guests</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <ChefHat size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.detailText}>
                      {list.pot_size === 'small'
                        ? '< 6 gal'
                        : list.pot_size === 'medium'
                          ? '10 gal'
                          : list.pot_size === 'large'
                            ? '14 gal'
                            : '18+ gal'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Calendar size={16} color="#6B7280" strokeWidth={2} />
                    <Text style={styles.detailText}>{formatDate(list.created_at)}</Text>
                  </View>
                </View>

                {Array.isArray(list.calculated_products) && list.calculated_products.length > 0 && (
                  <View style={styles.productsList}>
                    <Text style={styles.productsTitle}>Products:</Text>
                    {list.calculated_products.slice(0, 3).map((product: any, index: number) => (
                      <Text key={index} style={styles.productItem}>
                        • {product.quantity} {product.unit} - {product.product_name}
                      </Text>
                    ))}
                    {list.calculated_products.length > 3 && (
                      <Text style={styles.moreProducts}>
                        +{list.calculated_products.length - 3} more items
                      </Text>
                    )}
                  </View>
                )}
              </View>
            ))}
          </View>
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
  listsContainer: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  listCard: {
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
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  listName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    flex: 1,
    marginRight: 12,
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
  },
  listDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  productsList: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  productsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
    marginBottom: 8,
  },
  productItem: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  moreProducts: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
    marginTop: 4,
  },
});
