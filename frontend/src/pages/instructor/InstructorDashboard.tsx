import React, { useState, useEffect } from 'react';
import { GraduationCap, BookOpen, Code2, Users, CheckCircle2, Eye, Plus, ArrowRight, X } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';
import { apiClient } from '../../api/client';
import { Course } from '../../types';

export const InstructorDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'courses' | 'submissions' | 'cohort'>('courses');
  const [stats, setStats] = useState({
    active_students: 142,
    authored_courses: 3,
    pending_reviews: 1,
    cohort_accuracy: '79.4%',
  });
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [selectedSub, setSelectedSub] = useState<any | null>(null);
  const [gradeScore, setGradeScore] = useState<number>(85);
  const [gradeFeedback, setGradeFeedback] = useState<string>('Strong implementation of composite index and query rewrite.');
  const [submittingGrade, setSubmittingGrade] = useState(false);

  // Course authoring modal state
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [courseSlug, setCourseSlug] = useState('');
  const [courseDesc, setCourseDesc] = useState('');
  const [courseLevel, setCourseLevel] = useState('Intermediate');
  const [creatingCourse, setCreatingCourse] = useState(false);

  const loadData = async () => {
    try {
      const [st, c, subs] = await Promise.all([
        apiClient.getInstructorStats(),
        apiClient.getCourses(),
        apiClient.getInstructorSubmissions(),
      ]);
      setStats(st);
      setCourses(c);
      setSubmissions(subs);
    } catch (err) {
      console.error('Failed to load instructor studio data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;
    setSubmittingGrade(true);
    try {
      await apiClient.evaluateSubmission(selectedSub.id, gradeScore, gradeFeedback);
      setSelectedSub(null);
      await loadData();
    } catch (err) {
      console.error('Failed to submit evaluation', err);
    } finally {
      setSubmittingGrade(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCourse(true);
    try {
      const token = localStorage.getItem('codeintellect_token');
      await fetch('/api/v1/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: courseTitle,
          slug: courseSlug || courseTitle.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          description: courseDesc,
          level: courseLevel,
          category: 'Software Engineering',
          duration_hours: 12,
          modules: [
            {
              title: 'Module 1: Core Principles',
              description: 'Fundamental concepts and safety guarantees',
              lessons: [
                {
                  title: '1.1 System Architecture Invariants',
                  slug: 'sys-arch-invariants',
                  content_markdown: '# System Architecture\nDesign for resilience.',
                  duration_minutes: 20,
                  order_index: 0,
                }
              ]
            }
          ]
        }),
      });
      setShowCourseModal(false);
      setCourseTitle('');
      setCourseSlug('');
      setCourseDesc('');
      await loadData();
    } catch (err) {
      console.error('Failed to create course', err);
    } finally {
      setCreatingCourse(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Instructor Studio & Curriculum Management
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Design curricula, author test cases, and evaluate engineering rubric submissions
          </p>
        </div>

        <button 
          onClick={() => setShowCourseModal(true)}
          className="px-3.5 py-1.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Curriculum Module</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Active Cohort Learners"
          value={stats.active_students}
          unit="students"
          subtext="Enrolled across platform"
          icon={Users}
          highlight
        />
        <StatCard
          label="Authored Courses"
          value={courses.length || stats.authored_courses}
          unit="tracks"
          subtext="Published curricula"
          icon={BookOpen}
        />
        <StatCard
          label="Pending Rubric Reviews"
          value={submissions.filter(s => s.status === 'Pending Review').length}
          unit="submissions"
          subtext="Awaiting instructor feedback"
        />
        <StatCard
          label="Cohort Pass Accuracy"
          value={stats.cohort_accuracy}
          unit="avg"
          subtext="Across practical assessments"
        />
      </div>

      {/* Workspace Tabs */}
      <div className="flex border-b border-graphite-700 bg-graphite-850 rounded-t p-1 text-xs font-mono">
        <button
          onClick={() => setActiveTab('courses')}
          className={`px-4 py-1.5 rounded transition-colors ${
            activeTab === 'courses' ? 'bg-graphite-700 text-lime-accent font-bold' : 'text-graphite-400 hover:text-graphite-200'
          }`}
        >
          Curriculum Editor ({courses.length})
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-4 py-1.5 rounded transition-colors ${
            activeTab === 'submissions' ? 'bg-graphite-700 text-lime-accent font-bold' : 'text-graphite-400 hover:text-graphite-200'
          }`}
        >
          Rubric Submissions Review ({submissions.length})
        </button>
        <button
          onClick={() => setActiveTab('cohort')}
          className={`px-4 py-1.5 rounded transition-colors ${
            activeTab === 'cohort' ? 'bg-graphite-700 text-lime-accent font-bold' : 'text-graphite-400 hover:text-graphite-200'
          }`}
        >
          Cohort Misconception Diagnostics
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-graphite-800 border border-graphite-600 rounded-b p-5 space-y-4">
        {activeTab === 'courses' && (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course.id} className="p-4 rounded bg-graphite-900 border border-graphite-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-graphite-100 font-sans">
                      {course.title}
                    </h3>
                    <Badge variant="lime">Published</Badge>
                    <Badge variant="gray">{course.level}</Badge>
                  </div>
                  <div className="text-xs font-mono text-graphite-400 mt-1">
                    {course.total_lessons} Lessons · {course.duration_hours}h estimated · Author: {course.instructor_name}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/courses/${course.slug}`}
                    className="px-3 py-1.5 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100 font-mono text-xs font-bold"
                  >
                    View Syllabus
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-graphite-700 text-graphite-400 uppercase text-[11px]">
                  <th className="py-2.5 px-3">Student</th>
                  <th className="py-2.5 px-3">Scenario Task</th>
                  <th className="py-2.5 px-3">Submitted</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-graphite-700/60 text-graphite-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-graphite-700/40">
                    <td className="py-2.5 px-3 font-sans font-medium text-graphite-100">{sub.student_name}</td>
                    <td className="py-2.5 px-3">{sub.milestone_title || sub.project_title}</td>
                    <td className="py-2.5 px-3 text-graphite-400">{new Date(sub.submitted_at).toLocaleDateString()}</td>
                    <td className="py-2.5 px-3 font-bold text-lime-accent">{sub.score ? `${sub.score}/100` : 'Pending'}</td>
                    <td className="py-2.5 px-3">
                      <Badge variant={sub.status === 'Graded' ? 'lime' : 'warning'}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedSub(sub);
                          setGradeScore(sub.score || 85);
                          setGradeFeedback(sub.feedback || 'Code meets engineering rubric requirements.');
                        }}
                        className="px-3 py-1 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-200 hover:text-graphite-100"
                      >
                        Grade Rubric
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'cohort' && (
          <div className="space-y-3 font-sans text-xs">
            <div className="p-3.5 rounded bg-graphite-900 border border-graphite-700 space-y-1">
              <div className="font-bold text-graphite-100 flex items-center justify-between">
                <span>Top Cohort Stumbling Block: Stale Lock Race Conditions</span>
                <Badge variant="error">38% Failure Rate</Badge>
              </div>
              <p className="text-graphite-300">
                Students frequently omit monotonic fencing token verification at the database commit boundary.
              </p>
            </div>
            <div className="p-3.5 rounded bg-graphite-900 border border-graphite-700 space-y-1">
              <div className="font-bold text-graphite-100 flex items-center justify-between">
                <span>Secondary Issue: OFFSET Pagination Memory Blowups</span>
                <Badge variant="warning">24% Failure Rate</Badge>
              </div>
              <p className="text-graphite-300">
                Students struggle to convert compound ORDER BY columns into reliable cursor tuples.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Grade Rubric Modal */}
      {selectedSub && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite-800 border border-graphite-600 rounded max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-graphite-700">
              <h3 className="font-sans font-bold text-sm text-graphite-100">
                Evaluate Student Submission: {selectedSub.student_name}
              </h3>
              <button onClick={() => setSelectedSub(null)} className="text-graphite-400 hover:text-graphite-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div>
                <span className="text-graphite-400 block text-[10px]">Project Milestone:</span>
                <span className="text-graphite-100">{selectedSub.milestone_title || selectedSub.project_title}</span>
              </div>
              {selectedSub.repo_link && (
                <div>
                  <span className="text-graphite-400 block text-[10px]">Repository Link:</span>
                  <a href={selectedSub.repo_link} target="_blank" rel="noreferrer" className="text-lime-accent hover:underline">
                    {selectedSub.repo_link}
                  </a>
                </div>
              )}
              {selectedSub.code_snippet && (
                <div>
                  <span className="text-graphite-400 block text-[10px]">Submitted Code Snippet:</span>
                  <pre className="p-2 rounded bg-graphite-900 text-graphite-300 overflow-x-auto text-[11px]">
                    {selectedSub.code_snippet}
                  </pre>
                </div>
              )}
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-graphite-300 mb-1">Rubric Score (0 - 100):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeScore}
                  onChange={(e) => setGradeScore(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                  required
                />
              </div>

              <div>
                <label className="block text-graphite-300 mb-1">Instructor Rubric Feedback:</label>
                <textarea
                  rows={3}
                  value={gradeFeedback}
                  onChange={(e) => setGradeFeedback(e.target.value)}
                  className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-graphite-700">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-3 py-1.5 rounded bg-graphite-700 text-graphite-300 hover:bg-graphite-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingGrade}
                  className="px-4 py-1.5 rounded bg-lime-accent text-graphite-950 font-bold hover:bg-lime-bright"
                >
                  {submittingGrade ? 'Recording...' : 'Save Evaluation & Verify Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Authoring Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite-800 border border-graphite-600 rounded max-w-md w-full p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-graphite-700">
              <h3 className="font-sans font-bold text-sm text-graphite-100">
                Create New Curriculum Track
              </h3>
              <button onClick={() => setShowCourseModal(false)} className="text-graphite-400 hover:text-graphite-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-3 font-mono text-xs">
              <div>
                <label className="block text-graphite-300 mb-1">Course Title:</label>
                <input
                  type="text"
                  required
                  value={courseTitle}
                  onChange={(e) => {
                    setCourseTitle(e.target.value);
                    setCourseSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-'));
                  }}
                  placeholder="e.g. Distributed Consensus & Raft Protocols"
                  className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                />
              </div>

              <div>
                <label className="block text-graphite-300 mb-1">Slug:</label>
                <input
                  type="text"
                  required
                  value={courseSlug}
                  onChange={(e) => setCourseSlug(e.target.value)}
                  className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                />
              </div>

              <div>
                <label className="block text-graphite-300 mb-1">Level:</label>
                <select
                  value={courseLevel}
                  onChange={(e) => setCourseLevel(e.target.value)}
                  className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-graphite-300 mb-1">Description:</label>
                <textarea
                  rows={3}
                  required
                  value={courseDesc}
                  onChange={(e) => setCourseDesc(e.target.value)}
                  placeholder="Course learning goals and core concepts..."
                  className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-graphite-700">
                <button
                  type="button"
                  onClick={() => setShowCourseModal(false)}
                  className="px-3 py-1.5 rounded bg-graphite-700 text-graphite-300 hover:bg-graphite-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingCourse}
                  className="px-4 py-1.5 rounded bg-lime-accent text-graphite-950 font-bold hover:bg-lime-bright"
                >
                  {creatingCourse ? 'Creating...' : 'Publish Curriculum Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
