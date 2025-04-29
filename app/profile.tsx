// app/profile.tsx


import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView, Platform, Animated, Easing } from 'react-native';
import { Camera, Mail, User, Lock, ChevronRight, Edit2, ArrowLeft  } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { getProfile, updateProfile, changePassword } from '@/lib/api';
import { useNavigation } from '@react-navigation/native';
import { BASE_URL } from '@/lib/config';

export default function ProfileScreen() {
  const { isDark } = useTheme();
  const { user, loading: authLoading, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const navigation = useNavigation();
  const [avatarUri, setAvatarUri] = useState('');
  const slideAnim = useState(new Animated.Value(0))[0]; // Start position
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [userData, setUserData] = useState({
    username: '',
    email: '',
    name: '',
    avatarUrl: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
  });
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

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

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const profile = await getProfile();
        setUserData({
          username: profile.username,
          email: profile.email,
          name: profile.name,  // Match database 'name' field
          avatarUrl: profile.avatar_url || 'https://default-avatar-url.com'
        });
      } catch (error) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to load profile data'
        });
      } finally {
        setInitialLoad(false);
      }
    };

    loadUserData();
  }, []);

  // app/profile.tsx
const handleImagePick = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const formData = new FormData();
      formData.append('image', {
        uri: result.assets[0].uri,
        name: `avatar-${Date.now()}.jpg`,
        type: 'image/jpeg'
      } as any);

      const response = await fetch(`${BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      
      setUserData(prev => ({
        ...prev,
        avatarUrl: data.url
      }));
    }
  } catch (error) {
    console.error('Upload error:', error);
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error instanceof Error ? error.message : 'Failed to upload image'
    });
  }
};

const handleSaveProfile = async () => {
  try {
    // Validate required fields before sending request
    if (!userData.username?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Username is required',
      });
      return;
    }

    if (!userData.name?.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Full name is required',
      });
      return;
    }

    setLoading(true);

    // Trim whitespace from inputs
    const payload = {
      username: userData.username.trim(),
      name: userData.name.trim(),
      avatar_url: userData.avatarUrl?.trim() || null,
    };

    const updatedUser = await updateProfile(payload);
    
    // Update context and UI
    updateUser(updatedUser);
    setIsEditing(false);

    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Profile updated successfully',
    });
  } catch (error) {
    console.error('Profile update error:', error);
    
    let errorMessage = 'Failed to update profile';
    if (error instanceof Error) {
      errorMessage = error.message.includes('Username already taken')
        ? 'Username is already taken'
        : error.message;
    }

    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: errorMessage,
    });
  } finally {
    setLoading(false);
  }
};

const handleChangePassword = async () => {
  if (!passwords.current || !passwords.new || !passwords.confirm) {
    Toast.show({ type: 'error', text1: 'Error', text2: 'Please fill all password fields' });
    return;
  }

  if (passwords.new !== passwords.confirm) {
    Toast.show({ type: 'error', text1: 'Error', text2: 'New passwords do not match' });
    return;
  }

  try {
    setLoading(true);
    await changePassword(passwords.current, passwords.new);
    
    // Clear password fields after successful update
    setPasswords({ current: '', new: '', confirm: '' });
    
    Toast.show({
      type: 'success',
      text1: 'Success',
      text2: 'Password updated successfully'
    });
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Error',
      text2: error instanceof Error ? error.message : 'Failed to update password'
    });
  } finally {
    setLoading(false);
  }
};

  return (
    <Animated.View style={{ transform: [{ translateX: slideAnim }], flex: 1 }}>
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <View style={[styles.header, { alignItems: 'center' }, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
        <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Profile</Text>
        <TouchableOpacity onPress={handleBack} style={{ position: 'absolute', left: 16, top: Platform.OS === 'web' ? 16 : 60 }}>
          <ArrowLeft size={24} color={isDark ? '#fff' : '#1e293b'} />
        </TouchableOpacity>

      </View>

      <View style={styles.content}>
        <View style={[styles.profileImageContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Image
            source={{ uri: userData.avatarUrl }}
            style={styles.profileImage}
          />
          <TouchableOpacity 
            style={[styles.cameraButton, { backgroundColor: isDark ? '#2d3748' : '#e2e8f0' }]}
            onPress={handleImagePick}
          >
            <Camera size={20} color={isDark ? '#fff' : '#1e293b'} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Personal Information</Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Edit2 size={20} color={isDark ? '#fff' : '#1e293b'} />
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <User size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Username"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={userData.username}
                onChangeText={text => setUserData(prev => ({ ...prev, username: text }))}
                editable={isEditing}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Mail size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Email"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={userData.email}
                editable={false}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <User size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Full Name"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={userData.name}
                onChangeText={text => setUserData(prev => ({ ...prev, fullName: text }))}
                editable={isEditing}
              />
            </View>

            {isEditing && (
              <TouchableOpacity 
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSaveProfile}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Text>
                {!loading && <ChevronRight size={20} color="#fff" />}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
          <Text style={[styles.sectionTitle, { color: isDark ? '#fff' : '#1e293b' }]}>Change Password</Text>
          
          <View style={styles.inputGroup}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Lock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Current Password"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                secureTextEntry
                value={passwords.current}
                onChangeText={text => setPasswords(prev => ({ ...prev, current: text }))}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Lock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="New Password"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                secureTextEntry
                value={passwords.new}
                onChangeText={text => setPasswords(prev => ({ ...prev, new: text }))}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#2d3748' : '#f1f5f9' }]}>
              <Lock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Confirm New Password"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                secureTextEntry
                value={passwords.confirm}
                onChangeText={text => setPasswords(prev => ({ ...prev, confirm: text }))}
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleChangePassword}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Updating...' : 'Update Password'}
              </Text>
              {!loading && <ChevronRight size={20} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
    </Animated.View>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'web' ? 16 : 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'SpaceGrotesk-Bold',
  },
  content: {
    padding: 16,
    gap: 24,
  },
  profileImageContainer: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 16,
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 20,
    right: '50%',
    marginRight: -60,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderRadius: 16,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk-Medium',
  },
  inputGroup: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 12,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
});