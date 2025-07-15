# Smart Course Scheduler

An AI-powered course selection tool that helps students choose courses that fit their timetable. Built with Next.js, Firebase, and Google's Gemini AI.

## Features

- 🔐 **Firebase Authentication** - Secure Google OAuth login
- 📱 **Timetable Analysis** - Upload screenshots of your university ERP timetable
- 🤖 **AI-Powered Analysis** - Uses Gemini AI to extract course information from images
- 📊 **Course Recommendations** - Get personalized course suggestions based on your schedule
- ⚡ **Conflict Detection** - Automatically identifies schedule conflicts
- 📋 **Credit Management** - Ensures you don't exceed credit limits (max 25 credits)

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Lucide Icons
- **Authentication**: Firebase Auth (Google OAuth)
- **Database**: Firebase Firestore
- **AI**: Google Gemini API
- **File Upload**: React Dropzone
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. Firebase project set up
3. Google AI Studio API key (for Gemini)

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gdg_timetable
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication and choose Google as a sign-in method
   - Create a Firestore database
   - Get your Firebase configuration from Project Settings

4. **Set up Gemini AI**
   - Visit [Google AI Studio](https://aistudio.google.com/)
   - Create an API key for Gemini

5. **Environment Variables**
   - Copy `.env.local.example` to `.env.local`
   - Fill in your Firebase and Gemini API credentials:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

7. **Open the application**
   - Visit [http://localhost:3000](http://localhost:3000)
   - Sign in with your Google account
   - Upload a timetable screenshot and get AI-powered course recommendations!

## How It Works

1. **Authentication**: Students sign in using Google OAuth through Firebase
2. **Timetable Upload**: Students upload a screenshot of their current timetable
3. **AI Analysis**: Gemini AI analyzes the image and extracts course information
4. **Schedule Processing**: The system processes the extracted data to understand current commitments
5. **Recommendations**: AI suggests course combinations that fit the schedule and credit limits
6. **Conflict Detection**: The system ensures no scheduling conflicts exist

## Project Structure

```
gdg_timetable/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with AuthProvider
│   └── page.tsx           # Main page component
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Dashboard.tsx     # Main dashboard component
│   └── LoginForm.tsx     # Authentication component
├── lib/                  # Utility libraries
│   ├── auth-context.tsx  # Authentication context
│   ├── firebase.ts       # Firebase configuration
│   ├── gemini.ts         # Gemini AI integration
│   └── utils.ts          # Utility functions
└── public/               # Static assets
```

## Key Features Implemented

### 1. Firebase Authentication
- Google OAuth integration
- User session management
- Secure authentication flow

### 2. AI-Powered Timetable Analysis
- Image processing with Gemini AI
- Course information extraction
- Schedule conflict detection

### 3. Course Recommendations
- AI-generated course suggestions
- Credit limit management
- Conflict-free scheduling

## Demo Usage

1. Sign in with Google
2. Upload a timetable screenshot (formats: JPEG, PNG)
3. Wait for AI analysis to complete
4. View your current schedule
5. Get personalized course recommendations
6. Review suggested course combinations

## Future Enhancements

- Master timetable management interface
- Course prerequisite checking
- Integration with university ERP systems
- Mobile app version
- Advanced scheduling algorithms
- Course popularity and ratings

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For support, please contact [your-email@example.com] or create an issue on GitHub.
