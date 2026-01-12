import { tokenCache } from '@/utils/cache'
import { ClerkLoaded, ClerkProvider, useAuth } from '@clerk/clerk-expo'
import { Slot, useRouter, useSegments } from 'expo-router'
import { LogBox } from 'react-native'
import { useEffect } from 'react'

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''
if (!clerkPublishableKey) {
  throw new Error('Clerk publishable key is not defined')
}
LogBox.ignoreAllLogs()

function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (!isLoaded) return

    const inAuthGroup = segments[0] === '(auth)'

    if (isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/home')
    } else if (!isSignedIn && inAuthGroup) {
      router.replace('/(public)')
    }
  }, [isSignedIn, isLoaded, segments])

  return <Slot />
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <InitialLayout />
      </ClerkLoaded>
    </ClerkProvider>
  )
}