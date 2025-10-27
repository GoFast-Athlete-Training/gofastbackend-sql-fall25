const { PrismaClient } = require('@prisma/client');
const AIService = require('../services/aiService');

const prisma = new PrismaClient();

class TrainingController {
  /**
   * Generate a new training plan using AI
   */
  static async generatePlan(req, res) {
    try {
      const { userId, raceId, preferences } = req.body;

      // Get user profile and race info
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { profile: true }
      });

      const race = await prisma.race.findUnique({
        where: { id: raceId }
      });

      if (!user || !race) {
        return res.status(404).json({ error: 'User or race not found' });
      }

      // Generate AI-powered training plan
      const aiPlan = await AIService.generateTrainingPlan(
        user.profile,
        race,
        preferences
      );

      // Create training plan in database
      const trainingPlan = await prisma.trainingPlan.create({
        data: {
          userId,
          raceId,
          startDate: new Date(),
          raceDate: race.date,
          totalWeeks: aiPlan.planOverview.totalWeeks,
          planData: aiPlan,
          phase: 'base'
        }
      });

      // Create individual workouts
      for (const week of aiPlan.weeklyPlans) {
        for (const workout of week.workouts) {
          await prisma.workout.create({
            data: {
              trainingPlanId: trainingPlan.id,
              weekNumber: week.week,
              dayOfWeek: workout.day,
              workoutType: workout.type,
              distance: workout.distance,
              pace: workout.pace,
              description: workout.description,
              segments: workout.segments
            }
          });
        }
      }

      res.json({
        success: true,
        plan: trainingPlan,
        message: 'Training plan generated successfully!'
      });

    } catch (error) {
      console.error('Generate plan error:', error);
      res.status(500).json({ error: 'Failed to generate training plan' });
    }
  }

  /**
   * Get user's training plans
   */
  static async getPlans(req, res) {
    try {
      const { userId } = req.query;

      const plans = await prisma.trainingPlan.findMany({
        where: { userId },
        include: {
          race: true,
          workouts: {
            orderBy: [
              { weekNumber: 'asc' },
              { dayOfWeek: 'asc' }
            ]
          }
        }
      });

      res.json({ plans });
    } catch (error) {
      console.error('Get plans error:', error);
      res.status(500).json({ error: 'Failed to fetch training plans' });
    }
  }

  /**
   * Get specific training plan
   */
  static async getPlan(req, res) {
    try {
      const { id } = req.params;

      const plan = await prisma.trainingPlan.findUnique({
        where: { id },
        include: {
          race: true,
          workouts: {
            orderBy: [
              { weekNumber: 'asc' },
              { dayOfWeek: 'asc' }
            ]
          }
        }
      });

      if (!plan) {
        return res.status(404).json({ error: 'Training plan not found' });
      }

      res.json({ plan });
    } catch (error) {
      console.error('Get plan error:', error);
      res.status(500).json({ error: 'Failed to fetch training plan' });
    }
  }

  /**
   * Get workouts for a specific week
   */
  static async getWeekWorkouts(req, res) {
    try {
      const { planId, week } = req.params;

      const workouts = await prisma.workout.findMany({
        where: {
          trainingPlanId: planId,
          weekNumber: parseInt(week)
        },
        orderBy: { dayOfWeek: 'asc' }
      });

      res.json({ workouts });
    } catch (error) {
      console.error('Get week workouts error:', error);
      res.status(500).json({ error: 'Failed to fetch week workouts' });
    }
  }

  /**
   * Mark workout as completed
   */
  static async completeWorkout(req, res) {
    try {
      const { id } = req.params;
      const { actualDistance, actualPace, actualDuration, notes } = req.body;

      const workout = await prisma.workout.update({
        where: { id },
        data: {
          completed: true,
          completedAt: new Date(),
          actualDistance,
          actualPace,
          actualDuration,
          notes
        }
      });

      res.json({ 
        success: true, 
        workout,
        message: 'Workout completed! Great job!' 
      });
    } catch (error) {
      console.error('Complete workout error:', error);
      res.status(500).json({ error: 'Failed to complete workout' });
    }
  }

  /**
   * Analyze a completed workout using AI
   */
  static async analyzeWorkout(req, res) {
    try {
      const { workoutId } = req.body;

      const workout = await prisma.workout.findUnique({
        where: { id: workoutId },
        include: {
          trainingPlan: {
            include: {
              user: {
                include: { profile: true }
              }
            }
          }
        }
      });

      if (!workout) {
        return res.status(404).json({ error: 'Workout not found' });
      }

      // Get user's recent activities for context
      const recentActivities = await prisma.activity.findMany({
        where: { userId: workout.trainingPlan.userId },
        orderBy: { date: 'desc' },
        take: 5
      });

      // Analyze with AI
      const analysis = await AIService.analyzeWorkout(
        {
          type: workout.workoutType,
          distance: workout.actualDistance,
          duration: workout.actualDuration,
          pace: workout.actualPace,
          heartRate: null, // Would come from activity data
          weather: null
        },
        workout.trainingPlan.user.profile,
        recentActivities
      );

      res.json({ analysis });
    } catch (error) {
      console.error('Analyze workout error:', error);
      res.status(500).json({ error: 'Failed to analyze workout' });
    }
  }
}

module.exports = TrainingController;
