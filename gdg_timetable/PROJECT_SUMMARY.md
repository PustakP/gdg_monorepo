# Smart Course Scheduler - Project Summary

## Project Overview

The Smart Course Scheduler is an AI-powered web application that solves the real-world problem of course selection for university students. It helps students choose courses that fit their existing timetable while ensuring they don't exceed credit limits and avoid scheduling conflicts.

## Problem Statement

**Real-World Problem**: University students often struggle with course selection because:
- They need to manually check for schedule conflicts
- It's difficult to optimize course combinations within credit limits
- Course information is scattered across different systems
- Manual analysis is time-consuming and error-prone

**Target Community**: University students, particularly those in their intermediate to advanced years who have more flexibility in course selection.

## Solution

Our prototype provides an intelligent course recommendation system that:
1. **Analyzes existing timetables** using AI image recognition
2. **Suggests compatible courses** based on available slots
3. **Optimizes credit allocation** within the 25-credit limit
4. **Prevents scheduling conflicts** automatically

## Google Technologies Used

### ✅ Required Technologies

1. **Firebase Studio**
   - **Authentication**: Google OAuth for secure user login
   - **Firestore Database**: For storing user data and course information
   - **Firebase Storage**: For timetable image uploads
   - **Configuration**: Complete Firebase project setup

2. **Google AI Integration - Gemini API**
   - **Timetable Analysis**: Uses Gemini 1.5 Flash model to extract course information from uploaded images
   - **Course Recommendations**: AI-powered suggestions for optimal course combinations
   - **Intelligent Processing**: Natural language understanding for course descriptions and reasoning

3. **IDX Compatibility**
   - Built with Next.js 15 for optimal Google IDX support
   - Modern development workflow compatible with cloud-based development

## Key Features Implemented

### 1. Authentication System
- **Google OAuth Integration**: Secure login using Firebase Auth
- **Session Management**: Persistent user sessions with automatic token refresh
- **User Context**: React context for authentication state management

### 2. Timetable Analysis
- **Image Upload**: Drag-and-drop interface for timetable screenshots
- **AI Processing**: Gemini API analyzes images and extracts:
  - Course names and codes
  - Days and time slots
  - Duration calculations
- **Data Extraction**: Structured JSON output for further processing

### 3. Course Recommendations
- **Conflict Detection**: Automatically identifies scheduling conflicts
- **Credit Management**: Ensures recommendations stay within 25-credit limit
- **AI Reasoning**: Provides explanations for each recommendation
- **Multiple Options**: Suggests different course combinations

## Technical Implementation

### Architecture
```
Frontend (Next.js 15)
├── Authentication (Firebase Auth)
├── Image Processing (Gemini API)
├── Data Storage (Firestore)
└── UI/UX (Tailwind CSS)
```

### Core Components
1. **LoginForm**: Google OAuth authentication
2. **Dashboard**: Main application interface
3. **FileUpload**: Timetable image processing
4. **CourseRecommendations**: AI-powered suggestions
5. **ScheduleViewer**: Current timetable display

### API Integrations
- **Firebase Auth API**: User authentication
- **Gemini API**: Image analysis and course recommendations
- **Firestore API**: Data persistence

## Functional Features (3+ Implemented)

### Feature 1: Smart Timetable Analysis
- **Input**: Screenshot of university ERP timetable
- **Processing**: Gemini AI extracts course information
- **Output**: Structured data with course details, times, and conflicts

### Feature 2: AI-Powered Course Recommendations
- **Input**: Current schedule + master timetable
- **Processing**: AI analyzes compatibility and generates suggestions
- **Output**: Ranked course combinations with reasoning

### Feature 3: Conflict-Free Scheduling
- **Input**: Current courses + potential new courses
- **Processing**: Automatic conflict detection and resolution
- **Output**: Validated schedule within credit limits

### Feature 4: Real-Time Authentication
- **Input**: Google account credentials
- **Processing**: Firebase Auth with OAuth flow
- **Output**: Secure user session with personalized dashboard

## Sample Data Structure

### Timetable Analysis Output
```json
{
  "classes": [
    {
      "courseName": "Data Structures",
      "courseCode": "CS201",
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:30",
      "duration": 90
    }
  ]
}
```

### Course Recommendation Output
```json
{
  "recommendations": [
    {
      "combination": [
        {
          "courseName": "Machine Learning",
          "courseCode": "CS302",
          "credits": 4,
          "reason": "Fits well with your schedule and builds on your current coursework"
        }
      ],
      "totalCredits": 15,
      "conflictFree": true
    }
  ]
}
```

## Development Workflow

### Setup Process
1. **Environment Configuration**
   - Firebase project setup
   - Gemini API key configuration
   - Environment variables management

2. **Local Development**
   - Next.js development server
   - Hot reload for rapid iteration
   - TypeScript for type safety

3. **Testing Approach**
   - Manual testing with sample timetables
   - AI response validation
   - Authentication flow testing

## Future Enhancements

### Planned Features
1. **Master Timetable Management**: Admin interface for course database
2. **Prerequisite Checking**: Validate course requirements
3. **Mobile App**: React Native version
4. **Advanced Analytics**: Usage statistics and recommendations tracking
5. **Integration APIs**: Connect with university ERP systems

### Scalability Considerations
- **Database Optimization**: Indexed queries for fast course lookups
- **AI Cost Management**: Efficient prompt engineering
- **Caching Strategy**: Redis for frequent queries
- **Load Balancing**: Multi-region deployment

## Impact Assessment

### Problem Solved
- **Time Savings**: Reduces course selection time from hours to minutes
- **Error Reduction**: Eliminates manual scheduling conflicts
- **Optimization**: Maximizes credit utilization within limits
- **User Experience**: Intuitive interface for complex scheduling

### Technology Demonstration
- **AI Integration**: Practical application of computer vision
- **Cloud Services**: Modern Firebase ecosystem usage
- **Modern Frontend**: Latest Next.js and React features
- **Type Safety**: Full TypeScript implementation

## Conclusion

The Smart Course Scheduler successfully demonstrates:
1. **Real-world Problem Solving**: Addresses genuine student needs
2. **Google Technology Integration**: Effective use of Firebase and Gemini AI
3. **Functional Prototype**: Working system with core features
4. **Scalable Architecture**: Foundation for future development

The project showcases initiative in identifying local problems and applying cutting-edge technology to create meaningful solutions for the university community.

## Repository Structure

```
gdg_timetable/
├── app/                    # Next.js app router
├── components/            # React components
├── lib/                   # Utility libraries
├── data/                  # Sample data
├── public/               # Static assets
├── .env.local.example    # Environment template
└── README.md            # Setup instructions
```

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run development server: `npm run dev`
5. Open http://localhost:3000

**Note**: Requires Firebase project and Gemini API key for full functionality.