import { Image } from 'expo-image';
import { Text, View, TouchableOpacity, Platform, ActivityIndicator, Alert, Touchable, StyleSheet, TextInput } from 'react-native';
import './../global.css';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Amarna_400Regular } from '@expo-google-fonts/amarna';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { useAuth, useSignUp } from '@clerk/clerk-expo';


// Handle OAuth redirect - MUST be called at module level
WebBrowser.maybeCompleteAuthSession();

// Warm up browser for Android
export const useWarmUpBrowser = () => {
  useEffect(() => {
    void WebBrowser.warmUpAsync();
    return () => {
      void WebBrowser.coolDownAsync();
    };
  }, []);
};

export default function LoginScreen() {
  useWarmUpBrowser();
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fontsLoaded] = useFonts({
    Amarna_400Regular,
  });
  
  // If user is already signed in, send them to home directly
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/home');
    }
  }, [isSignedIn, router]);

  const handleEmailSignup = useCallback(async () => {
    try {
      if (!isLoaded) return;
      if (!email || !username || !password) {
        Alert.alert('Missing fields', 'Please fill email, username and password.');
        return;
      }
      setIsLoading(true);
      const result = await signUp.create({
        emailAddress: email.trim(),
        password: password,
        username: username.trim(),
      });

      if (result.status === 'complete' && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        // InitialLayout will redirect to /home
      } else {
        console.log('Signup not complete:', result.status);
      }
    } catch (err: any) {
      console.error('Email signup error:', err);
      const message = err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong. Please try again.';
      Alert.alert('Sign Up Failed', message);
    } finally {
      setIsLoading(false);
    }
  }, [router, isLoaded, email, username, password, signUp, setActive]);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View className="flex-1 bg-[#121212]">
      <Video
        source={require('./landing-vid.mp4')}
        style={StyleSheet.absoluteFill}
        className='brightness-100'
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay
        isMuted
      />
      <View pointerEvents="none" style={StyleSheet.absoluteFill} className="bg-black/60" />
      <SafeAreaView className="flex-1 px-6 justify-between py-10">
        
        {/* Header / Logo Section */}
        <View className="items-center mt-10">
            
           <View >
    
    </View>
            
        </View>

        {/* Content Section */}
        <View className="flex-1 justify-center items-center w-full">
          <View className="w-full space-y-4">
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="w-full bg-[#1f2933] text-white rounded-xl px-4 py-3 mb-3"
            />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#9ca3af"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              className="w-full bg-[#1f2933] text-white rounded-xl px-4 py-3 mb-3"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="w-full bg-[#1f2933] text-white rounded-xl px-4 py-3 mb-3"
            />
          </View>
        </View>

        {/* Action Section */}


         <View className='p-4 m-5'>
          <TouchableOpacity 
              activeOpacity={0.8}
            onPress={handleEmailSignup}
              className="flex-row items-center justify-center border border-white rounded-full py-4 px-6 w-full shadow-lg p-8"
          >
            <Text className="text-white text-lg font-semibold">
                  Create Account
              </Text>
          </TouchableOpacity>
         </View>
           <View className='justify-center items-center'>
            <TouchableOpacity onPress={() => router.push('/sign-in')}>
            <Text className='text-white underline font-mono'>Existing User ? Click here</Text>
           </TouchableOpacity>
           </View>
        <View className="w-full space-y-4 mb-8">
          {isLoading && (
            <ActivityIndicator size="small" color="#ffffff" />
          )}
          <Text className="text-gray-500 text-center text-xs mt-6">
            Sign up with your email, username and password.
          </Text>
          <Text className="text-gray-600 text-center text-xs mt-2">
            By continuing, you agree to our Terms of Service & Privacy Policy.
          </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}
