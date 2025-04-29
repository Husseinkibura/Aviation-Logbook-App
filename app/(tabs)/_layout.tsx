// app/(tabs)/_layout.tsx

import { Tabs } from 'expo-router';
import { Plane, Clock, ChartBar as BarChart3, Settings, Plus, Menu } from 'lucide-react-native';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Sidebar } from '@/components/Sidebar';

function CustomTabBar({ state, descriptors, navigation }) {
  const { isDark } = useTheme();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={[
        styles.tabBar,
        { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }
      ]}>
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          style={styles.menuButton}
        >
          <Menu size={24} color={isDark ? '#fff' : '#1e293b'} />
        </TouchableOpacity>

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[
                styles.tab,
                isFocused && styles.tabFocused,
                isDark && { backgroundColor: isFocused ? 'rgba(96,165,250,0.2)' : 'transparent' }
              ]}>
              {options.tabBarIcon &&
                options.tabBarIcon({
                  size: 24,
                  color: isFocused ? '#60a5fa' : isDark ? '#71717a' : '#64748b'
                })
              }
            </TouchableOpacity>
          );
        })}
      </BlurView>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setSidebarOpen(false)} />
    </>
  );
}

export default function TabLayout() {
  const { isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <Tabs
        tabBar={props => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Flights',
            tabBarIcon: ({ size, color }) => <Plane size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="logbook"
          options={{
            title: 'Logbook',
            tabBarIcon: ({ size, color }) => <Clock size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="new"
          options={{
            title: 'Add Flight',
            tabBarIcon: ({ size, color }) => (
              <View style={styles.addButton}>
                <Plus size={size} color="#fff" />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
            tabBarIcon: ({ size, color }) => <BarChart3 size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ size, color }) => <Settings size={size} color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  menuButton: {
    padding: 12,
    marginLeft: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  tabFocused: {
    backgroundColor: 'rgba(96,165,250,0.1)',
    borderRadius: 12,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -24,
  },
});
