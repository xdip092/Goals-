export interface SubjectTrack {
  id: string; // e.g., 'testing', 'ml', 'flutter'
  name: string;
  completedUnits: number; // 0-5
  totalUnits: number;
  notes: string[];
  importantQuestions: string[];
  mockMarksExpected: number;
  mockMarksScore: number;
  weakAreas: string[];
  unitProgress?: number[]; // Gradual completion percentage (0 - 100) for each unit note
}

export interface RoadmapItem {
  id: string;
  name: string;
  category: string; // e.g., 'Foundation', 'Frontend', 'Backend', 'AI Agents'
  status: 'pending' | 'completed';
  hoursSpent: number;
  progress: number; // Gradual completion percentage from 0 to 100
  notes?: string;
}

export interface GovExamSection {
  id: string;
  name: string; // e.g. 'Mathematics', 'Reasoning'
  progress: number; // percentage
  dailyTarget: string;
  weeklyTarget: string;
  mockTestsAttempted: number;
  averageScorePercentage: number;
  weakTopics: string[];
}

// Spoken English tracker
export interface SpokenEnglishState {
  wordsLearned: string[];
  wordRetentionScore: number; // 0-100
  grammarCompletedTopics: string[]; // tenses, etc.
  speakingPracticeDaysCount: number;
  confidenceScore: number; // 1-10
  listeningMinutes: number;
  readingWordsCount: number;
}

export interface FitnessLog {
  weight: number; // kg
  bodyFatPercentage: number;
  bmi: number;
  steps: number;
  waterIntakeLiters: number;
  sleepHours: number;
  caloriesConsumed: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
}

export interface WorkoutExercise {
  name: string;
  sets: number;
  reps: number;
  weightUsed: number; // in kg
}

export interface ActiveWorkoutPlan {
  id: string;
  day: string; // e.g., 'Day 1: Full Body'
  exercises: WorkoutExercise[];
  completed: boolean;
}

export interface GroomingRoutine {
  id: string;
  category: 'skin' | 'hair' | 'grooming' | 'posture';
  name: string;
  frequency: 'daily' | 'weekly';
  completed: boolean;
}

export interface DailyTask {
  id: string;
  text: string;
  category: 'Morning' | 'BCA Study' | 'Gov Prep' | 'Full Stack Study' | 'AI Study' | 'English' | 'Fitness' | 'Evening';
  completed: boolean;
}

export interface TimeAllocation {
  bcaPercent: number;
  fullStackPercent: number;
  govPercent: number;
  aiPercent: number;
  englishPercent: number;
  fitnessPercent: number;
}

export interface JobApplication {
  id: string;
  company: string;
  role: string;
  status: 'Applied' | 'Screening' | 'Interview' | 'Offer' | 'Rejected';
  dateApplied: string;
  notes: string;
  interviewRound?: string;
  feedback?: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  icon: string; // Lucide or custom character
}

export interface ATSResume {
  fullName: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  education: string;
  experience: { company: string; role: string; duration: string; bulletPoints: string[] }[];
  skills: string[];
  certifications: string[];
  atsScore: number;
  missingKeywords: string[];
  improvementSuggestions: string[];
}

export interface UserStats {
  xp: number;
  level: number;
  overallScore: number;
  goalCompletion: number;
  consistencyScore: number;
  disciplineScore: number;
  streakDays: {
    study: number;
    coding: number;
    fitness: number;
    english: number;
  };
  heatmapData: { date: string; count: number }[]; // GitHub-style format: 'YYYY-MM-DD' vs value
}

export interface GoalNote {
  id: string;
  name: string; // File name or note title
  content: string; // The body content wrote or loaded
  uploadedAt: string; // format YYYY-MM-DD
}

export interface CustomGoal {
  id: string;
  title: string;
  category: string; // e.g., 'Career', 'BCA Study', 'Fitness', 'Generative AI', 'Other'
  targetDate: string; // format YYYY-MM-DD
  status: 'pending' | 'completed';
  notes: GoalNote[];
}

export interface MockInterview {
  id: string;
  title: string;
  type: 'Technical' | 'HR' | 'English Speaking' | 'System Design' | 'Other';
  datetime: string; // format YYYY-MM-DDTHH:mm
  interviewer: string;
  status: 'scheduled' | 'completed' | 'canceled';
  remindersEnabled: boolean;
  feedbackNotes: string;
  performanceScore: number; // 0 for unset, 1 to 10 otherwise
  keyQuestionsAsked: string[];
}

export interface LifeTransformationState {
  userStats: UserStats;
  bcaSubjects: SubjectTrack[];
  fullStackRoadmap: RoadmapItem[];
  aiRoadmap: RoadmapItem[];
  rrbPrep: GovExamSection[];
  bankingPrep: GovExamSection[];
  englishState: SpokenEnglishState;
  fitnessLog: FitnessLog;
  activeWorkoutPlan: ActiveWorkoutPlan[];
  groomingRoutines: GroomingRoutine[];
  dailyTasks: DailyTask[];
  timeAllocation: TimeAllocation;
  jobApplications: JobApplication[];
  badges: Badge[];
  atsResume: ATSResume;
  portfolioDeployed: boolean;
  customGoals?: CustomGoal[]; // Enforce locking & notes uploading
  mockInterviews?: MockInterview[];
  flashcards?: Flashcard[];
}

export interface Flashcard {
  id: string;
  category: 'BCA' | 'Fullstack' | 'Generative AI' | 'Government Exams' | 'Spoken English';
  question: string;
  answer: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  lastStudiedAt?: string;
  reviewCount?: number;
}
