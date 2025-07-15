'use client';

import { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import { useAuth } from '@/lib/auth-context';
import { analyzeTimetable, generateCourseRecommendations } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, Calendar, BookOpen, User, LogOut, Brain, Clock } from 'lucide-react';

interface StudentClass {
  courseName: string;
  courseCode: string;
  day: string;
  startTime: string;
  endTime: string;
  duration: number;
}

interface CourseRecommendation {
  courseName: string;
  courseCode: string;
  credits: number;
  day: string;
  startTime: string;
  endTime: string;
  reason: string;
}

interface RecommendationGroup {
  combination: CourseRecommendation[];
  totalCredits: number;
  conflictFree: boolean;
  recommendation: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [studentClasses, setStudentClasses] = useState<StudentClass[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);

  // Sample master timetable - in a real app, this would come from Firebase
  const masterTimetable = useMemo(() => [
    {
      courseName: "Advanced Database Systems",
      courseCode: "CS301",
      credits: 3,
      day: "Monday",
      startTime: "14:00",
      endTime: "15:30",
      instructor: "Dr. Smith"
    },
    {
      courseName: "Machine Learning",
      courseCode: "CS302",
      credits: 4,
      day: "Tuesday",
      startTime: "10:00",
      endTime: "11:30",
      instructor: "Prof. Johnson"
    },
    {
      courseName: "Web Development",
      courseCode: "CS303",
      credits: 3,
      day: "Wednesday",
      startTime: "09:00",
      endTime: "10:30",
      instructor: "Dr. Brown"
    },
    {
      courseName: "Data Structures",
      courseCode: "CS201",
      credits: 3,
      day: "Thursday",
      startTime: "11:00",
      endTime: "12:30",
      instructor: "Prof. Wilson"
    },
    {
      courseName: "Software Engineering",
      courseCode: "CS304",
      credits: 4,
      day: "Friday",
      startTime: "13:00",
      endTime: "14:30",
      instructor: "Dr. Davis"
    }
  ], []);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];
        
        const analysisResult = await analyzeTimetable(base64Data);
        setStudentClasses(analysisResult.classes);
        setAnalysisComplete(true);
        
        // Generate recommendations
        const recommendationResult = await generateCourseRecommendations(
          analysisResult.classes,
          masterTimetable,
          25
        );
        setRecommendations(recommendationResult.recommendations);
        setLoading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error analyzing timetable:', error);
      setLoading(false);
    }
  }, [masterTimetable]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png']
    },
    maxFiles: 1
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Smart Course Scheduler</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600" />
                <span className="text-sm text-gray-600">{user?.displayName}</span>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="h-5 w-5" />
                  <span>Upload Timetable</span>
                </CardTitle>
                <CardDescription>
                  Upload a screenshot of your current timetable from your university ERP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input {...getInputProps()} />
                  <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  {isDragActive ? (
                    <p className="text-blue-600">Drop the timetable image here...</p>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">Drag & drop your timetable image here</p>
                      <p className="text-sm text-gray-500">or click to select</p>
                    </div>
                  )}
                </div>
                {loading && (
                  <div className="mt-4 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-sm text-gray-600">Analyzing timetable...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Current Schedule */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Clock className="h-5 w-5" />
                  <span>Your Current Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentClasses.length > 0 ? (
                  <div className="space-y-3">
                    {studentClasses.map((cls, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{cls.courseName}</p>
                          <p className="text-sm text-gray-600">{cls.courseCode}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">{cls.day}</p>
                          <p className="text-sm text-gray-600">{cls.startTime} - {cls.endTime}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                    <p>Upload your timetable to see your current schedule</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recommendations */}
        {analysisComplete && recommendations.length > 0 && (
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="h-5 w-5" />
                  <span>AI-Powered Course Recommendations</span>
                </CardTitle>
                <CardDescription>
                  Based on your current schedule, here are courses you can add (max 25 credits)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">Option {index + 1}</h3>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">
                            Total Credits: {rec.totalCredits}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            rec.conflictFree ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {rec.conflictFree ? 'Conflict Free' : 'Has Conflicts'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        {rec.combination.map((course, courseIndex) => (
                          <div key={courseIndex} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-gray-900">{course.courseName}</p>
                                <p className="text-sm text-gray-600">{course.courseCode} • {course.credits} credits</p>
                                <p className="text-sm text-gray-600">{course.day}, {course.startTime} - {course.endTime}</p>
                              </div>
                              <BookOpen className="h-5 w-5 text-gray-400" />
                            </div>
                            <p className="text-xs text-green-600 mt-2">{course.reason}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Recommendation:</strong> {rec.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}