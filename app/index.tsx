import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
  Pressable,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Card } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { Twitter, Instagram } from 'lucide-react-native';
import LottieView from 'lottie-react-native';
import { useFonts, Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';

const features = [
  {
    id: '1',
    icon: '🧙',
    title: 'AI Recipe Alchemy',
    description: "Turn 'rice + tofu' into Thai-Jamaican tacos!",
    active: true,
  },
  {
    id: '2',
    icon: '🥑',
    title: 'Allergy & Diet Filters',
    description: "Vegan? Keto? We've got you.",
    active: true,
  },
  {
    id: '3',
    icon: '🏡',
    title: 'Pantry Wizard',
    description: 'Use what you own—no grocery runs.',
    active: true,
  },
  {
    id: '4',
    icon: '🌟',
    title: 'Social Sharing',
    description: 'Build a foodie community (2024).',
    active: false,
  },
  {
    id: '5',
    icon: '🗓️',
    title: 'Meal Planning',
    description: 'Weekly plans (Coming Soon).',
    active: false,
  },
];

const testimonials = [
  {
    id: '1',
    text: 'I made Korean-Italian kimchi risotto. Mind. Blown.',
    author: 'FoodieFran',
  },
  {
    id: '2',
    text: 'The pantry wizard saved my dinner party!',
    author: 'ChefCharlie',
  },
  {
    id: '3',
    text: 'Finally, fusion recipes that actually work.',
    author: 'GlobalGourmet',
  },
];

function FeatureCard({ icon, title, description, active }) {
  return (
    <Card style={[styles.featureCard, !active && styles.inactiveCard]}>
      <Card.Content>
        <Text style={styles.featureIcon}>{icon}</Text>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={[styles.featureDescription, !active && styles.inactiveText]}>
          {description}
        </Text>
      </Card.Content>
    </Card>
  );
}

function TestimonialCard({ text, author }) {
  return (
    <Card style={styles.testimonialCard}>
      <Card.Content>
        <Text style={styles.testimonialText}>{text}</Text>
        <Text style={styles.testimonialAuthor}>- {author}</Text>
      </Card.Content>
    </Card>
  );
}

export default function Landing() {
  const { width } = useWindowDimensions();
  const [showDemo, setShowDemo] = useState(false);
  const [fontsLoaded] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      {/* Hero Section */}
      <LinearGradient colors={['#2E3192', '#1BFFFF']} style={styles.heroContainer}>
        <Text style={[styles.heroTitle, { fontSize: width > 768 ? 48 : 32 }]}>
          Craft Culinary Magic with AI-Powered Fusion 🌍✨
        </Text>
        <Text style={[styles.heroSubtitle, { fontSize: width > 768 ? 24 : 18 }]}>
          Blend cuisines, dodge allergens, and transform your pantry into gourmet masterpieces.
        </Text>
        <View style={styles.ctaContainer}>
          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={() => router.push('/auth/signup')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={() => setShowDemo(true)}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>Watch Demo</Text>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Features Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <FeatureCard key={feature.id} {...feature} />
          ))}
        </View>
      </View>

      {/* How It Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How It Works</Text>
        <View style={styles.stepsContainer}>
          {/* Replace with actual Lottie animations */}
          <View style={styles.step}>
            <Text style={styles.stepNumber}>1</Text>
            <Text style={styles.stepText}>Pick cuisines + dietary needs</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>2</Text>
            <Text style={styles.stepText}>AI generates two fusion recipes</Text>
          </View>
          <View style={styles.step}>
            <Text style={styles.stepNumber}>3</Text>
            <Text style={styles.stepText}>Cook, rate, share!</Text>
          </View>
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Foodies Say</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonials}>
          {testimonials.map((testimonial) => (
            <TestimonialCard
              key={testimonial.id}
              text={testimonial.text}
              author={testimonial.author}
            />
          ))}
        </ScrollView>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLinks}>
          <Link href="/auth/login" style={styles.footerLink}>
            Login
          </Link>
          <Link href="/auth/signup" style={styles.footerLink}>
            Register
          </Link>
          <Link href="/contact" style={styles.footerLink}>
            Contact
          </Link>
          <Link href="/faq" style={styles.footerLink}>
            FAQ
          </Link>
        </View>
        <View style={styles.socialIcons}>
          <Pressable style={styles.socialIcon}>
            <Twitter size={24} color="#1DA1F2" />
          </Pressable>
          <Pressable style={styles.socialIcon}>
            <Instagram size={24} color="#E4405F" />
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  heroContainer: {
    padding: 32,
    minHeight: 500,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroTitle: {
    fontFamily: 'Inter-Bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontFamily: 'Inter-Regular',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 600,
  },
  ctaContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 150,
  },
  primaryButton: {
    backgroundColor: '#fff',
  },
  secondaryButton: {
    borderColor: '#fff',
    borderWidth: 2,
  },
  buttonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    textAlign: 'center',
    color: '#2E3192',
  },
  secondaryButtonText: {
    color: '#fff',
  },
  section: {
    padding: 32,
  },
  sectionTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 16,
  },
  featureCard: {
    width: 300,
    marginBottom: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  inactiveCard: {
    opacity: 0.6,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    marginBottom: 8,
  },
  featureDescription: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  inactiveText: {
    color: '#999',
  },
  stepsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 32,
  },
  step: {
    alignItems: 'center',
    width: 200,
  },
  stepNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 48,
    color: '#2E3192',
    marginBottom: 16,
  },
  stepText: {
    fontFamily: 'Inter-Regular',
    fontSize: 18,
    textAlign: 'center',
  },
  testimonials: {
    paddingVertical: 16,
  },
  testimonialCard: {
    width: 300,
    marginRight: 16,
    backgroundColor: '#fff',
    elevation: 4,
  },
  testimonialText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#666',
  },
  footer: {
    padding: 32,
    backgroundColor: '#f5f5f5',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 24,
    marginBottom: 24,
  },
  footerLink: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#666',
  },
  socialIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialIcon: {
    padding: 8,
  },
});