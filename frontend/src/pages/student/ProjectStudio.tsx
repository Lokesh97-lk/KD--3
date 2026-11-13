import React, { useState, useEffect } from 'react';
import { FolderGit2, CheckCircle2, ArrowRight, ExternalLink, Layers, ShieldCheck, Award, X, Send } from 'lucide-react';
import { apiClient } from '../../api/client';
import { EngineeringScenario } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const ProjectStudio: React.FC = () => {
  const [scenarios, setScenarios] = useState<any[]>([]);
  const [activeScenario, setActiveScenario] = useState<any | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [repoLink, setRepoLink] = useState('https://github.com/developer/practical-solution');
  const [codeSnippet, setCodeSnippet] = useState('// Solution implementation\n');
  const [notes, setNotes] = useState('Implemented non-blocking handler and verified under load.');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const fetchScenarios = async () => {
    try {
      const data = await apiClient.getEngineeringScenarios();
      setScenarios(data);
      if (data.length > 0 && !activeScenario) setActiveScenario(data[0]);
    } catch (err) {
      console.error('Failed to load project scenarios', err);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleSubmitMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScenario) return;
    setSubmitting(true);
    try {
      const milestoneId = activeScenario.milestones?.[0]?.id || 'ms-default';
      await apiClient.submitProjectMilestone(
        activeScenario.id,
        milestoneId,
        repoLink,
        codeSnippet,
        notes
      );
      setSubmissionSuccess(true);
      setTimeout(() => {
        setSubmissionSuccess(false);
        setShowSubmitModal(false);
      }, 2000);
      await fetchScenarios();
    } catch (err) {
      console.error('Failed to submit milestone', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Project Studio: Practical Engineering Scenarios
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Real-world end-to-end engineering tasks evaluated by deterministic rubrics & instructors
          </p>
        </div>

        <Badge variant="lime">Verified Practical Engineering</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scenarios List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-mono text-graphite-400 uppercase tracking-wider font-semibold">
            Available Scenarios ({scenarios.length})
          </span>

          {scenarios.map((scen) => (
            <div
              key={scen.id}
              onClick={() => setActiveScenario(scen)}
              className={`p-4 rounded border cursor-pointer transition-all ${
                activeScenario?.id === scen.id
                  ? 'bg-graphite-800 border-lime-accent shadow-panel'
                  : 'bg-graphite-800/80 border-graphite-600 hover:border-graphite-500'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant={scen.difficulty === 'Lead' ? 'error' : scen.difficulty === 'Senior' ? 'warning' : 'gray'}>
                  {scen.difficulty}
                </Badge>
                {scen.is_verified && (
                  <span className="flex items-center gap-1 text-[11px] font-mono text-lime-accent">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}
              </div>
              <h3 className="text-xs md:text-sm font-bold text-graphite-100 font-sans">
                {scen.title}
              </h3>
              <p className="text-xs font-mono text-graphite-400 mt-1">
                Domain: {scen.domain}
              </p>
            </div>
          ))}
        </div>

        {/* Selected Scenario Details & Rubrics (8 cols) */}
        <div className="lg:col-span-8 bg-graphite-800 border border-graphite-600 rounded p-6 space-y-6">
          {activeScenario ? (
            <>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="lime">{activeScenario.domain}</Badge>
                  <Badge variant="gray">{activeScenario.difficulty}</Badge>
                  {activeScenario.is_verified && <Badge variant="lime">Evidence Badge Verified</Badge>}
                </div>
                <h2 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
                  {activeScenario.title}
                </h2>
              </div>

              {/* Context */}
              <div className="p-4 rounded bg-graphite-900 border border-graphite-700 text-xs font-sans text-graphite-200 leading-relaxed space-y-2">
                <div className="font-mono text-graphite-400 uppercase text-[10px] font-bold">
                  System Context & Failure Mode:
                </div>
                <p>{activeScenario.context}</p>
              </div>

              {/* Milestones if present */}
              {activeScenario.milestones && activeScenario.milestones.length > 0 && (
                <div>
                  <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-graphite-400 mb-2">
                    Project Milestones & Verification:
                  </h3>
                  <div className="space-y-2 font-mono text-xs">
                    {activeScenario.milestones.map((m: any) => (
                      <div key={m.id} className="p-3 rounded bg-graphite-900 border border-graphite-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="font-bold text-graphite-100 font-sans">{m.title}</div>
                          <div className="text-[11px] text-graphite-400 font-sans">{m.description}</div>
                        </div>
                        {m.submission ? (
                          <Badge variant={m.submission.status === 'Graded' ? 'lime' : 'warning'}>
                            {m.submission.status} {m.submission.score ? `(${m.submission.score}/100)` : ''}
                          </Badge>
                        ) : (
                          <Badge variant="gray">Not Submitted</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Acceptance Criteria */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-graphite-400 mb-2">
                  Verification Acceptance Criteria:
                </h3>
                <ul className="space-y-2 text-xs font-sans text-graphite-200">
                  {activeScenario.acceptance_criteria.map((crit: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded bg-graphite-900/60 border border-graphite-700/60">
                      <span className="text-lime-accent font-bold font-mono">[{idx + 1}]</span>
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Evaluation Rubric */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-graphite-400 mb-2">
                  Deterministic Evaluation Rubric:
                </h3>
                <div className="space-y-2 font-mono text-xs">
                  {activeScenario.evaluation_rubric.map((r: any, idx: number) => (
                    <div key={idx} className="p-3 rounded bg-graphite-900 border border-graphite-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="font-bold text-graphite-100 font-sans">{r.category}</div>
                        <div className="text-[11px] text-graphite-400 font-sans">{r.description}</div>
                      </div>
                      <Badge variant="lime" size="sm">Weight: {r.weight}%</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-graphite-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                <a
                  href={activeScenario.starter_repo}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 py-2 rounded bg-graphite-700 hover:bg-graphite-600 border border-graphite-500 text-graphite-100 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Inspect Starter Repository</span>
                </a>

                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full sm:w-auto px-5 py-2 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Solution for Rubric Evaluation</span>
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-xs font-mono text-graphite-400">
              Select an engineering scenario.
            </div>
          )}
        </div>
      </div>

      {/* Submission Modal */}
      {showSubmitModal && activeScenario && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-graphite-800 border border-graphite-600 rounded max-w-lg w-full p-5 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-graphite-700">
              <h3 className="font-sans font-bold text-sm text-graphite-100">
                Submit Milestone Solution: {activeScenario.title}
              </h3>
              <button onClick={() => setShowSubmitModal(false)} className="text-graphite-400 hover:text-graphite-200">
                <X className="w-4 h-4" />
              </button>
            </div>

            {submissionSuccess ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-lime-accent mx-auto animate-bounce" />
                <div className="font-sans font-bold text-sm text-graphite-100">Submission Queued!</div>
                <div className="text-xs font-mono text-graphite-400">
                  Your milestone has been saved and queued for instructor evaluation.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitMilestone} className="space-y-3 font-mono text-xs">
                <div>
                  <label className="block text-graphite-300 mb-1">Git Repository / PR URL:</label>
                  <input
                    type="url"
                    required
                    value={repoLink}
                    onChange={(e) => setRepoLink(e.target.value)}
                    placeholder="https://github.com/your-username/repo"
                    className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                  />
                </div>

                <div>
                  <label className="block text-graphite-300 mb-1">Key Code Snippet / Implementation Notes:</label>
                  <textarea
                    rows={4}
                    value={codeSnippet}
                    onChange={(e) => setCodeSnippet(e.target.value)}
                    placeholder="Paste the core implementation class or query..."
                    className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent text-[11px]"
                  />
                </div>

                <div>
                  <label className="block text-graphite-300 mb-1">Verification Evidence & Test Results:</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Describe invariant checks and benchmark results..."
                    className="w-full px-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-graphite-100 focus:border-lime-accent"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-graphite-700">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(false)}
                    className="px-3 py-1.5 rounded bg-graphite-700 text-graphite-300 hover:bg-graphite-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-1.5 rounded bg-lime-accent text-graphite-950 font-bold hover:bg-lime-bright disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit for Evaluation'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
