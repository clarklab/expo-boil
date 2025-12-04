import { Tabs } from 'expo-router';
import { Calculator, ShoppingCart, Bookmark, Settings } from 'lucide-react-native';
import { CalculatorProvider } from '@/contexts/CalculatorContext';

export default function TabLayout() {
  return (
    <CalculatorProvider>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#DC2626',
          tabBarInactiveTintColor: '#9CA3AF',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 2,
            borderTopColor: '#F3F4F6',
            paddingTop: 8,
            paddingBottom: 8,
            height: 70,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Calculator',
            tabBarIcon: ({ size, color }) => (
              <Calculator size={size} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="shopping-list"
          options={{
            title: 'Shopping',
            tabBarIcon: ({ size, color }) => (
              <ShoppingCart size={size} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="saved-lists"
          options={{
            title: 'Saved',
            tabBarIcon: ({ size, color }) => (
              <Bookmark size={size} color={color} strokeWidth={2.5} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} strokeWidth={2.5} />
            ),
          }}
        />
      </Tabs>
    </CalculatorProvider>
  );
}
