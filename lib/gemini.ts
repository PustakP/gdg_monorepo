import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

export const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite-preview-06-17' });

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
  instructor: string;
  room?: string;
  studentSet?: string;
}

// types for ai response structures
interface TimetableAnalysisResponse {
  classes: StudentClass[];
}

interface RecommendationResponse {
  recommendations: Array<{
    combination: Array<{
      courseName: string;
      courseCode: string;
      credits: number;
      day: string;
      startTime: string;
      endTime: string;
      reason: string;
    }>;
    totalCredits: number;
    conflictFree: boolean;
    recommendation: string;
  }>;
}

// union type for possible ai response structures
type AIResponse = TimetableAnalysisResponse | RecommendationResponse;

// helper func to extract json from ai response
function extractJsonFromResponse<T>(text: string): T {
  try {
    // try direct parsing first
    return JSON.parse(text);
  } catch (error) {
    // multiple regex patterns for json extraction
    const jsonPatterns = [
      /```json\s*(\{[\s\S]*?\})\s*```/i,          // ```json { ... } ```
      /```\s*(\{[\s\S]*?\})\s*```/i,              // ``` { ... } ```
      /(\{[\s\S]*"recommendations"[\s\S]*?\})/i,  // find obj with "recommendations" key
      /(\{[\s\S]*?\})/i                           // any json object
    ];

    for (const pattern of jsonPatterns) {
      const match = text.match(pattern);
      if (match) {
        try {
          return JSON.parse(match[1]);
        } catch (parseError) {
          console.log(`json parse failed for pattern: ${pattern}`);
        }
      }
    }

    // fallback: try to find json manually
    const openBrace = text.indexOf('{');
    const closeBrace = text.lastIndexOf('}');
    
    if (openBrace !== -1 && closeBrace !== -1 && closeBrace > openBrace) {
      try {
        const jsonText = text.substring(openBrace, closeBrace + 1);
        return JSON.parse(jsonText);
      } catch (parseError) {
        console.log('manual json extraction failed');
      }
    }

    throw new Error('no valid json found in response');
  }
}

export async function analyzeTimetable(imageBase64: string) {
  try {
    const prompt = `
      analyze this timetable screenshot and extract all the classes/courses with their details.
      for each class, provide:
      1. course name/code
      2. day of the week
      3. start time
      4. end time
      5. duration in minutes
      
      IMPORTANT: respond with ONLY valid JSON in exactly this format:
      {
        "classes": [
          {
            "courseName": "course name",
            "courseCode": "cs101",
            "day": "monday",
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
    
    console.log('raw timetable analysis response:', text);
    
    // extract json from response
    const parsedResponse = extractJsonFromResponse<TimetableAnalysisResponse>(text);
    
    // validate response structure
    if (!parsedResponse.classes || !Array.isArray(parsedResponse.classes)) {
      throw new Error('invalid response format: missing classes array');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('error analyzing timetable:', error);
    
    // fallback response if ai fails
    return {
      classes: [
        {
          courseName: "failed to analyze",
          courseCode: "error",
          day: "monday",
          startTime: "09:00",
          endTime: "10:30",
          duration: 90
        }
      ]
    };
  }
}

// helper func to check time conflicts between two courses
function hasTimeConflict(course1: Course | StudentClass, course2: Course | StudentClass): boolean {
  if (course1.day.toLowerCase() !== course2.day.toLowerCase()) {
    return false; // diff days = no conflict
  }
  
  // convert time to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const start1 = timeToMinutes(course1.startTime);
  const end1 = timeToMinutes(course1.endTime);
  const start2 = timeToMinutes(course2.startTime);
  const end2 = timeToMinutes(course2.endTime);
  
  // check for overlap
  return !(end1 <= start2 || end2 <= start1);
}

export async function generateCourseRecommendations(
  studentClasses: StudentClass[], 
  masterTimetable: Course[], 
  selectedBatch: string,
  maxCredits: number = 25
) {
  try {
    // get compulsory courses from selected batch
    const compulsoryCourses = masterTimetable.filter(course => 
      course.studentSet === selectedBatch
    );
    
    // get elective courses from other batches
    const electiveCourses = masterTimetable.filter(course => 
      course.studentSet !== selectedBatch
    );
    
    // filter out electives that conflict with compulsory courses
    const nonConflictingElectives = electiveCourses.filter(elective => {
      return !compulsoryCourses.some(compulsory => 
        hasTimeConflict(compulsory, elective)
      );
    });
    
    // also filter out electives that conflict with student's existing classes (from screenshot)
    const availableElectives = nonConflictingElectives.filter(elective => {
      return !studentClasses.some(studentClass => 
        hasTimeConflict(studentClass, elective)
      );
    });
    
    // calc total credits from compulsory courses
    const compulsoryCredits = compulsoryCourses.reduce((sum, course) => sum + course.credits, 0);
    
    // calc remaining credits for electives
    const remainingCredits = maxCredits - compulsoryCredits;
    
    const prompt = `
      Based on the student's selected batch and existing timetable, generate course recommendations.
      
      SELECTED BATCH: ${selectedBatch}
      COMPULSORY COURSES (must be included): ${JSON.stringify(compulsoryCourses)}
      STUDENT'S EXISTING CLASSES (from screenshot): ${JSON.stringify(studentClasses)}
      AVAILABLE ELECTIVES (non-conflicting from other batches): ${JSON.stringify(availableElectives)}
      
      Compulsory courses credits: ${compulsoryCredits}
      Remaining credits for electives: ${remainingCredits}
      Maximum total credits allowed: ${maxCredits}
      
      Rules:
      1. ALL compulsory courses from ${selectedBatch} batch MUST be included in every recommendation
      2. Suggest different combinations of elective courses from OTHER batches (not ${selectedBatch})
      3. Ensure NO time conflicts between compulsory courses, existing classes, and electives
      4. Total credits (compulsory + electives) must not exceed ${maxCredits}
      5. Only suggest electives that are already filtered for conflicts
      6. Create multiple different combinations of electives
      
      IMPORTANT: Respond with ONLY valid JSON in exactly this format:
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
                "reason": "Compulsory course for ${selectedBatch} batch" or "Non-conflicting elective from [batch name]"
              }
            ],
            "totalCredits": 18,
            "conflictFree": true,
            "recommendation": "This combination includes all compulsory courses plus recommended electives"
          }
        ]
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('raw ai response:', text); // debug logging
    
    // extract json from response
    const parsedResponse = extractJsonFromResponse<RecommendationResponse>(text);
    
    // validate response structure
    if (!parsedResponse.recommendations || !Array.isArray(parsedResponse.recommendations)) {
      throw new Error('invalid response format: missing recommendations array');
    }
    
    return parsedResponse;
  } catch (error) {
    console.error('error generating recommendations:', error);
    
    // fallback response if ai fails
    const compulsoryCourses = masterTimetable.filter(course => 
      course.studentSet === selectedBatch
    );
    
    const electiveCourses = masterTimetable.filter(course => 
      course.studentSet !== selectedBatch
    );
    
    // filter out conflicting electives
    const nonConflictingElectives = electiveCourses.filter(elective => {
      const conflictsWithCompulsory = compulsoryCourses.some(compulsory => 
        hasTimeConflict(compulsory, elective)
      );
      const conflictsWithExisting = studentClasses.some(studentClass => 
        hasTimeConflict(studentClass, elective)
      );
      return !conflictsWithCompulsory && !conflictsWithExisting;
    });
    
    const compulsoryCredits = compulsoryCourses.reduce((sum, course) => sum + course.credits, 0);
    
    // create fallback combo with all compulsory + some non-conflicting electives
    const fallbackElectives = nonConflictingElectives.slice(0, 2).filter(course => 
      compulsoryCredits + course.credits <= maxCredits
    );
    
    const fallbackCombination = [
      ...compulsoryCourses.map(course => ({
        courseName: course.courseName,
        courseCode: course.courseCode,
        credits: course.credits,
        day: course.day,
        startTime: course.startTime,
        endTime: course.endTime,
        reason: `compulsory course for ${selectedBatch} batch`
      })),
      ...fallbackElectives.map(course => ({
        courseName: course.courseName,
        courseCode: course.courseCode,
        credits: course.credits,
        day: course.day,
        startTime: course.startTime,
        endTime: course.endTime,
        reason: `non-conflicting elective from ${course.studentSet} batch`
      }))
    ];
    
    return {
      recommendations: [
        {
          combination: fallbackCombination,
          totalCredits: fallbackCombination.reduce((sum, course) => sum + course.credits, 0),
          conflictFree: true,
          recommendation: `all compulsory courses for ${selectedBatch} batch + non-conflicting electives (ai recommendation failed)`
        }
      ]
    };
  }
}