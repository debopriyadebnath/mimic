import { Image } from 'expo-image';
import { Text, View, TouchableOpacity, Platform, ActivityIndicator, Alert } from 'react-native';
import './../global.css';
import { useOAuth, useAuth } from '@clerk/clerk-expo';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';

import { Ionicons } from '@expo/vector-icons';
import { useFonts, Amarna_400Regular } from '@expo-google-fonts/amarna';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useEffect, useCallback, useState } from 'react';
import { useRouter } from 'expo-router';

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
  
  // Use useOAuth instead of useSSO for Google OAuth
  const { startOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  
  const [fontsLoaded] = useFonts({
    Amarna_400Regular,
  });

  // Redirect if already signed in
  useEffect(() => {
    if (isSignedIn) {
      router.replace('/(auth)/home');
    }
  }, [isSignedIn]);

  const handleGoogleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Use the scheme from app.json
      const redirectUrl = Linking.createURL('/');
      console.log('Redirect URL:', redirectUrl);
      
      const { createdSessionId, setActive, signIn, signUp } = await startOAuthFlow({
        redirectUrl,
      });
      
      // If we have a session, activate it
      if (createdSessionId) {
        await setActive?.({ session: createdSessionId });
        // Navigation handled by _layout.tsx
      } else {
        // User might need to complete sign-up
        if (signUp?.status === 'missing_requirements') {
          console.log('Sign up requires additional info');
        } else if (signIn?.status === 'needs_identifier') {
          console.log('Sign in needs identifier');
        }
      }
    } catch (err: any) {
      console.error('OAuth error:', JSON.stringify(err, null, 2));
      Alert.alert(
        'Sign In Failed',
        err?.errors?.[0]?.longMessage || err?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  }, [startOAuthFlow]);

  if (!fontsLoaded) {
    return null; 
  }

  return (
    <View className="flex-1 bg-[#121212]">
      <SafeAreaView className="flex-1 px-6 justify-between py-10">
        
        {/* Header / Logo Section */}
        <View className="items-center mt-10">
            <Image
            source={require('../../assets/images/mimic.png')}
            style={{ width: 280, height: 200 }}
            contentFit="contain"
            transition={300}
            />
            <Text className="text-white text-4xl font-bold mt-4" style={{ fontFamily: 'Amarna_400Regular' }}>
                Mimic
            </Text>
            <Text className="text-gray-400 text-lg mt-2 text-center">
                Your personalized AI companion
            </Text>
        </View>

        {/* Content Section */}
        <View className="flex-1 justify-center items-center">
             <Text className="text-gray-300 text-center text-base px-4">
                Experience the next generation of AI interaction. Sign in to sync your memories and preferences.
             </Text>
        </View>

        {/* Action Section */}
        <View className="w-full space-y-4 mb-8">
            <TouchableOpacity 
                activeOpacity={0.8}
                onPress={handleGoogleAuth}
                disabled={isLoading}
                className="flex-row items-center justify-center bg-white rounded-full py-4 px-6 w-full shadow-lg"
            >
                {isLoading ? (
                  <ActivityIndicator size="small" color="black" />
                ) : (
                  <>
                    <Ionicons name="logo-google" size={24} color="black" />
                    <Text className="text-black text-lg font-semibold ml-3">
                        Continue with Google
                    </Text>
                  </>
                )}
            </TouchableOpacity>

            <Text className="text-gray-500 text-center text-xs mt-6">
                Works for both new and existing users
            </Text>
            
            <Text className="text-gray-600 text-center text-xs mt-2">
                By continuing, you agree to our Terms of Service & Privacy Policy.
            </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}
