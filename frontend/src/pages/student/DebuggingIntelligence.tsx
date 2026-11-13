import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';
import { Bug, AlertTriangle, ArrowRight, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../api/client';
import { DebugErrorCategory } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { StatCard } from '../../components/ui/StatCard';

export const DebuggingIntelligence: React.FC = () => {
  const [errors, setErrors] = useState<DebugErrorCategory[]>([]);

  useEffect(() => {
    const fetchErrors = async () => {
      const data = await apiClient.getDebuggingErrors();
      setErrors(data);
    };
    fetchErrors();
  }, []);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Bug className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Debugging Intelligence & Error Synthesis
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Classifies compiler failures, runtime crashes, and developer time-to-fix curves
          </p>
        </div>

        <Badge variant="lime">Deterministic Analysis</Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Intercepted Bugs"
          value="53"
          unit="crashes"
          subtext="Across 12 coding problems"
          icon={Bug}
        />
        <StatCard
          label="Average Fix Duration"
          value="17.6"
          unit="mins"
          subtext="From first failure to Accepted"
          icon={AlertTriangle}
          trend={{ value: '4.2m faster', isPositive: true }}
          highlight
        />
        <StatCard
          label="Primary Failure Mode"
          value="34%"
          subtext="Off-by-One Boundary Condition"
        />
        <StatCard
          label="Test-Driven Fix Rate"
          value="88.2%"
          unit="fixed"
          subtext="Resolved without hints"
        />
      </div>

      {/* Main Error Distribution Chart & Hypotheses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Error Category Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-graphite-800 border border-graphite-600 rounded flex flex-col justify-between">
          <div className="mb-4">
            <h2 className="text-sm font-bold text-graphite-100 font-sans">
              Error Category Frequency (Occurrences)
            </h2>
            <span className="text-[11px] font-mono text-graphite-400">
              Distribution of repeated root causes
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={errors} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242D37" horizontal={false} />
                <XAxis type="number" stroke="#7B8A97" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis dataKey="category" type="category" stroke="#E8EEF2" fontSize={10} fontFamily="Inter" width={160} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', borderColor: '#303B45', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#E8EEF2' }}
                />
                <Bar dataKey="count" name="Error Count" fill="#FFC043" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actionable Debugging Hypotheses (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-graphite-800 border border-graphite-600 rounded space-y-4">
          <h2 className="text-sm font-bold text-graphite-100 font-sans flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-lime-accent" />
            <span>Active Debugging Hypotheses</span>
          </h2>

          <div className="p-3.5 rounded bg-graphite-900 border border-graphite-700 space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between">
              <span className="font-bold text-graphite-100">Sliding Window Cutoff Equality</span>
              <Badge variant="warning">Frequent</Badge>
            </div>
            <p className="text-graphite-300 leading-relaxed text-xs">
              Multiple test failures occur specifically when request timestamp matches exactly <code>current - window_size</code>.
            </p>
            <div className="text-[11px] font-mono text-lime-accent">
              Recommended: Ensure strictly monotonic &lt; vs &lt;= operator consistency.
            </div>
          </div>

          <div className="p-3.5 rounded bg-graphite-900 border border-graphite-700 space-y-2 text-xs font-sans">
            <div className="flex items-center justify-between">
              <span className="font-bold text-graphite-100">Event Loop Starvation</span>
              <Badge variant="error">High Latency</Badge>
            </div>
            <p className="text-graphite-300 leading-relaxed text-xs">
              Synchronous sleep calls inside coroutine caused 34-minute debugging sessions.
            </p>
            <div className="text-[11px] font-mono text-lime-accent">
              Recommended: Audit async routines for unawaited I/O blocking.
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/code-lab?problem=prob-rate-limiter"
              className="w-full py-2 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <span>Practice Boundary Test Scenarios</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Detailed Errors Table */}
      <div className="bg-graphite-800 border border-graphite-600 rounded overflow-hidden p-5">
        <h3 className="text-sm font-bold text-graphite-100 font-sans mb-3">
          Error Pattern Diagnostic Table
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-graphite-700 bg-graphite-850 text-graphite-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Failure Category</th>
                <th className="py-2.5 px-3">Total Occurrences</th>
                <th className="py-2.5 px-3">% of All Bugs</th>
                <th className="py-2.5 px-3">Average Fix Time</th>
                <th className="py-2.5 px-3">Resolution Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700/60 text-graphite-200">
              {errors.map((err, idx) => (
                <tr key={idx} className="hover:bg-graphite-700/30">
                  <td className="py-2.5 px-3 font-sans font-medium text-graphite-100">{err.category}</td>
                  <td className="py-2.5 px-3 font-bold text-lime-accent">{err.count}</td>
                  <td className="py-2.5 px-3">{err.percentage}%</td>
                  <td className="py-2.5 px-3">{err.avg_fix_minutes} mins</td>
                  <td className="py-2.5 px-3">
                    <Badge variant={err.trend === 'improving' ? 'lime' : 'warning'}>
                      {err.trend === 'improving' ? 'Improving ↓' : 'Repeating ↑'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
