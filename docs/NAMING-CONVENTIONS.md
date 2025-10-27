# GoFast Naming & Separation of Concerns

## CRITICAL: Frontend vs Backend Responsibilities

### 🚨 **AUTH IS FRONTEND ONLY**
- **Firebase Authentication** - User login/logout
- **Token Management** - Firebase ID tokens
- **Auth State** - Logged in/out status
- **User Interface** - Sign-in/sign-up forms

### 🚨 **BACKEND IS DATA ONLY**
- **Athlete Records** - Create/find athlete data
- **Data Linking** - Link firebaseId to athleteId
- **Business Logic** - RunCrew, Activities, Points
- **API Endpoints** - Data operations

## File Naming Conventions

### Frontend Files (Auth Focused)
```
src/
├── firebase.js              ← Firebase client config
├── Pages/
│   ├── SplashPage.jsx       ← Auth state router
│   ├── SigninPage.jsx       ← Firebase sign-in
│   └── AthleteHome.jsx      ← Post-auth navigation
```

### Backend Files (Data Focused)
```
routes/Athlete/
└── athleteCreateRoute.js    ← Create/find athlete records

middleware/
└── firebaseMiddleware.js    ← Verify Firebase tokens

config/
└── firebaseAdmin.js         ← Firebase Admin SDK
```

## Endpoint Naming

### ❌ WRONG (Auth-focused)
- `/auth/login` - Auth is frontend!
- `/auth/register` - Auth is frontend!
- `/auth/verify` - Auth is frontend!

### ✅ CORRECT (Data-focused)
- `/athleteuser` - Create/find athlete from Firebase data
- `/athlete/:id` - Get athlete data
- `/runcrew/:athleteId` - Get athlete's crews

## Integration Patterns

### Firebase Integration
- **Frontend:** Firebase Client SDK (browser auth)
- **Backend:** Firebase Admin SDK (token verification)
- **Flow:** Frontend auth → Backend data operations

### Garmin Integration
- **Frontend:** OAuth flow, user consent
- **Backend:** API calls, data sync, storage
- **Flow:** Frontend consent → Backend sync

### Future Integrations
- **Frontend:** User interface, OAuth flows
- **Backend:** API calls, data processing, storage
- **Pattern:** Frontend handles user interaction, Backend handles data

## Common Mistakes to Avoid

### 1. Backend "Auth" Routes
```javascript
// ❌ WRONG - Auth is frontend!
router.post('/auth/login', ...)

// ✅ CORRECT - Data operations
router.post('/athleteuser', ...)
```

### 2. Frontend "Data" Operations
```javascript
// ❌ WRONG - Data is backend!
const athlete = await createAthlete(data)

// ✅ CORRECT - Auth operations
const user = await signInWithGoogle()
```

### 3. Mixed Responsibilities
```javascript
// ❌ WRONG - Auth + Data mixed
router.post('/auth/create-athlete', ...)

// ✅ CORRECT - Clear separation
// Frontend: Firebase auth
// Backend: Athlete data operations
```

## Architecture Principles

### 1. Single Responsibility
- **Frontend:** User interface + authentication
- **Backend:** Data operations + business logic

### 2. Clear Boundaries
- **Firebase:** Handles authentication
- **Backend:** Handles data persistence
- **Frontend:** Handles user experience

### 3. Consistent Naming
- **Routes:** `athleteCreateRoute.js` (not `authRoute.js`)
- **Middleware:** `firebaseMiddleware.js` (not `authMiddleware.js`)
- **Endpoints:** `/athleteuser` (not `/auth/login`)

## Future Integrations

### Strava Integration
- **Frontend:** Strava OAuth flow
- **Backend:** `stravaSyncRoute.js` - Sync activity data

### Payment Integration
- **Frontend:** Payment forms, checkout
- **Backend:** `paymentRoute.js` - Process payments

### Notification Integration
- **Frontend:** Notification preferences
- **Backend:** `notificationRoute.js` - Send notifications

## Key Takeaways

1. **AUTH = FRONTEND** - Firebase handles authentication
2. **DATA = BACKEND** - Backend handles data operations
3. **NAMING MATTERS** - Clear, specific file/route names
4. **SEPARATION OF CONCERNS** - Frontend UI, Backend data
5. **CONSISTENT PATTERNS** - Apply same principles to all integrations

This naming convention prevents confusion and ensures clear boundaries between frontend authentication and backend data operations.
