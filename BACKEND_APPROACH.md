# GoFast Backend Approach - MVP1

## Overview

MVP1 backend focuses on **RunCrew functionality** - community building through activity tracking, leaderboards, and crew management. The backend uses **Athlete-First Architecture** where `athleteId` is the universal identifier for all relationships.

## Core Philosophy

- **Wire first, build second** - Connect APIs before building complex features
- **Athlete-centric** - All features stem from the athlete entity
- **Real data flow** - Replace mock data with actual Garmin integration
- **Scalable foundation** - Ready for future phases (training, matching, shopping)

## Current State Analysis

### ❌ What's Wrong (Needs Fixing)
- **Schema mismatch** - Uses `Racer` model instead of `Athlete`
- **Training-focused** - Built for training plans, not RunCrew
- **Missing models** - No `Crew`, `AthleteCrew`, `Points` models
- **Outdated README** - Focuses on AI training instead of community

### ✅ What's Good (Keep This)
- **Prisma setup** - Database ORM configured
- **Express structure** - Basic API server setup
- **PostgreSQL** - Database ready
- **Folder structure** - Controllers, routes, services organized

## Implementation Strategy

### Phase 1: Schema Refactor (Week 1)
**Priority: CRITICAL - Everything depends on this**

#### 1.1 Update Prisma Schema
```prisma
// Replace Racer with Athlete (universal entity)
model Athlete {
  id          String @id @default(cuid())
  firstName   String
  lastName    String
  age         Int
  city        String
  state       String
  profilePhoto String?
  firebaseId  String? @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  crews       AthleteCrew[]
  activities  Activity[]
  points      Points?
  
  @@map("athletes")
}

// Add RunCrew models
model Crew {
  id        String @id @default(cuid())
  crewCode  String @unique
  name      String
  description String?
  crewLeadId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  crewLead  Athlete @relation("CrewLeader", fields: [crewLeadId], references: [id])
  athletes  AthleteCrew[]
  
  @@map("crews")
}

model AthleteCrew {
  id        String @id @default(cuid())
  athleteId String
  crewId    String
  joinedAt  DateTime @default(now())
  
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  crew      Crew   @relation(fields: [crewId], references: [id])
  
  @@unique([athleteId, crewId])
  @@map("athlete_crews")
}

// Add Points system
model Points {
  id        String @id @default(cuid())
  athleteId String @unique
  balance   Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  athlete      Athlete @relation(fields: [athleteId], references: [id])
  transactions PointTransaction[]
  
  @@map("points")
}

model PointTransaction {
  id        String @id @default(cuid())
  pointsId  String
  amount    Int
  reason    String
  createdAt DateTime @default(now())
  
  points    Points @relation(fields: [pointsId], references: [id])
  
  @@map("point_transactions")
}

// Update Activity model
model Activity {
  id        String @id @default(cuid())
  athleteId String
  name      String
  type      String
  distance  Float?
  duration  String?
  pace      String?
  date      DateTime
  source    String? // garmin, manual, strava
  createdAt DateTime @default(now())
  
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  
  @@map("activities")
}
```

#### 1.2 Database Migration
```bash
# Generate new Prisma client
npm run db:generate

# Create migration
npm run db:migrate

# Push to database
npm run db:push
```

### Phase 2: Authentication (Week 2)
**Priority: HIGH - Required for all features**

#### 2.1 Firebase Integration
```javascript
// config/firebaseAdmin.js
const admin = require('firebase-admin');

const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

module.exports = admin;
```

#### 2.2 JWT Middleware
```javascript
// middleware/verifyFirebaseToken.js
const admin = require('../config/firebaseAdmin');

const verifyFirebaseToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

#### 2.3 Auth Routes
```javascript
// routes/auth.js
router.post('/register', async (req, res) => {
  // Create athlete from Firebase user
  const athlete = await prisma.athlete.create({
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      firebaseId: req.user.uid,
      // ... other fields
    }
  });
  
  res.json({ athlete });
});

router.get('/me', verifyFirebaseToken, async (req, res) => {
  const athlete = await prisma.athlete.findUnique({
    where: { firebaseId: req.user.uid }
  });
  
  res.json({ athlete });
});
```

### Phase 3: RunCrew API (Week 3)
**Priority: HIGH - Core MVP1 functionality**

#### 3.1 Crew Routes
```javascript
// routes/crews.js
router.post('/', verifyFirebaseToken, async (req, res) => {
  // Create crew with athlete as leader
  const crew = await prisma.crew.create({
    data: {
      name: req.body.name,
      description: req.body.description,
      crewCode: generateCrewCode(),
      crewLeadId: req.athlete.id
    }
  });
  
  res.json({ crew });
});

router.post('/:crewId/join', verifyFirebaseToken, async (req, res) => {
  // Join crew via code
  const crew = await prisma.crew.findUnique({
    where: { crewCode: req.params.crewId }
  });
  
  const athleteCrew = await prisma.athleteCrew.create({
    data: {
      athleteId: req.athlete.id,
      crewId: crew.id
    }
  });
  
  res.json({ success: true });
});
```

#### 3.2 Leaderboard Logic
```javascript
// services/leaderboardService.js
const getCrewLeaderboard = async (crewId, period = 'week') => {
  const startDate = getPeriodStart(period);
  
  const leaderboard = await prisma.athlete.findMany({
    where: {
      crews: {
        some: { crewId }
      }
    },
    include: {
      activities: {
        where: {
          date: { gte: startDate }
        }
      }
    }
  });
  
  return leaderboard.map(athlete => ({
    id: athlete.id,
    name: `${athlete.firstName} ${athlete.lastName}`,
    miles: athlete.activities.reduce((sum, activity) => sum + (activity.distance || 0), 0),
    runs: athlete.activities.length,
    bestPace: getBestPace(athlete.activities)
  })).sort((a, b) => b.miles - a.miles);
};
```

### Phase 4: Garmin Integration (Week 4)
**Priority: MEDIUM - Real data for leaderboards**

#### 4.1 Garmin API Setup
```javascript
// services/garminService.js
const GarminConnect = require('garmin-connect');

const syncAthleteActivities = async (athleteId, garminCredentials) => {
  const garmin = new GarminConnect({
    username: garminCredentials.username,
    password: garminCredentials.password
  });
  
  await garmin.login();
  const activities = await garmin.getActivities();
  
  // Save activities to database
  for (const activity of activities) {
    await prisma.activity.create({
      data: {
        athleteId,
        name: activity.activityName,
        type: activity.activityType,
        distance: activity.distance,
        duration: activity.elapsedDuration,
        pace: calculatePace(activity.distance, activity.elapsedDuration),
        date: new Date(activity.startTimeLocal),
        source: 'garmin'
      }
    });
  }
};
```

#### 4.2 Activity Sync Endpoint
```javascript
// routes/activities.js
router.post('/sync', verifyFirebaseToken, async (req, res) => {
  const athlete = await prisma.athlete.findUnique({
    where: { firebaseId: req.user.uid }
  });
  
  await syncAthleteActivities(athlete.id, req.body.garminCredentials);
  
  res.json({ success: true });
});
```

### Phase 5: Points System (Week 5)
**Priority: MEDIUM - Gamification**

#### 5.1 Points Calculation
```javascript
// services/pointsService.js
const calculateActivityPoints = (activity) => {
  let points = 0;
  
  // Base points for activity
  points += Math.floor(activity.distance || 0);
  
  // Bonus for PRs
  if (isPersonalRecord(activity)) {
    points += 50;
  }
  
  // Bonus for consistency
  if (isStreakDay(activity)) {
    points += 10;
  }
  
  return points;
};

const awardPoints = async (athleteId, amount, reason) => {
  await prisma.points.upsert({
    where: { athleteId },
    update: { balance: { increment: amount } },
    create: { athleteId, balance: amount }
  });
  
  await prisma.pointTransaction.create({
    data: {
      pointsId: athleteId,
      amount,
      reason
    }
  });
};
```

## API Endpoints (MVP1)

### Authentication
- `POST /api/auth/register` - Create athlete from Firebase user
- `GET /api/auth/me` - Get current athlete
- `PUT /api/auth/profile` - Update athlete profile

### RunCrew Management
- `POST /api/crews` - Create new crew
- `GET /api/crews/:crewCode` - Get crew by code
- `POST /api/crews/:crewId/join` - Join crew
- `DELETE /api/crews/:crewId/leave` - Leave crew
- `GET /api/crews/:crewId/members` - Get crew members
- `GET /api/crews/:crewId/leaderboard` - Get crew leaderboard

### Activity Tracking
- `GET /api/activities` - Get athlete activities
- `POST /api/activities` - Create manual activity
- `POST /api/activities/sync` - Sync from Garmin
- `GET /api/activities/stats` - Get activity statistics
- `GET /api/activities/leaderboard` - Get activity leaderboard

### Points System
- `GET /api/points` - Get athlete points
- `POST /api/points/earn` - Award points
- `GET /api/points/transactions` - Get point history

## Database Schema (MVP1)

### Core Models
```prisma
model Athlete {
  id          String @id @default(cuid())
  firstName   String
  lastName    String
  age         Int
  city        String
  state       String
  profilePhoto String?
  firebaseId  String? @unique
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  crews       AthleteCrew[]
  activities  Activity[]
  points      Points?
  
  @@map("athletes")
}

model Crew {
  id        String @id @default(cuid())
  crewCode  String @unique
  name      String
  description String?
  crewLeadId String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  crewLead  Athlete @relation("CrewLeader", fields: [crewLeadId], references: [id])
  athletes  AthleteCrew[]
  
  @@map("crews")
}

model AthleteCrew {
  id        String @id @default(cuid())
  athleteId String
  crewId    String
  joinedAt  DateTime @default(now())
  
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  crew      Crew   @relation(fields: [crewId], references: [id])
  
  @@unique([athleteId, crewId])
  @@map("athlete_crews")
}

model Activity {
  id        String @id @default(cuid())
  athleteId String
  name      String
  type      String
  distance  Float?
  duration  String?
  pace      String?
  date      DateTime
  source    String?
  createdAt DateTime @default(now())
  
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  
  @@map("activities")
}

model Points {
  id        String @id @default(cuid())
  athleteId String @unique
  balance   Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  athlete      Athlete @relation(fields: [athleteId], references: [id])
  transactions PointTransaction[]
  
  @@map("points")
}

model PointTransaction {
  id        String @id @default(cuid())
  pointsId  String
  amount    Int
  reason    String
  createdAt DateTime @default(now())
  
  points    Points @relation(fields: [pointsId], references: [id])
  
  @@map("point_transactions")
}
```

## Implementation Timeline

### Week 1: Schema Refactor
- [ ] Update Prisma schema to Athlete-First Architecture
- [ ] Remove training-focused models
- [ ] Add RunCrew models (Crew, AthleteCrew)
- [ ] Add Points system models
- [ ] Run database migrations

### Week 2: Authentication
- [ ] Firebase Admin SDK setup
- [ ] JWT middleware for API protection
- [ ] Auth routes (register, login, profile)
- [ ] Athlete creation on first login

### Week 3: RunCrew API
- [ ] Crew creation and management
- [ ] Join/leave crew functionality
- [ ] Crew member management
- [ ] Basic leaderboard calculations

### Week 4: Garmin Integration
- [ ] Garmin Connect API setup
- [ ] Activity sync functionality
- [ ] Real-time leaderboard updates
- [ ] Activity aggregation for competitions

### Week 5: Points System
- [ ] Points calculation logic
- [ ] Achievement tracking
- [ ] Points API endpoints
- [ ] Gamification features

## Key Decisions

### 1. Athlete-First Architecture
- **Universal entity** - All features stem from athlete
- **Clean relationships** - Easy to query and manage
- **Scalable** - Ready for future features

### 2. Wire First, Build Second
- **Connect APIs** before building complex features
- **Test data flow** early and often
- **Avoid overbuilding** until everything works

### 3. Real Data Integration
- **Garmin Connect** for activity tracking
- **Firebase Auth** for user management
- **PostgreSQL** for data persistence

### 4. MVP1 Focus
- **RunCrew functionality** only
- **No training plans** (Phase 2)
- **No matching** (Phase 5)
- **No shopping** (Phase 4)

## Next Steps

1. **Start with schema refactor** - Everything depends on this
2. **Set up authentication** - Required for all features
3. **Build RunCrew API** - Core MVP1 functionality
4. **Add Garmin integration** - Real data for leaderboards
5. **Implement points system** - Gamification

## Notes

- **Don't overbuild** - Focus on MVP1 features only
- **Test early** - Make sure APIs connect properly
- **Use existing patterns** - Follow demo structure
- **Keep it simple** - Complex features come later
- **Wire first** - Connect before building

This approach provides a solid foundation for MVP1 while keeping the door open for future phases without overbuilding.
