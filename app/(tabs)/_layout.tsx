import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import Auth from '@/components/Auth';
import Onboarding from '@/components/Onboarding';
import { ActivityIndicator, View } from 'react-native';

import { useClientOnlyValue } from '@/components/useClientOnlyValue';

// You can explore the built-in icon families and icons on the web at https://icons.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const [session, setSession] = useState<Session | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        checkProfile(session.user.id);
      } else {
        setIsProfileComplete(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, username, height, fitness_goal, gender, activity_level')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Profile check error:', error.message);
        // If columns are missing or other DB error, assume profile is incomplete
        setIsProfileComplete(false);
        return;
      }

      if (data && data.full_name && data.username && data.height && data.fitness_goal && data.gender) {
        setIsProfileComplete(true);
      } else {
        setIsProfileComplete(false);
      }
    } catch (err) {
      console.error('Catch error in checkProfile:', err);
      setIsProfileComplete(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#050505', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFB800" />
      </View>
    );
  }

  if (!session) {
    return <Auth />;
  }

  if (isProfileComplete === false) {
    return <Onboarding userId={session.user.id} onComplete={() => setIsProfileComplete(true)} />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FFB800',
        tabBarInactiveTintColor: '#444',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#050505',
          borderTopWidth: 0.5,
          borderTopColor: '#1A1A1A',
          height: 75,
          paddingBottom: 15,
        },
        headerStyle: {
          backgroundColor: '#050505',
          borderBottomWidth: 0.5,
          borderBottomColor: '#1A1A1A',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          color: '#FFFFFF',
          fontWeight: '200', // Thin for elegance
          letterSpacing: 4,
          fontSize: 14,
          textTransform: 'uppercase',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'HOME',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="food"
        options={{
          title: 'FOOD',
          tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          title: 'BOOKING',
          tabBarIcon: ({ color }) => <TabBarIcon name="calendar" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );
}
