import React, { useState } from 'react'
import { Alert, StyleSheet, View, AppState, ImageBackground, Platform } from 'react-native'
import { supabase } from '../lib/supabase'
import { Button, Input, Text } from '@rneui/themed'
import { LinearGradient } from 'expo-linear-gradient'

// Tells Supabase Auth to continuously refresh the session automatically if
// the app is in the foreground. When this is added, you will continue to receive
// `onAuthStateChange` events with the `TOKEN_REFRESHED` or `SIGNED_IN` event
// if the refresh token is successful.
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function signInWithEmail() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
    })

    if (error) Alert.alert(error.message)
    if (!session) Alert.alert('Check your inbox for verification!')
    setLoading(false)
  }

  return (
    <ImageBackground 
      source={{ uri: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop' }} 
      style={styles.backgroundImage}
    >
      <LinearGradient
        colors={['rgba(5,5,5,0.4)', 'rgba(5,5,5,0.95)']}
        style={styles.overlay}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text h1 style={styles.brand}>FALCON</Text>
            <View style={styles.taglineWrapper}>
              <View style={styles.goldLine} />
              <Text style={styles.tagline}>PREMIUM PERFORMANCE</Text>
              <View style={styles.goldLine} />
            </View>
          </View>

          <View style={styles.authCard}>
            <View style={styles.inputWrapper}>
              <Input
                label="EMAIL"
                labelStyle={styles.labelStyle}
                leftIcon={{ type: 'font-awesome', name: 'envelope', color: '#FFB800', size: 14 }}
                onChangeText={(text) => setEmail(text)}
                value={email}
                placeholder="EMAIL ADDRESS"
                autoCapitalize={'none'}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                placeholderTextColor="#444"
              />
            </View>
            <View style={styles.inputWrapper}>
              <Input
                label="PASSWORD"
                labelStyle={styles.labelStyle}
                leftIcon={{ type: 'font-awesome', name: 'lock', color: '#FFB800', size: 16 }}
                onChangeText={(text) => setPassword(text)}
                value={password}
                secureTextEntry={true}
                placeholder="PASSWORD"
                autoCapitalize={'none'}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                placeholderTextColor="#444"
              />
            </View>
            <View style={styles.buttonGroup}>
              <Button 
                title="SIGN IN" 
                disabled={loading} 
                onPress={() => signInWithEmail()} 
                ViewComponent={LinearGradient}
                linearGradientProps={{
                  colors: ['#FFE66D', '#FFB800', '#D4AF37'],
                  start: { x: 0, y: 0 },
                  end: { x: 1, y: 1 },
                }}
                buttonStyle={styles.signInButton}
                titleStyle={styles.signInButtonText}
              />
              <Button 
                title="CREATE NEW ACCOUNT" 
                disabled={loading} 
                onPress={() => signUpWithEmail()} 
                type="clear"
                titleStyle={styles.signUpButtonText}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  )
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
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 25,
  },
  header: {
    alignItems: 'center',
    marginBottom: 50,
    backgroundColor: 'transparent',
  },
  brand: {
    color: '#FFFFFF',
    fontWeight: '900',
    letterSpacing: 15,
    fontSize: 52,
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
  taglineWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  goldLine: {
    height: 1,
    width: 30,
    backgroundColor: '#FFB800',
    opacity: 0.6,
  },
  tagline: {
    color: '#FFB800',
    fontWeight: '400',
    letterSpacing: 5,
    fontSize: 10,
    marginHorizontal: 15,
    textTransform: 'uppercase',
  },
  authCard: {
    backgroundColor: 'rgba(10, 10, 10, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.15)',
    borderRadius: 40,
    padding: 35,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.5,
        shadowRadius: 40,
      },
      android: {
        elevation: 20,
      },
      web: {
        boxShadow: '0px 20px 40px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
      }
    })
  },
  inputWrapper: {
    marginBottom: 15,
    backgroundColor: 'transparent',
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    paddingHorizontal: 20,
    height: 60,
  },
  inputStyle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '300',
    letterSpacing: 1,
  },
  buttonGroup: {
    marginTop: 30,
    backgroundColor: 'transparent',
  },
  signInButton: {
    backgroundColor: '#FFB800',
    borderRadius: 50,
    paddingVertical: 18,
  },
  signInButtonText: {
    color: '#000000',
    fontWeight: '900',
    letterSpacing: 3,
    fontSize: 13,
  },
  signUpButtonText: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '600',
    fontSize: 11,
    letterSpacing: 2,
    marginTop: 20,
    textAlign: 'center',
  },
})
