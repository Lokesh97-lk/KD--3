export type UserRole = 'student' | 'instructor' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  timezone: string;
  is_active: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_hours: number;
  total_lessons: number;
  completed_lessons?: number;
  tags: string[];
  instructor_name: string;
  modules: Module[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  description: string;
  lessons: Lesson[];
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  duration_minutes: number;
  is_completed?: boolean;
  type: 'concept' | 'interactive' | 'exercise';
  content_markdown: string;
  starter_code?: string;
}

export interface Problem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  topic: string;
  acceptance_rate: number;
  description: string;
  constraints: string[];
  starter_code: Record<string, string>; // language -> code
  test_cases: TestCase[];
}

export interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
}

export type ExecutionVerdict = 
  | 'Accepted' 
  | 'Wrong Answer' 
  | 'Compilation Error' 
  | 'Runtime Error' 
  | 'Time Limit Exceeded' 
  | 'Memory Limit Exceeded'
  | 'Internal Error';

export interface Submission {
  id: string;
  problem_id: string;
  problem_title: string;
  language: string;
  code: string;
  verdict: ExecutionVerdict;
  passed_tests: number;
  total_tests: number;
  runtime_ms: number;
  memory_kb: number;
  submitted_at: string;
  error_output?: string;
}

export interface ConceptNode {
  id: string;
  title: string;
  category: string;
  mastery_percentage: number;
  status: 'mastered' | 'in_progress' | 'prerequisite_weak' | 'locked';
  prerequisites: string[]; // ids of prereqs
  practice_accuracy: number;
  last_practiced: string;
  recommended_next: string;
}

export interface ObservatoryMetric {
  total_study_hours: number;
  coding_hours: number;
  debugging_hours: number;
  reading_hours: number;
  testing_hours: number;
  revision_hours: number;
  sessions_count: number;
  average_session_minutes: number;
  focus_efficiency_score: number;
}

export interface TopicTimeData {
  topic: string;
  focused_minutes: number;
  reading_minutes: number;
  coding_minutes: number;
  debugging_minutes: number;
  testing_minutes: number;
}

export interface DailyTrendData {
  date: string;
  active_hours: number;
  coding_hours: number;
  reading_hours: number;
  score_average: number;
}

export interface DebugErrorCategory {
  category: string;
  count: number;
  percentage: number;
  avg_fix_minutes: number;
  trend: 'improving' | 'stable' | 'repeating';
}

export interface RevisionRecommendation {
  id: string;
  topic: string;
  reason: 'weak_prerequisite' | 'retention_decay' | 'repeated_errors' | 'upcoming_assessment';
  urgency: 'high' | 'medium' | 'low';
  explanation: string;
  estimated_minutes: number;
  problem_id?: string;
}

export interface EngineeringScenario {
  id: string;
  title: string;
  domain: 'Backend REST API' | 'Database Optimization' | 'Security Hardening' | 'Reliability / Fault Tolerance';
  difficulty: 'Mid-Level' | 'Senior' | 'Lead';
  context: string;
  acceptance_criteria: string[];
  starter_repo: string;
  evaluation_rubric: {
    category: string;
    weight: number;
    description: string;
  }[];
  is_verified?: boolean;
}

export interface SkillEvidenceItem {
  id: string;
  skill_name: string;
  domain: string;
  verified_level: 'Novice' | 'Practitioner' | 'Proficient' | 'Engineering Lead';
  demonstrated_at: string;
  evidence_source: string;
  evidence_url: string;
  confidence_score: number;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  type: 'code' | 'mcq' | 'debugging';
  options?: string[];
  starter_code?: string;
  points: number;
}

export interface Assessment {
  id: string;
  title: string;
  duration_minutes: number;
  total_questions: number;
  passing_score: number;
  category: string;
  questions: AssessmentQuestion[];
}
