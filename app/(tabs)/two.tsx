import { StyleSheet, ScrollView, Alert, Image, Platform } from 'react-native';
import { Button, Card, Text, Input, ListItem, Icon } from '@rneui/themed';
import { supabase } from '@/lib/supabase';
import { View } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export default function TabTwoScreen() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    fitness_goal: '',
    height: '',
  });
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [muscleMass, setMuscleMass] = useState('');
  const [waist, setWaist] = useState('');
  const [measurements, setMeasurements] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchData(session.user.id);
        fetchProfile(session.user.id);
      }
    });
  }, []);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('full_name, username, fitness_goal, height')
      .eq('id', userId)
      .single();
    
    if (data) setProfile({
      ...data,
      height: data.height?.toString() || '',
    });
  };

  const updateProfile = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: session?.user.id,
        full_name: profile.full_name,
        username: profile.username,
        fitness_goal: profile.fitness_goal,
        height: parseFloat(profile.height) || null,
        updated_at: new Date(),
      });
      if (error) throw error;
      Alert.alert('SUCCESS', 'PROFILE UPDATED!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (userId: string) => {
    const { data: mData } = await supabase
      .from('measurements')
      .select('*')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: false });
    setMeasurements(mData || []);

    const { data: pData } = await supabase
      .from('personal_photos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    setPhotos(pData || []);
  };

  const saveMeasurement = async () => {
    if (!weight) return Alert.alert('Enter weight');
    try {
      const { error } = await supabase.from('measurements').insert({
        user_id: session?.user.id,
        weight: parseFloat(weight),
        body_fat: parseFloat(bodyFat) || null,
        muscle_mass: parseFloat(muscleMass) || null,
        waist: parseFloat(waist) || null,
      });
      if (error) throw error;
      Alert.alert('SAVED!');
      setWeight('');
      setBodyFat('');
      setMuscleMass('');
      setWaist('');
      fetchData(session!.user.id);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const uploadPhoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setLoading(true);
      try {
        const base64 = await FileSystem.readAsStringAsync(result.assets[0].uri, { encoding: 'base64' });
        const filePath = `personal/${Date.now()}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('personal-photos')
          .upload(filePath, decode(base64), { contentType: 'image/jpeg' });

        if (uploadError) throw uploadError;

        const { error: dbError } = await supabase.from('personal_photos').insert({
          user_id: session?.user.id,
          image_url: filePath,
        });

        if (dbError) throw dbError;
        fetchData(session!.user.id);
      } catch (error: any) {
        Alert.alert('Error', error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  if (!session) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Profile Header */}
      <Card containerStyle={styles.mainCard}>
        <Text style={styles.profileEmail}>{session.user.email?.toUpperCase()}</Text>
      </Card>

      {/* Personal Info */}
      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>PERSONAL INFORMATION</Card.Title>
        <Input 
          placeholder="FULL NAME" 
          value={profile.full_name} 
          onChangeText={(t) => setProfile({...profile, full_name: t})}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          placeholderTextColor="#475569"
        />
        <Input 
          placeholder="USERNAME" 
          value={profile.username} 
          onChangeText={(t) => setProfile({...profile, username: t})}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          placeholderTextColor="#475569"
        />
        <Input 
          placeholder="HEIGHT (CM)" 
          keyboardType="numeric"
          value={profile.height} 
          onChangeText={(t) => setProfile({...profile, height: t})}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          placeholderTextColor="#475569"
        />
        <Input 
          placeholder="FITNESS GOAL (E.G. WEIGHT LOSS)" 
          value={profile.fitness_goal} 
          onChangeText={(t) => setProfile({...profile, fitness_goal: t})}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputStyle}
          placeholderTextColor="#475569"
        />
        <Button 
          title="UPDATE PROFILE" 
          onPress={updateProfile} 
          loading={loading}
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#FFE66D', '#FFB800', '#D4AF37'],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          buttonStyle={styles.actionButtonPrimary}
          titleStyle={styles.buttonTextPrimary}
        />
      </Card>

      {/* Body Measurements */}
      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>BODY MEASUREMENTS</Card.Title>
        <View style={styles.inputRow}>
          <Input 
            placeholder="WEIGHT (KG)" 
            keyboardType="numeric" 
            value={weight} 
            onChangeText={setWeight}
            containerStyle={{ flex: 1 }}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputStyle}
            placeholderTextColor="#475569"
          />
          <Input 
            placeholder="BODY FAT %" 
            keyboardType="numeric" 
            value={bodyFat} 
            onChangeText={setBodyFat}
            containerStyle={{ flex: 1 }}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputStyle}
            placeholderTextColor="#475569"
          />
        </View>
        <View style={styles.inputRow}>
          <Input 
            placeholder="MUSCLE %" 
            keyboardType="numeric" 
            value={muscleMass} 
            onChangeText={setMuscleMass}
            containerStyle={{ flex: 1 }}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputStyle}
            placeholderTextColor="#475569"
          />
          <Input 
            placeholder="WAIST (CM)" 
            keyboardType="numeric" 
            value={waist} 
            onChangeText={setWaist}
            containerStyle={{ flex: 1 }}
            inputContainerStyle={styles.inputContainer}
            inputStyle={styles.inputStyle}
            placeholderTextColor="#475569"
          />
        </View>
        <Button 
          title="SAVE ENTRY" 
          onPress={saveMeasurement} 
          ViewComponent={LinearGradient}
          linearGradientProps={{
            colors: ['#FFE66D', '#FFB800', '#D4AF37'],
            start: { x: 0, y: 0 },
            end: { x: 1, y: 1 },
          }}
          buttonStyle={styles.actionButtonPrimary}
          titleStyle={styles.buttonTextPrimary}
        />
        <View style={styles.divider} />
        {measurements.slice(0, 3).map((m, i) => (
          <ListItem key={i} containerStyle={styles.listItem}>
            <ListItem.Content>
              <ListItem.Title style={styles.historyTitle}>
                {m.weight}KG • {m.body_fat}% FAT • {m.muscle_mass}% MUSCLE
              </ListItem.Title>
              <ListItem.Subtitle style={styles.historySubtitle}>{new Date(m.recorded_at).toLocaleDateString().toUpperCase()}</ListItem.Subtitle>
            </ListItem.Content>
          </ListItem>
        ))}
      </Card>

      {/* Personal Photos */}
      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>PROGRESS PHOTOS</Card.Title>
        <Button 
          title="UPLOAD PHOTO" 
          onPress={uploadPhoto} 
          loading={loading} 
          buttonStyle={styles.actionButtonSecondary}
          titleStyle={styles.buttonTextSecondary}
        />
        <ScrollView horizontal style={{ marginTop: 15 }} showsHorizontalScrollIndicator={false}>
          {photos.map((p, i) => (
            <Image 
              key={i} 
              source={{ uri: `https://mquaspadfmagdbifgbik.supabase.co/storage/v1/object/public/personal-photos/${p.image_url}` }} 
              style={styles.thumbnail} 
            />
          ))}
        </ScrollView>
      </Card>

      {/* Payments & Feedback */}
      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>SYSTEM</Card.Title>
        <ListItem containerStyle={styles.systemItem} onPress={() => Alert.alert('PAYMENTS', 'PAYMENT GATEWAY COMING SOON.')}>
          <Icon name="payment" color="#FFB800" size={20} />
          <ListItem.Content>
            <ListItem.Title style={styles.systemTitle}>PAYMENT HISTORY</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron color="#FFB800" />
        </ListItem>
        <ListItem containerStyle={styles.systemItem} onPress={() => Alert.alert('FEEDBACK', 'WE VALUE YOUR INPUT.')}>
          <Icon name="feedback" color="#FFB800" size={20} />
          <ListItem.Content>
            <ListItem.Title style={styles.systemTitle}>SEND FEEDBACK</ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron color="#FFB800" />
        </ListItem>
      </Card>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050505',
  },
  contentContainer: {
    paddingVertical: 30,
  },
  mainCard: {
    backgroundColor: '#121212',
    borderWidth: 0,
    borderTopWidth: 1,
    borderTopColor: '#FFB800',
    borderRadius: 24,
    padding: 25,
    marginHorizontal: 20,
    marginVertical: 12,
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
    fontSize: 10,
    letterSpacing: 3,
    fontWeight: '900',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  profileEmail: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '200', // Thin weight for premium look
    letterSpacing: 1,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 15,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: '#0A0A0A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 15,
  },
  inputStyle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
  },
  actionButtonPrimary: {
    backgroundColor: '#FFB800',
    borderRadius: 50,
    paddingVertical: 18,
  },
  buttonTextPrimary: {
    color: '#000000',
    fontWeight: '800',
    letterSpacing: 2,
    fontSize: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#1A1A1A',
    marginVertical: 25,
  },
  listItem: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#222',
  },
  historyTitle: {
    color: '#FFFFFF',
    fontWeight: '400',
    fontSize: 14,
    letterSpacing: 1,
  },
  historySubtitle: {
    color: '#FFB800',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 2,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.4)',
    borderRadius: 50,
    paddingVertical: 14,
  },
  buttonTextSecondary: {
    color: '#FFB800',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 2,
  },
  thumbnail: {
    width: 140,
    height: 140,
    marginRight: 15,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: '#222',
  },
  systemItem: {
    backgroundColor: '#0A0A0A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#1A1A1A',
    marginBottom: 10,
    paddingVertical: 15,
  },
  systemTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '400',
    letterSpacing: 1,
  },
  emptyText: {
    color: '#333',
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 100,
    letterSpacing: 4,
  },
});
