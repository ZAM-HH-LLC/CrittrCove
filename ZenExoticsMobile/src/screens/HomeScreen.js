import React from 'react';
import { View, ScrollView, Image, StyleSheet, Linking, Dimensions, Platform } from 'react-native';
import { Button, Text, Card, Title, Paragraph, useTheme } from 'react-native-paper';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();

  const openAppStore = (url) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.contentContainer}>
      <View style={styles.heroSection}>
        <Image
          source={require('../../assets/hero-image.jpg')} // Replace with your image
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Text style={styles.heroText}>Welcome to ZenExotics</Text>
      </View>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>Our Services</Title>
        <Paragraph>
          At ZenExotics, we offer premium pet sitting services with a focus on exotic pets. Our unique features include:
        </Paragraph>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Secure Contract Handling</Title>
            <Paragraph>We ensure all agreements between pet owners and professionals are clear and legally sound.</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title>Real-time Pet Updates</Title>
            <Paragraph>Our professionals provide regular updates and photos, keeping you connected with your pets.</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>About Us</Title>
        <Paragraph>
          ZenExotics is dedicated to providing top-quality care for all pets, with a special focus on exotic animals. Our network of experienced and passionate professionals ensures your beloved pets receive the best care possible.
        </Paragraph>
      </View>

      <View style={styles.section}>
        <Title style={styles.sectionTitle}>How It Works</Title>
        <Card style={styles.card}>
          <Card.Content>
            <Title>1. Search</Title>
            <Paragraph>Read verified reviews and choose a screened professional who's perfect for your pets.</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title>2. Book & Pay</Title>
            <Paragraph>Easily book and make secure payments through our website or app.</Paragraph>
          </Card.Content>
        </Card>
        <Card style={styles.card}>
          <Card.Content>
            <Title>3. Relax</Title>
            <Paragraph>Stay connected with photos and messaging. Your booking is protected by ZenExotics, including 24/7 support.</Paragraph>
          </Card.Content>
        </Card>
      </View>

      <View style={styles.container}>
      {/* ... other sections */}

      {Platform.OS === 'web' && (
        <View style={styles.section}>
          <Title style={styles.sectionTitle}>Get Our App</Title>
          <View style={styles.appButtons}>
            <Button 
              mode="contained" 
              onPress={() => openAppStore('https://apps.apple.com/your-app-link')}
              style={styles.appButton}
            >
              App Store
            </Button>
            <Button 
              mode="contained" 
              onPress={() => openAppStore('https://play.google.com/store/apps/your-app-link')}
              style={styles.appButton}
            >
              Google Play
            </Button>
          </View>
        </View>
      )}

      {/* ... other sections */}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 80, // Add padding to the bottom of the content
  },
  heroSection: {
    height: Platform.OS === 'web' ? '70vh' : windowHeight * 0.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  card: {
    marginBottom: 10,
  },
  appButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  appButton: {
    width: '45%',
  },
});
