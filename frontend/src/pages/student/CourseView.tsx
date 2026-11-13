import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  BookOpen, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Play, 
  ArrowLeft, 
  Layers, 
  UserCheck, 
  Code2 
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { Course } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const CourseView: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [course, setCourse] = useState<Course | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      const c = await apiClient.getCourse(slug || 'backend-concurrency-systems');
      setCourse(c);
    };
    fetchCourse();
  }, [slug]);

  if (!course) {
    return <div className="p-8 text-center text-xs font-mono text-graphite-400">Loading syllabus...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Back button */}
      <div>
        <Link 
          to="/learning-paths" 
          className="inline-flex items-center gap-1.5 text-xs font-mono text-graphite-400 hover:text-graphite-200"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Learning Paths</span>
        </Link>
      </div>

      {/* Course Overview Card */}
      <div className="p-6 bg-graphite-800 border border-graphite-600 rounded">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="lime">{course.level}</Badge>
          <span className="text-xs font-mono text-graphite-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {course.duration_hours} Estimated Hours
          </span>
          <span className="text-xs font-mono text-graphite-400 flex items-center gap-1">
            <UserCheck className="w-3.5 h-3.5" /> Instructor: {course.instructor_name}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold font-sans text-graphite-100 mb-2">
          {course.title}
        </h1>
        <p className="text-xs md:text-sm text-graphite-300 font-sans leading-relaxed max-w-3xl mb-4">
          {course.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {course.tags.map((tag, idx) => (
            <Badge key={idx} variant="gray">{tag}</Badge>
          ))}
        </div>
      </div>

      {/* Syllabus Modules */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-graphite-400">
          Curriculum Modules & Lessons ({course.modules.length} Modules)
        </h2>

        {course.modules.length === 0 ? (
          <div className="p-8 text-center rounded bg-graphite-800 border border-graphite-600 text-xs font-mono text-graphite-400">
            Additional module lessons are staged in review.
          </div>
        ) : (
          course.modules.map((mod) => (
            <div key={mod.id} className="p-5 bg-graphite-800 border border-graphite-600 rounded">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-lime-accent">
                  Module {mod.order}: {mod.title}
                </span>
                <span className="text-xs font-mono text-graphite-400">
                  {mod.lessons.length} lessons
                </span>
              </div>
              <p className="text-xs text-graphite-300 font-sans mb-4">
                {mod.description}
              </p>

              <div className="space-y-2">
                {mod.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="p-3 rounded bg-graphite-900 border border-graphite-700 hover:border-graphite-500 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {lesson.is_completed ? (
                        <CheckCircle2 className="w-4 h-4 text-lime-accent shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-graphite-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-sans font-medium text-graphite-100 flex items-center gap-2">
                          <span>{lesson.title}</span>
                          <span className="text-[10px] font-mono text-graphite-400 uppercase">({lesson.type})</span>
                        </div>
                        <span className="text-[11px] font-mono text-graphite-400">
                          {lesson.duration_minutes} mins
                        </span>
                      </div>
                    </div>

                    <Link
                      to={`/lessons/${lesson.id}`}
                      className="px-3 py-1 rounded bg-graphite-800 hover:bg-lime-accent hover:text-graphite-950 text-graphite-200 border border-graphite-600 font-mono text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      <span>{lesson.is_completed ? 'Review' : 'Start'}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
