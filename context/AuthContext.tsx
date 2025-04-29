// context/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfile } from '../lib/api';

type User = {
  id: number;
  name: string;
  email: string;
  avatar_url?: string;
  username?: string;
};

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, userData: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const [token, storedUser] = await AsyncStorage.multiGet(['token', 'user']);
        
        if (token[1] && storedUser[1]) {
          // Immediately set stored user while validating
          setUser(JSON.parse(storedUser[1]));
          
          // Fetch fresh profile data
          const freshUser = await getProfile();
          await AsyncStorage.setItem('user', JSON.stringify(freshUser));
          setUser(freshUser);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await logout();
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (token: string, userData: User) => {
    try {
      await AsyncStorage.multiSet([
        ['token', token],
        ['user', JSON.stringify(userData)]
      ]);
      setUser(userData);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      if (!user) throw new Error('No user to update');
      
      const updatedUser = { ...user, ...userData };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};