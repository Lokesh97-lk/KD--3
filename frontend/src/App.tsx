import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppShell } from './components/layout/AppShell';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { FeaturesPage } from './pages/public/FeaturesPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { RecoveryPage } from './pages/public/RecoveryPage';

// Student Workstation Pages
import { Dashboard } from './pages/student/Dashboard';
import { LearningPaths } from './pages/student/LearningPaths';
import { CourseView } from './pages/student/CourseView';
import { LessonReader } from './pages/student/LessonReader';
import { ConceptGraph } from './pages/student/ConceptGraph';
import { ProblemCatalog } from './pages/student/ProblemCatalog';
import { CodeLab } from './pages/student/CodeLab';
import { AssessmentCenter } from './pages/student/AssessmentCenter';
import { SubmissionHistory } from './pages/student/SubmissionHistory';
import { LearningObservatory } from './pages/student/LearningObservatory';
import { DebuggingIntelligence } from './pages/student/DebuggingIntelligence';
import { StudyPatterns } from './pages/student/StudyPatterns';
import { RevisionPlanner } from './pages/student/RevisionPlanner';
import { ProjectStudio } from './pages/student/ProjectStudio';
import { SkillPassport } from './pages/student/SkillPassport';
import { Settings } from './pages/student/Settings';

// Instructor & Admin Workspaces
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { AdminConsole } from './pages/admin/AdminConsole';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Marketing & Auth Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/recovery" element={<RecoveryPage />} />

          {/* Authenticated Workstation Shell */}
          <Route element={<AppShell />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/courses/:slug" element={<CourseView />} />
            <Route path="/lessons/:lessonId" element={<LessonReader />} />
            <Route path="/concept-graph" element={<ConceptGraph />} />
            
            {/* Practice & Execution */}
            <Route path="/problems" element={<ProblemCatalog />} />
            <Route path="/code-lab" element={<CodeLab />} />
            <Route path="/assessments" element={<AssessmentCenter />} />
            <Route path="/submissions" element={<SubmissionHistory />} />

            {/* Signature Analytics Engines */}
            <Route path="/observatory" element={<LearningObservatory />} />
            <Route path="/debugging" element={<DebuggingIntelligence />} />
            <Route path="/study-patterns" element={<StudyPatterns />} />
            <Route path="/revision" element={<RevisionPlanner />} />

            {/* Practical Engineering & Verified Evidence */}
            <Route path="/projects" element={<ProjectStudio />} />
            <Route path="/projects/:id" element={<ProjectStudio />} />
            <Route path="/skill-passport" element={<SkillPassport />} />
            <Route path="/settings" element={<Settings />} />

            {/* Role-Specific Workspaces */}
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/admin" element={<AdminConsole />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
