import { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Platform, RefreshControl } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { syncHealthData } from '@/lib/health';
import { View } from '@/components/Themed';
import { Card, Button, ListItem, Icon, Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';

export default function TabOneScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchNotifications(session.user.id);
        fetchMetrics(session.user.id);
        handleSync(session.user.id);
      }
    });
  }, []);

  const onRefresh = async () => {
    if (session) {
      setRefreshing(true);
      await handleSync(session.user.id);
      setRefreshing(false);
    }
  };

  const handleSync = async (userId: string) => {
    try {
      await syncHealthData(userId);
      await fetchMetrics(userId);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchMetrics = async (userId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('health_metrics')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .maybeSingle();
    
    if (data) setMetrics(data);
  };

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .limit(5);
    setNotifications(data || []);
  };

  const ShinyButton = ({ title, icon, secondary, onPress }: { title: string, icon: any, secondary?: boolean, onPress?: () => void }) => (
    <Button 
      title={title} 
      onPress={onPress}
      ViewComponent={!secondary ? LinearGradient : View}
      linearGradientProps={!secondary ? {
        colors: ['#FFE66D', '#FFB800', '#D4AF37'],
        start: { x: 0, y: 0 },
        end: { x: 1, y: 1 },
      } : undefined}
      icon={icon}
      buttonStyle={secondary ? styles.actionButtonSecondary : styles.actionButtonPrimary}
      titleStyle={secondary ? styles.buttonTextSecondary : styles.buttonTextPrimary}
    />
  );

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFB800" />
      }
    >
      <View style={styles.header}>
        <Text h2 style={styles.welcome}>FALCON</Text>
        <Text style={styles.subtitle}>PREMIUM PERFORMANCE TRACKING</Text>
      </View>

      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>NOTIFICATIONS</Card.Title>
        {notifications.length === 0 ? (
          <Text style={styles.emptyText}>ALL CLEAR FOR NOW.</Text>
        ) : (
          notifications.map((n, i) => (
            <ListItem key={i} bottomDivider containerStyle={styles.listItem}>
              <Icon name="notifications" color="#FFB800" />
              <ListItem.Content>
                <ListItem.Title style={styles.notificationTitle}>{n.title}</ListItem.Title>
                <ListItem.Subtitle style={styles.notificationSubtitle}>{n.message}</ListItem.Subtitle>
              </ListItem.Content>
            </ListItem>
          ))
        )}
      </Card>

      <View style={styles.statsContainer}>
        <Card containerStyle={[styles.statCard, { flex: 1 }]}>
          <Text style={styles.statLabel}>STEPS</Text>
          <Text style={styles.statValue}>{metrics?.steps?.toLocaleString() || '0'}</Text>
        </Card>
        <Card containerStyle={[styles.statCard, { flex: 1 }]}>
          <Text style={styles.statLabel}>KCAL</Text>
          <Text style={styles.statValue}>{metrics?.calories_burned?.toLocaleString() || '0'}</Text>
        </Card>
      </View>

      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>QUICK ACTIONS</Card.Title>
        <ShinyButton 
          title="IDENTIFY FOOD" 
          icon={<Icon name="camera" type="font-awesome" color="black" size={18} style={{ marginRight: 10 }} />}
        />
        <ShinyButton 
          title="SYNC HEALTH" 
          secondary
          onPress={() => session && handleSync(session.user.id)}
          icon={<Icon name="refresh" type="font-awesome" color="#FFB800" size={18} style={{ marginRight: 10 }} />}
        />
      </Card>

      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>ABOUT FALCON</Card.Title>
        <Text style={styles.descriptionText}>
          FALCON FITNESS IS THE ULTIMATE TRAINING GROUND FOR THOSE WHO DEMAND EXCELLENCE. 
          OUR ELITE COACHES AND STATE-OF-THE-ART EQUIPMENT ARE DESIGNED TO PUSH YOU BEYOND YOUR LIMITS.
        </Text>
      </Card>

      <Button 
        title="LOGOUT" 
        onPress={() => supabase.auth.signOut()} 
        type="clear"
        titleStyle={styles.logoutButtonText}
        containerStyle={{ marginVertical: 30, paddingBottom: 20 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 30,
    backgroundColor: '#050505',
  },
  welcome: {
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 8,
    fontSize: 36,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(255, 184, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      },
      android: {
        textShadowColor: 'rgba(255, 184, 0, 0.3)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 10,
      },
      web: {
        textShadow: '0px 2px 10px rgba(255, 184, 0, 0.3)',
      }
    })
  },
  subtitle: {
    color: '#FFB800',
    letterSpacing: 4,
    fontWeight: '600',
    fontSize: 9,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.9,
  },
  mainCard: {
    backgroundColor: '#121212',
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#FFB800',
    borderRadius: 24,
    padding: 25,
    marginHorizontal: 20,
    marginVertical: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#FFB800',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
      web: {
        boxShadow: '0px 8px 20px rgba(255, 184, 0, 0.15)',
      }
    })
  },
  cardTitle: {
    color: '#FFB800',
    textAlign: 'center',
    fontSize: 11,
    letterSpacing: 4,
    fontWeight: '900',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  descriptionText: {
    color: '#AAA',
    fontSize: 12,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 1,
  },
  logoutButtonText: {
    color: '#444',
    fontWeight: '700',
    fontSize: 10,
    letterSpacing: 4,
  },
  listItem: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  notificationTitle: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  notificationSubtitle: {
    color: '#888',
    fontSize: 12,
  },
  emptyText: {
    color: '#333',
    textAlign: 'center',
    padding: 20,
    fontWeight: '600',
    letterSpacing: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    backgroundColor: 'transparent',
    marginTop: 10,
  },
  statCard: {
    backgroundColor: '#121212',
    borderWidth: 0,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    borderBottomWidth: 2,
    borderBottomColor: 'rgba(255, 184, 0, 0.4)', // Shiny bottom border
    ...Platform.select({
      ios: {
        shadowColor: '#FFB800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(255, 184, 0, 0.1)',
      }
    })
  },
  statLabel: {
    color: '#666',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '300',
    letterSpacing: 1,
  },
  actionButtonPrimary: {
    backgroundColor: 'transparent',
    borderRadius: 50,
    paddingVertical: 18,
    marginBottom: 15,
  },
  buttonTextPrimary: {
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 12,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#FFB800',
    borderRadius: 50,
    paddingVertical: 18,
  },
  buttonTextSecondary: {
    color: '#FFB800',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 12,
  },
});
