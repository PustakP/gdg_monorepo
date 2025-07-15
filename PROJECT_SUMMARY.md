# snu timetable helper - project summary

## project overview

ai-powered web app that helps university students choose courses based on their batch. solves the real-world problem of course selection by providing intelligent recommendations.

## problem statement

students struggle with course selection because:
- need to manually check for schedule conflicts
- difficult to optimize course combinations within credit limits
- course info scattered across different systems
- manual analysis is time-consuming and error-prone

## solution

intelligent course recommendation system that:
1. analyzes available courses by batch selection
2. suggests compatible courses based on available slots
3. optimizes credit allocation within 25-credit limit
4. prevents scheduling conflicts automatically

## google technologies used

### firebase studio
- authentication: google oauth for secure login
- firestore database: user data and course info storage
- complete firebase project setup

### google ai integration - gemini api
- course recommendations: ai-powered suggestions for optimal combinations
- intelligent processing: natural language understanding for course descriptions
- uses gemini 1.5 flash model for recommendations

### idx compatibility
- built with next.js 15 for optimal google idx support
- modern development workflow compatible with cloud-based development

## key features implemented

### authentication system
- google oauth integration with firebase auth
- session management with automatic token refresh
- user context for authentication state management

### batch-based selection
- batch selection interface for different academic programs
- course filtering based on selected batch
- structured data extraction for processing

### course recommendations
- conflict detection: automatically identifies scheduling conflicts
- credit management: ensures recommendations stay within 25-credit limit
- ai reasoning: provides explanations for each recommendation
- multiple options: suggests different course combinations

## technical implementation

### architecture
```
frontend (next.js 15)
├── authentication (firebase auth)
├── batch selection (react ui)
├── ai processing (gemini api)
├── data storage (firestore)
└── ui/ux (tailwind css)
```

### core components
1. loginform: google oauth authentication
2. dashboard: main application interface
3. batch selector: course selection by batch
4. course recommendations: ai-powered suggestions
5. schedule viewer: available courses display

## functional features

### batch-based course selection
- input: selected batch from dropdown
- processing: filters courses by batch affiliation
- output: available courses for selected batch

### ai-powered course recommendations
- input: available courses for batch
- processing: ai analyzes compatibility and generates suggestions
- output: ranked course combinations with reasoning

### conflict-free scheduling
- input: available courses + credit limits
- processing: automatic conflict detection and resolution
- output: validated schedule within credit limits

### real-time authentication
- input: google account credentials
- processing: firebase auth with oauth flow
- output: secure user session with personalized dashboard

## development workflow

### setup process
1. environment configuration: firebase project setup, gemini api key
2. local development: next.js dev server with hot reload
3. testing approach: manual testing with sample data

## impact assessment

### problem solved
- time savings: reduces course selection time from hours to minutes
- error reduction: eliminates manual scheduling conflicts
- optimization: maximizes credit utilization within limits
- user experience: intuitive interface for complex scheduling

### technology demonstration
- ai integration: practical application of ai recommendations
- cloud services: modern firebase ecosystem usage
- modern frontend: latest next.js and react features
- type safety: full typescript implementation

## available batches

- computer science: csd31-34, csd3yr, csd4yr
- mathematics: mat3yr, mat4yr
- physics, biology, chemistry: phy3yr, bio3yr, chd3yr
- engineering: med3yr (mechanical)
- liberal arts: eng3yr (english), his3yr/his4yr (history)
- economics: eco3yr, enf3yr
- business: bms21, fac202
- interdisciplinary: uwe (undergraduate writing)

## future enhancements

- master timetable management interface
- prerequisite checking validation
- mobile app version
- advanced analytics and tracking
- integration with university erp systems

## getting started

1. clone repository
2. install dependencies: `npm install`
3. configure environment variables
4. run development server: `npm run dev`
5. open http://localhost:3000

requires firebase project and gemini api key for full functionality.