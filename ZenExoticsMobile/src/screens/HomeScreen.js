import React, { useState } from 'react';
import { View, ScrollView, Image, StyleSheet, Linking, Dimensions, Platform, TouchableOpacity, TextInput } from 'react-native';
import { Button, Text, Card, Title, Paragraph, useTheme } from 'react-native-paper';
import { ImageBackground } from 'react-native';
import { theme } from '../styles/theme';
import { SCREEN_WIDTH } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { FontAwesome } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import RoadmapSection from '../components/RoadmapSection';
import { useForm, ValidationError } from '@formspree/react';

const { width: windowWidth, height: windowHeight } = Dimensions.get('window');

// Define a sample reviews array
const reviews = [
  {
    image: 'https://via.placeholder.com/80',
    text: "\"CrittrCove has been amazing for finding reliable pet professionals!",
    author: "Jane Doe"
  },
  {
    image: 'https://via.placeholder.com/80',
    text: "\"Great experience with pet sitting services!",
    author: "John Smith"
  },
  {
    image: 'https://via.placeholder.com/80',
    text: "\"Found the perfect sitter for my exotic pets!",
    author: "Alice Brown"
  },
  {
    image: 'https://via.placeholder.com/80',
    text: "\"CrittrCove has been amazing for finding reliable pet professionals!",
    author: "Murph Atker"
  }
];

// Define the ReviewImage component
const ReviewImage = ({ source, style }) => {
  if (Platform.OS === 'web') {
    return <img src={source.uri} style={style} alt="" />;
  }
  return <Image source={source} style={style} />;
};

export default function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const openAppStore = (url) => {
    Linking.openURL(url);
  };

  // Add state for social media popup visibility
  const [showSocialMedia, setShowSocialMedia] = useState(false);

  const ReviewsSection = () => {
    const scrollViewRef = React.useRef(null);

    return (
      <View style={styles.section}>
        <Text style={styles.reviewsSubtitle}>TESTIMONIAL</Text>
        <Text style={styles.reviewsTitle}>Kind Words From Users</Text>
        <View style={styles.reviewsContainer}>
          <ScrollView
            ref={scrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={true}
            style={[styles.reviewsContainer, { WebkitOverflowScrolling: 'touch' }]}
            contentContainerStyle={styles.reviewsContent}
          >
            {reviews.map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <Text style={styles.reviewText}>{review.text}</Text>
                <View style={styles.reviewAuthorContainer}>
                  <ReviewImage
                    source={{ uri: review.image }}
                    style={styles.reviewerImage}
                  />
                  <View>
                    <Text style={styles.reviewAuthorName}>{review.author}</Text>
                    <Text style={styles.reviewAuthorTitle}>Marketing Manager</Text>
                    <Text>⭐⭐⭐⭐⭐</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  const Features = () => {
    const [activeTab, setActiveTab] = useState('owners'); // Default to owners tab

    return (
      <View style={styles.featuresSection}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity 
            style={[styles.toggleButton, activeTab === 'owners' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('owners')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'owners' && styles.toggleButtonTextActive]}>For Pet Owners</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.toggleButton, activeTab === 'sitters' && styles.toggleButtonActive]}
            onPress={() => setActiveTab('sitters')}
          >
            <Text style={[styles.toggleButtonText, activeTab === 'sitters' && styles.toggleButtonTextActive]}>For Pet Professionals</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuresContainer}>
          {activeTab === 'owners' && (
            <View style={styles.featureColumn}>
              <Text style={styles.columnTitle}>For Pet Owners</Text>
              <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>📝</Text></View>
                  <Text style={styles.featureTitle}>Complete Your Profile</Text>
                  <Text style={styles.featureText}>Submit details about you and your requirements.</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>📋</Text></View>
                  <Text style={styles.featureTitle}>Complete Pet Profile</Text>
                  <Text style={styles.featureText}>Submit details about your pet and sitting requirements.</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>🤝</Text></View>
                  <Text style={styles.featureTitle}>Search for Pro's</Text>
                  <Text style={styles.featureText}>You can use our marketplace to find the best pro for your desired service.</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>✅</Text></View>
                  <Text style={styles.featureTitle}>Confirm Your Booking</Text>
                  <Text style={styles.featureText}>Coordinate directly with your professional to finalize details.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={() => Linking.openURL('https://your-google-form')}>
                <Text style={styles.buttonText} onPress={() => navigation.navigate('SignUp')}>Sign up Today!</Text>
              </TouchableOpacity>
            </View>
          )}
          {activeTab === 'sitters' && (
            <View style={styles.featureColumn}>
              <Text style={styles.columnTitle}>For Pet Professionals</Text>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>📋</Text></View>
                  <Text style={styles.featureTitle}>Sign Up to Join</Text>
                  <Text style={styles.featureText}>Submit your profile, specialties, and availability.</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>🔍</Text></View>
                  <Text style={styles.featureTitle}>Get Matched with Clients</Text>
                  <Text style={styles.featureText}>Pet owners in your area will reach out to you once you create services.</Text>
                </View>
                <View style={styles.featureItem}>
                  <View style={styles.featureIconCircle}><Text style={styles.featureIcon}>📈</Text></View>
                  <Text style={styles.featureTitle}>Grow Your Business</Text>
                  <Text style={styles.featureText}>Manage bookings and get support as you build your pet service business.</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('BecomeProfessional')}>
                <Text style={styles.buttonText}>Become a Professional</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  const ContactSection = () => {
    const [state, handleSubmit] = useForm("mkgobpro");
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    const handleFormSubmit = async (e) => {
      e.preventDefault();
      const formData = {
        name: name,
        email: email,
        message: message
      };
      
      await handleSubmit(formData);
      
      if (state.succeeded) {
        setName('');
        setEmail('');
        setMessage('');
      }
    };

    if (state.succeeded) {
      return (
        <View style={styles.contactSection}>
          <View style={styles.contactContainer}>
            <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>
              Thanks for reaching out!
            </Text>
            <Text style={styles.successMessage}>
              We'll get back to you soon.
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.contactSection}>
        <View style={styles.contactContainer}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <TextInput
            placeholder="Your Name"
            style={styles.input}
            value={name}
            onChangeText={setName}
            name="name"
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />
          
          <TextInput
            placeholder="Your Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            name="email"
            autoCapitalize="none"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
          
          <TextInput
            placeholder="Your Message"
            style={[styles.input, styles.messageInput]}
            value={message}
            onChangeText={setMessage}
            multiline
            name="message"
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              state.submitting && styles.disabledButton
            ]}
            onPress={handleFormSubmit}
            disabled={state.submitting}
          >
            <Text style={styles.buttonText}>
              {state.submitting ? 'Sending...' : 'Send'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.heroSection}>
        <Image
          source={require('../../assets/hero-image.jpg')} // Replace with your image
          style={styles.heroImage}
          resizeMode="cover"
        />
        <Text style={styles.heroText}>Welcome to CrittrCove</Text>
      </View>

      <Features />
      <ReviewsSection />

      {/* Blog Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Our Blog</Text>
        <View style={styles.blogContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={true}
            style={[styles.blogContainer, { WebkitOverflowScrolling: 'touch' }]}
            contentContainerStyle={styles.blogScrollContainer}
          >
            {[...Array(13)].map((_, index) => (
              <TouchableOpacity key={index} style={styles.blogCard} onPress={() => Linking.openURL('https://your-blog-url')}>
                <Text style={styles.blogDate}>November {index + 1}, 2024</Text>
                <Text style={styles.blogTitle}>Managing Exotic Pets Effectively</Text>
                <Text style={styles.blogSnippet}>Learn the best tips for managing exotic pets...</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>

      {/* Roadmap Section */}
      <RoadmapSection />

      {/* FAQ Section */}
      {/* <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQs</Text>
         {faqs.map((faq, index) => (
          <View key={index} style={styles.faqItem}>
            <TouchableOpacity 
              style={styles.faqButton}
              onPress={() => setSelectedFaq(selectedFaq === index ? null : index)}
            >
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqToggle}>{selectedFaq === index ? '-' : '+'}</Text>
            </TouchableOpacity>
            {selectedFaq === index && (
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            )}
          </View>
        ))} 
      </View> */}

      {/* Contact Us Section */}
      <ContactSection />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerLink} onPress={() => Linking.openURL('https://your-privacy-policy-url')}>Privacy Policy</Text>
        <Text style={styles.footerLink} onPress={() => Linking.openURL('https://your-terms-of-service-url')}>Terms of Service</Text>
        <Text style={styles.footerLink} onPress={() => setShowSocialMedia(true)}>Follow us on Social Media</Text>
      </View>

      {/* Social Media Popup */}
      {showSocialMedia && (
        <View style={styles.socialMediaPopup}>
          <View style={styles.socialIconsContainer}>
            <TouchableOpacity 
              style={styles.socialIcon} 
              onPress={() => Linking.openURL('https://instagram.com/your-profile')}
            >
              <FontAwesome name="instagram" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialIcon} 
              onPress={() => Linking.openURL('https://discord.com/your-profile')}
            >
              <FontAwesome5 name="discord" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.socialIcon} 
              onPress={() => Linking.openURL('https://facebook.com/your-profile')}
            >
              <FontAwesome name="facebook" size={24} color={theme.colors.primary} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowSocialMedia(false)}
          >
            <FontAwesome name="times" size={20} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}
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
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10
  },
  section: {
    padding: 20,
    width: '100%',
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: 'black',
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
  reviewsSection: {
    // height: 350,
    marginBottom: 20,
  },
  reviewsBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewsOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  reviewsSubtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  reviewsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
  },
  reviewsContainer: {
    width: '100%',
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  reviewsContent: {
    flexDirection: 'row',
    minWidth: 'min-content',
    gap: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reviewCard: {
    width: 280,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    // marginRight: 10,
  },
  reviewCardMobile: {
    width: '100%',
    height: '100%',
  },
  reviewQuote: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
    marginBottom: 10,
  },
  reviewText: {
    fontSize: 16,
    color: 'black',
  },
  reviewAuthorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
  },
  reviewerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  reviewAuthorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  reviewAuthorTitle: {
    fontSize: 14,
    color: 'black',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    margin: 5,
  },
  paginationDotActive: {
    backgroundColor: 'black',
  },
  featuresSection: {
    marginBottom: 20,
    marginTop: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
  },
  toggleButton: {
    padding: 10,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  toggleButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleButtonTextActive: {
    color: theme.colors.whiteText,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureColumn: {
    width: SCREEN_WIDTH < 768 ? '90%' : '',
    maxWidth: 600,
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  columnTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureIconCircle: {
    // width: 60,
    // height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureIcon: {
    fontSize: 40,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
    marginRight: 10,
    color: 'black',
  },
  featureText: {
    fontSize: 16,
    color: 'black',
  },
  actionButton: {
    backgroundColor: '#6A6C51',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  blogSection: {
    marginBottom: 20,
    alignItems: 'center',
  },
  blogCard: {
    width: 200,
    // height: 200,
    // marginRight: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    padding: 10,
  },
  blogDate: {
    fontSize: 14,
    color: 'gray',
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  blogSnippet: {
    fontSize: 16,
  },
  roadmapSection: {
    marginBottom: 20,
  },
  roadmapImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roadmapOverlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'black',
  },
  faqSection: {
    marginBottom: 20,
  },
  faqItem: {
    marginBottom: 10,
  },
  faqButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  faqToggle: {
    fontSize: 14,
    color: 'gray',
  },
  faqAnswer: {
    fontSize: 16,
  },
  contactSection: {
    // maxWidth: 800,
    width: '100%',
    // display: 'flex',
    // flexDirection: 'column',
    // alignItems: 'center',
    // justifyContent: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 20,
  },
  contactContainer: {
    width: '100%',
    maxWidth: 600,
  },
  input: {
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  footer: {
    padding: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
  },
  footerLink: {
    color: 'white',
    margin: 5,
    textDecorationLine: 'underline',
  },
  socialMediaPopup: {
    position: 'absolute',
    bottom: 60,
    left: '50%',
    transform: [{ translateX: -100 }],
    width: 200,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  seeAllButton: {
    marginTop: 10,
  },
  blogContainer: {
    width: '100%',
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch',
  },
  blogScrollContainer: {
    flexDirection: 'row',
    minWidth: 'min-content',
    gap: 20,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialIconsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 10,
  },
  socialIcon: {
    padding: 10,
  },
  closeButton: {
    marginTop: 5,
    padding: 5,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    color: 'black',
  },
  messageInput: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  disabledButton: {
    opacity: 0.7,
  },
  validationError: {
    color: 'red',
    fontSize: 14,
    marginTop: -5,
    marginBottom: 10,
  },
});
