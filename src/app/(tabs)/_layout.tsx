import AppTabs from '@/components/app-tabs'; // Tavo meniu komponentas
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Layout() {
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!active) {
        return;
      }

      if (!session) {
        router.replace('/Login');
      } else {
        setIsReady(true);
      }
    };

    checkSession();

    return () => {
      active = false;
    };
  }, [router]);

  if (!isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppTabs />;
}