# Athlete-First Schema Design

## Core Principle: Single AthleteProfile Container

The Athlete model is the single source of truth for all user data. Everything is flattened and bolted onto this one container to prevent hydration hell and multiple API calls.

## Schema Architecture

### Single AthleteProfile Container (Flattened)
```prisma
model Athlete {
  id        String @id @default(cuid())
  firebaseId String @unique
  
  // Universal Profile (always present)
  firstName String
  lastName  String
  age       Int?
  city      String?
  state     String?
  photoURL  String?
  bio       String?
  instagram String?
  
  // Training Profile (bolted on when relevant)
  currentPace     String?
  weeklyMileage   Int?
  trainingGoal   String?
  targetRace     String?
  trainingStartDate DateTime?
  
  // Match Profile (bolted on when relevant)  
  preferredDistance String?
  timePreference    String?
  paceRange         String?
  runningGoals      String?
  
  // Crew Profile (bolted on when relevant)
  primaryCrewId String?
  
  // Event Profile (bolted on when relevant)
  estimatedFinishTime String?
  goalTime           String?
  raceCategory       String?
  emergencyContact   String?
  tShirtSize         String?
  
  // System fields
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  status    String   @default("active")
}
```

## Frontend Flow (Progressive Filling)

### 1. User Signs Up
```javascript
// Only universal fields filled
const athleteData = {
  firstName: "John",
  lastName: "Doe", 
  age: 30,
  city: "Arlington",
  state: "VA",
  photoURL: "https://...",
  bio: "Love running!",
  instagram: "@john_runs"
};
```

### 2. User Clicks "Train"
```javascript
// Training fields get filled
const trainingData = {
  currentPace: "8:00",
  weeklyMileage: 25,
  trainingGoal: "Marathon",
  targetRace: "Boston Marathon",
  trainingStartDate: "2024-01-01"
};
```

### 3. User Clicks "Match"
```javascript
// Match fields get filled
const matchData = {
  preferredDistance: "5K",
  timePreference: "Morning",
  paceRange: "7:30-8:30",
  runningGoals: "Find crew, PR"
};
```

### 4. User Clicks "Crew"
```javascript
// Crew fields get filled
const crewData = {
  primaryCrewId: "crew_123"
};
```

## Benefits of This Approach

### 1. Single Hydration Call
```javascript
// One API call gets everything
const athleteProfile = await api.get('/athlete-profile');
// All data is there - universal, training, match, crew, event
```

### 2. No Hydration Hell
- **No multiple API calls** - Everything in one place
- **No complex joins** - Flattened schema
- **No state management complexity** - Single data source

### 3. Progressive Frontend Filling
- **Users only fill what they need** - No overwhelming forms
- **Feature-specific data** - Only when relevant
- **Clean user experience** - Simple, focused forms

### 4. Easy Backend Development
- **Single model** - No complex relationships
- **Simple queries** - Just get the Athlete record
- **Easy updates** - Update one record

## File Structure

### Frontend
```
src/Pages/Athlete/
├── AthleteCreateProfile.jsx    # Universal profile setup
├── AthleteProfile.jsx          # Hydrated dashboard view
└── Setup/
    ├── TrainingSetup.jsx       # Training fields
    ├── MatchSetup.jsx          # Match fields
    └── EventSetup.jsx          # Event fields
```

### Backend
```
routes/Athlete/
└── athleteCreateRoute.js       # Create/update athlete profile

services/Athlete/
└── athleteService.js           # Business logic for athlete operations
```

## Implementation Strategy

### Phase 1: Universal Profile
- **AthleteCreateProfile.jsx** - Basic identity setup
- **athleteCreateRoute.js** - Create athlete with universal fields
- **Single hydration call** - Get athlete data

### Phase 2: Feature-Specific Fields
- **TrainingSetup.jsx** - Fill training fields when user clicks Train
- **MatchSetup.jsx** - Fill match fields when user clicks Match
- **CrewSetup.jsx** - Fill crew fields when user clicks Crew

### Phase 3: Hydrated Dashboard
- **AthleteProfile.jsx** - Display all data in one view
- **Single API call** - Get complete athlete profile

## Key Principles

1. **Single Source of Truth** - Athlete model contains everything
2. **Progressive Filling** - Frontend fills fields as needed
3. **No Hydration Hell** - One API call gets everything
4. **Surgical Design** - Get it right from the start
5. **Flattened Schema** - No complex relationships

This approach prevents the pain of multiple data sources and complex hydration while providing a clean, simple user experience.