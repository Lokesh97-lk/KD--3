import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Clock, 
  BarChart3, 
  Bug, 
  Award, 
  ArrowRight, 
  Play, 
  AlertTriangle, 
  CheckCircle2, 
  Layers, 
  History,
  GitFork,
  Flame,
  Activity
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../api/client';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { Course, Submission, RevisionRecommendation, ObservatoryMetric } from '../../types';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<ObservatoryMetric | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [recommendations, setRecommendations] = useState<RevisionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, c, s, r] = await Promise.all([
          apiClient.getObservatoryMetrics(),
          apiClient.getCourses(),
          apiClient.getSubmissions(),
          apiClient.getRevisionRecommendations(),
        ]);
        setMetrics(m);
        setCourses(c);
        setSubmissions(s);
        setRecommendations(r);
      } catch (err) {
        console.error('Failed to load dashboard telemetry', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeCourse = courses[0];
  const primaryRecommendation = recommendations[0];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Welcome & System Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Developer Workstation: {user?.full_name || 'Engineer'}
            </h1>
            <Badge variant="lime">Active Session</Badge>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Role: <span className="text-graphite-200 capitalize">{user?.role || 'student'}</span> · Timezone: {user?.timezone || 'UTC'} · Telemetry: Verified
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/code-lab"
            className="px-3 py-1.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Open Code Lab</span>
          </Link>
          <Link
            to="/observatory"
            className="px-3 py-1.5 rounded bg-graphite-700 border border-graphite-600 text-graphite-200 font-mono text-xs font-medium hover:border-graphite-500 transition-colors"
          >
            Observatory
          </Link>
        </div>
      </div>

      {/* High-Density Key Engineering Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <StatCard
          label="Focused Study Time"
          value={metrics?.total_study_hours || 46.5}
          unit="hrs"
          subtext="21.2h coding · 10.8h debugging"
          icon={Clock}
          trend={{ value: '14% this week', isPositive: true }}
          highlight
        />
        <StatCard
          label="Focus Efficiency"
          value={metrics?.focus_efficiency_score || 87.4}
          unit="%"
          subtext="Active interaction ratio"
          icon={Activity}
          trend={{ value: 'Optimal (>85%)', isPositive: true }}
        />
        <StatCard
          label="Study Sessions"
          value={metrics?.sessions_count || 34}
          unit="sessions"
          subtext="82m average session duration"
          icon={Flame}
        />
        <StatCard
          label="Verified Skills"
          value="4"
          unit="items"
          subtext="Evidence-backed passport entries"
          icon={Award}
        />
      </div>

      {/* Main Grid: Priority Action + Debugging Intelligence Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Active Course & Recommended Drill */}
        <div className="lg:col-span-8 space-y-6">
          {/* Recommended Next Engineering Task */}
          {primaryRecommendation && (
            <div className="p-4 bg-graphite-800 border-l-4 border-l-lime-accent border border-graphite-600 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-lime-accent uppercase tracking-wider font-bold flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 fill-lime-accent" />
                  Recommended Engineering Recovery Step
                </span>
                <Badge variant="warning" size="sm">Urgency: High</Badge>
              </div>
              <h3 className="text-sm md:text-base font-bold text-graphite-100 font-sans mb-1">
                {primaryRecommendation.topic}
              </h3>
              <p className="text-xs text-graphite-300 leading-relaxed font-sans mb-3">
                {primaryRecommendation.explanation}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-graphite-700/60">
                <span className="text-xs font-mono text-graphite-400">
                  Estimated duration: ~{primaryRecommendation.estimated_minutes} mins
                </span>
                <Link
                  to={`/code-lab?problem=${primaryRecommendation.problem_id || 'prob-rate-limiter'}`}
                  className="px-3 py-1 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center gap-1"
                >
                  <span>Launch Drill</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Active Learning Path Progress */}
          {activeCourse && (
            <div className="p-5 bg-graphite-800 border border-graphite-600 rounded">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-graphite-400 uppercase tracking-wider font-semibold">
                  In-Progress Curriculum Path
                </span>
                <Badge variant="gray">{activeCourse.level}</Badge>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold text-graphite-100 font-sans">
                    {activeCourse.title}
                  </h2>
                  <p className="text-xs text-graphite-300 mt-1 line-clamp-2 font-sans">
                    {activeCourse.description}
                  </p>
                </div>

                <Link
                  to={`/courses/${activeCourse.slug}`}
                  className="shrink-0 px-4 py-2 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100 border border-graphite-500 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>Resume Path</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Progress bar */}
              <div className="mt-4 pt-3 border-t border-graphite-700">
                <div className="flex justify-between text-xs font-mono mb-1.5">
                  <span className="text-graphite-400">Path Completion</span>
                  <span className="text-lime-accent font-bold">
                    {activeCourse.completed_lessons} of {activeCourse.total_lessons} lessons ({Math.round(((activeCourse.completed_lessons || 0) / activeCourse.total_lessons) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-graphite-900 rounded-full overflow-hidden border border-graphite-700">
                  <div 
                    className="h-full bg-lime-accent rounded-full transition-all"
                    style={{ width: `${((activeCourse.completed_lessons || 0) / activeCourse.total_lessons) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Recent Submissions Feed */}
          <div className="p-5 bg-graphite-800 border border-graphite-600 rounded">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-lime-accent" />
                <h3 className="text-sm font-bold text-graphite-100 font-sans">Recent Code Lab Submissions</h3>
              </div>
              <Link to="/submissions" className="text-xs font-mono text-lime-accent hover:underline">
                View Full Log →
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-graphite-700 text-graphite-400">
                    <th className="pb-2">Problem</th>
                    <th className="pb-2">Verdict</th>
                    <th className="pb-2">Passed</th>
                    <th className="pb-2">Runtime</th>
                    <th className="pb-2">Memory</th>
                    <th className="pb-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-graphite-700/60 text-graphite-200">
                  {submissions.slice(0, 3).map((s) => (
                    <tr key={s.id} className="hover:bg-graphite-700/40">
                      <td className="py-2.5 font-sans font-medium text-graphite-100">{s.problem_title}</td>
                      <td className="py-2.5">
                        <Badge 
                          variant={s.verdict === 'Accepted' ? 'lime' : s.verdict === 'Wrong Answer' ? 'error' : 'warning'}
                        >
                          {s.verdict}
                        </Badge>
                      </td>
                      <td className="py-2.5">{s.passed_tests}/{s.total_tests}</td>
                      <td className="py-2.5">{s.runtime_ms}ms</td>
                      <td className="py-2.5">{(s.memory_kb / 1024).toFixed(1)}MB</td>
                      <td className="py-2.5 text-graphite-400">{new Date(s.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Debugging Intelligence & Concept Explorer */}
        <div className="lg:col-span-4 space-y-6">
          {/* Debugging Alert Box */}
          <div className="p-4 bg-graphite-800 border border-graphite-600 rounded space-y-3">
            <div className="flex items-center gap-2 text-status-warning font-sans font-bold text-xs">
              <AlertTriangle className="w-4 h-4" />
              <span>Debugging Intelligence Signal</span>
            </div>
            <p className="text-xs text-graphite-300 font-sans leading-relaxed">
              Detected recurring pattern: <span className="font-mono text-graphite-100">Off-by-One Boundary Condition</span> appeared in 18 recent runs, taking ~12.4m to repair.
            </p>
            <div className="p-2.5 rounded bg-graphite-900 border border-graphite-700 text-xs font-mono text-graphite-300">
              <span className="text-lime-accent font-bold">Hypothesis:</span> Array slicing boundary condition overlooked when timestamp equals cutoff boundary.
            </div>
            <Link
              to="/debugging"
              className="inline-flex items-center gap-1.5 text-xs font-mono text-lime-accent hover:underline pt-1"
            >
              Inspect Debug Diagnostics →
            </Link>
          </div>

          {/* Quick Concept DAG Preview */}
          <div className="p-4 bg-graphite-800 border border-graphite-600 rounded space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-graphite-400 uppercase tracking-wider font-semibold">
                Prerequisite Mastery DAG
              </span>
              <Link to="/concept-graph" className="text-[11px] font-mono text-lime-accent hover:underline">
                Explore Full Graph →
              </Link>
            </div>

            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center justify-between p-2 rounded bg-graphite-900 border border-graphite-700">
                <span className="text-graphite-200">Data Structures & Memory</span>
                <Badge variant="lime">95% Mastered</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-graphite-900 border border-graphite-700">
                <span className="text-graphite-200">Asynchronous Event Loops</span>
                <Badge variant="lime">84% Mastered</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-graphite-900 border border-graphite-700">
                <span className="text-graphite-200">Thread Locks & Concurrency</span>
                <Badge variant="warning">62% In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-graphite-900 border border-status-warning/40">
                <span className="text-graphite-200">Distributed Consensus (Raft)</span>
                <Badge variant="error">Prerequisite Weak</Badge>
              </div>
            </div>
          </div>

          {/* Practical Engineering Scenario Card */}
          <div className="p-4 bg-graphite-800 border border-graphite-600 rounded">
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-lime-accent" />
              <h4 className="text-xs font-bold text-graphite-100 font-sans uppercase tracking-wider">
                Active Scenario Studio
              </h4>
            </div>
            <p className="text-xs text-graphite-300 font-sans leading-relaxed mb-3">
              Diagnose and Resolve Unbounded Query Pagination over 10M rows in PostgreSQL.
            </p>
            <Link
              to="/projects"
              className="w-full py-1.5 rounded bg-graphite-700 hover:bg-graphite-600 border border-graphite-500 text-graphite-100 text-xs font-mono text-center block transition-colors"
            >
              View Scenario Rubric & Code
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
