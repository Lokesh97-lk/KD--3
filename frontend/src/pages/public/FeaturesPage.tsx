import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  GitFork, 
  Bug, 
  Terminal, 
  Award, 
  RotateCcw, 
  ShieldAlert, 
  Cpu, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';

export const FeaturesPage: React.FC = () => {
  const features = [
    {
      title: 'Learning Observatory',
      badge: 'Core Metric Engine',
      icon: BarChart3,
      description: 'Granular telemetry capturing actual active interaction, discriminating between passive reading, active syntax drafting, test-driven debugging, and revision review.',
      metrics: ['Focused study time per topic', 'Active vs elapsed interaction ratio', 'Time-investment vs score delta', 'Daily session length distribution']
    },
    {
      title: 'Concept Dependency Graph',
      badge: 'Versioned Curriculum DAG',
      icon: GitFork,
      description: 'Directional graph mapping foundational primitives directly to complex engineering paradigms, visually isolating which unmastered prerequisite causes failure in downstream topics.',
      metrics: ['Topological prerequisite traversal', 'Evidence-based topic mastery status', 'Versioned concept schemas', 'Targeted recovery curriculum pathways']
    },
    {
      title: 'Debugging Intelligence',
      badge: 'Diagnostic Engine',
      icon: Bug,
      description: 'Captures and classifies repeated compilation errors, runtime exceptions, and boundary failures, evaluating developer problem-solving time-to-fix curves.',
      metrics: ['Error category clustering', 'Off-by-one and race condition detection', 'Time spent prior to successful commit', 'Deterministic debugging hypotheses']
    },
    {
      title: 'Isolated Monaco Code Lab',
      badge: 'Secure Execution Sandbox',
      icon: Terminal,
      description: 'Zero-trust browser development environment executing against disposable sandbox runners with CPU limits, memory bounds, and confidential hidden test validation.',
      metrics: ['Execution verdicts (Accepted, WA, TLE, RE)', 'Sub-millisecond runtime measurements', 'Peak resident set memory metrics', 'No untrusted code inside API runtime']
    },
    {
      title: 'Engineering Scenario Simulator',
      badge: 'Practical Architecture Work',
      icon: Layers,
      description: 'Simulates realistic software engineering tasks: resolving failing REST APIs, curing PostgreSQL query deadlocks, fixing security timing vulnerabilities, and refactoring pagination.',
      metrics: ['Deterministic automated unit & load tests', 'Multi-dimensional rubric evaluations', 'Production-grade starter repositories', 'Real-world system constraints']
    },
    {
      title: 'Evidence-Based Skill Passport',
      badge: 'Verifiable Developer Profile',
      icon: Award,
      description: 'A tamper-proof, verified technical profile where every claim links directly to immutable assessment logs, scenario completions, and benchmark evidence.',
      metrics: ['Direct links to submission evidence', 'Privacy-controlled public sharing', 'Rigorous multi-stage verification', 'Zero self-declared unverified claims']
    }
  ];

  return (
    <div className="min-h-screen bg-graphite-900 text-graphite-100 flex flex-col">
      <header className="h-16 border-b border-graphite-600 px-4 md:px-8 flex items-center justify-between bg-graphite-900/90 backdrop-blur sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-graphite-800 border border-graphite-600 flex items-center justify-center">
            <Terminal className="w-4 h-4 text-lime-accent" />
          </div>
          <span className="font-mono font-bold text-base tracking-tight">CodeIntellect</span>
        </Link>
        <Link 
          to="/dashboard" 
          className="px-3.5 py-1.5 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center gap-1.5"
        >
          <span>Open Dashboard</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </header>

      <main className="max-w-6xl mx-auto py-12 px-4 md:px-8 flex-1">
        <div className="max-w-3xl mb-12">
          <Badge variant="lime" size="md">Architecture & Engineering Features</Badge>
          <h1 className="text-3xl md:text-4xl font-extrabold text-graphite-100 mt-3 font-sans tracking-tight">
            Designed for Evidence, Depth, and Measurable Competence
          </h1>
          <p className="text-graphite-300 text-sm mt-3 leading-relaxed">
            Every feature in CodeIntellect is constructed as a transparent analytical instrument. We provide mathematical transparency into how metrics are computed, avoiding synthetic engagement tricks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="p-6 rounded bg-graphite-800 border border-graphite-600 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded bg-lime-muted border border-lime-dim/40 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-lime-accent" />
                    </div>
                    <Badge variant="gray">{feat.badge}</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-graphite-100 mb-2 font-sans">{feat.title}</h3>
                  <p className="text-xs text-graphite-300 leading-relaxed mb-4">{feat.description}</p>
                </div>

                <div className="pt-4 border-t border-graphite-700">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-graphite-400 mb-2">Tracked Telemetry:</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs font-mono text-graphite-300">
                    {feat.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="flex items-center gap-1.5">
                        <span className="text-lime-accent">▸</span>
                        <span className="truncate">{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};
