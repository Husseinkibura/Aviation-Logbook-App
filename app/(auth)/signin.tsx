import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Link, router } from 'expo-router';
import { Mail, Lock, ArrowRight } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Toast from 'react-native-toast-message';
import { signIn, storeToken } from '@/lib/api';
import { useRefresh } from '@/context/RefreshContext';

export default function SignInScreen() {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setShouldRefresh } = useRefresh();

  const handleSignIn = async () => {
    if (!email || !password) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Please fill in all fields',
      });
      return;
    }
  
    try {
      setLoading(true);
      const { token } = await signIn(email, password);
      storeToken(token);
      
      Toast.show({
        type: 'success',
        text1: 'Success',
        text2: 'Welcome back!',
      });
  
      setShouldRefresh(true);
      router.replace('/(tabs)');
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error instanceof Error ? error.message : 'Failed to sign in',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0f172a' : '#f8fafc' }]}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?q=80&w=2067&auto=format&fit=crop' }}
        style={styles.backgroundImage}
      />
      <View style={[styles.overlay, { backgroundColor: isDark ? 'rgba(15, 23, 42, 0.9)' : 'rgba(248, 250, 252, 0.9)' }]}>
        <View style={styles.content}>
          <Text style={[styles.title, { color: isDark ? '#fff' : '#1e293b' }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94a3b8' : '#64748b' }]}>
            Sign in to continue your flight journey
          </Text>

          <View style={styles.form}>
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

            <TouchableOpacity 
              style={[styles.signInButton, loading && styles.signInButtonDisabled]} 
              onPress={handleSignIn}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" /> // Round loader here
              ) : (
                <>
                  <Text style={styles.signInButtonText}>Sign In</Text>
                  <ArrowRight size={20} color="#fff" />
                </>
              )}
            </TouchableOpacity>

            <View style={styles.signupContainer}>
              <Text style={[styles.signupText, { color: isDark ? '#94a3b8' : '#64748b' }]}>
                Don't have an account?
              </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </View>
    </View>
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
    justifyContent: 'center',
  },
  content: {
    padding: 24,
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
  signInButton: {
    backgroundColor: '#60a5fa',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  signInButtonDisabled: {
    opacity: 0.7,
  },
  signInButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  signupText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
  },
  signupLink: {
    color: '#60a5fa',
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
  },
});
