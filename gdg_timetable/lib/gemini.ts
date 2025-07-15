import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

interface StudentClass {
  courseName: string;
  courseCode: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface Course {
  courseName: string;
  courseCode: string;
  credits: number;
  day: string;
  startTime: string;
  endTime: string;
  instructor?: string;
  department?: string;
  prerequisites?: string[];
  description?: string;
}

export async function analyzeTimetable(imageBase64: string) {
  try {
    const prompt = `
      Analyze this timetable screenshot and extract all the classes/courses with their details.
      For each class, provide:
      1. Course name/code
      2. Day of the week
      3. Start time
      4. End time
      5. Duration
      
      Return the data in JSON format like this:
      {
        "classes": [
          {
            "courseName": "Course Name",
            "courseCode": "CS101",
            "day": "Monday",
            "startTime": "09:00",
            "endTime": "10:30",
            "duration": 90
          }
        ]
      }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: imageBase64,
          mimeType: 'image/jpeg'
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up the response and parse JSON
    const cleanedText = text.replace(/```json\n?|```\n?/g, '');
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error analyzing timetable:', error);
    throw error;
  }
}

export async function generateCourseRecommendations(
  studentClasses: StudentClass[], 
  masterTimetable: Course[], 
  maxCredits: number = 25
) {
  try {
    const prompt = `
      Based on the student's current timetable and the master timetable of available courses,
      suggest combinations of courses they can take without conflicts.
      
      Student's current classes: ${JSON.stringify(studentClasses)}
      Available courses: ${JSON.stringify(masterTimetable)}
      Maximum credits allowed: ${maxCredits}
      
      Provide recommendations in the following format:
      {
        "recommendations": [
          {
            "combination": [
              {
                "courseName": "Course Name",
                "courseCode": "CS102",
                "credits": 3,
                "day": "Tuesday",
                "startTime": "11:00",
                "endTime": "12:30",
                "reason": "Fits well with your schedule and builds on your current coursework"
              }
            ],
            "totalCredits": 15,
            "conflictFree": true,
            "recommendation": "This combination provides a good balance of technical and elective courses"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const cleanedText = text.replace(/```json\n?|```\n?/g, '');
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    throw error;
  }
}