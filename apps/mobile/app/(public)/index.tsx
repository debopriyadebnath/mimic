import { Image } from 'expo-image';
import { Platform, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import './../global.css'
import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import {Amarna_400Regular, useFonts } from '@expo-google-fonts/amarna';
import { Link } from 'expo-router';

export default function HomeScreen() {
  let [fontsLoaded] = useFonts({
    Amarna_400Regular})
  return (
   <View className='bg-[#1a1d2e] flex-1 px-6 justify-between py-12'>
      {/* Logo at top */}
      <View className='items-start pt-8'>
        <Image
          source={require('../../assets/images/mimic.png')}
          style={{ width: 320, height: 240 }}
          contentFit="contain"
        />
      </View>
      <View className='justify-between items-start pt-8 text-center flex'>
        <Text className='text-white text-3xl font-mono text-center '>
          Welcome to MIMIC AI
        </Text>
       
      </View>
      {/* Main content */}
      <View className='flex-1 justify-center'>
        <Text className='text-white text-5xl  mb-2' style={{fontFamily: fontsLoaded ? 'Amarna_400Regular' : undefined}}>
          Identity.
        </Text>
        <Text className='text-blue-500 text-5xl font-bold mb-6'>
          Evolved.
        </Text>
        <Text className='text-white text-base leading-6 text-3xl'>
          AI clones built from real memories
        </Text>
      </View>

      {/* Bottom buttons */}
      <View className='pb-8'>
        <TouchableOpacity className='bg-blue-600 py-4 rounded-lg mb-4 flex-row justify-center items-center'>
          <Text className='text-white font-semibold text-base mr-2'>CREATE IDENTITY</Text>
          <Text className='text-white text-lg'>→</Text>
        </TouchableOpacity>

        <TouchableOpacity className='bg-[#252839] py-4 rounded-lg flex-row justify-center items-center'>
          <Text className='text-white font-semibold text-base mr-2'>VERIFY ACCESS</Text>
          <Text className='text-gray-400 text-lg'>🔒</Text>
        </TouchableOpacity>

        <Text className='text-gray-600 text-xs text-center mt-6'>
          KNOWLEDGE TIER: PREMIUM
        </Text>
      </View>
   </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    backgroundColor:'white',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
