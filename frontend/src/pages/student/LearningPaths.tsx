import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Clock, Tag, ArrowRight, Search, Filter } from 'lucide-react';
import { apiClient } from '../../api/client';
import { Course } from '../../types';
import { Badge } from '../../components/ui/Badge';

export const LearningPaths: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      const data = await apiClient.getCourses();
      setCourses(data);
    };
    fetchCourses();
  }, []);

  const filtered = courses.filter((c) => {
    const matchesLevel = filterLevel === 'all' || c.level.toLowerCase() === filterLevel.toLowerCase();
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase()) || 
                          c.description.toLowerCase().includes(search.toLowerCase()) ||
                          c.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchesLevel && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-graphite-800 border border-graphite-600 rounded">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-lime-accent" />
            <h1 className="text-lg md:text-xl font-bold font-sans text-graphite-100">
              Curriculum & Learning Paths
            </h1>
          </div>
          <p className="text-xs font-mono text-graphite-400 mt-0.5">
            Structured engineering tracks designed for deep implementation competence
          </p>
        </div>

        {/* Search & Level Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search topics, tags..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-xs text-graphite-100 font-mono focus:border-lime-accent"
            />
            <Search className="w-3.5 h-3.5 text-graphite-400 absolute left-2.5 top-2.5" />
          </div>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="px-2.5 py-1.5 bg-graphite-900 border border-graphite-600 rounded text-xs font-mono text-graphite-200 focus:border-lime-accent"
          >
            <option value="all">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      {/* Grid of Courses */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((course) => (
          <div 
            key={course.id}
            className="p-5 rounded bg-graphite-800 border border-graphite-600 hover:border-graphite-500 flex flex-col justify-between transition-colors shadow-sm"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge variant={course.level === 'Advanced' ? 'lime' : 'gray'}>
                  {course.level}
                </Badge>
                <div className="flex items-center gap-1.5 text-xs font-mono text-graphite-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{course.duration_hours}h</span>
                </div>
              </div>

              <h2 className="text-base font-bold text-graphite-100 font-sans mb-2">
                {course.title}
              </h2>
              <p className="text-xs text-graphite-300 font-sans leading-relaxed line-clamp-3 mb-4">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {course.tags.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded bg-graphite-900 border border-graphite-700 text-[10px] font-mono text-graphite-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-graphite-700/70">
              <div className="flex items-center justify-between text-xs font-mono mb-3">
                <span className="text-graphite-400">Total Lessons</span>
                <span className="text-graphite-200 font-bold">{course.total_lessons} modules</span>
              </div>
              <Link
                to={`/courses/${course.slug}`}
                className="w-full py-2 rounded bg-graphite-700 hover:bg-graphite-600 text-graphite-100 border border-graphite-500 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>Inspect Syllabus</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
