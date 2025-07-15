# SNU Timetable Helper by GDG

ai-powered course selection tool that helps students choose courses based on their batch. built with next.js, firebase, and google's gemini ai.

## features

- firebase authentication with google oauth
- batch-based course selection
- ai-powered course recommendations
- conflict detection and credit management
- responsive ui with tailwind css

## tech stack

- next.js 15, react 19, typescript
- firebase auth & firestore
- google gemini api
- tailwind css, lucide icons

## getting started

1. clone the repository
2. install dependencies: `npm install`
3. set up firebase project and get config
4. get gemini api key from google ai studio
5. create `.env.local` with your keys
6. run dev server: `npm run dev`

## env variables

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain_here
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket_here
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here
```

## how it works

1. students sign in with google
2. select their batch from available options
3. ai analyzes available courses for that batch
4. get personalized course recommendations
5. view conflict-free combinations within credit limits

## available batches

- computer science (csd31-34, csd3yr, csd4yr)
- mathematics (mat3yr, mat4yr)
- physics, biology, chemistry
- engineering (chemical, mechanical)
- economics, english, history
- and more

## project structure

```
gdg_timetable/
├── app/                    # next.js app directory
├── components/            # react components
├── lib/                  # utility libraries
└── public/               # static assets
```
