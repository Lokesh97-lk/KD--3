import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Code2, Search, ArrowRight, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Problem } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const ProblemCatalog: React.FC = () => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    const fetchProbs = async () => {
      const p = await apiClient.getProblems();
      setProblems(p);
    };
    fetchProbs();
  }, []);

  const filtered = problems.filter((p) => {
    const matchesDiff = difficultyFilter === 'all' || p.difficulty.toLowerCase() === difficultyFilter.toLowerCase();
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || 
                          p.topic.toLowerCase().includes(search.toLowerCase());
    return matchesDiff && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Practice Problem Bank
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Practical engineering algorithmic and systems implementation tasks
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search problems or topics..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-xs text-graphite-100 font-mono focus:border-lime-accent"
            />
            <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-xs font-mono text-graphite-200 focus:border-lime-accent"
          >
            <option value="all">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Table of Problems */}
      <div className="bg-graphite-800 border border-graphite-600 rounded overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-graphite-700 bg-graphite-850 text-graphite-400 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Problem Name</th>
                <th className="py-3 px-4">Topic Domain</th>
                <th className="py-3 px-4">Difficulty</th>
                <th className="py-3 px-4">Acceptance Rate</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-graphite-700/60 text-graphite-200">
              {filtered.map((prob) => (
                <tr key={prob.id} className="hover:bg-graphite-700/40 transition-colors">
                  <td className="py-3.5 px-4 font-sans font-medium text-graphite-100">
                    <Link to={`/code-lab?problem=${prob.id}`} className="hover:text-lime-accent">
                      {prob.title}
                    </Link>
                  </td>
                  <td className="py-3.5 px-4 text-graphite-300">{prob.topic}</td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={prob.difficulty === 'Easy' ? 'gray' : prob.difficulty === 'Medium' ? 'warning' : 'error'}
                    >
                      {prob.difficulty}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-graphite-300">{prob.acceptance_rate}%</td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/code-lab?problem=${prob.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded bg-graphite-700 hover:bg-lime-accent hover:text-graphite-950 text-graphite-100 border border-graphite-500 font-mono text-xs font-bold transition-colors"
                    >
                      <span>Code Lab</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
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
