# Backend Architecture Process

## Overview

Clean, scalable backend architecture for GoFast MVP1 with clear naming conventions and separation of concerns.

## Naming Conventions

### Routes vs Services

**Routes** - Simple Prisma mutations, single responsibility
- `authRoute.js` - Authentication endpoints
- `crewRoute.js` - Crew CRUD operations
- `activityRoute.js` - Activity CRUD operations
- `pointsRoute.js` - Points CRUD operations

**Services** - Complex business logic, multiple operations
- `authService.js` - Login, registration, token management
- `crewService.js` - Crew creation, joining, leaderboard calculations
- `activityService.js` - Garmin sync, activity aggregation, stats
- `pointsService.js` - Points calculation, achievement tracking
- `leaderboardService.js` - Leaderboard generation, rankings

## Architecture Pattern

### 1. Route Layer (Express)
```javascript
// routes/crewRoute.js
const express = require('express');
const crewService = require('../services/crewService');
const router = express.Router();

// Simple CRUD - Route handles directly
router.get('/:crewId', async (req, res) => {
  const crew = await prisma.crew.findUnique({
    where: { id: req.params.crewId }
  });
  res.json(crew);
});

// Complex logic - Delegate to service
router.post('/', async (req, res) => {
  const crew = await crewService.createCrew(req.body, req.user.id);
  res.json(crew);
});
```

### 2. Service Layer (Business Logic)
```javascript
// services/crewService.js
const prisma = require('../prisma');
const pointsService = require('./pointsService');

const createCrew = async (crewData, athleteId) => {
  // Complex business logic
  const crew = await prisma.crew.create({
    data: {
      ...crewData,
      crewLeadId: athleteId,
      crewCode: generateCrewCode()
    }
  });
  
  // Award points for creating crew
  await pointsService.awardPoints(athleteId, 50, 'Crew Created');
  
  return crew;
};

module.exports = { createCrew };
```

### 3. Controller Layer (Optional)
```javascript
// controllers/crewController.js
const crewService = require('../services/crewService');

const createCrew = async (req, res) => {
  try {
    const crew = await crewService.createCrew(req.body, req.user.id);
    res.json(crew);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { createCrew };
```

## File Structure

```
backend/
├── routes/
│   ├── authRoute.js
│   ├── crewRoute.js
│   ├── activityRoute.js
│   └── pointsRoute.js
├── services/
│   ├── authService.js
│   ├── crewService.js
│   ├── activityService.js
│   ├── pointsService.js
│   └── leaderboardService.js
├── controllers/
│   ├── authController.js
│   ├── crewController.js
│   ├── activityController.js
│   └── pointsController.js
├── middleware/
│   ├── authMiddleware.js
│   └── validationMiddleware.js
├── utils/
│   ├── helpers.js
│   └── constants.js
└── prisma/
    └── schema.prisma
```

## Decision Matrix

### Use Route When:
- ✅ Simple CRUD operations
- ✅ Single Prisma query
- ✅ No business logic
- ✅ Direct data transformation

**Example:**
```javascript
// routes/crewRoute.js
router.get('/:crewId/members', async (req, res) => {
  const members = await prisma.athleteCrew.findMany({
    where: { crewId: req.params.crewId },
    include: { athlete: true }
  });
  res.json(members);
});
```

### Use Service When:
- ✅ Multiple database operations
- ✅ Business logic required
- ✅ External API calls
- ✅ Data aggregation
- ✅ Cross-service communication

**Example:**
```javascript
// services/crewService.js
const createCrew = async (crewData, athleteId) => {
  // 1. Create crew
  const crew = await prisma.crew.create({...});
  
  // 2. Add creator as member
  await prisma.athleteCrew.create({...});
  
  // 3. Award points
  await pointsService.awardPoints(athleteId, 50, 'Crew Created');
  
  // 4. Send notification
  await notificationService.sendCrewCreated(crew);
  
  return crew;
};
```

## Service Dependencies

### Service Communication
```javascript
// services/crewService.js
const pointsService = require('./pointsService');
const activityService = require('./activityService');

const updateLeaderboard = async (crewId) => {
  // Get crew activities
  const activities = await activityService.getCrewActivities(crewId);
  
  // Calculate leaderboard
  const leaderboard = await leaderboardService.calculateLeaderboard(activities);
  
  // Award points for top performers
  await pointsService.awardLeaderboardPoints(leaderboard);
  
  return leaderboard;
};
```

## Error Handling

### Route Level
```javascript
// routes/crewRoute.js
router.post('/', async (req, res) => {
  try {
    const crew = await crewService.createCrew(req.body, req.user.id);
    res.json(crew);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Service Level
```javascript
// services/crewService.js
const createCrew = async (crewData, athleteId) => {
  try {
    // Validate input
    if (!crewData.name) {
      throw new Error('Crew name is required');
    }
    
    // Check if athlete exists
    const athlete = await prisma.athlete.findUnique({
      where: { id: athleteId }
    });
    
    if (!athlete) {
      throw new Error('Athlete not found');
    }
    
    // Create crew
    const crew = await prisma.crew.create({...});
    
    return crew;
  } catch (error) {
    throw new Error(`Failed to create crew: ${error.message}`);
  }
};
```

## Testing Strategy

### Route Testing
```javascript
// tests/routes/crewRoute.test.js
describe('Crew Routes', () => {
  test('GET /crews/:id should return crew', async () => {
    const response = await request(app)
      .get('/api/crews/123')
      .expect(200);
    
    expect(response.body).toHaveProperty('id');
  });
});
```

### Service Testing
```javascript
// tests/services/crewService.test.js
describe('Crew Service', () => {
  test('createCrew should create crew and award points', async () => {
    const crewData = { name: 'Test Crew' };
    const athleteId = '123';
    
    const crew = await crewService.createCrew(crewData, athleteId);
    
    expect(crew).toHaveProperty('id');
    expect(crew.name).toBe('Test Crew');
  });
});
```

## Migration Strategy

### Phase 1: Clean Up Existing Routes
- [ ] Delete deprecated routes
- [ ] Rename existing routes to follow convention
- [ ] Extract complex logic to services

### Phase 2: Implement Services
- [ ] Create service layer for complex operations
- [ ] Move business logic from routes to services
- [ ] Implement service-to-service communication

### Phase 3: Add Controllers (Optional)
- [ ] Add controller layer for complex error handling
- [ ] Implement consistent response formatting
- [ ] Add request validation

## Benefits

### 1. Clear Separation
- **Routes** - HTTP handling
- **Services** - Business logic
- **Controllers** - Error handling

### 2. Testability
- **Route tests** - HTTP endpoints
- **Service tests** - Business logic
- **Integration tests** - Full flows

### 3. Maintainability
- **Single responsibility** - Each file has one job
- **Reusability** - Services can be used by multiple routes
- **Scalability** - Easy to add new features

### 4. Performance
- **Efficient queries** - Services optimize database calls
- **Caching** - Services can implement caching
- **Background jobs** - Services can handle async operations

## Examples

### Simple Route (CRUD)
```javascript
// routes/pointsRoute.js
router.get('/:athleteId', async (req, res) => {
  const points = await prisma.points.findUnique({
    where: { athleteId: req.params.athleteId }
  });
  res.json(points);
});
```

### Complex Service (Business Logic)
```javascript
// services/pointsService.js
const awardPoints = async (athleteId, amount, reason) => {
  // 1. Update points balance
  const points = await prisma.points.upsert({
    where: { athleteId },
    update: { balance: { increment: amount } },
    create: { athleteId, balance: amount }
  });
  
  // 2. Create transaction record
  await prisma.pointTransaction.create({
    data: {
      pointsId: points.id,
      amount,
      reason
    }
  });
  
  // 3. Check for achievements
  await checkAchievements(athleteId, points.balance);
  
  return points;
};
```

This architecture provides a clean, scalable foundation for the GoFast backend while maintaining clear separation of concerns and easy testing.
