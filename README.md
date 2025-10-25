# GoFast Backend SQL

A clean, AI-powered backend for GoFast built with Node.js, Express, PostgreSQL, and Prisma.

## Features

- 🤖 **AI-Powered Training Plans** - OpenAI generates personalized training plans
- 🏃‍♂️ **Smart Workout Analysis** - AI analyzes completed workouts and provides insights
- 📊 **PostgreSQL Database** - Clean, structured data with Prisma ORM
- 🔐 **JWT Authentication** - Secure user authentication
- 📱 **RESTful API** - Clean, documented API endpoints
- 🚀 **Modern Architecture** - Clean separation of concerns

## Tech Stack

- **Node.js** + **Express.js** - API server
- **PostgreSQL** - Database
- **Prisma** - ORM and database toolkit
- **OpenAI** - AI-powered training logic
- **JWT** - Authentication
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
OPENAI_API_KEY="your_openai_api_key_here"
JWT_SECRET="your_jwt_secret_here"
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
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Training Plans
- `POST /api/training/plans/generate` - Generate AI training plan
- `GET /api/training/plans` - Get user's training plans
- `GET /api/training/plans/:id` - Get specific plan
- `PUT /api/training/plans/:id` - Update plan

### Workouts
- `GET /api/training/plans/:planId/workouts/:week` - Get week workouts
- `PUT /api/training/workouts/:id/complete` - Mark workout complete
- `POST /api/training/workouts/analyze` - AI workout analysis

### Races
- `GET /api/races` - Get all races
- `POST /api/races` - Create race
- `POST /api/races/:id/register` - Register for race

### Activities
- `GET /api/activities` - Get user activities
- `POST /api/activities` - Create activity
- `GET /api/activities/user/:userId/summary` - Get activity summary

## Database Schema

### Core Models
- **User** - User accounts and profiles
- **RunnerProfile** - Detailed runner information
- **Race** - Race information and details
- **TrainingPlan** - AI-generated training plans
- **Workout** - Individual workout sessions
- **Activity** - Completed activities (Garmin sync)
- **Reflection** - User reflections and journaling

### Key Relationships
- User → RunnerProfile (1:1)
- User → TrainingPlan (1:many)
- Race → TrainingPlan (1:many)
- TrainingPlan → Workout (1:many)
- User → Activity (1:many)
- User → Reflection (1:many)

## AI Integration

### Training Plan Generation
The AI service generates personalized training plans based on:
- User's current fitness level
- Race goals and timeline
- Training preferences
- Injury history

### Workout Analysis
AI analyzes completed workouts to provide:
- Performance insights
- Pace analysis
- Effort level assessment
- Personalized recommendations

### Race Strategy
AI generates race-specific strategies including:
- Pacing plans
- Nutrition strategies
- Mental preparation
- Course-specific tactics

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
- `OPENAI_API_KEY` - OpenAI API key
- `JWT_SECRET` - JWT signing secret
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
