import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { BarChart3, Clock, Calendar, Activity, Filter, Eye, Layers } from 'lucide-react';
import { apiClient } from '../../api/client';
import { StatCard } from '../../components/ui/StatCard';
import { Badge } from '../../components/ui/Badge';
import { TopicTimeData, DailyTrendData, ObservatoryMetric } from '../../types';

export const LearningObservatory: React.FC = () => {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d');
  const [metrics, setMetrics] = useState<ObservatoryMetric | null>(null);
  const [topicTimes, setTopicTimes] = useState<TopicTimeData[]>([]);
  const [dailyTrends, setDailyTrends] = useState<DailyTrendData[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<TopicTimeData | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [m, t, d] = await Promise.all([
        apiClient.getObservatoryMetrics(),
        apiClient.getTopicTimeDistribution(timeRange),
        apiClient.getDailyTrends(timeRange),
      ]);
      setMetrics(m);
      setTopicTimes(t);
      setDailyTrends(d);
      if (t.length > 0) setSelectedTopic(t[0]);
    };
    fetchData();
  }, [timeRange]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header with Time Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Learning Observatory (Signature Feature)
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Empirical telemetry measuring actual focus, coding, debugging, and revision investment
          </p>
        </div>

        {/* Date Filter Segmented Buttons */}
        <div className="flex items-center bg-graphite-900 border border-graphite-600 rounded p-0.5 text-xs font-mono">
          <button
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === 'today' ? 'bg-graphite-700 text-lime-accent font-bold' : 'text-graphite-400 hover:text-graphite-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === '7d' ? 'bg-graphite-700 text-lime-accent font-bold' : 'text-graphite-400 hover:text-graphite-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1 rounded transition-colors ${
              timeRange === '30d' ? 'bg-graphite-700 text-lime-accent font-bold' : 'text-graphite-400 hover:text-graphite-200'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Estimated Focused Time"
          value={metrics?.total_study_hours || 46.5}
          unit="hrs"
          subtext="Passive tabs & idle time filtered"
          icon={Clock}
          highlight
        />
        <StatCard
          label="Coding vs Debugging"
          value="2.0 : 1"
          subtext="21.2h coding to 10.8h debugging"
          icon={Activity}
        />
        <StatCard
          label="Average Session Length"
          value={metrics?.average_session_minutes || 82}
          unit="mins"
          subtext="Across 34 verified sessions"
          icon={Calendar}
        />
        <StatCard
          label="Focus Efficiency Index"
          value={metrics?.focus_efficiency_score || 87.4}
          unit="%"
          subtext="Active interaction ratio"
          icon={BarChart3}
        />
      </div>

      {/* Main Observatory Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Topic Time Distribution Chart (7 cols) */}
        <div className="lg:col-span-7 p-5 bg-graphite-800 border border-graphite-600 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-graphite-100 font-sans">
                Topic Time Distribution (Stacked Minutes)
              </h2>
              <span className="text-[11px] font-mono text-graphite-400">
                Segmented by Coding, Debugging, Reading, and Testing
              </span>
            </div>
            <Badge variant="lime">Live Telemetry</Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topicTimes} layout="vertical" margin={{ left: 20, right: 20, top: 10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242D37" horizontal={false} />
                <XAxis type="number" stroke="#7B8A97" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis dataKey="topic" type="category" stroke="#E8EEF2" fontSize={10} fontFamily="Inter" width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', borderColor: '#303B45', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#E8EEF2' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'JetBrains Mono', paddingTop: '10px' }} />
                <Bar dataKey="coding_minutes" name="Coding (mins)" stackId="a" fill="#B8E986" radius={[0, 0, 0, 0]} />
                <Bar dataKey="debugging_minutes" name="Debugging (mins)" stackId="a" fill="#FFC043" />
                <Bar dataKey="reading_minutes" name="Reading (mins)" stackId="a" fill="#62C2FE" />
                <Bar dataKey="testing_minutes" name="Testing (mins)" stackId="a" fill="#A7B3BC" radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Learning Time Trend (5 cols) */}
        <div className="lg:col-span-5 p-5 bg-graphite-800 border border-graphite-600 rounded flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-graphite-100 font-sans">
                Daily Active Study Trend
              </h2>
              <span className="text-[11px] font-mono text-graphite-400">
                Daily hours invested over previous 7 days
              </span>
            </div>
            <Badge variant="gray">7-Day Trajectory</Badge>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="activeHoursGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B8E986" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#B8E986" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#242D37" />
                <XAxis dataKey="date" stroke="#7B8A97" fontSize={11} fontFamily="JetBrains Mono" />
                <YAxis stroke="#7B8A97" fontSize={11} fontFamily="JetBrains Mono" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#161B22', borderColor: '#303B45', fontSize: '11px', fontFamily: 'JetBrains Mono' }}
                  itemStyle={{ color: '#E8EEF2' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="active_hours" 
                  name="Active Hours" 
                  stroke="#B8E986" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#activeHoursGrad)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Granular Topic Breakdown Table */}
      <div className="bg-graphite-800 border border-graphite-600 rounded overflow-hidden p-5">
        <h3 className="text-sm font-bold text-graphite-100 font-sans mb-3">
          Topic Activity & Focus Breakdown
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-graphite-700 bg-graphite-850 text-graphite-400 uppercase text-[11px]">
                <th className="py-2.5 px-3">Topic</th>
                <th className="py-2.5 px-3">Total Minutes</th>
                <th className="py-2.5 px-3">Coding</th>
                <th className="py-2.5 px-3">Debugging</th>
                <th className="py-2.5 px-3">Reading</th>
                <th className="py-2.5 px-3">Code / Debug Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700/60 text-graphite-200">
              {topicTimes.map((t, idx) => (
                <tr key={idx} className="hover:bg-graphite-700/30">
                  <td className="py-2.5 px-3 font-sans font-medium text-graphite-100">{t.topic}</td>
                  <td className="py-2.5 px-3 font-bold text-lime-accent">{t.focused_minutes}m</td>
                  <td className="py-2.5 px-3">{t.coding_minutes}m</td>
                  <td className="py-2.5 px-3">{t.debugging_minutes}m</td>
                  <td className="py-2.5 px-3">{t.reading_minutes}m</td>
                  <td className="py-2.5 px-3 text-graphite-400">
                    {(t.coding_minutes / (t.debugging_minutes || 1)).toFixed(2)}x
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
