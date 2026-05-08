import { useState, useEffect } from 'react';
import { StyleSheet, FlatList, Alert, TouchableOpacity, Platform } from 'react-native';
import { Button, Card, Text, ListItem, Avatar, Icon } from '@rneui/themed';
import { supabase } from '@/lib/supabase';
import { View } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';

export default function BookingScreen() {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [selectedTrainer, setSelectedTrainer] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTrainers();
  }, []);

  const fetchTrainers = async () => {
    const { data, error } = await supabase.from('trainers').select('*');
    if (error) Alert.alert('Error', error.message);
    else setTrainers(data || []);
  };

  const fetchSlots = async (trainerId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('slots')
      .select('*')
      .eq('trainer_id', trainerId)
      .eq('is_booked', false);
    
    if (error) Alert.alert('Error', error.message);
    else setSlots(data || []);
    setLoading(false);
  };

  const bookSlot = async (slotId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error: bookingError } = await supabase.from('bookings').insert({
        user_id: user?.id,
        slot_id: slotId,
      });
      if (bookingError) throw bookingError;

      const { error: slotError } = await supabase
        .from('slots')
        .update({ is_booked: true })
        .eq('id', slotId);
      if (slotError) throw slotError;

      Alert.alert('Success', 'SLOT BOOKED!');
      fetchSlots(selectedTrainer.id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  if (selectedTrainer) {
    return (
      <View style={styles.container}>
        <Button 
          title="BACK" 
          onPress={() => setSelectedTrainer(null)} 
          type="clear"
          icon={{ name: 'arrow-left', type: 'font-awesome', size: 12, color: '#FFB800' }}
          titleStyle={styles.backButtonText}
          containerStyle={styles.backButton}
        />
        <Card containerStyle={styles.mainCard}>
          <View style={styles.trainerHeader}>
            <Avatar rounded source={{ uri: selectedTrainer.avatar_url || 'https://via.placeholder.com/150' }} size="large" containerStyle={styles.avatarBorder} />
            <View style={styles.trainerInfo}>
              <Text style={styles.trainerName}>{selectedTrainer.name.toUpperCase()}</Text>
              <Text style={styles.specialtyText}>{selectedTrainer.specialty.toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.bioText}>{selectedTrainer.bio}</Text>
          <View style={styles.divider} />
          <Text style={styles.cardTitle}>AVAILABLE SLOTS</Text>
          {loading ? (
            <Text style={styles.loadingText}>FETCHING SLOTS...</Text>
          ) : slots.length === 0 ? (
            <Text style={styles.emptyText}>NO SLOTS AVAILABLE.</Text>
          ) : (
            slots.map((slot) => (
              <ListItem key={slot.id} containerStyle={styles.slotItem}>
                <ListItem.Content>
                  <ListItem.Title style={styles.slotTitle}>
                    {new Date(slot.start_time).toLocaleDateString().toUpperCase()}
                  </ListItem.Title>
                  <ListItem.Subtitle style={styles.slotSubtitle}>
                    {new Date(slot.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </ListItem.Subtitle>
                </ListItem.Content>
                <Button 
                  title="BOOK" 
                  size="sm" 
                  onPress={() => bookSlot(slot.id)} 
                  ViewComponent={LinearGradient}
                  linearGradientProps={{
                    colors: ['#FFE66D', '#FFB800', '#D4AF37'],
                    start: { x: 0, y: 0 },
                    end: { x: 1, y: 1 },
                  }}
                  buttonStyle={styles.bookButton}
                  titleStyle={styles.bookButtonText}
                />
              </ListItem>
            ))
          )}
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={trainers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={<Text style={styles.header}>ELITE COACHES</Text>}
        ListEmptyComponent={<Text style={styles.emptyText}>RECRUITING TRAINERS...</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity activeOpacity={0.8} onPress={() => { setSelectedTrainer(item); fetchSlots(item.id); }}>
            <Card containerStyle={styles.trainerCard}>
              <View style={styles.row}>
                <Avatar rounded source={{ uri: item.avatar_url || 'https://via.placeholder.com/150' }} size="medium" containerStyle={styles.avatarBorder} />
                <View style={styles.trainerInfo}>
                  <Text style={styles.name}>{item.name.toUpperCase()}</Text>
                  <Text style={styles.specialty}>{item.specialty.toUpperCase()}</Text>
                </View>
                <Icon name="chevron-right" color="#FFB800" />
              </View>
            </Card>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  listContent: {
    paddingBottom: 40,
  },
  header: {
    marginHorizontal: 30,
    marginTop: 40,
    marginBottom: 20,
    fontSize: 24,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 6,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 10,
    fontWeight: '700',
    color: '#333',
    letterSpacing: 2,
  },
  trainerCard: {
    backgroundColor: '#121212',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 184, 0, 0.2)',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  trainerInfo: {
    marginLeft: 15,
    flex: 1,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  specialty: {
    color: '#FFB800',
    fontSize: 9,
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1.5,
  },
  mainCard: {
    backgroundColor: '#121212',
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#FFB800',
    borderRadius: 24,
    padding: 30,
    marginHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#FFB800',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
      web: {
        boxShadow: '0px 8px 20px rgba(255, 184, 0, 0.15)',
      }
    })
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
    backgroundColor: 'transparent',
  },
  trainerName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  specialtyText: {
    color: '#FFB800',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  bioText: {
    color: '#888',
    lineHeight: 24,
    fontSize: 14,
    fontWeight: '400',
    marginBottom: 25,
  },
  divider: {
    height: 1,
    backgroundColor: '#222',
    marginBottom: 25,
  },
  cardTitle: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 20,
    textAlign: 'center',
  },
  slotItem: {
    backgroundColor: '#0A0A0A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 12,
    padding: 15,
  },
  slotTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
  },
  slotSubtitle: {
    color: '#FFB800',
    fontSize: 16,
    fontWeight: '700',
  },
  bookButton: {
    backgroundColor: '#FFB800',
    borderRadius: 50,
    paddingHorizontal: 25,
  },
  bookButtonText: {
    color: '#000000',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  backButton: {
    marginTop: 50,
    marginLeft: 20,
    marginBottom: 10,
  },
  backButtonText: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  avatarBorder: {
    borderWidth: 1,
    borderColor: '#FFB800',
  },
  loadingText: {
    color: '#333',
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: 1,
  },
});
