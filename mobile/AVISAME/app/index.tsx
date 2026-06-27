import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { storage } from '@/lib/storage';

export default function Index() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const isRegistered = await storage.isCustomerRegistered();

        if (isRegistered) {
          // Always go to scan first, as requested
          router.replace('/scan');
        } else {
          router.replace('/register');
        }
      } catch (error) {
        console.error('Error checking status:', error);
        router.replace('/register');
      } finally {
        setLoading(false);
      }
    };

    checkRegistration();
  }, [router]);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return null;
}
