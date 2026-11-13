import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Clock, AlertTriangle, ArrowRight, CheckCircle2, Calendar } from 'lucide-react';
import { apiClient } from '../../api/client';
import { RevisionRecommendation } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const RevisionPlanner: React.FC = () => {
  const [recs, setRecs] = useState<RevisionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecs = async () => {
    try {
      const data = await apiClient.getRevisionRecommendations();
      setRecs(data);
    } catch (err) {
      console.error('Failed to load revision tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecs();
  }, []);

  const handleComplete = async (id: string) => {
    try {
      await apiClient.completeRevisionTask(id);
      setRecs(recs.filter((r) => r.id !== id));
    } catch (err) {
      setRecs(recs.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Learning Debt & Spaced Revision Planner
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Targeted reinforcement drills dynamically scheduled by retention decay and weak prerequisites
          </p>
        </div>

        <Badge variant={recs.length > 0 ? "warning" : "lime"}>
          {recs.length} Revisions Due
        </Badge>
      </div>

      {/* Recommendations Feed */}
      <div className="space-y-4">
        {recs.length === 0 ? (
          <div className="p-12 text-center rounded bg-graphite-800 border border-graphite-600 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-lime-accent mx-auto" />
            <h3 className="text-sm font-bold text-graphite-100 font-sans">Zero Learning Debt</h3>
            <p className="text-xs text-graphite-400 font-sans">
              All demonstrated prerequisites and spaced retention targets are fully up to date.
            </p>
          </div>
        ) : (
          recs.map((item) => (
            <div 
              key={item.id}
              className="p-5 bg-graphite-800 border border-graphite-600 hover:border-graphite-500 rounded flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm md:text-base font-bold text-graphite-100 font-sans">
                    {item.topic}
                  </h3>
                  <Badge 
                    variant={item.urgency === 'high' ? 'error' : item.urgency === 'medium' ? 'warning' : 'gray'}
                  >
                    {item.urgency.toUpperCase()} URGENCY
                  </Badge>
                  <span className="text-[11px] font-mono text-graphite-400 uppercase">
                    Trigger: {item.reason.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs text-graphite-300 font-sans leading-relaxed max-w-3xl">
                  {item.explanation}
                </p>

                <div className="text-xs font-mono text-graphite-400 flex items-center gap-1.5 pt-1">
                  <Clock className="w-3.5 h-3.5 text-lime-accent" />
                  <span>Estimated reinforcement duration: ~{item.estimated_minutes} minutes</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleComplete(item.id)}
                  className="px-3 py-1.5 rounded bg-graphite-900 border border-graphite-700 hover:border-lime-accent/50 text-graphite-300 hover:text-lime-accent text-xs font-mono transition-colors"
                >
                  Mark Revised ✓
                </button>
                <Link
                  to={`/code-lab?problem=${item.problem_id || 'prob-rate-limiter'}`}
                  className="px-4 py-1.5 rounded bg-lime-accent text-graphite-950 hover:bg-lime-bright text-xs font-mono font-bold transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span>Launch Drill</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
