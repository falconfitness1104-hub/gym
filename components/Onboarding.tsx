import React, { useState } from 'react';
import { StyleSheet, View, Alert, ImageBackground, ScrollView, Platform } from 'react-native';
import { Button, Input, Text } from '@rneui/themed';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';

interface OnboardingProps {
  userId: string;
  onComplete: () => void;
}

export default function Onboarding({ userId, onComplete }: OnboardingProps) {
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    username: '',
    height: '',
    fitness_goal: '',
    gender: '',
    activity_level: 'moderate',
  });

  const handleComplete = async () => {
    if (!profile.full_name || !profile.username || !profile.height || !profile.fitness_goal || !profile.gender) {
      Alert.alert('MISSING DATA', 'PLEASE FILL IN ALL FIELDS TO CONTINUE.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').upsert({
        id: userId,
        full_name: profile.full_name,
        username: profile.username,
        height: parseFloat(profile.height),
        fitness_goal: profile.fitness_goal,
        gender: profile.gender,
        activity_level: profile.activity_level,
        updated_at: new Date(),
      });

      if (error) throw error;
      onComplete();
    } catch (error: any) {
      Alert.alert('ERROR', error.message || 'COULD NOT SAVE PROFILE.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=2069&auto=format&fit=crop' }} 
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(5,5,5,0.7)', 'rgba(5,5,5,0.98)']}
        style={styles.overlay}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text h1 style={styles.title}>WELCOME</Text>
            <Text style={styles.subtitle}>FINISH YOUR PROFILE TO UNLOCK FALCON</Text>
          </View>

          <View style={styles.card}>
            <Input
              label="FULL NAME"
              labelStyle={styles.labelStyle}
              placeholder="ENTER YOUR NAME"
              value={profile.full_name}
              onChangeText={(t) => setProfile({ ...profile, full_name: t })}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputStyle}
              placeholderTextColor="#444"
            />
            <Input
              label="USERNAME"
              labelStyle={styles.labelStyle}
              placeholder="PICK A USERNAME"
              value={profile.username}
              onChangeText={(t) => setProfile({ ...profile, username: t })}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputStyle}
              placeholderTextColor="#444"
            />
            <Input
              label="HEIGHT (CM)"
              labelStyle={styles.labelStyle}
              placeholder="E.G. 180"
              keyboardType="numeric"
              value={profile.height}
              onChangeText={(t) => setProfile({ ...profile, height: t })}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputStyle}
              placeholderTextColor="#444"
            />
            <Input
              label="FITNESS GOAL"
              labelStyle={styles.labelStyle}
              placeholder="E.G. BUILD MUSCLE"
              value={profile.fitness_goal}
              onChangeText={(t) => setProfile({ ...profile, fitness_goal: t })}
              inputContainerStyle={styles.inputContainer}
              inputStyle={styles.inputStyle}
              placeholderTextColor="#444"
            />

            <View style={styles.inputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.labelStyle}>GENDER</Text>
                <View style={styles.pickerContainer}>
                  <Button 
                    title="MALE" 
                    type={profile.gender === 'male' ? 'solid' : 'clear'}
                    onPress={() => setProfile({...profile, gender: 'male'})}
                    buttonStyle={profile.gender === 'male' ? styles.activeOption : styles.inactiveOption}
                    titleStyle={profile.gender === 'male' ? styles.activeText : styles.inactiveText}
                    containerStyle={{ flex: 1 }}
                  />
                  <Button 
                    title="FEMALE" 
                    type={profile.gender === 'female' ? 'solid' : 'clear'}
                    onPress={() => setProfile({...profile, gender: 'female'})}
                    buttonStyle={profile.gender === 'female' ? styles.activeOption : styles.inactiveOption}
                    titleStyle={profile.gender === 'female' ? styles.activeText : styles.inactiveText}
                    containerStyle={{ flex: 1 }}
                  />
                </View>
              </View>
            </View>

            <Text style={styles.labelStyle}>ACTIVITY LEVEL</Text>
            <View style={styles.pickerContainer}>
              {['sedentary', 'moderate', 'active'].map((level) => (
                <Button 
                  key={level}
                  title={level.toUpperCase()} 
                  type={profile.activity_level === level ? 'solid' : 'clear'}
                  onPress={() => setProfile({...profile, activity_level: level})}
                  buttonStyle={profile.activity_level === level ? styles.activeOption : styles.inactiveOption}
                  titleStyle={profile.activity_level === level ? styles.activeText : styles.inactiveText}
                  containerStyle={{ flex: 1 }}
                />
              ))}
            </View>

            <Button
              title="GET STARTED"
              onPress={handleComplete}
              loading={loading}
              ViewComponent={LinearGradient}
              linearGradientProps={{
                colors: ['#FFE66D', '#FFB800', '#D4AF37'],
                start: { x: 0, y: 0 },
                end: { x: 1, y: 1 },
              }}
              buttonStyle={styles.button}
              titleStyle={styles.buttonText}
              containerStyle={{ marginTop: 20 }}
            />
          </View>
        </ScrollView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 25,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 60,
  },
  title: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 10,
    fontSize: 42,
    textAlign: 'center',
    ...Platform.select({
      ios: {
        textShadowColor: 'rgba(255, 184, 0, 0.4)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
      },
      android: {
        textShadowColor: 'rgba(255, 184, 0, 0.4)',
        textShadowOffset: { width: 0, height: 4 },
        textShadowRadius: 15,
      },
      web: {
        textShadow: '0px 4px 15px rgba(255, 184, 0, 0.4)',
      }
    })
  },
  subtitle: {
    color: '#FFB800',
    fontWeight: '600',
    letterSpacing: 3,
    fontSize: 10,
    marginTop: 10,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(15, 15, 15, 0.6)',
    borderRadius: 35,
    padding: 30,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.15)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.4,
        shadowRadius: 30,
      },
      android: {
        elevation: 15,
      },
      web: {
        boxShadow: '0px 20px 30px rgba(0, 0, 0, 0.4)',
      }
    })
  },
  labelStyle: {
    color: '#FFB800',
    fontSize: 9,
    letterSpacing: 2,
    fontWeight: '900',
    marginBottom: 10,
    marginLeft: 5,
    opacity: 0.8,
  },
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 15,
    height: 55,
  },
  inputStyle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '300',
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activeOption: {
    backgroundColor: '#FFB800',
    borderRadius: 15,
  },
  inactiveOption: {
    backgroundColor: 'transparent',
  },
  activeText: {
    color: '#000',
    fontSize: 10,
    fontWeight: '900',
  },
  inactiveText: {
    color: '#666',
    fontSize: 10,
    fontWeight: '600',
  },
  button: {
    borderRadius: 50,
    paddingVertical: 18,
  },
  buttonText: {
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 4,
    fontSize: 13,
  },
});
