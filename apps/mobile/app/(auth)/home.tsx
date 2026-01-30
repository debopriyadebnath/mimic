import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import '../global.css';
import { useEffect } from 'react';
import { syncClerkUserToBackend } from '@/utils/clerkBackend';
import { useFonts, Amarna_400Regular } from '@expo-google-fonts/amarna';

export default function HomeScreen() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [fontsLoaded] = useFonts({ Amarna_400Regular });

  // Sync Logic
  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        await syncClerkUserToBackend(token);
      } catch (error) {
        console.log('Sync error:', error);
      }
    })();
    return () => { cancelled = true; };
  }, [isSignedIn, getToken]);

  if (!fontsLoaded) return null;

  return (
    <View className="flex-1 bg-[#FDFBF7]">
      <SafeAreaView className="flex-1">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          
          {/* 1. Header: Minimal & Personal */}
          <View className="px-6 pt-6 pb-8 border-b border-[#E5E5E0]">
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-[#737373] text-xs font-medium uppercase tracking-widest mb-1">
                  Workspace
                </Text>
                <Text 
                  className="text-[#1a1a1a] text-2xl" 
                  style={{ fontFamily: 'Amarna_400Regular' }}
                >
                  {user?.firstName ? `Hello, ${user.firstName}` : 'Welcome'}
                </Text>
              </View>
              
              {/* Profile Avatar - subtle & circular */}
              <TouchableOpacity className="border border-[#E5E5E0] rounded-full p-1">
                 {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    style={{ width: 40, height: 40, borderRadius: 20 }}
                  />
                ) : (
                  <View className="w-10 h-10 bg-[#E5E5E0] rounded-full items-center justify-center">
                    <Ionicons name="person" size={20} color="#737373" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* 2. Main Action: The "New Thread" Button */}
          {/* Instead of a robot image, we use a strong typographic action block */}
          <View className="px-6 py-10">
            <TouchableOpacity 
              activeOpacity={0.9}
              className="w-full bg-[#1a1a1a] rounded-xl p-6 shadow-sm flex-row justify-between items-center group"
            >
              <View>
                <View className="flex-row items-center space-x-2 mb-2">
                   <View className="w-2 h-2 rounded-full " />
                   <Text className="text-[#a3a3a3] text-xs font-medium uppercase tracking-wider">System Online</Text>
                </View>
                <Text className="text-[#FDFBF7] text-xl font-medium tracking-tight">
                  Start New Session
                </Text>
                <Text className="text-[#737373] text-sm mt-1">
                  Initialize a new context window.
                </Text>
              </View>
              
              <View className="w-12 h-12 bg-[#333] rounded-full items-center justify-center">
                <Ionicons name="arrow-forward" size={24} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* 3. The "Menu" List (Replacing the Grid) */}
          <View className="px-6">
            <Text className="text-[#1a1a1a] text-xs font-bold uppercase tracking-widest mb-4 ml-1">
              Tools & Archives
            </Text>
            
            <View className="bg-white border border-[#E5E5E0] rounded-xl overflow-hidden">
              
              {/* History Item */}
              <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-[#E5E5E0] active:bg-gray-50">
                <View className="flex-row items-center space-x-4">
                  <Ionicons name="layers-outline" size={20} color="#1a1a1a" />
                  <View>
                    <Text className="text-[#1a1a1a] text-base font-medium">Archives</Text>
                    <Text className="text-[#737373] text-xs">View past conversation logs</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#d4d4d4" />
              </TouchableOpacity>

              {/* Training Item (Renamed to Knowledge Base) */}
              <TouchableOpacity className="flex-row items-center justify-between p-5 border-b border-[#E5E5E0] active:bg-gray-50">
                <View className="flex-row items-center space-x-4">
                  <Ionicons name="library-outline" size={20} color="#1a1a1a" />
                  <View>
                    <Text className="text-[#1a1a1a] text-base font-medium">Knowledge Base</Text>
                    <Text className="text-[#737373] text-xs">Fine-tune assistant parameters</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#d4d4d4" />
              </TouchableOpacity>

              {/* Settings Item */}
              <TouchableOpacity className="flex-row items-center justify-between p-5 active:bg-gray-50">
                <View className="flex-row items-center space-x-4">
                  <Ionicons name="options-outline" size={20} color="#1a1a1a" />
                  <View>
                    <Text className="text-[#1a1a1a] text-base font-medium">Preferences</Text>
                    <Text className="text-[#737373] text-xs">Account and display settings</Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={16} color="#d4d4d4" />
              </TouchableOpacity>

            </View>
          </View>

          {/* 4. Footer Status (Replacing the "0 Stats" block) */}
          <View className="mt-10 mb-10 px-6 items-center">
            <Text className="text-[#d4d4d4] text-[10px] uppercase tracking-widest">
              Version 1.0.2 • Sync Active
            </Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}