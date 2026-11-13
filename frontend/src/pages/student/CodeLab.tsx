import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Play, 
  Send, 
  RotateCcw, 
  Terminal, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Cpu, 
  ArrowLeft,
  ChevronDown,
  Layers,
  HelpCircle
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Problem, ExecutionVerdict, Submission } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const CodeLab: React.FC = () => {
  const [searchParams] = useSearchParams();
  const problemParam = searchParams.get('problem') || 'prob-rate-limiter';

  const [problem, setProblem] = useState<Problem | null>(null);
  const [language, setLanguage] = useState<'python' | 'javascript'>('python');
  const [code, setCode] = useState<string>('');
  const [stdin, setStdin] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'description' | 'testcases' | 'submissions'>('description');
  const [bottomTab, setBottomTab] = useState<'output' | 'stdin'>('output');
  
  // Execution state
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outputResult, setOutputResult] = useState<{
    verdict?: ExecutionVerdict;
    stdout?: string;
    stderr?: string;
    runtime_ms?: number;
    memory_kb?: number;
    passed_tests?: number;
    total_tests?: number;
  } | null>(null);

  useEffect(() => {
    const fetchProblem = async () => {
      const p = await apiClient.getProblem(problemParam);
      setProblem(p);
      if (p.starter_code[language]) {
        setCode(p.starter_code[language]);
      }
    };
    fetchProblem();
  }, [problemParam, language]);

  const handleLanguageChange = (lang: 'python' | 'javascript') => {
    setLanguage(lang);
    if (problem && problem.starter_code[lang]) {
      setCode(problem.starter_code[lang]);
    }
  };

  const handleRun = async () => {
    if (!problem) return;
    setIsRunning(true);
    setBottomTab('output');
    try {
      const res = await apiClient.runCode(problem.id, code, language, stdin);
      setOutputResult({
        verdict: res.verdict,
        stdout: res.stdout,
        stderr: res.stderr,
        runtime_ms: res.runtime_ms,
        memory_kb: res.memory_kb,
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setIsSubmitting(true);
    setBottomTab('output');
    try {
      const sub = await apiClient.submitCode(problem.id, code, language);
      setOutputResult({
        verdict: sub.verdict,
        stdout: `Official Test Suite Completed.\nPassed: ${sub.passed_tests} / ${sub.total_tests} test cases.`,
        stderr: sub.error_output || '',
        runtime_ms: sub.runtime_ms,
        memory_kb: sub.memory_kb,
        passed_tests: sub.passed_tests,
        total_tests: sub.total_tests,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (problem && problem.starter_code[language]) {
      setCode(problem.starter_code[language]);
      setOutputResult(null);
    }
  };

  if (!problem) {
    return <div className="p-8 text-center text-xs font-mono text-graphite-400">Loading Code Lab workspace...</div>;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-full">
      {/* Top Workspace Action Bar */}
      <div className="h-12 bg-graphite-800 border border-graphite-600 rounded-t px-3 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-3">
          <Link 
            to="/problems" 
            className="p-1 rounded text-graphite-400 hover:text-graphite-100 hover:bg-graphite-700"
            title="Back to problems"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <span className="font-mono font-bold text-xs md:text-sm text-graphite-100 truncate">
            {problem.title}
          </span>
          <Badge 
            variant={problem.difficulty === 'Easy' ? 'gray' : problem.difficulty === 'Medium' ? 'warning' : 'error'}
          >
            {problem.difficulty}
          </Badge>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value as any)}
            className="px-2 py-1 bg-graphite-900 border border-graphite-600 rounded text-xs font-mono text-graphite-200 focus:border-lime-accent"
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">Node.js (ES6)</option>
          </select>

          <button
            onClick={handleReset}
            className="p-1.5 rounded text-graphite-400 hover:text-graphite-200 hover:bg-graphite-700 transition-colors"
            title="Reset to starter template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleRun}
            disabled={isRunning || isSubmitting}
            className="px-3 py-1 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100 border border-graphite-500 font-mono text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isRunning ? 'Running...' : 'Run'}</span>
          </button>

          <button
            onClick={handleSubmit}
            disabled={isRunning || isSubmitting}
            className="px-3.5 py-1 rounded bg-lime-accent text-graphite-950 font-mono text-xs font-bold hover:bg-lime-bright transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Send className="w-3 h-3" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit'}</span>
          </button>
        </div>
      </div>

      {/* Main Split Layout: Left problem info, Right editor + console */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 border-x border-b border-graphite-600 rounded-b overflow-hidden bg-graphite-900">
        {/* Left Specification Column (5 cols on desktop, top tab on mobile) */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-graphite-600 flex flex-col h-full bg-graphite-850 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-graphite-700 bg-graphite-900 text-xs font-mono">
            <button
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'description'
                  ? 'border-lime-accent text-lime-accent bg-graphite-850'
                  : 'border-transparent text-graphite-400 hover:text-graphite-200'
              }`}
            >
              Specification
            </button>
            <button
              onClick={() => setActiveTab('testcases')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'testcases'
                  ? 'border-lime-accent text-lime-accent bg-graphite-850'
                  : 'border-transparent text-graphite-400 hover:text-graphite-200'
              }`}
            >
              Test Cases ({problem.test_cases.length})
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-2 border-b-2 font-medium transition-colors ${
                activeTab === 'submissions'
                  ? 'border-lime-accent text-lime-accent bg-graphite-850'
                  : 'border-transparent text-graphite-400 hover:text-graphite-200'
              }`}
            >
              Attempts
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs font-sans text-graphite-200">
            {activeTab === 'description' && (
              <>
                <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3">
                  <div className="whitespace-pre-line font-sans">{problem.description}</div>
                </div>

                <div className="pt-3 border-t border-graphite-700">
                  <div className="text-[11px] font-mono text-graphite-400 uppercase tracking-wider font-bold mb-2">
                    Runtime & Memory Constraints:
                  </div>
                  <ul className="list-disc pl-4 space-y-1 font-mono text-graphite-300">
                    {problem.constraints.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              </>
            )}

            {activeTab === 'testcases' && (
              <div className="space-y-3 font-mono">
                {problem.test_cases.map((tc, idx) => (
                  <div key={tc.id} className="p-3 rounded bg-graphite-900 border border-graphite-700 space-y-1.5">
                    <div className="flex justify-between items-center text-graphite-400 text-[11px]">
                      <span>Case {idx + 1} {tc.is_hidden ? '(Hidden Suite)' : '(Sample)'}</span>
                      {tc.is_hidden && <Badge variant="warning">Confidential</Badge>}
                    </div>
                    <div>
                      <span className="text-graphite-400 text-[10px] block">Input:</span>
                      <code className="text-graphite-100">{tc.input}</code>
                    </div>
                    <div>
                      <span className="text-graphite-400 text-[10px] block">Expected Output:</span>
                      <code className="text-lime-accent">{tc.expected_output}</code>
                    </div>
                    {tc.explanation && (
                      <p className="text-[11px] text-graphite-400 font-sans mt-1">
                        Explanation: {tc.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'submissions' && (
              <div className="space-y-2 font-mono">
                <div className="text-[11px] text-graphite-400 mb-2">Recent runs on this problem:</div>
                <div className="p-2.5 rounded bg-graphite-900 border border-graphite-700 flex justify-between items-center">
                  <div>
                    <Badge variant="lime">Accepted</Badge>
                    <div className="text-[11px] text-graphite-400 mt-1">Passed 12/12 test cases</div>
                  </div>
                  <div className="text-right text-[11px] text-graphite-400">
                    <div>48ms · 14.2MB</div>
                    <div>Oct 12, 14:22</div>
                  </div>
                </div>
                <div className="p-2.5 rounded bg-graphite-900 border border-graphite-700 flex justify-between items-center">
                  <div>
                    <Badge variant="error">Wrong Answer</Badge>
                    <div className="text-[11px] text-graphite-400 mt-1">Passed 8/12 test cases</div>
                  </div>
                  <div className="text-right text-[11px] text-graphite-400">
                    <div>52ms · 14.1MB</div>
                    <div>Oct 12, 13:58</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Monaco Editor & Console Column (7 cols on desktop) */}
        <div className="lg:col-span-7 flex flex-col h-full overflow-hidden bg-graphite-950">
          {/* Monaco Editor Wrapper */}
          <div className="flex-1 min-h-[300px] overflow-hidden">
            <Editor
              height="100%"
              language={language}
              value={code}
              onChange={(val) => setCode(val || '')}
              theme="vs-dark"
              options={{
                fontFamily: 'JetBrains Mono',
                fontSize: 13,
                lineHeight: 20,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                tabSize: 4,
                automaticLayout: true,
              }}
            />
          </div>

          {/* Console / Output Drawer */}
          <div className="h-44 md:h-52 border-t border-graphite-700 bg-graphite-900 flex flex-col shrink-0">
            {/* Drawer Tabs */}
            <div className="h-8 bg-graphite-850 px-3 flex items-center justify-between border-b border-graphite-700 text-xs font-mono text-graphite-400">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setBottomTab('output')}
                  className={`hover:text-graphite-200 ${bottomTab === 'output' ? 'text-lime-accent font-bold' : ''}`}
                >
                  Execution Console
                </button>
                <button
                  onClick={() => setBottomTab('stdin')}
                  className={`hover:text-graphite-200 ${bottomTab === 'stdin' ? 'text-lime-accent font-bold' : ''}`}
                >
                  Custom Stdin
                </button>
              </div>

              {outputResult && (
                <div className="flex items-center gap-3">
                  {outputResult.runtime_ms && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Clock className="w-3 h-3 text-lime-accent" /> {outputResult.runtime_ms}ms
                    </span>
                  )}
                  {outputResult.memory_kb && (
                    <span className="flex items-center gap-1 text-[11px]">
                      <Cpu className="w-3 h-3 text-lime-accent" /> {(outputResult.memory_kb / 1024).toFixed(1)}MB
                    </span>
                  )}
                  {outputResult.verdict && (
                    <Badge 
                      variant={
                        outputResult.verdict === 'Accepted' ? 'lime' : 
                        outputResult.verdict === 'Wrong Answer' ? 'error' : 'warning'
                      }
                    >
                      {outputResult.verdict}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Drawer Content */}
            <div className="flex-1 p-3 overflow-y-auto font-mono text-xs text-graphite-200 bg-graphite-950">
              {bottomTab === 'output' ? (
                outputResult ? (
                  <div className="space-y-1">
                    {outputResult.stdout && (
                      <div className="text-graphite-200 whitespace-pre-wrap">{outputResult.stdout}</div>
                    )}
                    {outputResult.stderr && (
                      <div className="text-status-error whitespace-pre-wrap">{outputResult.stderr}</div>
                    )}
                  </div>
                ) : (
                  <div className="text-graphite-500 py-4 text-center">
                    Execute code or click Run/Submit to view compiler and test results.
                  </div>
                )
              ) : (
                <textarea
                  value={stdin}
                  onChange={(e) => setStdin(e.target.value)}
                  placeholder="Enter custom input arguments passed via standard input..."
                  className="w-full h-full bg-transparent border-0 text-graphite-100 font-mono text-xs focus:ring-0 p-0 resize-none outline-none"
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
