import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { View, Text } from 'react-native';
import '../global.css';

export default function AuthLayout() {
  // In production, this would come from a context/store
  const pendingInvitesCount = 2;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#000',
        tabBarInactiveTintColor: '#999',
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E5E5',
          borderTopWidth: 1,
          height: 84,
          paddingBottom: 28,
          paddingTop: 12,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'people' : 'people-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="invites"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View>
              <Ionicons 
                name={focused ? 'mail' : 'mail-outline'} 
                size={24} 
                color={color} 
              />
              {pendingInvitesCount > 0 && (
                <View 
                  style={{
                    position: 'absolute',
                    top: -4,
                    right: -8,
                    backgroundColor: '#DC2626',
                    borderRadius: 8,
                    minWidth: 16,
                    height: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingHorizontal: 4,
                  }}
                >
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
                    {pendingInvitesCount}
                  </Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'settings' : 'settings-outline'} 
              size={24} 
              color={color} 
            />
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen
        name="memories"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="sign-in"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
