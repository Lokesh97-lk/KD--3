import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  Copy, 
  Check, 
  Terminal, 
  Clock 
} from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { apiClient } from '../../api/client';

export const LessonReader: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<any | null>(null);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLesson = async () => {
      if (!lessonId) return;
      try {
        const l = await apiClient.getLesson(lessonId);
        if (l) {
          setLesson(l);
          setCompleted(l.is_completed || false);
        }
      } catch (err) {
        console.error('Failed to load lesson', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleComplete = async () => {
    if (!lessonId) return;
    setSaving(true);
    try {
      await apiClient.completeLesson(lessonId, 180);
      setCompleted(true);
    } catch (err) {
      console.error('Failed to mark lesson complete', err);
    } finally {
      setSaving(false);
    }
  };

  const sampleSnippet = lesson?.starter_code || `import asyncio
import time

async def fetch_telemetry(metric_id: str):
    await asyncio.sleep(0.05)
    return {"metric": metric_id, "status": "nominal"}

async def main():
    results = await asyncio.gather(
        fetch_telemetry("cpu_load"),
        fetch_telemetry("memory_rss"),
        fetch_telemetry("disk_iops")
    )
    print("Telemetry batch retrieved:", results)

if __name__ == "__main__":
    asyncio.run(main())`;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-graphite-700">
        <Link 
          to="/learning-paths" 
          className="inline-flex items-center gap-1.5 text-xs font-mono text-graphite-400 hover:text-graphite-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Paths</span>
        </Link>

        <div className="flex items-center gap-2">
          <Badge variant="lime">Interactive Curriculum</Badge>
          <span className="text-xs font-mono text-graphite-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {lesson?.duration_minutes || 20} min read
          </span>
        </div>
      </div>

      {/* Lesson Content Area */}
      <article className="p-6 md:p-8 bg-graphite-800 border border-graphite-600 rounded shadow-panel space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-graphite-100 font-sans tracking-tight mb-2">
            {lesson?.title || 'Deconstructing Event Loop Mechanisms & Invariants'}
          </h1>
          <p className="text-xs font-mono text-graphite-400">
            Type: <span className="capitalize">{lesson?.type || 'Concept'}</span> · Language: {lesson?.language || 'python'} · Progress: {completed ? 'Completed' : 'In Progress'}
          </p>
        </div>

        <div className="prose prose-invert max-w-none text-xs md:text-sm text-graphite-200 space-y-4 font-sans leading-relaxed">
          {lesson?.content_markdown ? (
            <div className="whitespace-pre-line font-sans leading-relaxed">
              {lesson.content_markdown}
            </div>
          ) : (
            <>
              <p>
                Modern backend infrastructure handles hundreds of thousands of concurrent connections not by allocating an operating system thread to each socket, but by relying on an asynchronous, single-threaded or thread-pooled event loop powered by system calls like <code>epoll</code> on Linux or <code>kqueue</code> on BSD/macOS.
              </p>
              <h2 className="text-base font-bold text-graphite-100 font-sans pt-2">
                1. The Kernel Multiplexing Boundary
              </h2>
              <p>
                When a standard synchronous client issues a socket read, the operating system kernel blocks the calling thread, descheduling it until network packets arrive on the network interface controller (NIC). In contrast, non-blocking I/O registers the file descriptor with an event demultiplexer and immediately returns control to user-space.
              </p>
            </>
          )}

          {/* Interactive Code Snippet */}
          <div className="my-4 rounded border border-graphite-600 bg-graphite-950 overflow-hidden">
            <div className="h-8 bg-graphite-850 px-3 flex items-center justify-between border-b border-graphite-700 text-xs font-mono text-graphite-400">
              <span>code_example.{lesson?.language === 'javascript' ? 'js' : 'py'}</span>
              <button 
                onClick={() => handleCopy(sampleSnippet)}
                className="flex items-center gap-1 hover:text-graphite-100 text-[11px]"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-lime-accent" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <pre className="p-4 text-xs font-mono text-graphite-200 overflow-x-auto leading-relaxed">
              <code>{sampleSnippet}</code>
            </pre>
          </div>
        </div>

        {/* Completion Bar */}
        <div className="pt-6 border-t border-graphite-700 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleToggleComplete}
            disabled={saving || completed}
            className={`w-full sm:w-auto px-4 py-2 rounded font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              completed
                ? 'bg-graphite-700 text-lime-accent border border-lime-dim'
                : 'bg-lime-accent text-graphite-950 hover:bg-lime-bright'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{saving ? 'Recording Progress...' : completed ? 'Lesson Completed ✓' : 'Mark Lesson as Completed'}</span>
          </button>

          <Link
            to="/code-lab?problem=prob-rate-limiter"
            className="w-full sm:w-auto px-4 py-2 rounded bg-graphite-700 hover:bg-graphite-600 border border-graphite-500 text-graphite-100 font-mono text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
          >
            <span>Proceed to Code Lab</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </article>
    </div>
  );
};
