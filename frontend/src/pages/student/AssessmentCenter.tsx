import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, Clock, ArrowRight, ArrowLeft, Send, AlertTriangle, CheckCircle2, Award, XCircle } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Assessment, AssessmentQuestion } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const AssessmentCenter: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    max_score: number;
    percentage: number;
    passed: boolean;
    feedback: string;
  } | null>(null);

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const data = await apiClient.getAssessments();
        setAssessments(data);
        if (data.length > 0) {
          setAssessment(data[0]);
          setTimeLeft(data[0].duration_minutes * 60);
        }
      } catch (err) {
        console.error('Failed to load assessments', err);
      }
    };
    fetchAssessments();
  }, []);

  useEffect(() => {
    if (result) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [result]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSelectOption = (qId: string, optText: string) => {
    setSelectedAnswers({ ...selectedAnswers, [qId]: optText });
  };

  const handleSubmit = async () => {
    if (!assessment) return;
    setIsSubmitting(true);
    try {
      const answersPayload = assessment.questions.map((q) => ({
        question_id: q.id,
        answer: selectedAnswers[q.id] || '',
      }));
      const res = await apiClient.submitAssessment(
        assessment.id,
        answersPayload,
        assessment.duration_minutes * 60 - timeLeft
      );
      setResult(res);
    } catch (err) {
      console.error('Failed to submit assessment', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!assessment) {
    return <div className="p-8 text-center text-xs font-mono text-graphite-400">Loading assessment...</div>;
  }

  const currentQ: AssessmentQuestion = assessment.questions[currentIdx] || assessment.questions[0];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Assessment Header with Countdown Timer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-lime-accent" />
            <h1 className="text-base md:text-lg font-bold font-sans text-graphite-100">
              {assessment.title}
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Category: {assessment.category} · Passing Criteria: {assessment.passing_score}%
          </p>
        </div>

        {/* Countdown Timer */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-graphite-900 border border-graphite-600 font-mono text-xs">
          <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-status-error animate-pulse' : 'text-lime-accent'}`} />
          <span className="text-graphite-400">Time Remaining:</span>
          <span className={`font-bold ${timeLeft < 300 ? 'text-status-error' : 'text-graphite-100'}`}>
            {formatTimer(timeLeft)}
          </span>
        </div>
      </div>

      {result ? (
        <div className="p-8 bg-graphite-800 border border-graphite-600 rounded text-center space-y-4">
          {result.passed ? (
            <CheckCircle2 className="w-14 h-14 text-lime-accent mx-auto" />
          ) : (
            <XCircle className="w-14 h-14 text-status-warning mx-auto" />
          )}

          <h2 className="text-xl md:text-2xl font-bold font-sans text-graphite-100">
            {result.passed ? 'Assessment Passed & Competency Verified!' : 'Assessment Attempt Recorded'}
          </h2>

          <div className="flex justify-center items-center gap-4 py-2">
            <div className="p-3 bg-graphite-900 border border-graphite-700 rounded text-center font-mono">
              <span className="text-graphite-400 block text-[10px] uppercase">Final Score</span>
              <span className={`text-xl font-bold ${result.passed ? 'text-lime-accent' : 'text-status-warning'}`}>
                {result.score} / {result.max_score}
              </span>
            </div>
            <div className="p-3 bg-graphite-900 border border-graphite-700 rounded text-center font-mono">
              <span className="text-graphite-400 block text-[10px] uppercase">Percentage</span>
              <span className="text-xl font-bold text-graphite-100">{result.percentage}%</span>
            </div>
            <div className="p-3 bg-graphite-900 border border-graphite-700 rounded text-center font-mono">
              <span className="text-graphite-400 block text-[10px] uppercase">Benchmark</span>
              <span className="text-xl font-bold text-graphite-400">{assessment.passing_score}%</span>
            </div>
          </div>

          <p className="text-xs text-graphite-300 font-sans max-w-md mx-auto leading-relaxed">
            {result.feedback}
          </p>

          <div className="pt-4 flex justify-center gap-3 font-mono text-xs">
            <button
              onClick={() => {
                setResult(null);
                setSelectedAnswers({});
                setTimeLeft(assessment.duration_minutes * 60);
                setCurrentIdx(0);
              }}
              className="px-4 py-2 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100"
            >
              Retake Assessment
            </button>
            <Link
              to="/skill-passport"
              className="px-4 py-2 rounded bg-lime-accent text-graphite-950 font-bold hover:bg-lime-bright flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Inspect Skill Passport Evidence</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-graphite-800 border border-graphite-600 rounded p-6 space-y-6">
          {/* Question Stepper */}
          <div className="flex items-center justify-between pb-4 border-b border-graphite-700">
            <span className="text-xs font-mono text-graphite-400 font-bold uppercase tracking-wider">
              Question {currentIdx + 1} of {assessment.questions.length} ({currentQ.points} Points)
            </span>
            <div className="flex gap-1.5">
              {assessment.questions.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentIdx(idx)}
                  className={`w-7 h-7 rounded text-xs font-mono font-bold transition-colors ${
                    currentIdx === idx
                      ? 'bg-lime-accent text-graphite-950'
                      : selectedAnswers[q.id]
                      ? 'bg-graphite-700 text-lime-accent border border-lime-dim/50'
                      : 'bg-graphite-900 text-graphite-400 border border-graphite-700'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <h3 className="text-sm md:text-base font-bold text-graphite-100 font-sans leading-relaxed mb-4">
              {currentQ.prompt}
            </h3>

            {/* MCQ Options */}
            {currentQ.options && currentQ.options.length > 0 && (
              <div className="space-y-3 font-sans">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedAnswers[currentQ.id] === opt;
                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(currentQ.id, opt)}
                      className={`w-full text-left p-3.5 rounded border text-xs md:text-sm transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-graphite-700/80 border-lime-accent text-graphite-100 shadow-sm'
                          : 'bg-graphite-900 border-graphite-700 text-graphite-300 hover:border-graphite-500'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 font-mono text-xs ${
                        isSelected ? 'border-lime-accent text-lime-accent' : 'border-graphite-500 text-graphite-400'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Code Question */}
            {currentQ.type === 'code' && (
              <div className="space-y-2">
                <textarea
                  value={selectedAnswers[currentQ.id] || currentQ.starter_code || ''}
                  onChange={(e) => handleSelectOption(currentQ.id, e.target.value)}
                  className="w-full h-48 p-3 rounded bg-graphite-950 border border-graphite-700 text-graphite-100 font-mono text-xs focus:border-lime-accent focus:ring-0 leading-relaxed"
                />
              </div>
            )}
          </div>

          {/* Stepper Navigation */}
          <div className="pt-4 border-t border-graphite-700 flex items-center justify-between">
            <button
              onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
              disabled={currentIdx === 0}
              className="px-3 py-1.5 rounded bg-graphite-700 text-graphite-200 text-xs font-mono hover:bg-graphite-600 disabled:opacity-40 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            {currentIdx < assessment.questions.length - 1 ? (
              <button
                onClick={() => setCurrentIdx(currentIdx + 1)}
                className="px-4 py-1.5 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100 text-xs font-mono flex items-center gap-1 font-bold"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-4 py-1.5 rounded bg-lime-accent text-graphite-950 text-xs font-mono font-bold hover:bg-lime-bright flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Grading Responses...' : 'Submit Final Assessment'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
