import { Image } from 'expo-image';
import { Text, View, TouchableOpacity } from 'react-native';
import './../global.css'
import {UseOAuthFlowParams} from '@clerk/clerk-expo';

import { Ionicons } from '@expo/vector-icons';
import { useFonts, Amarna_400Regular } from '@expo-google-fonts/amarna';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const handeGooglLogin=async()=>{
  try{
   const {createdSessionId,setActive }=await startGoogleOauthFloW();console.log('~handleGooglLogin ~ createSessionId:', createSessionId);
   if(createdSessionId){
    setActive!({session:createdSessionId})

   }
  
  }
  catch{
    console.log("Login failed")
  }
}
export default function HomeScreen() {
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    Amarna_400Regular,
  });

  const handleLogin = () => {
    // Navigate to auth flow or handle login
    console.log("Login with Google pressed");
  };

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
                onPress={handleLogin}
                className="flex-row items-center justify-center bg-white rounded-full py-4 px-6 w-full shadow-lg"
            >
                <Ionicons name="logo-google" size={24} color="black" className="mr-3" />
                <Text className="text-black text-lg font-semibold ml-2">
                    Continue with Google
                </Text>
            </TouchableOpacity>

            <Text className="text-gray-500 text-center text-xs mt-4">
                By continuing, you agree to our Terms of Service & Privacy Policy.
            </Text>
        </View>

      </SafeAreaView>
    </View>
  );
}
