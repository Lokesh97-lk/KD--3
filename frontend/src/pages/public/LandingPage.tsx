import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  BarChart3, 
  GitFork, 
  Bug, 
  Award, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Activity,
  Code2,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-graphite-900 text-graphite-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 border-b border-graphite-600 px-4 md:px-8 flex items-center justify-between bg-graphite-900/90 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-graphite-800 border border-graphite-600 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-lime-accent" />
          </div>
          <span className="font-mono font-bold text-base tracking-tight">CodeIntellect</span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-graphite-300">
          <Link to="/features" className="hover:text-graphite-100 transition-colors">Architecture & Features</Link>
          <Link to="/learning-paths" className="hover:text-graphite-100 transition-colors">Learning Paths</Link>
          <Link to="/observatory" className="hover:text-lime-accent transition-colors">Learning Observatory</Link>
          <Link to="/skill-passport" className="hover:text-graphite-100 transition-colors">Skill Passport</Link>
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            to="/login" 
            className="text-xs font-mono text-graphite-300 hover:text-graphite-100 px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link 
            to="/dashboard" 
            className="px-3.5 py-1.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Launch Workstation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col items-center text-center space-y-5 max-w-3xl mx-auto">
          <Badge variant="lime" size="md">
            Developer Skill Intelligence Platform
          </Badge>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-graphite-100 font-sans leading-tight">
            Measure learning. Analyze coding behavior. Verify practical competence.
          </h1>

          <p className="text-graphite-300 text-sm md:text-base leading-relaxed max-w-2xl font-sans">
            CodeIntellect goes beyond conventional LMS courses and video quizzes. We analyze how you actually code, debug, and reason under real engineering conditions—producing verifiable, evidence-based technical mastery.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <Link
              to="/dashboard"
              className="px-5 py-2.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs md:text-sm font-bold hover:bg-lime-bright transition-all flex items-center gap-2 shadow-glow"
            >
              <span>Explore Engineering Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/code-lab"
              className="px-5 py-2.5 rounded bg-graphite-800 border border-graphite-600 text-graphite-200 font-mono text-xs md:text-sm font-medium hover:border-graphite-500 hover:text-graphite-100 transition-colors"
            >
              <span>Open Monaco Code Lab</span>
            </Link>
          </div>
        </div>

        {/* Live Workstation Preview Terminal */}
        <div className="mt-12 rounded-lg border border-graphite-600 bg-graphite-800 shadow-panel overflow-hidden">
          <div className="h-9 bg-graphite-850 border-b border-graphite-600 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-graphite-600 inline-block" />
              <span className="w-3 h-3 rounded-full bg-graphite-600 inline-block" />
              <span className="w-3 h-3 rounded-full bg-graphite-600 inline-block" />
              <span className="text-xs font-mono text-graphite-400 ml-2">codeintellect-workstation-session-01.py</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-graphite-400">
              <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-lime-accent" /> Memory: 14.2 MB</span>
              <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-lime-accent" /> Verdict: Accepted (38ms)</span>
            </div>
          </div>

          <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-graphite-900/60 font-mono text-xs">
            {/* Code column */}
            <div className="lg:col-span-7 bg-graphite-950 p-4 rounded border border-graphite-600/80 overflow-x-auto text-graphite-200">
              <div className="text-graphite-500 mb-2"># Signature Scenario: Sliding Window Log Rate Limiter</div>
              <div><span className="text-status-warning">class</span> <span className="text-lime-accent font-bold">SlidingWindowLimiter</span>:</div>
              <div className="pl-4 text-graphite-400">def __init__(self, max_requests: int, window_size_ms: int):</div>
              <div className="pl-8 text-graphite-300">self.max_requests = max_requests</div>
              <div className="pl-8 text-graphite-300">self.window_size_ms = window_size_ms</div>
              <div className="pl-8 text-graphite-300">self.client_windows = &#123;&#125;</div>
              <br />
              <div className="pl-4 text-graphite-400">def allow_request(self, client_id: str, timestamp_ms: int) -&gt; bool:</div>
              <div className="pl-8 text-graphite-400"># Evict expired logs older than sliding threshold</div>
              <div className="pl-8 text-graphite-300">cutoff = timestamp_ms - self.window_size_ms</div>
              <div className="pl-8 text-graphite-300">window = self.client_windows.setdefault(client_id, [])</div>
              <div className="pl-8 text-graphite-300">while window and window[0] &lt;= cutoff:</div>
              <div className="pl-12 text-graphite-300">window.pop(0)</div>
              <div className="pl-8 text-graphite-300">if len(window) &lt; self.max_requests:</div>
              <div className="pl-12 text-lime-accent font-bold">window.append(timestamp_ms); return True</div>
              <div className="pl-8 text-status-error font-bold">return False</div>
            </div>

            {/* Observatory insights column */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="bg-graphite-800 p-4 rounded border border-graphite-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[11px] text-graphite-400 uppercase tracking-wider">Learning Observatory Telemetry</span>
                  <Badge variant="lime">Active Session</Badge>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1 border-b border-graphite-700">
                    <span className="text-graphite-300 font-sans">Focused Coding Time</span>
                    <span className="font-mono font-bold text-graphite-100">21.2 hrs</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-graphite-700">
                    <span className="text-graphite-300 font-sans">Debugging & Fix Time</span>
                    <span className="font-mono font-bold text-graphite-100">10.8 hrs</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-graphite-300 font-sans">Focus Efficiency Index</span>
                    <span className="font-mono font-bold text-lime-accent">87.4%</span>
                  </div>
                </div>
              </div>

              <div className="bg-graphite-800 p-4 rounded border border-graphite-600">
                <div className="flex items-center gap-2 text-lime-accent mb-1 font-sans font-semibold text-xs">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Competence Passport Item</span>
                </div>
                <p className="text-graphite-300 font-sans text-xs">
                  Demonstrated monotonic lease checks and sliding-window concurrency under 10,000 requests.
                </p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="gray">Concurrency</Badge>
                  <Badge variant="gray">Rate Limiting</Badge>
                  <Badge variant="lime">Proficient</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="py-16 bg-graphite-850 border-t border-graphite-600 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-graphite-100 mb-3">
              Built for Engineering Truth, Not Gamified Engagement
            </h2>
            <p className="text-graphite-300 text-xs md:text-sm">
              We reject arbitrary quiz streaks and fake completion percentages in favor of measurable technical competence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded bg-graphite-800 border border-graphite-600 hover:border-lime-accent/50 transition-colors">
              <div className="w-10 h-10 rounded bg-lime-muted border border-lime-dim/40 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5 text-lime-accent" />
              </div>
              <h3 className="text-base font-bold text-graphite-100 mb-2">Learning Observatory</h3>
              <p className="text-xs text-graphite-300 leading-relaxed font-sans">
                True session-level observability. Distinguish elapsed reading time from active coding, test-driven debugging, and revision cycles.
              </p>
            </div>

            <div className="p-5 rounded bg-graphite-800 border border-graphite-600 hover:border-lime-accent/50 transition-colors">
              <div className="w-10 h-10 rounded bg-lime-muted border border-lime-dim/40 flex items-center justify-center mb-4">
                <GitFork className="w-5 h-5 text-lime-accent" />
              </div>
              <h3 className="text-base font-bold text-graphite-100 mb-2">Concept Dependency Graph</h3>
              <p className="text-xs text-graphite-300 leading-relaxed font-sans">
                Versioned prerequisite mapping. Pinpoint exactly which fundamental concept (e.g. pointers or event loops) is blocking advanced topics.
              </p>
            </div>

            <div className="p-5 rounded bg-graphite-800 border border-graphite-600 hover:border-lime-accent/50 transition-colors">
              <div className="w-10 h-10 rounded bg-lime-muted border border-lime-dim/40 flex items-center justify-center mb-4">
                <Bug className="w-5 h-5 text-lime-accent" />
              </div>
              <h3 className="text-base font-bold text-graphite-100 mb-2">Debugging Intelligence</h3>
              <p className="text-xs text-graphite-300 leading-relaxed font-sans">
                Synthesize repetitive compiler and runtime failures into actionable debugging hypotheses, tracking your time-to-fix metrics over attempts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Paths Preview */}
      <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <Badge variant="lime">Structured Curricula</Badge>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-graphite-100 mt-2">
              Engineering Learning Tracks
            </h2>
            <p className="text-graphite-300 text-xs md:text-sm mt-1">
              Curated by senior systems architects and industry researchers.
            </p>
          </div>
          <Link
            to="/learning-paths"
            className="text-xs font-mono text-lime-accent hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Explore All Learning Paths</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-5 rounded bg-graphite-800 border border-graphite-600 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="lime">Advanced</Badge>
              <span className="font-mono text-xs text-graphite-400">16 hrs estimated</span>
            </div>
            <h3 className="text-base font-bold text-graphite-100 font-sans">
              High-Throughput Systems & Defensive Engineering
            </h3>
            <p className="text-xs text-graphite-300 font-sans leading-relaxed">
              Master non-blocking I/O architectures, thread synchronization, boundary invariance, and zero-allocation memory pipelines under extreme load.
            </p>
            <div className="pt-2 flex justify-between items-center text-xs font-mono border-t border-graphite-700">
              <span className="text-graphite-400">Author: Elena Rostova</span>
              <Link to="/courses/high-throughput-systems" className="text-lime-accent hover:underline font-bold">
                Start Track →
              </Link>
            </div>
          </div>

          <div className="p-5 rounded bg-graphite-800 border border-graphite-600 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="gray">Intermediate</Badge>
              <span className="font-mono text-xs text-graphite-400">12 hrs estimated</span>
            </div>
            <h3 className="text-base font-bold text-graphite-100 font-sans">
              Database Query Engine Internals & Index Design
            </h3>
            <p className="text-xs text-graphite-300 font-sans leading-relaxed">
              Analyze storage engines, B-tree balance heuristics, cost-based optimizers, and deep cursor pagination strategies.
            </p>
            <div className="pt-2 flex justify-between items-center text-xs font-mono border-t border-graphite-700">
              <span className="text-graphite-400">Author: Staff Engineers</span>
              <Link to="/courses/database-internals" className="text-lime-accent hover:underline font-bold">
                Start Track →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Registration & CTA Section */}
      <section className="py-14 bg-graphite-850 border-y border-graphite-600 px-4 md:px-8 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-graphite-100">
            Ready to Verify Your Engineering Competence?
          </h2>
          <p className="text-graphite-300 text-xs md:text-sm leading-relaxed">
            Join students, instructors, and hiring engineering teams who measure practical skills using real code execution and telemetry.
          </p>
          <div className="flex justify-center gap-3 pt-2">
            <Link
              to="/register"
              className="px-6 py-2.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors shadow-sm"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100 font-mono text-xs font-bold transition-colors"
            >
              Sign In to Workstation
            </Link>
          </div>
        </div>
      </section>

      {/* Contact & Platform Support */}
      <section className="py-12 px-4 md:px-8 max-w-6xl mx-auto w-full text-xs font-mono text-graphite-400">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded bg-graphite-800 border border-graphite-600">
          <div>
            <div className="text-graphite-200 font-bold uppercase text-[11px] mb-1">Platform Inquiries</div>
            <p className="text-graphite-400">support@codeintellect.io</p>
            <p className="text-graphite-400">+1 (800) 555-CODE</p>
          </div>
          <div>
            <div className="text-graphite-200 font-bold uppercase text-[11px] mb-1">Academic & Cohort Licenses</div>
            <p className="text-graphite-400">curriculum@codeintellect.io</p>
            <p className="text-graphite-400">Custom rubrics & assessment sandboxes</p>
          </div>
          <div>
            <div className="text-graphite-200 font-bold uppercase text-[11px] mb-1">Security & Sandboxing</div>
            <p className="text-graphite-400">security@codeintellect.io</p>
            <p className="text-graphite-400">Disposable execution runners & test confidentiality</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-graphite-600 px-4 md:px-8 bg-graphite-900 text-xs font-mono text-graphite-400">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-lime-accent" />
            <span className="font-bold text-graphite-200">CodeIntellect</span>
            <span>— Intelligent Coding Learning & Assessment Platform</span>
          </div>
          <div className="flex gap-6">
            <Link to="/features" className="hover:text-graphite-100">Features</Link>
            <Link to="/learning-paths" className="hover:text-graphite-100">Catalog</Link>
            <Link to="/dashboard" className="text-lime-accent hover:underline">Workstation</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
