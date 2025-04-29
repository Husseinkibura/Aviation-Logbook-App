// app/(tabs)/settings.tsx

import React, { useState, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Animated, Easing, Platform } from 'react-native';
import { ChevronRight, User, Bell, Shield, Download, CircleHelp as HelpCircle, ArrowLeft, Info } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { router } from 'expo-router';
import { useNavigation, useFocusEffect  } from '@react-navigation/native';
import { useAuth } from '@/context/AuthContext';
import { Image } from 'react-native';

export default function SettingsScreen() {
  const { isDark } = useTheme();
  const navigation = useNavigation();
  const slideAnim = useState(new Animated.Value(0))[0]; // Start position
  const { user } = useAuth(); // Add this line

  const handleBack = () => {
    Animated.timing(slideAnim, {
      toValue: -500, // Slide to left
      duration: 300,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      navigation.goBack();
    });
  };

  useFocusEffect(
    useCallback(() => {
      // Reset the animation when screen comes into focus
      slideAnim.setValue(-1000);
  
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
  
      return () => {
        // Optionally reset again when leaving
        slideAnim.setValue(-1000);
      };
    }, [])
  );

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'Your flight data will be exported as a CSV file',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Export', onPress: () => {
          // TODO: Implement data export
        }}
      ]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'We take your privacy seriously. Your data is encrypted and stored securely. We never share your personal information with third parties.',
      [{ text: 'OK' }]
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help Center',
      'Need assistance? Contact our support team at support@flightlog.com',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Us',
      'Flight Log App v1.0.0\n\nWe help pilots track their aviation journey with precision and ease.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { alignItems: 'center' }, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Settings</Text>
        <TouchableOpacity onPress={handleBack} style={{ position: 'absolute', left: 16, top: Platform.OS === 'web' ? 16 : 60 }}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#1e293b'} />
        </TouchableOpacity>
      </View>
  
      {/* WRAP the content inside Animated.View */}
      <Animated.View style={{ transform: [{ translateX: slideAnim }], flex: 1 }}>
        <ScrollView style={styles.content}>
          {/* --- All the inner content here --- */}
          {/* Profile Section */}
          <TouchableOpacity 
            style={[styles.profileSection, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}
            onPress={() => router.push('/profile')}
          >
            <View style={styles.profileImage}>
              {user?.avatar_url ? (
                <Image
                  source={{ uri: user.avatar_url }}
                  style={styles.avatarImage}
                />
              ) : (
                <User size={32} color="#60a5fa" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: isDark ? '#fff' : '#1e293b' }]}>
                {user?.name || 'Loading...'}
              </Text>
              <Text style={styles.profileEmail}>
                {user?.email || 'Loading...'}
              </Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#fff' : '#64748b'} />
          </TouchableOpacity>
  
          {/* Preferences Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Preferences</Text>
            
            <View style={[styles.settingItem, { backgroundColor: isDark ? '#1e293b' : '#fff', borderBottomColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Bell size={20} color={isDark ? '#fff' : '#64748b'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#1e293b' }]}>Notifications</Text>
              <Switch value={true} onValueChange={() => {}} />
            </View>
  
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: isDark ? '#1e293b' : '#fff', borderBottomColor: isDark ? '#2d3748' : '#f1f5f9' }]}
              onPress={handlePrivacy}
            >
              <Shield size={20} color={isDark ? '#fff' : '#64748b'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#1e293b' }]}>Privacy</Text>
              <ChevronRight size={20} color={isDark ? '#fff' : '#64748b'} />
            </TouchableOpacity>
  
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: isDark ? '#1e293b' : '#fff', borderBottomColor: isDark ? '#2d3748' : '#f1f5f9' }]}
              onPress={handleExportData}
            >
              <Download size={20} color={isDark ? '#fff' : '#64748b'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#1e293b' }]}>Export Data</Text>
              <ChevronRight size={20} color={isDark ? '#fff' : '#64748b'} />
            </TouchableOpacity>
          </View>
  
          {/* Support Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>Support</Text>
  
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: isDark ? '#1e293b' : '#fff', borderBottomColor: isDark ? '#2d3748' : '#f1f5f9' }]}
              onPress={handleHelp}
            >
              <HelpCircle size={20} color={isDark ? '#fff' : '#64748b'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#1e293b' }]}>Help Center</Text>
              <ChevronRight size={20} color={isDark ? '#fff' : '#64748b'} />
            </TouchableOpacity>
  
            <TouchableOpacity 
              style={[styles.settingItem, { backgroundColor: isDark ? '#1e293b' : '#fff', borderBottomColor: isDark ? '#2d3748' : '#f1f5f9' }]}
              onPress={handleAbout}
            >
              <Info size={20} color={isDark ? '#fff' : '#64748b'} />
              <Text style={[styles.settingLabel, { color: isDark ? '#fff' : '#1e293b' }]}>About Us</Text>
              <ChevronRight size={20} color={isDark ? '#fff' : '#64748b'} />
            </TouchableOpacity>
          </View>
  
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.version, { color: isDark ? '#94a3b8' : '#64748b' }]}>Version 1.0.0</Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/signin')}>
              <Text style={styles.logout}>Log Out</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
  

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginTop: 16,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },  
  profileEmail: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 2,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  version: {
    fontSize: 14,
    marginBottom: 16,
  },
  logout: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
  },
});
