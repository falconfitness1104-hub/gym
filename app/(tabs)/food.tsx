import { useState } from 'react';
import { StyleSheet, Image, ScrollView, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Button, Input, Card, Text, Icon } from '@rneui/themed';
import { supabase } from '@/lib/supabase';
import { View } from '@/components/Themed';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

export default function FoodScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const identifyFood = async () => {
    if (!image && !description) {
      Alert.alert('Please provide an image or description');
      return;
    }

    setLoading(true);
    try {
      let imageUrl = null;

      // 1. Upload image if exists
      if (image) {
        const base64 = await FileSystem.readAsStringAsync(image, { encoding: 'base64' });
        const filePath = `${Date.now()}.jpg`;
        const contentType = 'image/jpeg';
        
        await supabase.storage
          .from('food-photos')
          .upload(filePath, decode(base64), { contentType });

        imageUrl = filePath;
      }

      // 2. Mock AI Identification (In real app, call OpenAI/Vision API here)
      const mockResult = {
        identified_food: description || 'Healthy Salad',
        calories: 350,
        macros: { protein: 20, carbs: 45, fat: 10 },
        ingredients: ['Lettuce', 'Tomato', 'Cucumber', 'Chicken'],
      };

      // 3. Save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      const { error: dbError } = await supabase.from('food_logs').insert({
        user_id: user?.id,
        image_url: imageUrl,
        description: description,
        identified_food: mockResult.identified_food,
        calories: mockResult.calories,
        macros: mockResult.macros,
        ingredients: mockResult.ingredients,
      });

      if (dbError) throw dbError;

      setResult(mockResult);
      Alert.alert('Success', 'Food identified and logged!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Card containerStyle={styles.mainCard}>
        <Card.Title style={styles.cardTitle}>IDENTIFY FOOD</Card.Title>
        
        {image ? (
          <Image source={{ uri: image }} style={styles.image} />
        ) : (
          <View style={styles.placeholderImage}>
            <Icon name="camera" type="font-awesome" size={40} color="#FFB800" />
            <Text style={styles.placeholderText}>NO IMAGE SELECTED</Text>
          </View>
        )}
        
        <View style={styles.buttonGroup}>
          <Button 
            title="GALLERY" 
            onPress={pickImage} 
            buttonStyle={styles.actionButtonSecondary}
            titleStyle={styles.buttonTextSecondary}
            containerStyle={styles.buttonHalf}
          />
          <Button 
            title="CAMERA" 
            onPress={() => Alert.alert('Camera not implemented')} 
            buttonStyle={styles.actionButtonSecondary}
            titleStyle={styles.buttonTextSecondary}
            containerStyle={styles.buttonHalf}
          />
        </View>

        <Input
          placeholder="DESCRIBE WHAT YOU ATE..."
          value={description}
          onChangeText={setDescription}
          multiline
          inputStyle={styles.inputStyle}
          placeholderTextColor="#475569"
          inputContainerStyle={styles.inputContainer}
        />

        <Button 
          title="IDENTIFY & LOG" 
          onPress={identifyFood} 
          loading={loading}
          disabled={loading}
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

      {result && (
        <Card containerStyle={styles.resultCard}>
          <Card.Title style={styles.resultTitle}>{result.identified_food.toUpperCase()}</Card.Title>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{result.calories}</Text>
              <Text style={styles.statLabel}>KCAL</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{result.macros.protein}g</Text>
              <Text style={styles.statLabel}>PRO</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{result.macros.carbs}g</Text>
              <Text style={styles.statLabel}>CARB</Text>
            </View>
          </View>
          <Text style={styles.ingredientHeader}>INGREDIENTS</Text>
          {result.ingredients.map((ing: string, i: number) => (
            <Text key={i} style={styles.ingredient}>• {ing.toUpperCase()}</Text>
          ))}
        </Card>
      )}
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
    fontSize: 12,
    letterSpacing: 4,
    fontWeight: '900',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  image: {
    width: '100%',
    height: 300,
    borderRadius: 20,
    marginBottom: 25,
    borderWidth: 0.5,
    borderColor: '#222',
  },
  placeholderImage: {
    width: '100%',
    height: 200,
    borderRadius: 20,
    backgroundColor: '#0A0A0A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#222',
    borderStyle: 'dashed',
  },
  placeholderText: {
    color: '#333',
    fontWeight: '800',
    marginTop: 10,
    fontSize: 9,
    letterSpacing: 2,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  buttonHalf: {
    flex: 0.48,
  },
  actionButtonPrimary: {
    backgroundColor: '#FFB800',
    borderRadius: 50,
    paddingVertical: 18,
  },
  buttonTextPrimary: {
    color: '#000000',
    fontWeight: '800',
    letterSpacing: 3,
    fontSize: 12,
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
  inputContainer: {
    borderBottomWidth: 0,
    backgroundColor: '#0A0A0A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#222',
    paddingHorizontal: 20,
    marginBottom: 20,
    height: 60,
  },
  inputStyle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
  },
  resultCard: {
    backgroundColor: '#121212',
    borderWidth: 0,
    borderRadius: 24,
    padding: 25,
    marginHorizontal: 20,
    marginTop: 25,
    borderLeftWidth: 2,
    borderLeftColor: '#FFB800',
  },
  resultTitle: {
    color: '#FFFFFF',
    textAlign: 'left',
    fontSize: 18,
    fontWeight: '300',
    letterSpacing: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '200',
  },
  statLabel: {
    color: '#FFB800',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  ingredientHeader: {
    color: '#FFB800',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginTop: 15,
    marginBottom: 12,
  },
  ingredient: {
    color: '#888',
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 6,
  },
});
