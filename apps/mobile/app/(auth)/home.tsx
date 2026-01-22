import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import '../global.css';

export default function HomeScreen() {
  const { user } = useUser();

  return (
    <View className="flex-1 bg-[#121212]">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <SafeAreaView className="flex-1 px-6 pt-4">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-8">
            <View>
              <Text className="text-gray-400 text-base">Welcome back,</Text>
              <Text className="text-white text-2xl font-bold">
                {user?.firstName || 'User'} 👋
              </Text>
            </View>
            <TouchableOpacity className="bg-[#1e1e1e] p-3 rounded-full">
              <Ionicons name="notifications-outline" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Main Card */}
          <View className="bg-gradient-to-br from-[#2a2a2a] to-[#1e1e1e] rounded-3xl p-6 mb-6 border border-[#333]">
            <View className="items-center mb-4">
              <Image
                source={require('../../assets/images/mimic.png')}
                style={{ width: 120, height: 90 }}
                contentFit="contain"
              />
            </View>
            <Text className="text-white text-xl font-bold text-center mb-2">
              Your AI Companion
            </Text>
            <Text className="text-gray-400 text-center mb-4">
              Start chatting with your personalized AI assistant
            </Text>
            <TouchableOpacity 
              className="bg-white rounded-full py-3 px-6 flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="chatbubble-ellipses" size={20} color="#121212" />
              <Text className="text-[#121212] font-semibold text-base ml-2">
                Start Conversation
              </Text>
            </TouchableOpacity>
          </View>

          {/* Quick Actions */}
          <Text className="text-white text-lg font-semibold mb-4">Quick Actions</Text>
          <View className="flex-row flex-wrap justify-between mb-6">
            <TouchableOpacity className="bg-[#1e1e1e] rounded-2xl p-4 w-[48%] mb-4 border border-[#333]">
              <View className="bg-purple-500/20 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="sparkles" size={24} color="#a855f7" />
              </View>
              <Text className="text-white font-semibold">Train Avatar</Text>
              <Text className="text-gray-400 text-sm">Customize your AI</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-[#1e1e1e] rounded-2xl p-4 w-[48%] mb-4 border border-[#333]">
              <View className="bg-blue-500/20 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="time" size={24} color="#3b82f6" />
              </View>
              <Text className="text-white font-semibold">History</Text>
              <Text className="text-gray-400 text-sm">View past chats</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-[#1e1e1e] rounded-2xl p-4 w-[48%] border border-[#333]">
              <View className="bg-green-500/20 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="settings" size={24} color="#22c55e" />
              </View>
              <Text className="text-white font-semibold">Settings</Text>
              <Text className="text-gray-400 text-sm">Preferences</Text>
            </TouchableOpacity>

            <TouchableOpacity className="bg-[#1e1e1e] rounded-2xl p-4 w-[48%] border border-[#333]">
              <View className="bg-orange-500/20 w-12 h-12 rounded-full items-center justify-center mb-3">
                <Ionicons name="help-circle" size={24} color="#f97316" />
              </View>
              <Text className="text-white font-semibold">Help</Text>
              <Text className="text-gray-400 text-sm">Get support</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <Text className="text-white text-lg font-semibold mb-4">Your Stats</Text>
          <View className="bg-[#1e1e1e] rounded-2xl p-5 border border-[#333] mb-6">
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">0</Text>
                <Text className="text-gray-400 text-sm">Conversations</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">0</Text>
                <Text className="text-gray-400 text-sm">Memories</Text>
              </View>
              <View className="items-center">
                <Text className="text-white text-2xl font-bold">0</Text>
                <Text className="text-gray-400 text-sm">Days Active</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>
      </ScrollView>
    </View>
  );
}
