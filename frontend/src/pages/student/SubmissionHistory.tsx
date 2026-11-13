import React, { useState, useEffect } from 'react';
import { History, Eye, CheckCircle2, XCircle, Clock, Cpu, X } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Submission, ExecutionVerdict } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const SubmissionHistory: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filterVerdict, setFilterVerdict] = useState<string>('all');
  const [inspectingSub, setInspectingSub] = useState<Submission | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      const data = await apiClient.getSubmissions();
      setSubmissions(data);
    };
    fetchSubmissions();
  }, []);

  const filtered = submissions.filter((s) => {
    if (filterVerdict === 'all') return true;
    return s.verdict.toLowerCase().replace(' ', '_') === filterVerdict;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Execution & Submission Audit Log
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Immutable log of evaluated code executions and benchmark diagnostics
          </p>
        </div>

        <select
          value={filterVerdict}
          onChange={(e) => setFilterVerdict(e.target.value)}
          className="px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-xs font-mono text-graphite-200 focus:border-lime-accent"
        >
          <option value="all">All Verdicts</option>
          <option value="accepted">Accepted</option>
          <option value="wrong_answer">Wrong Answer</option>
          <option value="time_limit_exceeded">Time Limit Exceeded</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-graphite-800 border border-graphite-600 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-graphite-700 bg-graphite-850 text-graphite-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Problem Name</th>
                <th className="py-3 px-4">Verdict</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Passed Suites</th>
                <th className="py-3 px-4">Execution Time</th>
                <th className="py-3 px-4">Resident Memory</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700/60 text-graphite-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-graphite-700/40 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-graphite-100">{s.problem_title}</td>
                  <td className="py-3.5 px-4">
                    <Badge 
                      variant={s.verdict === 'Accepted' ? 'lime' : s.verdict === 'Wrong Answer' ? 'error' : 'warning'}
                    >
                      {s.verdict}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-graphite-300 capitalize">{s.language}</td>
                  <td className="py-3.5 px-4">{s.passed_tests} / {s.total_tests}</td>
                  <td className="py-3.5 px-4">{s.runtime_ms} ms</td>
                  <td className="py-3.5 px-4">{(s.memory_kb / 1024).toFixed(1)} MB</td>
                  <td className="py-3.5 px-4 text-graphite-400">
                    {new Date(s.submitted_at).toLocaleDateString()} {new Date(s.submitted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => setInspectingSub(s)}
                      className="p-1.5 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-200 hover:text-graphite-100"
                      title="Inspect Submission Code"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Code Inspector Modal */}
      {inspectingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-graphite-800 border border-graphite-600 rounded shadow-panel overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-graphite-700 flex items-center justify-between bg-graphite-850">
              <div>
                <h3 className="text-sm font-bold text-graphite-100 font-sans">
                  {inspectingSub.problem_title} ({inspectingSub.language})
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant={inspectingSub.verdict === 'Accepted' ? 'lime' : 'error'}
                  >
                    {inspectingSub.verdict}
                  </Badge>
                  <span className="text-xs font-mono text-graphite-400">
                    {inspectingSub.runtime_ms}ms · {(inspectingSub.memory_kb / 1024).toFixed(1)}MB
                  </span>
                </div>
              </div>
              <button
                onClick={() => setInspectingSub(null)}
                className="p-1 rounded text-graphite-400 hover:text-graphite-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 font-mono text-xs space-y-4">
              <div>
                <div className="text-[10px] text-graphite-400 uppercase tracking-wider mb-1 font-bold">
                  Submitted Source Code:
                </div>
                <pre className="p-3 rounded bg-graphite-950 border border-graphite-700 text-graphite-200 overflow-x-auto leading-relaxed">
                  <code>{inspectingSub.code}</code>
                </pre>
              </div>

              {inspectingSub.error_output && (
                <div>
                  <div className="text-[10px] text-status-error uppercase tracking-wider mb-1 font-bold">
                    Compiler / Runtime Diagnostic Output:
                  </div>
                  <pre className="p-3 rounded bg-status-error/10 border border-status-error/30 text-status-error overflow-x-auto leading-relaxed">
                    <code>{inspectingSub.error_output}</code>
                  </pre>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-graphite-700 bg-graphite-850 text-right">
              <button
                onClick={() => setInspectingSub(null)}
                className="px-4 py-1.5 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100 text-xs font-mono font-bold"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
