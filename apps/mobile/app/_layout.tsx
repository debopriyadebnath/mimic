import { tokenCache } from '@/utils/cache'
import { ClerkLoaded, ClerkProvider } from '@clerk/clerk-expo'
import { Slot, Stack } from 'expo-router'
import { LogBox } from 'react-native'
const clerkPublishableKey=process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY|| ''
if(!clerkPublishableKey){
  throw new Error('Clerk publishable key is not defined')
}
LogBox.ignoreAllLogs
const InitialLayout=()=>{
  return ( 
    <Stack>
      <Stack.Screen name='index' />
    </Stack>
  )
}
export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
      <Slot  />
      </ClerkLoaded>
    </ClerkProvider>
  )
}