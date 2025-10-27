# GoFast Auth Flow Documentation

## Overview

Clean Firebase authentication flow for GoFast MVP1, based on Events CRM pattern but adapted for Athlete-first architecture.

## Auth Flow Pattern

### 1. Splash Page - Model Auth Check Router
```javascript
// Uses Firebase onAuthStateChanged to check auth state
const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
  if (!firebaseUser) {
    navigate("/signin");  // Not authenticated
  } else {
    navigate("/athlete-home");  // Authenticated
  }
});
```

### 2. Signin Route - Firebase Token + Athlete ID
```javascript
// After Google sign-in success
const result = await signInWithGoogle();

// Call backend with Firebase data
const res = await api.post("/auth/athleteuser", {
  firebaseId: result.uid,
  email: result.email,
  firstName: result.name?.split(' ')[0] || '',
  lastName: result.name?.split(' ').slice(1).join(' ') || '',
  photoURL: result.photoURL
});

// Store both Firebase ID and Athlete ID
localStorage.setItem("firebaseId", result.uid);
localStorage.setItem("athleteId", res.data.id);
```

### 3. Backend Auth Route - `pushFirebaseToken` + `mutateAthleteId`
```javascript
// POST /auth/athleteuser
// Receives Firebase token data
// Links firebaseId to athleteId
// Returns athlete data
```

## Endpoint Details

### `POST /auth/athleteuser`
**Purpose:** Link Firebase authentication to Athlete record

**Request Body:**
```json
{
  "firebaseId": "firebase_user_uid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "photoURL": "https://..."
}
```

**Response:**
```json
{
  "id": "athlete_id",
  "firebaseId": "firebase_user_uid",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "photoURL": "https://..."
}
```

**Logic:**
1. **Find by firebaseId** - Check if Athlete already exists with this Firebase ID
2. **Find by email** - Check if Athlete exists with this email (link firebaseId)
3. **Create new** - Create new Athlete record with Firebase data

## Frontend Storage

### LocalStorage Keys
- `firebaseId` - Firebase user UID
- `athleteId` - GoFast Athlete ID
- `email` - User email (fallback from Firebase)

### Usage Pattern
```javascript
// Get current athlete ID for API calls
const athleteId = localStorage.getItem("athleteId");

// All API calls use athleteId
const response = await api.get(`/runcrew/${athleteId}`);
```

## Backend Architecture

### File Structure
```
routes/Athlete/
└── athleteAuthRoute.js  ← Firebase auth endpoint

services/Athlete/
└── (future athlete services)
```

### Database Schema
```prisma
model Athlete {
  id        String  @id @default(cuid())
  firebaseId String? @unique  ← Links to Firebase
  email     String  @unique
  firstName String?
  lastName  String?
  photoURL  String?
  status    String  @default("active")
  
  // Athlete-first relationships
  athleteCrews AthleteCrew[]
  activities    Activity[]
  points        Points[]
}
```

## Key Differences from Events CRM

### Events CRM (Admin-first)
- `adminId` is primary identifier
- Links to `orgId` and `containerId`
- Complex org/container hierarchy

### GoFast (Athlete-first)
- `athleteId` is primary identifier
- Direct relationships to RunCrew, Activities, Points
- Simpler, flatter architecture

## Security Notes

### Firebase Token Verification
- Frontend gets Firebase token from Google sign-in
- Backend should verify Firebase token (future middleware)
- All subsequent API calls use `athleteId` (not Firebase token)

### Data Flow
1. **Firebase** → Authenticates user
2. **Backend** → Links Firebase to Athlete record
3. **Frontend** → Stores athleteId for API calls
4. **API** → Uses athleteId for all operations

## Future Enhancements

### Middleware
```javascript
// Future: Verify Firebase token on protected routes
export const verifyFirebaseToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  const decodedToken = await admin.auth().verifyIdToken(token);
  req.firebaseUser = decodedToken;
  next();
};
```

### Athlete Services
- `athleteService.js` - Complex athlete operations
- Profile management, settings, preferences
- Integration with RunCrew, Activities, Points

This auth flow provides a clean foundation for GoFast MVP1 with proper separation between Firebase authentication and GoFast business logic.
