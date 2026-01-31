import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import '../global.css';
import { useEffect, useState } from 'react';
import { syncClerkUserToBackend } from '@/utils/clerkBackend';

type AvatarStatus = 'invited' | 'active' | 'ready';

interface Avatar {
  id: string;
  name: string;
  photo?: string;
  status: AvatarStatus;
  memoryCount: number;
  lastActivity: string;
}

// Sample data - in production this would come from your backend
const SAMPLE_AVATARS: Avatar[] = [
  {
    id: '1',
    name: 'Mom',
    photo: undefined,
    status: 'ready',
    memoryCount: 47,
    lastActivity: 'Added memory 2h ago',
  },
  {
    id: '2',
    name: 'Sarah',
    photo: undefined,
    status: 'active',
    memoryCount: 12,
    lastActivity: 'Added memory yesterday',
  },
  {
    id: '3',
    name: 'Dad',
    photo: undefined,
    status: 'invited',
    memoryCount: 0,
    lastActivity: "Hasn't responded yet",
  },
];

const STATUS_CONFIG = {
  invited: {
    label: 'Invited',
    color: '#999999',
    bgColor: '#F5F5F5',
  },
  active: {
    label: 'memories added',
    color: '#059669',
    bgColor: '#ECFDF5',
  },
  ready: {
    label: 'Ready to chat',
    color: '#2563EB',
    bgColor: '#EFF6FF',
  },
};

function getStatusText(avatar: Avatar): string {
  if (avatar.status === 'invited') return 'Invited';
  if (avatar.status === 'active') return `${avatar.memoryCount} memories added`;
  return 'Ready to chat';
}

function AvatarCard({ avatar }: { avatar: Avatar }) {
  const config = STATUS_CONFIG[avatar.status];
  const isInvited = avatar.status === 'invited';
  
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="bg-white border border-[#E5E5E5] rounded-lg p-4 mb-4"
    >
      <View className="flex-row items-center">
        {/* Avatar Photo */}
        <View className="mr-4">
          {avatar.photo ? (
            <Image
              source={{ uri: avatar.photo }}
              style={{ width: 64, height: 64, borderRadius: 32 }}
            />
          ) : (
            <View 
              className="w-16 h-16 rounded-full items-center justify-center"
              style={{ backgroundColor: isInvited ? '#E5E5E5' : '#F5F5F5' }}
            >
              <Text 
                className="text-2xl font-semibold"
                style={{ color: isInvited ? '#999' : '#000' }}
              >
                {avatar.name.charAt(0)}
              </Text>
            </View>
          )}
        </View>
        
        {/* Info */}
        <View className="flex-1">
          <Text 
            className="text-base font-semibold"
            style={{ color: isInvited ? '#666' : '#000' }}
          >
            {avatar.name}
          </Text>
          
          {/* Status Badge */}
          <View className="flex-row items-center mt-1">
            <View 
              className="rounded-full px-2 py-0.5"
              style={{ backgroundColor: config.bgColor }}
            >
              <Text 
                className="text-xs font-medium"
                style={{ color: config.color }}
              >
                {getStatusText(avatar)}
              </Text>
            </View>
          </View>
          
          {/* Last Activity */}
          <Text className="text-xs mt-1.5" style={{ color: '#666' }}>
            {avatar.lastActivity}
          </Text>
        </View>
        
        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="px-4 py-2 rounded-lg"
          style={{ 
            backgroundColor: isInvited ? '#F5F5F5' : (avatar.status === 'ready' ? '#2563EB' : '#000'),
          }}
        >
          <Text 
            className="text-sm font-medium"
            style={{ color: isInvited ? '#666' : '#fff' }}
          >
            {isInvited ? 'Remind' : 'Chat'}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onCreateAvatar }: { onCreateAvatar: () => void }) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      {/* Icon */}
      <View className="w-16 h-16 bg-[#F5F5F5] rounded-full items-center justify-center mb-6">
        <Ionicons name="people-outline" size={28} color="#999" />
      </View>
      
      {/* Title */}
      <Text className="text-lg font-semibold text-black text-center mb-2">
        Create your first avatar
      </Text>
      
      {/* Description */}
      <Text className="text-sm text-center mb-8" style={{ color: '#666' }}>
        Invite someone to build their AI together with you
      </Text>
      
      {/* CTA Button */}
      <TouchableOpacity
        onPress={onCreateAvatar}
        activeOpacity={0.8}
        className="bg-black rounded-lg px-6 py-3"
      >
        <Text className="text-white text-sm font-medium">Create Avatar</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function HomeScreen() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const [avatars, setAvatars] = useState<Avatar[]>(SAMPLE_AVATARS);
  const [showEmpty, setShowEmpty] = useState(false); // Toggle for demo

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

  const handleCreateAvatar = () => {
    // Navigate to avatar creation flow
    console.log('Create new avatar');
  };

  return (
    <View className="flex-1" style={{ backgroundColor: '#FAFAFA' }}>
      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Text className="text-lg font-semibold tracking-tight text-black">
            Mimic
          </Text>
          <TouchableOpacity
            onPress={handleCreateAvatar}
            activeOpacity={0.7}
            className="flex-row items-center"
          >
            <Ionicons name="add" size={20} color="#000" />
            <Text className="text-sm font-medium text-black ml-1">
              New Avatar
            </Text>
          </TouchableOpacity>
        </View>

        {/* User Banner */}
        <View className="flex-row items-center px-6 py-4 mb-2">
          {user?.imageUrl ? (
            <Image
              source={{ uri: user.imageUrl }}
              style={{ width: 40, height: 40, borderRadius: 20 }}
            />
          ) : (
            <View className="w-10 h-10 bg-[#E5E5E5] rounded-full items-center justify-center">
              <Text className="text-base font-semibold" style={{ color: '#666' }}>
                {user?.firstName?.charAt(0) || 'U'}
              </Text>
            </View>
          )}
          <View className="ml-3">
            <Text className="text-base font-medium text-black">
              Hey, {user?.username || 'there'}
            </Text>
            <Text className="text-xs" style={{ color: '#666' }}>
              {avatars.length} avatar{avatars.length !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        {showEmpty || avatars.length === 0 ? (
          <EmptyState onCreateAvatar={handleCreateAvatar} />
        ) : (
          <ScrollView
            className="flex-1 px-6"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 32 }}
          >
            {avatars.map((avatar) => (
              <AvatarCard key={avatar.id} avatar={avatar} />
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
