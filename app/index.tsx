// app/index.tsx
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function Index() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/(auth)/signin');
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  return null;
}
