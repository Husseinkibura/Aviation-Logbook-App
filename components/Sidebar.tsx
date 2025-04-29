// components/Sidebar.tsx

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun, Monitor, User, Settings, Archive, LogOut, Book, Award, X } from 'lucide-react-native';
import { Link, router } from 'expo-router';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { theme, toggleTheme, isDark } = useTheme();

  const handleLogout = () => {
    router.replace('/(auth)/signin');
  };

  const getThemeIcon = () => {
    if (theme === 'system') return <Monitor size={24} color={isDark ? '#fff' : '#1e293b'} />;
    if (theme === 'dark') return <Moon size={24} color={isDark ? '#fff' : '#1e293b'} />;
    return <Sun size={24} color={isDark ? '#fff' : '#1e293b'} />;
  };

  if (!isOpen) return null;

  return (
    <View style={[
      styles.container,
      { backgroundColor: isDark ? '#1e293b' : '#fff' }
    ]}>
      <ScrollView style={styles.content}>
        <View style={styles.header}>
          <Text style={[
            styles.title,
            { color: isDark ? '#fff' : '#1e293b' }
          ]}>Menu</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={isDark ? '#fff' : '#1e293b'} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
        <Link href="/profile" asChild>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={onClose} // Close sidebar when navigating
          >
            <User size={24} color={isDark ? '#fff' : '#1e293b'} />
            <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Profile</Text>
          </TouchableOpacity>
        </Link>

          <Link href="/logbook" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Book size={24} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Logbook</Text>
            </TouchableOpacity>
          </Link>

          {/* <Link href="/schedule" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Book size={24} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Schedules</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/audit" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Book size={24} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Audits</Text>
            </TouchableOpacity>
          </Link> */}

          <Link href="/analytics" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Book size={24} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Analytics</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity style={styles.menuItem} onPress={toggleTheme}>
            {getThemeIcon()}
            <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>
              {theme === 'system' ? 'System Theme' : theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </TouchableOpacity>

          <Link href="/settings" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Settings size={24} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Settings</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/certifications" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Award size={24} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Certifications</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/backup" asChild>
            <TouchableOpacity style={styles.menuItem}>
              <Archive  size={24} color={isDark ? '#fff' : '#1e293b'} />
              <Text style={[styles.menuText, { color: isDark ? '#fff' : '#1e293b' }]}>Backup</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <TouchableOpacity style={[styles.menuItem, styles.logoutButton]} onPress={handleLogout}>
          <LogOut size={24} color="#ef4444" />
          <Text style={[styles.menuText, { color: '#ef4444' }]}>Log Out</Text>
        </TouchableOpacity>
      </ScrollView>

      <TouchableOpacity style={styles.overlay} onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    zIndex: 100,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 300,
    bottom: 0,
    right: -1000,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontFamily: 'SpaceGrotesk-Bold',
    fontSize: 24,
  },
  section: {
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    marginLeft: 12,
  },
  logoutButton: {
    margin: 16,
    marginTop: 0,
  },
});