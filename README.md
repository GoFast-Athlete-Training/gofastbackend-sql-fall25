# GoFast Backend SQL - MVP1 (RunCrew Focus)

A clean, community-focused backend for GoFast MVP1 built with Node.js, Express, PostgreSQL, and Prisma.

## MVP1 Features (RunCrew Phase)

- 👥 **RunCrew Management** - Create and join running crews with leaderboards
- 🏃‍♂️ **Activity Tracking** - Garmin Connect integration for real-time activity sync
- 📊 **Leaderboards** - Weekly/monthly competitions (miles, pace, calories)
- 🏆 **Points System** - Achievement tracking and crew challenges
- 🔐 **Firebase + JWT Authentication** - Secure user authentication
- 📱 **RESTful API** - Clean, documented API endpoints
- 🚀 **Athlete-First Architecture** - Universal athlete relationships

## Tech Stack

- **Node.js** + **Express.js** - API server
- **PostgreSQL** - Database
- **Prisma** - ORM and database toolkit
- **Firebase Admin** - User authentication
- **JWT** - API authentication
- **Garmin Connect API** - Activity tracking
- **CORS** - Cross-origin resource sharing

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
```bash
cp env.example .env
```

Edit `.env` with your configuration:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gofast_db"
FIREBASE_PROJECT_ID="your_firebase_project_id"
FIREBASE_PRIVATE_KEY="your_firebase_private_key"
FIREBASE_CLIENT_EMAIL="your_firebase_client_email"
JWT_SECRET="your_jwt_secret_here"
GARMIN_CONSUMER_KEY="your_garmin_consumer_key"
GARMIN_CONSUMER_SECRET="your_garmin_consumer_secret"
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Or run migrations
npm run db:migrate
```

### 4. Start Development Server
```bash
npm run dev
```

API will be available at `http://localhost:3001`

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Authentication
- `POST /api/auth/register` - Register new athlete
- `POST /api/auth/login` - Login athlete
- `GET /api/auth/me` - Get current athlete

### RunCrew Management
- `POST /api/crews` - Create new crew
- `GET /api/crews/:crewCode` - Get crew by code
- `POST /api/crews/:crewId/join` - Join crew
- `DELETE /api/crews/:crewId/leave` - Leave crew
- `GET /api/crews/:crewId/members` - Get crew members
- `GET /api/crews/:crewId/leaderboard` - Get crew leaderboard

### Activity Tracking
- `GET /api/activities` - Get athlete activities
- `POST /api/activities` - Create activity
- `POST /api/activities/sync` - Sync from Garmin
- `GET /api/activities/stats` - Get activity statistics
- `GET /api/activities/leaderboard` - Get activity leaderboard

### Points System
- `GET /api/points` - Get athlete points
- `POST /api/points/earn` - Earn points
- `POST /api/points/spend` - Spend points
- `GET /api/points/transactions` - Get point history

## Database Schema

### Core Models (MVP1)
- **Athlete** - User accounts and profiles (universal entity)
- **Crew** - Running crews with join codes
- **AthleteCrew** - Many-to-many relationship (athletes ↔ crews)
- **Activity** - Completed activities (Garmin sync)
- **Points** - Points balance and transactions
- **PointTransaction** - Points earned/spent history

### Key Relationships
- Athlete → Crew (many-to-many via AthleteCrew)
- Athlete → Activity (one-to-many)
- Athlete → Points (one-to-one)
- Points → PointTransaction (one-to-many)
- Crew → AthleteCrew (one-to-many)

## Garmin Integration

### Activity Sync
The Garmin Connect API integration provides:
- **Real-time activity sync** from Garmin devices
- **Automatic leaderboard updates** when new activities are logged
- **Activity aggregation** for crew competitions
- **Points calculation** based on activity achievements

### Leaderboard Calculations
- **Weekly/Monthly totals** - Miles, calories, runs
- **Best splits** - Fastest mile, 5K, 10K times
- **Consistency metrics** - Streaks, frequency
- **Crew rankings** - Relative performance within crew

### Points System
- **Activity completion** - Points for logging runs
- **Achievement bonuses** - PRs, streaks, milestones
- **Crew participation** - Points for crew activities
- **Leaderboard positions** - Bonus points for top rankings

## Development

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database
npx prisma migrate reset

# Deploy to production
npx prisma migrate deploy
```

### API Testing
Use tools like Postman or curl to test endpoints:

```bash
# Health check
curl http://localhost:3001/api/health

# Generate training plan
curl -X POST http://localhost:3001/api/training/plans/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "user_id", "raceId": "race_id", "preferences": {...}}'
```

## Deployment

### Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `FIREBASE_PROJECT_ID` - Firebase project ID
- `FIREBASE_PRIVATE_KEY` - Firebase private key
- `FIREBASE_CLIENT_EMAIL` - Firebase client email
- `JWT_SECRET` - JWT signing secret
- `GARMIN_CONSUMER_KEY` - Garmin API consumer key
- `GARMIN_CONSUMER_SECRET` - Garmin API consumer secret
- `PORT` - Server port (default: 3001)
- `NODE_ENV` - Environment (development/production)

### Production Setup
1. Set up PostgreSQL database
2. Configure environment variables
3. Run database migrations
4. Deploy to your hosting platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
