const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AIService {
  /**
   * Generate a personalized training plan using AI
   */
  static async generateTrainingPlan(userProfile, raceInfo, preferences) {
    const prompt = `
You are an expert running coach. Generate a detailed training plan for a runner.

RUNNER PROFILE:
- Experience: ${userProfile.experience}
- Current Pace: ${userProfile.currentPace}
- Weekly Mileage: ${userProfile.weeklyMileage} miles
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}

RACE INFO:
- Distance: ${raceInfo.distance}
- Date: ${raceInfo.date}
- Goal Time: ${raceInfo.goalTime}
- Current Date: ${new Date().toISOString().split('T')[0]}

PREFERENCES:
- Training Days: ${preferences.trainingDays} days per week
- Preferred Time: ${preferences.preferredTime}
- Injury History: ${preferences.injuryHistory}

Generate a JSON response with this structure:
{
  "planOverview": {
    "totalWeeks": number,
    "phases": {
      "base": { "weeks": number, "description": "string" },
      "build": { "weeks": number, "description": "string" },
      "peak": { "weeks": number, "description": "string" },
      "taper": { "weeks": number, "description": "string" }
    }
  },
  "weeklyPlans": [
    {
      "week": number,
      "phase": "string",
      "totalMileage": number,
      "workouts": [
        {
          "day": "string",
          "type": "string",
          "distance": number,
          "pace": "string",
          "description": "string",
          "segments": [
            {
              "type": "string",
              "distance": number,
              "pace": "string"
            }
          ]
        }
      ]
    }
  ]
}

Make the plan realistic, progressive, and personalized to their current fitness level.
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert running coach with 20+ years of experience. Generate detailed, personalized training plans that are safe, progressive, and effective."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate training plan');
    }
  }

  /**
   * Analyze a completed workout and provide insights
   */
  static async analyzeWorkout(workoutData, userProfile) {
    const prompt = `
Analyze this completed workout and provide insights:

WORKOUT DATA:
- Type: ${workoutData.type}
- Distance: ${workoutData.distance} miles
- Duration: ${workoutData.duration}
- Pace: ${workoutData.pace}
- Heart Rate: ${JSON.stringify(workoutData.heartRate)}
- Weather: ${JSON.stringify(workoutData.weather)}

USER PROFILE:
- Experience: ${userProfile.experience}
- Goal Pace: ${userProfile.targetPace}
- Weekly Mileage: ${userProfile.weeklyMileage}

Provide a JSON response with:
{
  "analysis": {
    "performance": "string (excellent/good/fair/needs improvement)",
    "paceAnalysis": "string",
    "effortLevel": "string",
    "recommendations": ["string", "string"]
  },
  "insights": {
    "trends": "string",
    "improvements": "string",
    "nextSteps": "string"
  },
  "motivation": {
    "message": "string",
    "achievements": ["string"]
  }
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a supportive running coach. Analyze workouts and provide encouraging, actionable feedback."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        max_tokens: 1000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to analyze workout');
    }
  }

  /**
   * Generate personalized race strategy
   */
  static async generateRaceStrategy(raceInfo, userProfile, trainingHistory) {
    const prompt = `
Generate a race strategy for this runner:

RACE INFO:
- Distance: ${raceInfo.distance}
- Course: ${raceInfo.courseType}
- Elevation: ${raceInfo.elevationGain} feet
- Weather: ${raceInfo.weatherNotes}

RUNNER PROFILE:
- Goal Time: ${userProfile.targetTime}
- Current Fitness: ${userProfile.experience}
- Training History: ${JSON.stringify(trainingHistory)}

Provide a JSON response with:
{
  "strategy": {
    "pacing": {
      "startPace": "string",
      "targetPace": "string",
      "finishPace": "string",
      "notes": "string"
    },
    "nutrition": {
      "preRace": "string",
      "duringRace": "string",
      "hydration": "string"
    },
    "mental": {
      "keyPoints": ["string"],
      "motivation": "string"
    }
  },
  "courseStrategy": {
    "hills": "string",
    "weather": "string",
    "crowds": "string"
  }
}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are an expert race strategist. Create detailed, personalized race plans that maximize performance while staying safe."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 2000
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to generate race strategy');
    }
  }
}

module.exports = AIService;
