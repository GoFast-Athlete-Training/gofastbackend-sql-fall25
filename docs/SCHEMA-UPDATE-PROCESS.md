# Schema Update & API Route Handling Process

## Overview
This document defines the surgical process for updating the Prisma schema and implementing corresponding API routes for the GoFast MVP1 backend.

## Current Schema Status
- ✅ **Athlete model** - Flattened, single container design
- ✅ **Firebase integration** - Admin SDK configured
- ✅ **Basic routes** - `athleteCreateRoute.js` exists

## Required Schema Updates for MVP1

### 1. Update Athlete Model Fields
```prisma
model Athlete {
  id        String @id @default(cuid())
  firebaseId String @unique
  
  // Universal Profile (MVP1 Required)
  firstName    String
  lastName     String
  gofastHandle String @unique  // NEW: @sarah_runs format
  birthday     DateTime?        // NEW: Instead of age
  gender       String?          // NEW: male/female
  city         String?
  state        String?
  primarySport String?          // NEW: running, cycling, etc.
  photoURL     String?
  bio          String?          // NEW: Short bio
  instagram    String?          // NEW: Instagram handle
  
  // Training Profile (Future)
  currentPace     String?
  weeklyMileage   Int?
  trainingGoal    String?
  targetRace      String?
  trainingStartDate DateTime?
  
  // Match Profile (Future)
  preferredDistance String?
  timePreference    String?
  paceRange         String?
  runningGoals      String?
  
  // System fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  status    String   @default("active")
}
```

## API Route Implementation Process

### Step 1: Update Prisma Schema
```bash
# 1. Edit prisma/schema.prisma with new fields
# 2. Generate new migration
npx prisma migrate dev --name add-athlete-profile-fields

# 3. Generate Prisma client
npx prisma generate
```

### Step 2: Update athleteCreateRoute.js
```javascript
// routes/Athlete/athleteCreateRoute.js
router.post('/athleteuser', async (req, res) => {
  try {
    const { 
      firebaseId, 
      email, 
      firstName, 
      lastName, 
      photoURL 
    } = req.body;

    // 1. Find existing Athlete by firebaseId
    let athlete = await prisma.athlete.findFirst({
      where: { firebaseId }
    });

    if (athlete) {
      return res.json({
        id: athlete.id,
        firebaseId: athlete.firebaseId,
        email: athlete.email,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        // ... other fields
      });
    }

    // 2. Find existing Athlete by email
    athlete = await prisma.athlete.findFirst({
      where: { email }
    });

    if (athlete) {
      // Link firebaseId to existing Athlete
      athlete = await prisma.athlete.update({
        where: { id: athlete.id },
        data: { firebaseId, photoURL: photoURL || undefined }
      });

      return res.json({
        id: athlete.id,
        firebaseId: athlete.firebaseId,
        email: athlete.email,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        // ... other fields
      });
    }

    // 3. Create new Athlete
    athlete = await prisma.athlete.create({
      data: {
        firebaseId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        photoURL: photoURL || null,
        // Default values for new fields
        gofastHandle: null,
        birthday: null,
        gender: null,
        city: null,
        state: null,
        primarySport: null,
        bio: null,
        instagram: null
      }
    });

    res.status(201).json({
      id: athlete.id,
      firebaseId: athlete.firebaseId,
      email: athlete.email,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      // ... other fields
    });

  } catch (error) {
    console.error('❌ AUTH: FindOrCreate error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

### Step 3: Create Athlete Profile Update Route
```javascript
// routes/Athlete/athleteProfileRoute.js
router.put('/athlete/:athleteId/profile', async (req, res) => {
  try {
    const { athleteId } = req.params;
    const profileData = req.body;

    const athlete = await prisma.athlete.update({
      where: { id: athleteId },
      data: {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        gofastHandle: profileData.gofastHandle,
        birthday: profileData.birthday ? new Date(profileData.birthday) : null,
        gender: profileData.gender,
        city: profileData.city,
        state: profileData.state,
        primarySport: profileData.primarySport,
        bio: profileData.bio,
        instagram: profileData.instagram,
        photoURL: profileData.photoURL
      }
    });

    res.json(athlete);
  } catch (error) {
    console.error('❌ Profile update error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

### Step 4: Create Athlete Profile Get Route
```javascript
// routes/Athlete/athleteProfileRoute.js
router.get('/athlete/:athleteId', async (req, res) => {
  try {
    const { athleteId } = req.params;

    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId }
    });

    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    res.json(athlete);
  } catch (error) {
    console.error('❌ Profile get error:', error);
    res.status(400).json({ error: error.message });
  }
});
```

## Frontend Integration Process

### Step 1: Update SignupPage.jsx
```javascript
// After Google auth success
const res = await api.post("/athleteuser", {
  firebaseId: result.uid,
  email: result.email,
  firstName: result.name?.split(' ')[0] || '',
  lastName: result.name?.split(' ').slice(1).join(' ') || '',
  photoURL: result.photoURL
});

const athlete = res.data;
localStorage.setItem("athleteId", athlete.id);
localStorage.setItem("firebaseId", result.uid);
localStorage.setItem("email", result.email);

navigate('/athlete-create-profile');
```

### Step 2: Update AthleteCreateProfile.jsx
```javascript
// On form submit
const res = await api.put(`/athlete/${athleteId}/profile`, {
  firstName: formData.firstName,
  lastName: formData.lastName,
  gofastHandle: formData.gofastHandle,
  birthday: formData.birthday,
  gender: formData.gender,
  city: formData.city,
  state: formData.state,
  primarySport: formData.primarySport,
  bio: formData.bio,
  instagram: formData.instagram,
  photoURL: formData.photoURL
});

navigate('/athlete-home');
```

## Implementation Checklist

### Backend
- [ ] Update `prisma/schema.prisma` with new fields
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npx prisma generate`
- [ ] Update `athleteCreateRoute.js` with new fields
- [ ] Create `athleteProfileRoute.js` for profile updates
- [ ] Test all routes with Postman/curl

### Frontend
- [ ] Update `SignupPage.jsx` to call `/athleteuser`
- [ ] Update `AthleteCreateProfile.jsx` to call `/athlete/:id/profile`
- [ ] Add error handling for API calls
- [ ] Test complete signup → profile creation flow

## Testing Strategy

### 1. Backend Testing
```bash
# Test athlete creation
curl -X POST http://localhost:3000/api/athleteuser \
  -H "Content-Type: application/json" \
  -d '{"firebaseId":"test123","email":"test@test.com","firstName":"John","lastName":"Doe"}'

# Test profile update
curl -X PUT http://localhost:3000/api/athlete/ATHLETE_ID/profile \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","gofastHandle":"john_runs"}'
```

### 2. Frontend Testing
- [ ] Google auth popup works
- [ ] Signup creates athlete record
- [ ] Profile form submits successfully
- [ ] Navigation flows correctly
- [ ] Error handling works

## Key Principles

1. **Surgical Updates** - Only add what's needed for MVP1
2. **Backward Compatibility** - Don't break existing functionality
3. **Single Source of Truth** - Athlete model contains everything
4. **Progressive Enhancement** - Add fields as features are built
5. **Error Handling** - Graceful failures with user feedback

This process ensures clean, surgical updates to the schema and API routes while maintaining the athlete-first architecture.
