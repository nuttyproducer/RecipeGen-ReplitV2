import { useState } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { Card } from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';
import { colors } from '@/constants/colors';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signInError } = await signIn({ email, password });
      
      if (signInError) {
        throw new Error(signInError.message);
      }

      // Successful login - redirect to create tab
      router.replace('/(tabs)/create');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#2E3192', '#1BFFFF']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Image
              source={{ uri: 'https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg' }}
              style={styles.headerImage}
            />
            <Text style={styles.headerTitle}>Welcome Back</Text>
            <Text style={styles.headerSubtitle}>Sign in to continue cooking amazing recipes</Text>
          </View>

          <Card style={styles.card}>
            <TextInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={error}
            />
            <TextInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              error={error}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconPress={() => setShowPassword(!showPassword)}
            />
            <Button
              onPress={handleLogin}
              disabled={loading}
              loading={loading}
              style={styles.button}
            >
              Sign In
            </Button>
            <Button
              mode="outlined"
              onPress={() => {}}
              disabled={true}
              style={styles.googleButton}
            >
              Continue with Google
            </Button>
            {error && (
              <Text style={styles.errorText}>{error}</Text>
            )}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/auth/signup" style={styles.link}>
                Sign Up
              </Link>
            </View>
          </Card>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  headerImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 24,
  },
  button: {
    marginTop: 8,
  },
  googleButton: {
    marginTop: 8,
    opacity: 0.5,
  },
  errorText: {
    color: colors.error.main,
    marginTop: 8,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: colors.text.secondary,
  },
  link: {
    color: colors.primary.main,
    textDecorationLine: 'underline',
  },
});