// app/(auth)/signup.tsx

import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Link, router } from 'expo-router';
import { User, Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Toast from 'react-native-toast-message';
import { signUp, storeToken } from '@/lib/api';
import { useRefresh } from '@/context/RefreshContext';

export default function SignUpScreen() {
  const { isDark } = useTheme();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setShouldRefresh } = useRefresh();

  const handleSignUp = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      });
      return;
    }
    
    if (password !== confirmPassword) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Passwords do not match',
      });
      return;
    }

    try {
      setLoading(true);
      const { token } = await signUp(email, password, username, name, confirmPassword);
      storeToken(token);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Account created successfully!',
      });
      router.replace('/signin');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to create account',
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?q=80&w=2940&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(248, 250, 252, 0.9)' }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Create Account</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Start your aviation journey today
          </Text>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <User size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Full Name"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={name}
                onChangeText={setName}
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <User size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Username"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <Mail size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Email"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <Lock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Password"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1e293b' : '#fff' }]}>
              <Lock size={20} color={isDark ? '#94a3b8' : '#64748b'} />
              <TextInput
                style={[styles.input, { color: isDark ? '#fff' : '#1e293b' }]}
                placeholder="Confirm Password"
                placeholderTextColor={isDark ? '#94a3b8' : '#64748b'}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <TouchableOpacity 
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]} 
              onPress={handleSignUp}
              disabled={loading}
            >
              <Text style={styles.signUpButtonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
              {!loading && <ArrowRight size={20} color="#fff" />}
            </TouchableOpacity>

            <View style={styles.signinContainer}>
              <Text style={[styles.signinText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Already have an account?
              </Text>
              <Link href="/signin" asChild>
                <TouchableOpacity>
                  <Text style={styles.signinLink}>Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    minHeight: 800,
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontFamily: 'SpaceGrotesk-Bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  signUpButton: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  signinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  signinText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  signinLink: {
    color: '#60a5fa',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});