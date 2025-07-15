'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAuth } from '@/lib/auth-context';
import { generateCourseRecommendations } from '@/lib/gemini';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, BookOpen, User, LogOut, Brain, Users } from 'lucide-react';

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

interface MasterTimetableEntry {
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

const parseMasterTimetable = (csvData: string): MasterTimetableEntry[] => {
  const lines = csvData.split('\n');
  return lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
      const values = line.split(',');
      const studentSet = values[0];
      const courseCode = values[1];
      const courseName = values[2];
      const teachers = values[3];
      const room = values[5];
      const day = values[6];
      const startTime = values[7];
      const endTime = values[8];
      const duration = values[9];
      
      const dayMapping: { [key: string]: string } = {
        'Mo': 'Monday',
        'Tu': 'Tuesday',
        'We': 'Wednesday',
        'Th': 'Thursday',
        'Fr': 'Friday',
        'Sa': 'Saturday',
        'Su': 'Sunday'
      };
      
      // est credits from duration
      const estimatedCredits = duration ? Math.ceil(parseFloat(duration.replace(':', '.')) / 1.5) : 3;
      
      return {
        courseName: courseName || 'Unknown Course',
        courseCode: courseCode || 'UNKNOWN',
        credits: estimatedCredits,
        day: dayMapping[day] || day,
        startTime: startTime || '00:00:00',
        endTime: endTime || '00:00:00',
        instructor: teachers || 'Unknown Instructor',
        room: room || '',
        studentSet: studentSet || ''
      };
    })
    .filter(entry => 
      entry.courseName && 
      entry.courseCode && 
      entry.day && 
      entry.startTime && 
      entry.endTime
    );
};

const timetableCsvData = `Students Sets,Course Code,Course Name,Teachers,Activity Tags,Room,Day,Start Time,End Time,Duration
UWE,DNC106,Method Meets Art,Amrithasruthi  Radhakrishnan[20501673],LEC,,Fr,16:00:00,18:00:00,02:00
UWE,DNC106,Method Meets Art,Amrithasruthi  Radhakrishnan[20501673],LEC,,Th,14:00:00,16:00:00,02:00
UWE,ART202,Critical Art History:An Intro.,Deepti  Mulgund[20501517],LEC,,Tu,16:00:00,18:00:00,02:00
UWE,ART202,Critical Art History:An Intro.,Deepti  Mulgund[20501517],LEC,,Th,16:00:00,18:00:00,02:00
CSD31+CSD32+CSD33+CSD34,CSD304,Computer Networks,Himani  Sikarwar[20501982],LEC,,Tu,11:30:00,13:00:00,01:30
CSD31+CSD32+CSD33+CSD34,CSD304,Computer Networks,Himani  Sikarwar[20501982],LEC,,Mo,09:30:00,11:00:00,01:30
CSD31+CSD32+CSD33+CSD34,CSD311,Artificial Intelligence,Snehasis  Mukherjee[20501281],LEC,,Tu,17:30:00,19:00:00,01:30
CSD31+CSD32+CSD33+CSD34,CSD311,Artificial Intelligence,Snehasis  Mukherjee[20501281],LEC,,Fr,09:00:00,10:30:00,01:30
CSD3YR+CSD4YR,CSD355,Foundation of Data Sciences,Suchi  Kumari[20501836],LEC,,Fr,12:00:00,13:00:00,01:00
CSD3YR+CSD4YR,CSD355,Foundation of Data Sciences,Suchi  Kumari[20501836],LEC,,We,13:00:00,14:00:00,01:00
CSD3YR+CSD4YR,CSD361,Intro. to Machine Learning,Nitin  Kumar[20501744],LEC,,Fr,13:00:00,14:00:00,01:00
CSD3YR+CSD4YR,CSD361,Intro. to Machine Learning,Nitin  Kumar[20501744],LEC,,Fr,14:00:00,15:00:00,01:00
CSD4YR,CSD456,Deep Learning,Saurabh Janardan Shigwan[20501375],LEC,,Tu,08:00:00,09:00:00,01:00
CSD4YR,CSD456,Deep Learning,Saurabh Janardan Shigwan[20501375],LEC,,Mo,10:00:00,11:00:00,01:00
BMS21,FAC202,Financial Management,Ashish  Vazirani[20501855],LEC,,Tu,16:00:00,17:30:00,01:30
BMS21,FAC202,Financial Management,Ashish  Vazirani[20501855],LEC,,Fr,12:30:00,14:00:00,01:30
MAT3YR+MAT4YR,MAT442,Graph Theory,Sudeepto  Bhattacharya[20500090]+Niteesh  Sahni[20500011],LEC,,Mo,09:00:00,10:30:00,01:30
MAT3YR+MAT4YR,MAT442,Graph Theory,Sudeepto  Bhattacharya[20500090]+Niteesh  Sahni[20500011],LEC,,Fr,15:30:00,17:00:00,01:30
PHY3YR,PHY301,Classical Mechanics,Arindam  Chatterjee[20501204],LEC,,We,12:00:00,13:30:00,01:30
PHY3YR,PHY301,Classical Mechanics,Arindam  Chatterjee[20501204],LEC,,Fr,12:00:00,13:30:00,01:30
ENG3YR,ENG340,The Fundamentals of Crea. wrtg,Vikram  Kapur[20500186],LEC,,Tu,14:00:00,15:30:00,01:30
ENG3YR,ENG340,The Fundamentals of Crea. wrtg,Vikram  Kapur[20500186],LEC,,Mo,14:00:00,15:30:00,01:30
BIO3YR,BIO301,Animal Biotechnology,Sri Krishna Jayadev Magani[20500054],LEC,,We,10:00:00,11:00:00,01:00
BIO3YR,BIO301,Animal Biotechnology,Sri Krishna Jayadev Magani[20500054],LEC,,Fr,15:30:00,16:30:00,01:00
CHD3YR,CHD310,Chemical Reaction Engg.-II,Sanjeev  Yadav[20500213],LEC,,We,12:30:00,13:30:00,01:00
CHD3YR,CHD310,Chemical Reaction Engg.-II,Sanjeev  Yadav[20500213],LEC,,Tu,13:00:00,14:00:00,01:00
MED3YR,MED303,Heat and Mass Transfer,Satti Rajesh Reddy[20500731],LEC,,Mo,12:00:00,13:00:00,01:00
MED3YR,MED303,Heat and Mass Transfer,Satti Rajesh Reddy[20500731],LEC,,Tu,10:30:00,11:30:00,01:00
ECO3YR+ENF3YR,ECO392,Poverty & Inequality,Shabana  Mitra[20501444],LEC,,Mo,12:00:00,13:30:00,01:30
ECO3YR+ENF3YR,ECO392,Poverty & Inequality,Shabana  Mitra[20501444],LEC,,Th,08:00:00,09:30:00,01:30
HIS3YR+HIS4YR,HIS317,Archaeology of Landscapes,Hemanth  Kadambi[20501041],LEC,,Th,15:30:00,17:00:00,01:30
HIS3YR+HIS4YR,HIS317,Archaeology of Landscapes,Hemanth  Kadambi[20501041],LEC,,Tu,15:00:00,16:30:00,01:30`;

const availableBatches = [
  { id: 'UWE', name: 'UWE - Undergraduate Writing & Expression', type: 'undergraduate' },
  { id: 'CSD31', name: 'CSD31 - Computer Science & Design (3rd Year)', type: 'undergraduate' },
  { id: 'CSD32', name: 'CSD32 - Computer Science & Design (3rd Year)', type: 'undergraduate' },
  { id: 'CSD33', name: 'CSD33 - Computer Science & Design (3rd Year)', type: 'undergraduate' },
  { id: 'CSD34', name: 'CSD34 - Computer Science & Design (3rd Year)', type: 'undergraduate' },
  { id: 'CSD3YR', name: 'CSD3YR - Computer Science 3rd Year', type: 'undergraduate' },
  { id: 'CSD4YR', name: 'CSD4YR - Computer Science 4th Year', type: 'undergraduate' },
  { id: 'BMS21', name: 'BMS21 - Business Management Studies', type: 'undergraduate' },
  { id: 'MAT3YR', name: 'MAT3YR - Mathematics 3rd Year', type: 'undergraduate' },
  { id: 'MAT4YR', name: 'MAT4YR - Mathematics 4th Year', type: 'undergraduate' },
  { id: 'PHY3YR', name: 'PHY3YR - Physics 3rd Year', type: 'undergraduate' },
  { id: 'ENG3YR', name: 'ENG3YR - English 3rd Year', type: 'undergraduate' },
  { id: 'BIO3YR', name: 'BIO3YR - Biology 3rd Year', type: 'undergraduate' },
  { id: 'CHD3YR', name: 'CHD3YR - Chemical Engineering 3rd Year', type: 'undergraduate' },
  { id: 'MED3YR', name: 'MED3YR - Mechanical Engineering 3rd Year', type: 'undergraduate' },
  { id: 'ECO3YR', name: 'ECO3YR - Economics 3rd Year', type: 'undergraduate' },
  { id: 'ENF3YR', name: 'ENF3YR - Environment & Forestry 3rd Year', type: 'undergraduate' },
  { id: 'HIS3YR', name: 'HIS3YR - History 3rd Year', type: 'undergraduate' },
  { id: 'HIS4YR', name: 'HIS4YR - History 4th Year', type: 'undergraduate' }
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [selectedBatch, setSelectedBatch] = useState<string>('');
  const [availableCourses, setAvailableCourses] = useState<MasterTimetableEntry[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const masterTimetable = useMemo(() => parseMasterTimetable(timetableCsvData), []);

  const handleBatchSelection = async (batchId: string) => {
    setSelectedBatch(batchId);
    setLoading(true);
    
    try {
      const batchCourses = masterTimetable.filter(course => 
        course.studentSet?.includes(batchId)
      );
      
      setAvailableCourses(batchCourses);
      
      // gen recommendations for the selected batch
      const recommendationResult = await generateCourseRecommendations(
        [],
        batchCourses,
        25
      );
      
      setRecommendations(recommendationResult.recommendations);
      setShowRecommendations(true);
      setLoading(false);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Getting your course recommendations...</p>
          <p className="text-sm text-gray-500">analyzing available courses for your batch</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Brain className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">SNU Timetable Helper by GDG</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-1" />
                {user?.email}
              </div>
              <Button
                onClick={logout}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!showRecommendations ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome to SNU Timetable Helper by GDG
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Select your batch to get personalized course recommendations that fit your schedule.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card className="text-center">
                <CardHeader>
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Select Batch</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Choose your batch from the available options
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <Brain className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">AI Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Our AI analyzes available courses for your batch
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center">
                <CardHeader>
                  <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-lg">Course Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">
                    Get personalized course suggestions within your credit limit
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-xl text-center">Select Your Batch</CardTitle>
                <CardDescription className="text-center">
                  Choose your batch to see available courses and get recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableBatches.map((batch) => (
                    <Button
                      key={batch.id}
                      onClick={() => handleBatchSelection(batch.id)}
                      variant="outline"
                      className="h-auto p-4 text-left flex flex-col items-start space-y-2 hover:bg-blue-50 hover:border-blue-500"
                    >
                      <div className="font-medium text-sm">{batch.id}</div>
                      <div className="text-xs text-gray-600 whitespace-normal">
                        {batch.name}
                      </div>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Available Courses for {selectedBatch}
                </CardTitle>
                <CardDescription>
                  Courses available for your selected batch
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {availableCourses.map((course, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{course.courseName}</p>
                        <p className="text-sm text-gray-600">{course.courseCode}</p>
                        <p className="text-sm text-gray-500">Instructor: {course.instructor}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{course.day}</p>
                        <p className="text-sm text-gray-600">
                          {course.startTime} - {course.endTime}
                        </p>
                        <p className="text-xs text-blue-600">{course.credits} credits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Course Recommendations
                </CardTitle>
                <CardDescription>
                  AI-suggested course combinations (max 25 credits)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recommendations.map((group, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-lg">
                          Combination {index + 1}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            group.conflictFree 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {group.conflictFree ? 'No Conflicts' : 'Has Conflicts'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {group.totalCredits} credits
                          </span>
                        </div>
                      </div>
                      
                      <div className="grid gap-3 mb-4">
                        {group.combination.map((course, courseIndex) => (
                          <div key={courseIndex} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div>
                              <p className="font-medium">{course.courseName}</p>
                              <p className="text-sm text-gray-600">{course.courseCode}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{course.day}</p>
                              <p className="text-sm text-gray-600">
                                {course.startTime} - {course.endTime}
                              </p>
                              <p className="text-xs text-blue-600">{course.credits} credits</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-700">
                          <strong>Why this combination:</strong> {group.recommendation}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="text-center">
              <Button
                onClick={() => {
                  setSelectedBatch('');
                  setAvailableCourses([]);
                  setRecommendations([]);
                  setShowRecommendations(false);
                }}
                variant="outline"
                size="lg"
              >
                Select Another Batch
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}