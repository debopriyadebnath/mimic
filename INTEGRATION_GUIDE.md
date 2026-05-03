# MIMIC App - Complete Integration Guide

## 🎯 Status Summary

### ✅ Completed
- **Build Fixed**: TypeScript errors resolved
- **Frontend Server**: Running on http://localhost:3000
- **Clerk Authentication**: Fully integrated with email/password and Google OAuth
- **API Connections**: All backend routes configured
- **Environment Variables**: Set in `.env.local`

### 🚀 Current Setup

#### Frontend (.env.local)
```
NEXT_PUBLIC_BACKEND_URL=https://mimic-xt46.onrender.com/
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_d2l0dHktbW9ua2Zpc2gtMTkuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_djZxQMoraSESuBmmKhySFXNaoS5gSWEg97OvkRwNK2
NEXT_PUBLIC_CONVEX_URL=https://sincere-mouse-679.convex.cloud/
SARVAM_API_KEY=sk_9cp8pdgp_KtdhgHm6fwHKYEM6hXHcKQAX
GEMINI_API_KEY=AIzaSyDKXZdlYIkTA6LelLZ3Q4eBQmWMv_b5-So
NEXT_PUBLIC_BASE_URL=http://localhost:3000/
```

#### Backend Architecture
- **Framework**: Express.js + TypeScript
- **Database**: Convex (Primary) + Neo4j (Graph) + MongoDB (Optional)
- **Auth**: Clerk
- **ORM**: Prisma (for some operations)
- **AI**: Google Gemini API

---

## 🔌 Connections & Integrations

### 1. Clerk Authentication ✅

**Status**: Fully connected to SignIn and SignUp pages

**Flows Implemented**:
- Email + Password registration with verification
- Email + Password login
- Google OAuth (single sign-on)
- Session management

**Files**:
- `src/components/auth/SignInForm.tsx`
- `src/components/auth/SignUpForm.tsx`

**Test It**:
```
1. Go to http://localhost:3000/signin
2. Try email/password or Google OAuth
3. After sign-in, check localStorage for Clerk session
4. Navigate to /dashboard
```

---

### 2. Avatar Creation Flow ✅

**Status**: Connected with backend API

**Steps**:
1. Owner fills: Name, Email (auto-populated from Clerk)
2. Select or upload avatar image
3. Answer 3 personality questions
4. Submit → Creates draft avatar
5. Generates trainer invitation link

**API Endpoints Used**:
- `POST /api/avatar-flow/create-draft` → Create avatar with owner responses
- `POST /api/avatar-flow/generate-invite` → Generate trainer invitation token

**Files**:
- `src/components/dashboard/CreateAvatar.tsx`

**Test It**:
```
1. Sign in → Dashboard → Click "Create Avatar"
2. Fill all fields (auto-filled email from Clerk)
3. Click "Generate Invitation" button
4. Should redirect to training-results page with invite link
5. Copy the invite link for trainer flow
```

---

### 3. Trainer Invitation & Flow ✅

**Status**: Connected with questionnaire flow

**Steps**:
1. Trainer receives invitation link
2. Accepts invitation and enters name
3. Answers 10 psychological MCQ questions
4. Optionally adds notes per question
5. Submits responses → Responses stored in backend

**API Endpoints Used**:
- `GET /api/avatar-flow/validate/:token` → Validate invitation token
- `POST /api/avatar-flow/accept/:token` → Accept invitation
- `POST /api/avatar-flow/submit/:token` → Submit questionnaire responses

**Files**:
- `src/app/trainer-invite/[token]/page.tsx`

**Test It**:
```
1. Use invite link from avatar creation
2. Enter trainer name and accept
3. Answer all 10 questions
4. Click Submit
5. Should show success message
```

---

### 4. Avatar Training (Memory Input) ✅

**Status**: Connected with multiple input methods

**Features**:
- Text input for memories
- Voice input (via Sarvam AI)
- Embedding generation (Gemini)
- Memory categorization
- Session memory storage

**API Endpoints Used**:
- `POST /api/avatar/:id/memory` → Save memory with embedding
- `POST /api/avatar-flow/generate-embedding` → Generate vector embedding
- `GET /api/avatar-flow/avatar/:id` → Get avatar info

**Files**:
- `src/components/dashboard/AvatarTraining.tsx`

**Test It**:
```
1. Go to Dashboard → Train Avatar
2. Select an avatar from dropdown
3. Type text or use voice recording button
4. Click "ADD_MEMORY" button
5. Check if memory is saved (notification appears)
6. Try voice input (requires microphone access)
```

---

### 5. Avatar Chat ✅

**Status**: Connected with conversation storage

**Features**:
- Real-time chat with trained avatar
- Multilingual support (13 Indian languages)
- Message translation
- Text-to-speech playback
- Voice input
- Session persistence

**API Endpoints Used**:
- `POST /api/avatar/:id/chat` → Send message and get response
- `GET /api/avatar-flow/conversation/:id` → Load chat history
- `/api/translate` → Translate messages
- `/api/text-to-speech` → Generate speech
- `/api/speech-to-text` → Transcribe voice

**Files**:
- `src/app/chat/[avatarId]/page.tsx`

**Test It**:
```
1. Go to Dashboard → Find a completed avatar
2. Click "START_CHAT"
3. Type a message and press Enter
4. See avatar response
5. Try voice recording button
6. Try translation feature
7. Try text-to-speech playback
```

---

## 🔍 Key API Endpoints Reference

### Avatar Management
```
POST /api/avatar-flow/create-draft
  Body: { ownerId, ownerName, ownerEmail, avatarName, avatarImageUrl, ownerResponses }
  Response: { success, avatarId, avatarName }

GET /api/avatar-flow/avatar/:id
  Response: { success, avatar: { id, avatarName, status, finalMasterPrompt } }

GET /api/avatar-flow/dashboard/:userId
  Response: { success, avatars: [ { id, avatarName, status, avatarImageUrl } ] }
```

### Trainer Flow
```
GET /api/avatar-flow/validate/:token
  Response: { valid, invitation: { avatarName, ownerName, status, expiresAt } }

POST /api/avatar-flow/accept/:token
  Body: { trainerName }
  Response: { success, message }

POST /api/avatar-flow/submit/:token
  Body: { responses: { q1: answer, q2: answer, ... } }
  Response: { success, message }
```

### Memory & Chat
```
POST /api/avatar/:id/memory
  Body: { userId, text, embedding, category, source }
  Response: { success, memory: { id, avatarId, text } }

GET /api/avatar-flow/conversation/:avatarId
  Params: { sessionId }
  Response: { success, messages: [ { role, content, timestamp } ] }
```

---

## 🧪 Testing Workflow

### Complete User Journey
```
1. Sign Up
   └─ Go to /signup → Register with email or Google → Verify email

2. Create Avatar
   └─ Dashboard → Create Avatar → Fill fields → Generate invite

3. Share Training Invite
   └─ Copy invite link → Share with trainer

4. Trainer Accepts & Responds
   └─ Trainer clicks link → Answers questionnaire → Submit

5. Train Avatar with Memories
   └─ Dashboard → Train Avatar → Add voice/text memories

6. Chat with Avatar
   └─ Dashboard → Find avatar → Start Chat → Interact
```

---

## ⚙️ Environment Setup Checklist

### Frontend
- [ ] `.env.local` configured with all keys
- [ ] `NEXT_PUBLIC_BACKEND_URL` points to backend
- [ ] Clerk keys are valid and not expired
- [ ] Convex URL is accessible

### Backend (on Render)
- [ ] Express server running
- [ ] Convex integration active
- [ ] Clerk middleware enabled
- [ ] All routes registered:
  - [ ] avatarFlow routes
  - [ ] auth routes
  - [ ] user routes
  - [ ] chat routes
  - [ ] trainer routes
- [ ] Environment variables set:
  - [ ] CONVEX_URL
  - [ ] CLERK_SECRET_KEY
  - [ ] GEMINI_API_KEY
  - [ ] JWT_SECRET

### External Services
- [ ] Clerk account active
- [ ] Convex workspace created
- [ ] Google Gemini API enabled
- [ ] Sarvam AI credentials active

---

## 🐛 Troubleshooting

### "Backend not responding"
```
→ Check if Render deployment is awake (might sleep on free tier)
→ Check NEXT_PUBLIC_BACKEND_URL is correct
→ Check CORS settings in backend
→ Verify network connectivity
```

### "Clerk authentication failing"
```
→ Verify Clerk keys in .env.local
→ Check Clerk dashboard for active instance
→ Ensure redirect URLs are correct
→ Clear browser cache and localStorage
```

### "Convex connection error"
```
→ Check NEXT_PUBLIC_CONVEX_URL
→ Verify Convex dashboard is accessible
→ Check if functions are deployed
→ Verify schema is up to date
```

### "Speech-to-text not working"
```
→ Check browser microphone permissions
→ Verify SARVAM_API_KEY is valid
→ Check Sarvam API status
→ Try different language selection
```

---

## 📊 Database Schema Quick Reference

### Users
```
{
  clerkId: string          // Clerk user ID
  userName: string
  email: string
  profilePhoto?: string
  createdAt: number
  updatedAt?: number
}
```

### Avatars
```
{
  ownerId: string          // Reference to user
  avatarName: string
  masterPrompt: string     // AI personality definition
  trainerId?: string       // Optional trainer
  isActive: boolean
  createdAt: number
  updatedAt: number
}
```

### Memories
```
{
  avatarId: string
  text: string
  embedding: number[]      // Vector embedding
  category: string         // "personality", "preference", etc.
  trustWeight: "owner" | "trainer" | "derived"
  source: "user_saved" | "trainer_added" | "voice_input" | "conversation_extract"
  isActive: boolean
  createdAt: number
}
```

### Conversations
```
{
  avatarId: string
  userId: string
  sessionId: string
  messages: [ { role, content, timestamp } ]
  createdAt: number
  updatedAt: number
}
```

---

## 📝 Next Steps

1. **Local Testing**
   - Test all authentication flows
   - Create a test avatar
   - Share invite with another account
   - Complete full trainer questionnaire
   - Add memories and chat

2. **Fix Any Issues**
   - Debug API failures
   - Check database connections
   - Verify all endpoints respond

3. **Production Readiness**
   - Ensure Render backend is stable
   - Test with production Clerk keys
   - Verify Convex database is synced
   - Set up proper error logging

---

## 🚀 Running Locally

```bash
# Frontend
cd apps/frontend
npm run dev
# Runs on http://localhost:3000

# Backend (if running locally)
cd apps/backend
npm run dev
# Runs on http://localhost:8000
```

---

## 📞 Support

For issues with:
- **Clerk**: https://clerk.com/docs
- **Convex**: https://docs.convex.dev
- **Next.js**: https://nextjs.org/docs
- **Express**: https://expressjs.com/
- **Sarvam AI**: https://www.sarvam.ai/
- **Google Gemini**: https://ai.google.dev/

---

**Last Updated**: May 3, 2026
**Build Status**: ✅ PASSING
**Dev Server**: ✅ RUNNING
