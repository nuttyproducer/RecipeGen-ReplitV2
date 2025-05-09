import { useState, useCallback } from 'react';
import { StyleSheet, View, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { Link, router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import debounce from 'lodash/debounce';
import { Button } from '@/components/Button';
import { TextInput } from '@/components/TextInput';
import { Card } from '@/components/Card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { colors } from '@/constants/colors';

const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string) => {
  return password.length >= 8;
};

const validateUsername = (username: string) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
  return usernameRegex.test(username);
};

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  
  const { signUp } = useAuth();

  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (!validateUsername(username)) {
        setUsernameError('Username must be 3-20 characters, alphanumeric only');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') {
        setUsernameError('Error checking username availability');
      } else if (data) {
        setUsernameError('Username is already taken');
      } else {
        setUsernameError(null);
      }
    }, 500),
    []
  );

  const handleSignup = async () => {
    if (!email || !password || !username) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (!validateUsername(username) || usernameError) {
      setError('Please choose a valid username');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await signUp({ email, password });
      
      if (signUpError) {
        throw new Error(signUpError.message);
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ username });

      if (profileError) {
        throw new Error('Error creating profile');
      }

      router.replace('/(tabs)');
    } catch (err: any) {
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
              source={{ uri: 'https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg' }}
              style={styles.headerImage}
            />
            <Text style={styles.headerTitle}>Join the Community</Text>
            <Text style={styles.headerSubtitle}>Create an account to start your culinary journey</Text>
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
              label="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                checkUsername(text);
              }}
              autoCapitalize="none"
              error={usernameError}
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
              onPress={handleSignup}
              disabled={loading}
              loading={loading}
              style={styles.button}
            >
              Create Account
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
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/auth/login" style={styles.link}>
                Sign In
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