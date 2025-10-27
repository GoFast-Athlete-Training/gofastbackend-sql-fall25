# GoFast Delete Auth Route - Testing Guide

## Overview
Quick delete routes for testing and cleanup. Perfect for deleting yourself multiple times during development!

## Available Delete Endpoints

### 1. Delete by Athlete ID
```bash
DELETE http://localhost:3001/api/athlete/{athleteId}
```

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/athlete/athlete_adam_cole_001
```

### 2. Delete by Email
```bash
DELETE http://localhost:3001/api/athlete/email/{email}
```

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/athlete/email/adam@example.com
```

### 3. Delete by Firebase ID
```bash
DELETE http://localhost:3001/api/athlete/firebase/{firebaseId}
```

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/athlete/firebase/firebase_adam_cole_001
```

### 4. Bulk Delete
```bash
DELETE http://localhost:3001/api/athlete/bulk
Content-Type: application/json

{
  "ids": ["athlete_id_1", "athlete_id_2", "athlete_id_3"]
}
```

**Example:**
```bash
curl -X DELETE http://localhost:3001/api/athlete/bulk \
  -H "Content-Type: application/json" \
  -d '{"ids": ["athlete_adam_cole_001", "athlete_sarah_johnson_002"]}'
```

## Testing Flow

### Quick Delete Yourself
1. **Get your athlete ID** from SQL admin or create one
2. **Delete by ID**: `DELETE /api/athlete/{yourId}`
3. **Verify deletion** - Check database or try to find again
4. **Recreate** - Use signup flow to create new athlete
5. **Repeat** - Perfect for testing!

### Bulk Cleanup
1. **Get multiple athlete IDs** from database
2. **Bulk delete**: `DELETE /api/athlete/bulk` with array of IDs
3. **Verify cleanup** - Check database is clean
4. **Start fresh** - Ready for new testing

## Response Examples

### Successful Delete
```json
{
  "success": true,
  "message": "Athlete deleted successfully",
  "deletedAthlete": {
    "id": "athlete_adam_cole_001",
    "email": "adam@example.com",
    "firstName": "Adam",
    "lastName": "Cole"
  }
}
```

### Athlete Not Found
```json
{
  "error": "Athlete not found",
  "id": "nonexistent_id"
}
```

### Bulk Delete Success
```json
{
  "success": true,
  "message": "2 athletes deleted successfully",
  "deletedAthletes": [
    {
      "id": "athlete_adam_cole_001",
      "email": "adam@example.com",
      "firstName": "Adam",
      "lastName": "Cole"
    },
    {
      "id": "athlete_sarah_johnson_002",
      "email": "sarah@example.com",
      "firstName": "Sarah",
      "lastName": "Johnson"
    }
  ],
  "requestedCount": 2,
  "deletedCount": 2
}
```

## Common Use Cases

### 1. Testing Signup Flow
- Delete yourself after each test
- Recreate with signup
- Test different scenarios

### 2. Clean Database
- Bulk delete all test athletes
- Start with clean slate
- Test fresh signup flow

### 3. Debug Profile Issues
- Delete problematic athlete
- Recreate with different data
- Test profile completion

### 4. Test Admin Dashboard
- Delete athletes to test "no athletes" state
- Recreate to test loading states
- Test bulk operations

## Safety Notes

⚠️ **These routes are for development/testing only!**
- No authentication required (for now)
- No confirmation prompts
- Permanent deletion
- Use with caution in production

## Quick Commands

```bash
# Delete yourself by email (easiest)
curl -X DELETE http://localhost:3001/api/athlete/email/adam@example.com

# Delete yourself by ID
curl -X DELETE http://localhost:3001/api/athlete/athlete_adam_cole_001

# Clean up all test data
curl -X DELETE http://localhost:3001/api/athlete/bulk \
  -H "Content-Type: application/json" \
  -d '{"ids": ["id1", "id2", "id3"]}'
```

Perfect for rapid testing and cleanup! 🗑️✨
