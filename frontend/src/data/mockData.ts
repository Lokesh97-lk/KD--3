import { 
  Course, 
  Problem, 
  ConceptNode, 
  ObservatoryMetric, 
  TopicTimeData, 
  DailyTrendData, 
  DebugErrorCategory, 
  RevisionRecommendation, 
  EngineeringScenario, 
  SkillEvidenceItem, 
  Assessment,
  Submission 
} from '../types';

export const INITIAL_USER = {
  id: 'usr_eng_84920',
  email: 'alex.chen@codeintellect.io',
  full_name: 'Alex Chen',
  role: 'student' as const,
  timezone: 'UTC+05:30',
  is_active: true,
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=128&auto=format&fit=crop&q=80',
  created_at: '2026-08-14T10:00:00Z',
};

export const COURSES: Course[] = [
  {
    id: 'course-sys-arch-1',
    title: 'High-Performance Backend Engineering & Concurrency',
    slug: 'backend-concurrency-systems',
    description: 'Master non-blocking I/O, goroutines and threads, connection pooling, and distributed mutexes under load.',
    level: 'Advanced',
    duration_hours: 38,
    total_lessons: 24,
    completed_lessons: 16,
    tags: ['Systems', 'Python', 'Go', 'Distributed Systems'],
    instructor_name: 'Elena Rostova, Staff Systems Architect',
    modules: [
      {
        id: 'mod-1',
        title: 'Asynchronous Runtimes and Event Loops',
        order: 1,
        description: 'How event loops schedule tasks, cooperative multitasking, and avoiding event loop starvation.',
        lessons: [
          {
            id: 'les-1',
            title: 'Deconstructing the Event Loop Mechanism',
            order: 1,
            duration_minutes: 25,
            is_completed: true,
            type: 'concept',
            content_markdown: `### Event Loop Fundamentals\n\nModern backend servers achieve high concurrency through non-blocking asynchronous I/O. Instead of allocating a kernel thread per socket, a single event loop monitors multiple file descriptors using system calls like \`epoll\` (Linux) or \`kqueue\` (macOS).\n\n\`\`\`python\nimport asyncio\n\nasync def fetch_telemetry(metric_id: str):\n    # Non-blocking async I/O\n    await asyncio.sleep(0.05)\n    return {"metric": metric_id, "status": "nominal"}\n\`\`\`\n\n**Common Pitfall:** Blocking calls (such as synchronous database drivers or CPU-intensive JSON parsing) within the event loop freeze all concurrent requests.`,
          },
          {
            id: 'les-2',
            title: 'Avoiding Event Loop Blockers & CPU Delegation',
            order: 2,
            duration_minutes: 30,
            is_completed: true,
            type: 'interactive',
            content_markdown: `### Delegating CPU-Intensive Tasks\n\nWhen handling encryption, compression, or complex data transformation, work must be dispatched to worker pools rather than executed on the main event thread.\n\nUse \`asyncio.to_thread()\` or \`ProcessPoolExecutor\` to isolate heavy workloads.`,
            starter_code: `import asyncio\nimport time\n\ndef heavy_cryptographic_verification(token: str) -> bool:\n    # Simulate CPU-bound work\n    time.sleep(0.1)\n    return token.startswith("valid_")\n\nasync def handle_request(raw_token: str):\n    # TODO: Refactor to prevent event loop blocking\n    result = await asyncio.to_thread(heavy_cryptographic_verification, raw_token)\n    return {"verified": result}\n`,
          },
        ]
      },
      {
        id: 'mod-2',
        title: 'Distributed Locks & Race Condition Elimination',
        order: 2,
        description: 'Redlock algorithms, database row fencing tokens, and idempotent state mutation.',
        lessons: [
          {
            id: 'les-3',
            title: 'Implementing Fencing Tokens in Distributed Mutual Exclusion',
            order: 1,
            duration_minutes: 40,
            is_completed: false,
            type: 'exercise',
            content_markdown: `### The Fencing Token Solution\n\nDistributed locks with leases (TTL) are vulnerable to garbage collection pauses or network delays. A client may hold a lock, freeze, lose the lease, and subsequently perform an illegal write.\n\nFencing tokens enforce strictly monotonic sequence numbers verified at storage commit boundaries.`,
            starter_code: `class StorageCommitManager:\n    def __init__(self):\n        self.highest_fencing_token = 0\n        self.committed_records = {}\n\n    def commit(self, record_id: str, payload: dict, token: int) -> bool:\n        # Ensure the token strictly exceeds highest seen\n        if token <= self.highest_fencing_token:\n            raise ValueError("Stale lock lease token rejected")\n        self.highest_fencing_token = token\n        self.committed_records[record_id] = payload\n        return True\n`,
          }
        ]
      }
    ]
  },
  {
    id: 'course-db-perf',
    title: 'Database Query Optimization & Indexing Strategies',
    slug: 'database-indexing-optimization',
    description: 'Learn B-Tree vs LSM-Tree storage engines, EXPLAIN ANALYZE interpretation, and covering indexes.',
    level: 'Intermediate',
    duration_hours: 24,
    total_lessons: 18,
    completed_lessons: 11,
    tags: ['PostgreSQL', 'SQL', 'Databases', 'Performance'],
    instructor_name: 'Marcus Vance, Principal Data Engineer',
    modules: []
  },
  {
    id: 'course-sec-code',
    title: 'Defensive Software Design & Practical Application Security',
    slug: 'defensive-software-security',
    description: 'Protect services against memory corruption, SSRF, broken object-level authorization, and timing attacks.',
    level: 'Advanced',
    duration_hours: 30,
    total_lessons: 20,
    completed_lessons: 5,
    tags: ['Security', 'Cryptography', 'API', 'Architecture'],
    instructor_name: 'Siddharth Iyer, AppSec Director',
    modules: []
  }
];

export const PROBLEMS: Problem[] = [
  {
    id: 'prob-rate-limiter',
    title: 'Sliding Window Rate Limiter',
    slug: 'sliding-window-rate-limiter',
    difficulty: 'Medium',
    topic: 'System Design & Algorithms',
    acceptance_rate: 68.4,
    description: `### Specification\n\nDesign an in-memory Sliding Window Log Rate Limiter for an API gateway.\n\nEach request provides a **client_id** and a **timestamp_ms** (in milliseconds). The rate limiter enforces a limit of **max_requests** within a sliding window of **window_size_ms** milliseconds.\n\n### Functional Requirements\n- Record incoming timestamps for the client.\n- Evict timestamps older than \`current_timestamp - window_size_ms\`.\n- Return \`True\` if the request is permitted, or \`False\` if rejected.\n\n### Constraints\n- Time Complexity per request must be amortized \`O(log N)\` or better.\n- Memory must be freed upon eviction.\n`,
    constraints: [
      '1 <= max_requests <= 10,000',
      '100 <= window_size_ms <= 60,000',
      'Timestamps are monotonically increasing per client.'
    ],
    starter_code: {
      python: `class SlidingWindowLimiter:\n    def __init__(self, max_requests: int, window_size_ms: int):\n        self.max_requests = max_requests\n        self.window_size_ms = window_size_ms\n        self.client_windows = {}\n\n    def allow_request(self, client_id: str, timestamp_ms: int) -> bool:\n        # TODO: Implement sliding window evaluation and eviction\n        if client_id not in self.client_windows:\n            self.client_windows[client_id] = []\n            \n        window = self.client_windows[client_id]\n        cutoff = timestamp_ms - self.window_size_ms\n        \n        # Remove expired timestamps\n        while window and window[0] <= cutoff:\n            window.pop(0)\n            \n        if len(window) < self.max_requests:\n            window.append(timestamp_ms)\n            return True\n            \n        return False\n\n# Quick local test runner\nif __name__ == "__main__":\n    limiter = SlidingWindowLimiter(3, 1000)\n    print(limiter.allow_request("client_1", 100))  # True\n    print(limiter.allow_request("client_1", 200))  # True\n    print(limiter.allow_request("client_1", 300))  # True\n    print(limiter.allow_request("client_1", 400))  # False (limit reached)\n    print(limiter.allow_request("client_1", 1150)) # True (100 expired)\n`,
      javascript: `class SlidingWindowLimiter {\n  constructor(maxRequests, windowSizeMs) {\n    this.maxRequests = maxRequests;\n    this.windowSizeMs = windowSizeMs;\n    this.clientWindows = new Map();\n  }\n\n  allowRequest(clientId, timestampMs) {\n    if (!this.clientWindows.has(clientId)) {\n      this.clientWindows.set(clientId, []);\n    }\n    const timestamps = this.clientWindows.get(clientId);\n    const cutoff = timestampMs - this.windowSizeMs;\n\n    while (timestamps.length > 0 && timestamps[0] <= cutoff) {\n      timestamps.shift();\n    }\n\n    if (timestamps.length < this.maxRequests) {\n      timestamps.push(timestampMs);\n      return true;\n    }\n    return false;\n  }\n}\n`,
    },
    test_cases: [
      {
        id: 'tc-1',
        input: 'limit=3, window=1000ms, reqs=[100, 200, 300, 400, 1150]',
        expected_output: '[True, True, True, False, True]',
        is_hidden: false,
        explanation: 'The 4th request at 400ms is blocked because 3 requests occurred within the 1000ms window. At 1150ms, 100ms has expired.'
      },
      {
        id: 'tc-2',
        input: 'limit=1, window=500ms, reqs=[10, 20, 520]',
        expected_output: '[True, False, True]',
        is_hidden: false,
      },
      {
        id: 'tc-3',
        input: 'Hidden Stress & Burst Load Suite (10,000 calls)',
        expected_output: 'Correctly Throttled (Accepted)',
        is_hidden: true,
      }
    ]
  },
  {
    id: 'prob-lru-cache',
    title: 'Thread-Safe LRU Cache with TTL Eviction',
    slug: 'thread-safe-lru-cache',
    difficulty: 'Hard',
    topic: 'Data Structures & Concurrency',
    acceptance_rate: 42.1,
    description: `Design a Least Recently Used (LRU) Cache supporting concurrent reads and writes with per-key expiration timestamps (TTL).`,
    constraints: ['Capacity: 1 to 50,000 items', 'Time complexity O(1) average for get and put'],
    starter_code: {
      python: `from collections import OrderedDict\nimport time\nimport threading\n\nclass ConcurrentLRUCache:\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = OrderedDict()\n        self.lock = threading.RLock()\n\n    def get(self, key: str):\n        with self.lock:\n            if key not in self.cache:\n                return None\n            val, expiry = self.cache[key]\n            if expiry and time.time() > expiry:\n                del self.cache[key]\n                return None\n            self.cache.move_to_end(key)\n            return val\n`
    },
    test_cases: []
  },
  {
    id: 'prob-sql-index',
    title: 'Query Latency & Covering Index Optimization',
    slug: 'query-latency-covering-index',
    difficulty: 'Medium',
    topic: 'Databases & Query Planning',
    acceptance_rate: 55.0,
    description: `Refactor an unindexed \`SELECT ... WHERE status = 'pending' ORDER BY created_at DESC\` query experiencing sequential table scans across 5 million rows into an index-only scan.`,
    constraints: ['PostgreSQL 15 execution engine', 'Max query duration < 12ms'],
    starter_code: {
      python: `-- Analyze existing query plan\n-- EXPLAIN (ANALYZE, BUFFERS)\n-- SELECT user_id, order_id, amount FROM orders WHERE status = 'pending' ORDER BY created_at DESC LIMIT 50;\n\nCREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status_created_covering\nON orders (status, created_at DESC)\nINCLUDE (user_id, amount);\n`
    },
    test_cases: []
  }
];

export const SUBMISSIONS: Submission[] = [
  {
    id: 'sub-9481',
    problem_id: 'prob-rate-limiter',
    problem_title: 'Sliding Window Rate Limiter',
    language: 'python',
    code: 'class SlidingWindowLimiter:\n    def __init__(self, max_requests: int, window_size_ms: int):\n        self.max_requests = max_requests\n...',
    verdict: 'Accepted',
    passed_tests: 12,
    total_tests: 12,
    runtime_ms: 48,
    memory_kb: 14200,
    submitted_at: '2026-10-12T14:22:10Z',
  },
  {
    id: 'sub-9480',
    problem_id: 'prob-rate-limiter',
    problem_title: 'Sliding Window Rate Limiter',
    language: 'python',
    code: 'class SlidingWindowLimiter:\n    # Missing boundary check on timestamp equality',
    verdict: 'Wrong Answer',
    passed_tests: 8,
    total_tests: 12,
    runtime_ms: 52,
    memory_kb: 14100,
    submitted_at: '2026-10-12T13:58:02Z',
    error_output: 'AssertionError: Expected False on boundary timestamp collision (t=1000ms), received True.',
  },
  {
    id: 'sub-9472',
    problem_id: 'prob-lru-cache',
    problem_title: 'Thread-Safe LRU Cache with TTL Eviction',
    language: 'python',
    code: 'import threading\n...',
    verdict: 'Time Limit Exceeded',
    passed_tests: 14,
    total_tests: 20,
    runtime_ms: 2040,
    memory_kb: 32000,
    submitted_at: '2026-10-11T19:30:15Z',
    error_output: 'Execution exceeded 2000ms hard ceiling under 100 concurrent worker threads.',
  }
];

export const OBSERVATORY_METRICS: ObservatoryMetric = {
  total_study_hours: 46.5,
  coding_hours: 21.2,
  debugging_hours: 10.8,
  reading_hours: 8.4,
  testing_hours: 3.9,
  revision_hours: 2.2,
  sessions_count: 34,
  average_session_minutes: 82,
  focus_efficiency_score: 87.4,
};

export const TOPIC_TIME_DISTRIBUTION: TopicTimeData[] = [
  { topic: 'Concurrency & Threads', focused_minutes: 580, reading_minutes: 120, coding_minutes: 260, debugging_minutes: 150, testing_minutes: 50 },
  { topic: 'Database Indexing & Plans', focused_minutes: 420, reading_minutes: 90, coding_minutes: 180, debugging_minutes: 110, testing_minutes: 40 },
  { topic: 'Sliding Window & Queues', focused_minutes: 360, reading_minutes: 60, coding_minutes: 210, debugging_minutes: 70, testing_minutes: 20 },
  { topic: 'Tree & Graph Traversal', focused_minutes: 310, reading_minutes: 80, coding_minutes: 140, debugging_minutes: 60, testing_minutes: 30 },
  { topic: 'API Security & Auth', focused_minutes: 250, reading_minutes: 70, coding_minutes: 110, debugging_minutes: 50, testing_minutes: 20 },
  { topic: 'Memory & Resource Leaks', focused_minutes: 210, reading_minutes: 40, coding_minutes: 90, debugging_minutes: 70, testing_minutes: 10 },
];

export const DAILY_TRENDS: DailyTrendData[] = [
  { date: 'Oct 06', active_hours: 4.2, coding_hours: 2.5, reading_hours: 1.2, score_average: 82 },
  { date: 'Oct 07', active_hours: 5.8, coding_hours: 3.1, reading_hours: 1.5, score_average: 88 },
  { date: 'Oct 08', active_hours: 3.5, coding_hours: 1.8, reading_hours: 0.9, score_average: 79 },
  { date: 'Oct 09', active_hours: 6.4, coding_hours: 3.8, reading_hours: 1.6, score_average: 91 },
  { date: 'Oct 10', active_hours: 5.1, coding_hours: 2.9, reading_hours: 1.1, score_average: 85 },
  { date: 'Oct 11', active_hours: 7.2, coding_hours: 4.5, reading_hours: 1.8, score_average: 94 },
  { date: 'Oct 12', active_hours: 6.8, coding_hours: 4.1, reading_hours: 1.4, score_average: 92 },
];

export const DEBUG_ERRORS: DebugErrorCategory[] = [
  { category: 'Off-by-One Boundary Condition', count: 18, percentage: 34, avg_fix_minutes: 12.4, trend: 'improving' },
  { category: 'Stale Lock / Lease Expiration Race', count: 12, percentage: 23, avg_fix_minutes: 26.8, trend: 'repeating' },
  { category: 'Unclosed File/Socket Descriptor', count: 9, percentage: 17, avg_fix_minutes: 8.5, trend: 'improving' },
  { category: 'Type Inconsistency & Null Handling', count: 8, percentage: 15, avg_fix_minutes: 6.2, trend: 'improving' },
  { category: 'Event Loop Coroutine Starvation', count: 6, percentage: 11, avg_fix_minutes: 34.0, trend: 'repeating' },
];

export const CONCEPT_NODES: ConceptNode[] = [
  { id: 'c-vars', title: 'Data Structures & Memory', category: 'Foundation', mastery_percentage: 95, status: 'mastered', prerequisites: [], practice_accuracy: 94, last_practiced: '2026-10-02', recommended_next: 'c-pointers' },
  { id: 'c-pointers', title: 'Pointers & References', category: 'Foundation', mastery_percentage: 88, status: 'mastered', prerequisites: ['c-vars'], practice_accuracy: 89, last_practiced: '2026-10-05', recommended_next: 'c-trees' },
  { id: 'c-trees', title: 'Trees & Balanced Graphs', category: 'Algorithms', mastery_percentage: 78, status: 'in_progress', prerequisites: ['c-pointers'], practice_accuracy: 76, last_practiced: '2026-10-09', recommended_next: 'c-concurrent' },
  { id: 'c-async', title: 'Asynchronous Event Loops', category: 'Architecture', mastery_percentage: 84, status: 'mastered', prerequisites: ['c-vars'], practice_accuracy: 88, last_practiced: '2026-10-11', recommended_next: 'c-concurrent' },
  { id: 'c-concurrent', title: 'Thread Synchronization & Locks', category: 'Systems', mastery_percentage: 62, status: 'in_progress', prerequisites: ['c-trees', 'c-async'], practice_accuracy: 64, last_practiced: '2026-10-12', recommended_next: 'c-dist-mutex' },
  { id: 'c-dist-mutex', title: 'Distributed Consensus & Raft', category: 'Distributed', mastery_percentage: 35, status: 'prerequisite_weak', prerequisites: ['c-concurrent'], practice_accuracy: 42, last_practiced: '2026-10-10', recommended_next: 'c-concurrent' },
];

export const REVISION_RECOMMENDATIONS: RevisionRecommendation[] = [
  {
    id: 'rev-1',
    topic: 'Thread Synchronization & Mutual Exclusion',
    reason: 'repeated_errors',
    urgency: 'high',
    explanation: 'Your last 3 attempts encountered race conditions when simulating worker thread lease timeouts. Practicing fenced token checks will unblock Distributed Consensus.',
    estimated_minutes: 25,
    problem_id: 'prob-lru-cache',
  },
  {
    id: 'rev-2',
    topic: 'Sliding Window Boundary Timestamps',
    reason: 'retention_decay',
    urgency: 'medium',
    explanation: 'Last tested 6 days ago. Spaced repetition retention projection indicates a 15% decay without a 10-minute reinforcement problem.',
    estimated_minutes: 15,
    problem_id: 'prob-rate-limiter',
  },
  {
    id: 'rev-3',
    topic: 'PostgreSQL Covering Indexes & Buffers',
    reason: 'upcoming_assessment',
    urgency: 'medium',
    explanation: 'High-Performance Backend Assessment is scheduled in 2 days. Review EXPLAIN (ANALYZE, BUFFERS) interpretation.',
    estimated_minutes: 20,
    problem_id: 'prob-sql-index',
  }
];

export const ENGINEERING_SCENARIOS: EngineeringScenario[] = [
  {
    id: 'scen-api-pagination',
    title: 'Diagnose and Resolve Unbounded Query Pagination',
    domain: 'Backend REST API',
    difficulty: 'Mid-Level',
    context: 'A production service endpoint /api/v1/orders crashes under memory spikes because pagination allows page_size=100000 and uses OFFSET-based scanning over 10M rows.',
    acceptance_criteria: [
      'Enforce strict maximum page size ceiling (max 100).',
      'Refactor from OFFSET pagination to keyset (cursor-based) pagination using (created_at, order_id).',
      'Pass automated load test ensuring query execution under 25ms at page 10,000.',
    ],
    starter_repo: 'https://github.com/codeintellect-scenarios/cursor-pagination-refactor',
    evaluation_rubric: [
      { category: 'Functional Correctness', weight: 40, description: 'Cursor accurately reflects ordering without duplicate or missing rows across page boundaries.' },
      { category: 'Query Performance', weight: 35, description: 'B-tree index traversal replaces sequential scan.' },
      { category: 'Defensive Input Validation', weight: 25, description: 'Rejects invalid cursors and clamps excessive page_size requests.' },
    ],
    is_verified: true,
  },
  {
    id: 'scen-deadlock-prevention',
    title: 'Eliminate Database Deadlock in Financial Ledger',
    domain: 'Database Optimization',
    difficulty: 'Senior',
    context: 'Concurrent bank transfer operations deadlocking during bidirectional account balance deductions.',
    acceptance_criteria: [
      'Enforce consistent account locking ordering by ID.',
      'Implement atomic advisory locks or SELECT FOR UPDATE ordered sets.',
      'Achieve zero deadlocks over 5,000 simulated concurrent transfers.',
    ],
    starter_repo: 'https://github.com/codeintellect-scenarios/ledger-concurrency-deadlocks',
    evaluation_rubric: [
      { category: 'Lock Hierarchy Integrity', weight: 50, description: 'Strict lexicographical lock acquisition prevents circular wait conditions.' },
      { category: 'Throughput Under Contention', weight: 30, description: 'Optimistic retries preserve system latency.' },
      { category: 'Audit Trail Completeness', weight: 20, description: 'Every transfer logs transactional idempotency key.' },
    ],
    is_verified: true,
  }
];

export const SKILL_PASSPORT_ITEMS: SkillEvidenceItem[] = [
  {
    id: 'sk-1',
    skill_name: 'Asynchronous Concurrency & Event Loops',
    domain: 'Backend Engineering',
    verified_level: 'Proficient',
    demonstrated_at: '2026-10-12',
    evidence_source: 'Scenario: Sliding Window Rate Limiter & Stress Test',
    evidence_url: '/code-lab?problem=prob-rate-limiter',
    confidence_score: 94,
  },
  {
    id: 'sk-2',
    skill_name: 'Keyset Pagination & Index Optimization',
    domain: 'Database Architecture',
    verified_level: 'Proficient',
    demonstrated_at: '2026-10-08',
    evidence_source: 'Scenario: Unbounded Query Pagination Refactor',
    evidence_url: '/projects/scen-api-pagination',
    confidence_score: 91,
  },
  {
    id: 'sk-3',
    skill_name: 'Distributed Mutual Exclusion & Fencing',
    domain: 'Distributed Systems',
    verified_level: 'Practitioner',
    demonstrated_at: '2026-10-05',
    evidence_source: 'Lab Assessment: Monotonic Fencing Token Commits',
    evidence_url: '/assessments/asmt-sys-1',
    confidence_score: 78,
  },
  {
    id: 'sk-4',
    skill_name: 'Defensive Input Sanitization & Timing Attacks',
    domain: 'Application Security',
    verified_level: 'Proficient',
    demonstrated_at: '2026-09-28',
    evidence_source: 'AppSec Practical Audit Suite: Constant-time HMAC checks',
    evidence_url: '/projects/scen-timing-attacks',
    confidence_score: 89,
  }
];

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'asmt-sys-1',
    title: 'Systems & Concurrency Practical Assessment',
    duration_minutes: 60,
    total_questions: 4,
    passing_score: 75,
    category: 'Backend Engineering',
    questions: [
      {
        id: 'q-1',
        prompt: 'Explain why simple Redis TTL locks without fencing tokens can permit dual-master writes in the presence of GC pauses.',
        type: 'mcq',
        options: [
          'Because Redis replication is asynchronous, causing data loss during failovers.',
          'A client holding a lock may pause during garbage collection; the lease expires, another client acquires the lock, and the first resumes writing with a stale belief of ownership.',
          'Because Redis only supports single-threaded command evaluation.',
          'Because network packets always arrive in randomized ordering.'
        ],
        points: 25,
      },
      {
        id: 'q-2',
        prompt: 'Implement a thread-safe token bucket algorithm with refill rate calculation.',
        type: 'code',
        starter_code: 'class TokenBucket:\n    def __init__(self, capacity: int, refill_rate_per_sec: float):\n        # Fill implementation here\n        pass\n',
        points: 40,
      }
    ]
  }
];
