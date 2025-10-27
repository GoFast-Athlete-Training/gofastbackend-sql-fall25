# Athlete-First Architecture

## Overview

GoFast uses an **Athlete-centric architecture** where `athleteId` is the universal source of all relationships throughout the system. The athlete is the central entity that connects to all other features - crews, matches, training, shopping, etc.

## Core Principles

### 1. Athlete as Universal Entity
- **`athleteId`** = Primary identifier for ALL user operations
- **Universal relationships** = Athlete connects to everything
- **Single source of truth** = All features stem from the athlete
- **Domain-agnostic** = "Athlete" works for running, cycling, any sport

### 2. Relationship-First Design
- **Athlete → Crew** = Many-to-many (athletes can be in multiple crews)
- **Athlete → Match** = One-to-many (athlete has multiple running partners)
- **Athlete → Training** = One-to-many (athlete has multiple training plans)
- **Athlete → Activity** = One-to-many (athlete logs multiple activities)
- **Athlete → Order** = One-to-many (athlete has shopping history)

### 3. ID Strategy
- **Prisma auto-generates IDs** = `id String @id @default(cuid())`
- **String codes as secondary** = Human-readable codes for sharing
- **Every table gets an ID** = Even with codes, we need IDs for relationships
- **No flags** = Use IDs for admin privileges (crewLeadId)

## Core Data Collection

### Profile Setup (ProfileSetupUniversal.jsx)
```javascript
{
  firstName: String,
  lastName: String,
  age: Int,
  city: String,
  state: String,
  profilePhoto: String?
}
```

### Training Setup (TrainingPlanSetup.jsx)
```javascript
{
  raceName: String,
  raceDistance: String,
  targetTime: String,
  raceDate: DateTime,
  currentPace: String,
  weeklyMileage: Int,
  experience: String,
  trainingDays: String[]
}
```

## Prisma Schema

### Core Athlete Model
```prisma
model Athlete {
  id          String @id @default(cuid())
  firstName   String
  lastName    String
  age         Int
  city        String
  state       String
  profilePhoto String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  crews       AthleteCrew[]
  matches     Match[]
  trainingPlans TrainingPlan[]
  activities  Activity[]
  orders      Order[]
  points      Points?
  
  @@map("athletes")
}
```

### Crew System
```prisma
model Crew {
  id        String @id @default(cuid())
  crewCode  String @unique  // Human-readable code for sharing
  name      String
  description String?
  crewLeadId String  // Admin privileges - no flags!
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  crewLead  Athlete @relation("CrewLeader", fields: [crewLeadId], references: [id])
  athletes  AthleteCrew[]
  
  @@map("crews")
}

model AthleteCrew {
  id        String @id @default(cuid())
  athleteId String
  crewId    String
  joinedAt  DateTime @default(now())
  
  // Relationships
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  crew      Crew   @relation(fields: [crewId], references: [id])
  
  @@unique([athleteId, crewId])
  @@map("athlete_crews")
}
```

### Training System
```prisma
model TrainingPlan {
  id          String @id @default(cuid())
  athleteId   String
  raceName    String
  raceDistance String
  targetTime  String
  raceDate    DateTime
  currentPace String
  weeklyMileage Int
  experience  String
  trainingDays String[] // Array of days
  status      String @default("active") // active, completed, paused
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  athlete     Athlete @relation(fields: [athleteId], references: [id])
  
  @@map("training_plans")
}
```

### Matching System
```prisma
model Match {
  id        String @id @default(cuid())
  athleteId String  // The athlete who initiated the match
  partnerId String  // The athlete being matched with
  status    String @default("pending") // pending, accepted, declined
  message   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  athlete   Athlete @relation("MatchAthlete", fields: [athleteId], references: [id])
  partner   Athlete @relation("MatchPartner", fields: [partnerId], references: [id])
  
  @@unique([athleteId, partnerId])
  @@map("matches")
}
```

### Activity Tracking
```prisma
model Activity {
  id        String @id @default(cuid())
  athleteId String
  type      String // run, bike, swim, etc.
  distance  Float?
  duration  Int? // in minutes
  pace      String?
  calories  Int?
  source    String? // garmin, strava, manual
  date      DateTime
  createdAt DateTime @default(now())
  
  // Relationships
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  
  @@map("activities")
}
```

### Points System
```prisma
model Points {
  id        String @id @default(cuid())
  athleteId String @unique
  balance   Int @default(0)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  transactions PointTransaction[]
  
  @@map("points")
}

model PointTransaction {
  id        String @id @default(cuid())
  pointsId  String
  amount    Int // positive for earned, negative for spent
  reason    String // "5K PR", "Crew Challenge", "Merch Purchase"
  createdAt DateTime @default(now())
  
  // Relationships
  points    Points @relation(fields: [pointsId], references: [id])
  
  @@map("point_transactions")
}
```

### Shopping System
```prisma
model Order {
  id        String @id @default(cuid())
  athleteId String
  total     Float
  status    String @default("pending") // pending, completed, cancelled
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  // Relationships
  athlete   Athlete @relation(fields: [athleteId], references: [id])
  items     OrderItem[]
  
  @@map("orders")
}

model OrderItem {
  id        String @id @default(cuid())
  orderId   String
  productId String
  quantity  Int
  price     Float
  
  // Relationships
  order     Order @relation(fields: [orderId], references: [id])
  
  @@map("order_items")
}
```

## API Endpoints

### Athlete Management
- `POST /api/athletes` → Create new athlete
- `GET /api/athletes/:athleteId` → Get athlete details
- `PUT /api/athletes/:athleteId` → Update athlete

### Crew Management
- `POST /api/crews` → Create new crew (athlete becomes crewLead)
- `GET /api/crews/:crewCode` → Get crew by code
- `POST /api/crews/:crewId/join` → Join crew
- `DELETE /api/crews/:crewId/leave` → Leave crew

### Training Plans
- `POST /api/training/plans` → Create training plan
- `GET /api/athletes/:athleteId/training-plans` → Get athlete's plans
- `PUT /api/training/plans/:planId` → Update plan

### Matching
- `POST /api/matches` → Create match request
- `GET /api/athletes/:athleteId/matches` → Get athlete's matches
- `PUT /api/matches/:matchId/respond` → Accept/decline match

## Admin Privileges

### Crew Admin Check
```javascript
// Check if athlete is crew leader
const crew = await prisma.crew.findUnique({
  where: { id: crewId },
  include: { crewLead: true }
});

if (crew.crewLeadId === athleteId) {
  // Admin privileges - can manage crew
}
```

### No Flags Approach
- ✅ **crewLeadId** - Direct relationship to admin
- ✅ **Clean queries** - No boolean flags to check
- ✅ **Clear ownership** - One leader per crew
- ✅ **Scalable** - Easy to add co-leaders later if needed

## Data Flow

### User Registration
```
1. Firebase Auth → User logs in
2. Backend API → POST /api/athletes
3. Prisma → Generates unique athleteId
4. Response → Returns athleteId to frontend
5. Frontend → Stores athleteId in localStorage
```

### Crew Creation
```
1. Frontend → Gets athleteId from localStorage
2. Backend API → POST /api/crews
3. Prisma → Creates Crew with crewLeadId = athleteId
4. Response → Returns crew with crewCode
```

## Benefits

### 1. Universal Relationships
- **Single athleteId** connects to all features
- **Consistent patterns** across all operations
- **Easy to query** athlete's complete data

### 2. Clean Admin System
- **No flags** - Use IDs for privileges
- **Direct relationships** - crewLeadId points to admin
- **Scalable** - Easy to add more admin types

### 3. Prisma Benefits
- **Auto-generated IDs** - No manual ID management
- **Type safety** - Generated TypeScript types
- **Relationship management** - Automatic foreign keys
- **Query optimization** - Built-in indexing

## Next Steps

1. **Start with core models** - Athlete, Crew, AthleteCrew
2. **Add training system** - TrainingPlan model
3. **Build matching** - Match model
4. **Add activity tracking** - Activity model
5. **Implement points** - Points, PointTransaction
6. **Add shopping** - Order, OrderItem

## Migration Strategy

### Phase 1: Core Athlete System
- Athlete model with basic profile data
- Crew system with crewLeadId admin
- Basic API endpoints

### Phase 2: Training Integration
- TrainingPlan model
- Integration with existing training flow
- Training plan generation

### Phase 3: Social Features
- Match system
- Activity tracking
- Points system

### Phase 4: E-commerce
- Order system
- Shopping integration
- Points redemption

This architecture provides a solid foundation that can grow with the application while maintaining clean relationships and admin privileges through IDs rather than flags.
