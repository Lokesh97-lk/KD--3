import React from 'react';
import { Clock, Activity, Calendar, Zap, ArrowRight, BarChart2 } from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';

export const StudyPatterns: React.FC = () => {
  const timeOfDayData = [
    { hour: '06:00 - 09:00 (Early Morning)', sessions: 4, focus: 92, status: 'Peak Focus' },
    { hour: '09:00 - 12:00 (Morning)', sessions: 8, focus: 89, status: 'High' },
    { hour: '14:00 - 18:00 (Afternoon)', sessions: 12, focus: 84, status: 'Moderate' },
    { hour: '20:00 - 23:00 (Late Night)', sessions: 10, focus: 79, status: 'Fatigue Risk' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Study Pattern & Learning Efficiency Analyzer
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Transparent analysis of personal study cadence, session length variance, and focus retention
          </p>
        </div>

        <Badge variant="lime">Privacy Preserved</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Optimal Session Length"
          value="75 - 90"
          unit="mins"
          subtext="Highest accuracy commits"
          icon={Clock}
          highlight
        />
        <StatCard
          label="Topic Switching"
          value="1.8"
          unit="topics/session"
          subtext="Low context-switching penalty"
          icon={Activity}
        />
        <StatCard
          label="Consistency Cadence"
          value="6 / 7"
          unit="days"
          subtext="Consistent daily practice"
          icon={Calendar}
        />
        <StatCard
          label="Efficiency Delta"
          value="+18.4%"
          subtext="Improvement over past 14 days"
          icon={Zap}
        />
      </div>

      {/* Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time of day focus */}
        <div className="p-5 bg-graphite-800 border border-graphite-600 rounded space-y-4">
          <h2 className="text-sm font-bold text-graphite-100 font-sans">
            Session Performance by Time-of-Day Window
          </h2>
          <p className="text-xs text-graphite-300 font-sans leading-relaxed">
            Correlates your test pass rates with the time period when coding exercises were initiated.
          </p>

          <div className="space-y-3 font-mono text-xs">
            {timeOfDayData.map((d, idx) => (
              <div key={idx} className="p-3 rounded bg-graphite-900 border border-graphite-700 flex items-center justify-between">
                <div>
                  <div className="text-graphite-100 font-sans font-medium">{d.hour}</div>
                  <div className="text-graphite-400 text-[11px]">{d.sessions} recorded study sessions</div>
                </div>
                <div className="text-right">
                  <div className="text-lime-accent font-bold">{d.focus}% Accuracy</div>
                  <Badge variant={d.focus >= 88 ? 'lime' : d.focus >= 80 ? 'gray' : 'warning'} size="sm">
                    {d.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Efficiency Formula Transparency */}
        <div className="p-5 bg-graphite-800 border border-graphite-600 rounded space-y-4">
          <h2 className="text-sm font-bold text-graphite-100 font-sans">
            Learning Efficiency Index (Methodology & Formula)
          </h2>
          <p className="text-xs text-graphite-300 font-sans leading-relaxed">
            CodeIntellect publishes the exact formula for efficiency metrics to prevent artificial or opaque rankings:
          </p>

          <div className="p-3.5 rounded bg-graphite-950 border border-graphite-700 text-xs font-mono text-graphite-200 space-y-2">
            <div className="text-lime-accent font-bold">
              Efficiency Score = (FirstAttemptPassRate * 0.4) + (1.0 - (AvgFixTime / MaxCeiling) * 0.3) + (ActiveFocusRatio * 0.3)
            </div>
            <p className="text-[11px] text-graphite-400 font-sans leading-relaxed">
              Weights reflect conceptual correctness on initial run, velocity of resolving syntax/runtime hurdles, and active keystroke interaction vs background idle duration.
            </p>
          </div>

          <div className="p-3 rounded bg-graphite-900 border border-graphite-700 text-xs font-sans text-graphite-300">
            <span className="font-bold text-graphite-100">Analytical Guardrail:</span> Never compare learners across disparate topics or differing problem difficulty tiers.
          </div>
        </div>
      </div>
    </div>
  );
};
