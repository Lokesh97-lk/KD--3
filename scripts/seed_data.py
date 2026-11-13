"""Database seeding script populating comprehensive realistic engineering curricula,
problems with test cases, concept DAG, assessments, and student activity."""

import os
import sys
from datetime import UTC, datetime, timedelta

# Ensure python path includes backend and workspace root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select
from app.db.init_db import init_db
from app.db.session import SessionLocal, engine
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.system import AuditLog
from app.models.course import Course, Module, Lesson, CourseEnrollment, LessonProgress, CourseLevel, EnrollmentStatus, LessonType
from app.models.problem import Problem, TestCase, Submission, ProblemDifficulty, ExecutionVerdict
from app.models.concept import ConceptNode, ConceptDependency, UserConceptMastery, ConceptMasteryStatus
from app.models.assessment import Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentAnswer, QuestionType, AttemptStatus
from app.models.project import Project, ProjectMilestone, ProjectMilestoneSubmission, ProjectDifficulty, MilestoneSubmissionStatus
from app.models.analytics import (
    LearningEvent, StudySession, ErrorPattern, RevisionTask, SkillEvidence,
    EventType, RevisionReason, RevisionUrgency, ErrorTrend, VerifiedLevel
)


def seed():
    print("Initializing database tables...")
    init_db()

    db = SessionLocal()
    try:
        # Check if already seeded
        existing_admin = db.execute(select(User).where(User.email == "admin.lead@codeintellect.io")).scalar_one_or_none()
        if existing_admin:
            print("Database already contains seed data. Updating/refreshing...")

        # 1. Users
        print("Creating users for Student, Instructor, and Admin roles...")
        users_to_create = [
            ("alex.chen@codeintellect.io", "Alex Chen", UserRole.STUDENT),
            ("student@codeintellect.io", "Student Demo", UserRole.STUDENT),
            ("marcus.b@example.com", "Marcus Brody", UserRole.STUDENT),
            ("priya.s@example.com", "Priya Sharma", UserRole.STUDENT),
            ("carlos.m@example.com", "Carlos Mendez", UserRole.STUDENT),
            ("instructor.elena@codeintellect.io", "Elena Rostova", UserRole.INSTRUCTOR),
            ("instructor@codeintellect.io", "Instructor Demo", UserRole.INSTRUCTOR),
            ("admin.lead@codeintellect.io", "Admin Root", UserRole.ADMIN),
            ("admin@codeintellect.io", "System Administrator", UserRole.ADMIN),
        ]

        user_map = {}
        for email, full_name, role in users_to_create:
            u = db.execute(select(User).where(User.email == email)).scalar_one_or_none()
            if not u:
                u = User(
                    email=email,
                    full_name=full_name,
                    hashed_password=get_password_hash("Secr3t!P@ssword2026"),
                    role=role,
                    is_active=True,
                    is_verified=True,
                    timezone="UTC",
                )
                db.add(u)
                db.flush()
            user_map[email] = u

        alex = user_map["alex.chen@codeintellect.io"]
        elena = user_map["instructor.elena@codeintellect.io"]
        admin = user_map["admin.lead@codeintellect.io"]

        # 2. Concept Dependency Nodes
        print("Creating Concept Dependency Graph nodes & edges...")
        concepts_data = [
            ("concept-ds-memory", "Data Structures & Memory", "Foundations", "Core memory layout, cache locality, pointer traversal, and heap vs stack ergonomics.", "Thread Locks & Concurrency"),
            ("concept-async-loops", "Asynchronous Event Loops", "Concurrency", "Non-blocking I/O, cooperative multitasking, task scheduling, and promise execution models.", "Thread Locks & Concurrency"),
            ("concept-locks-concurrency", "Thread Locks & Concurrency", "Concurrency", "Mutual exclusion primitives, spinlocks, semaphores, deadlock avoidance, and race detection.", "Distributed Consensus (Raft)"),
            ("concept-raft-consensus", "Distributed Consensus (Raft)", "Distributed Systems", "State machine replication, quorum leadership, log compaction, and partition recovery.", "Byzantine Fault Tolerance"),
            ("concept-db-indexes", "Database Index Architecture", "Databases", "B-Tree structures, LSM trees, write amplification, and covering query execution plans.", "Distributed Query Planning"),
            ("concept-rate-limiting", "Distributed Rate Limiting", "Systems Design", "Sliding window logs, token bucket heuristics, and distributed Redis counter synchronization.", "Fault-Tolerant Gateways"),
        ]

        concept_map = {}
        for nid, title, cat, desc, rec_next in concepts_data:
            c = db.execute(select(ConceptNode).where(ConceptNode.node_id == nid)).scalar_one_or_none()
            if not c:
                c = ConceptNode(
                    node_id=nid,
                    title=title,
                    category=cat,
                    description=desc,
                    difficulty_level="Intermediate",
                    recommended_next=rec_next,
                )
                db.add(c)
                db.flush()
            concept_map[nid] = c

        # Concept dependencies
        deps_data = [
            ("concept-locks-concurrency", "concept-ds-memory"),
            ("concept-locks-concurrency", "concept-async-loops"),
            ("concept-raft-consensus", "concept-locks-concurrency"),
            ("concept-rate-limiting", "concept-ds-memory"),
            ("concept-db-indexes", "concept-ds-memory"),
        ]
        for src, tgt in deps_data:
            existing_dep = db.execute(
                select(ConceptDependency).where(
                    ConceptDependency.source_concept_id == concept_map[src].id,
                    ConceptDependency.target_concept_id == concept_map[tgt].id,
                )
            ).scalar_one_or_none()
            if not existing_dep:
                dep = ConceptDependency(
                    source_concept_id=concept_map[src].id,
                    target_concept_id=concept_map[tgt].id,
                    relationship_type="requires",
                )
                db.add(dep)

        # User concept mastery for Alex Chen
        mastery_levels = [
            ("concept-ds-memory", 95, 0.94, ConceptMasteryStatus.MASTERED),
            ("concept-async-loops", 84, 0.88, ConceptMasteryStatus.MASTERED),
            ("concept-locks-concurrency", 62, 0.65, ConceptMasteryStatus.IN_PROGRESS),
            ("concept-raft-consensus", 28, 0.35, ConceptMasteryStatus.PREREQUISITE_WEAK),
            ("concept-db-indexes", 78, 0.82, ConceptMasteryStatus.IN_PROGRESS),
            ("concept-rate-limiting", 86, 0.91, ConceptMasteryStatus.MASTERED),
        ]
        for cid, pct, acc, stat in mastery_levels:
            m = db.execute(
                select(UserConceptMastery).where(
                    UserConceptMastery.user_id == alex.id,
                    UserConceptMastery.concept_id == concept_map[cid].id,
                )
            ).scalar_one_or_none()
            if not m:
                m = UserConceptMastery(
                    user_id=alex.id,
                    concept_id=concept_map[cid].id,
                    mastery_percentage=pct,
                    practice_accuracy=acc,
                    status=stat,
                    last_practiced=datetime.now(UTC) - timedelta(days=2),
                )
                db.add(m)

        # 3. Courses, Modules, Lessons
        print("Creating educational courses, modules, and lessons...")
        courses_data = [
            {
                "title": "High-Throughput Systems & Defensive Engineering",
                "slug": "high-throughput-systems",
                "category": "Systems Engineering",
                "level": CourseLevel.ADVANCED,
                "duration_hours": 16,
                "description": "Master non-blocking I/O architectures, thread synchronization, boundary invariance, and zero-allocation memory pipelines under extreme load.",
                "modules": [
                    {
                        "title": "Module 1: Concurrency Primitives & Memory Models",
                        "description": "Understand thread interleaving, mutual exclusion, and hardware memory barriers.",
                        "lessons": [
                            {
                                "title": "1.1 The Mechanics of Critical Sections & Invariant Violations",
                                "slug": "critical-sections-invariants",
                                "duration_minutes": 20,
                                "type": LessonType.CONCEPT,
                                "concept_id": concept_map["concept-locks-concurrency"].id,
                                "content_markdown": """# Critical Sections & Invariant Violations

In concurrent programming, an **invariant** is a property of program state that remains true during valid operations. When multiple execution threads access shared state concurrently without synchronization, temporary invariant violations can be observed by other threads, leading to silent data corruption.

```python
import threading

class Account:
    def __init__(self, balance: int):
        self.balance = balance
        self._lock = threading.Lock()

    def transfer(self, target: 'Account', amount: int):
        # Always acquire locks in canonical order to prevent deadlocks
        first, second = (self, target) if id(self) < id(target) else (target, self)
        with first._lock:
            with second._lock:
                if self.balance >= amount:
                    self.balance -= amount
                    target.balance += amount
```
""",
                                "starter_code": "def solve():\n    pass\n",
                                "language": "python",
                            },
                            {
                                "title": "1.2 Deadlock Prevention: Resource Hierarchies",
                                "slug": "deadlock-prevention-hierarchies",
                                "duration_minutes": 25,
                                "type": LessonType.INTERACTIVE,
                                "concept_id": concept_map["concept-locks-concurrency"].id,
                                "content_markdown": """# Deadlock Prevention via Resource Ordering

The Coffman conditions specify that deadlock requires Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait.

Eliminating circular wait by enforcing a strict global total order over lock acquisitions guarantees freedom from deadlock.
""",
                                "starter_code": "# Enforce lock ordering by object ID\ndef safe_dual_lock(lock_a, lock_b):\n    pass\n",
                                "language": "python",
                            },
                        ],
                    },
                    {
                        "title": "Module 2: Sliding Window Algorithms & Rate Limiting",
                        "description": "Implement microsecond-precise request throttle gates without memory bloat.",
                        "lessons": [
                            {
                                "title": "2.1 Sliding Window Log vs Token Bucket",
                                "slug": "sliding-window-log-token-bucket",
                                "duration_minutes": 30,
                                "type": LessonType.CONCEPT,
                                "concept_id": concept_map["concept-rate-limiting"].id,
                                "content_markdown": """# Sliding Window Log vs Token Bucket

Fixed window counters fail at boundary transitions: an attacker can burst 2x the allowed volume across a window boundary.

A sliding window log retains timestamps in a monotonic deque, evicting any timestamp where `t <= current_time - window_size`.

### Invariant Check
When checking whether an event at `now` is permissible:
```
cutoff = now - window_size
while deque and deque[0] <= cutoff:
    deque.popleft()

if len(deque) < max_capacity:
    deque.append(now)
    return True
return False
```
Notice the `<=` boundary operator! Using `<` creates an off-by-one boundary leak!
""",
                                "starter_code": "class RateLimiter:\n    def __init__(self, limit: int, window: int):\n        pass\n",
                                "language": "python",
                            },
                        ],
                    },
                ],
            },
            {
                "title": "Database Query Engine Internals & Index Design",
                "slug": "database-internals",
                "category": "Database Architecture",
                "level": CourseLevel.INTERMEDIATE,
                "duration_hours": 12,
                "description": "Analyze storage engines, B-tree balance heuristics, cost-based optimizers, and deep cursor pagination strategies.",
                "modules": [
                    {
                        "title": "Module 1: Index Structures & Covering Queries",
                        "description": "How database engines avoid random disk I/O.",
                        "lessons": [
                            {
                                "title": "1.1 B-Tree Leaf Node Traversal & Range Scans",
                                "slug": "btree-leaf-traversal",
                                "duration_minutes": 25,
                                "type": LessonType.CONCEPT,
                                "concept_id": concept_map["concept-db-indexes"].id,
                                "content_markdown": """# B-Tree Mechanics & Index Scans

When an index includes all columns requested by a SQL query, the query executes as an Index-Only Scan without touching table heap pages.

```sql
-- Keyset pagination pattern (avoids OFFSET quadratic scan)
SELECT id, title, created_at 
FROM events 
WHERE (created_at, id) < (:last_created_at, :last_id)
ORDER BY created_at DESC, id DESC
LIMIT 50;
```
""",
                                "starter_code": "-- Keyset pagination query\nSELECT * FROM logs LIMIT 10;\n",
                                "language": "sql",
                            }
                        ]
                    }
                ],
            },
        ]

        for c_data in courses_data:
            course = db.execute(select(Course).where(Course.slug == c_data["slug"])).scalar_one_or_none()
            if not course:
                course = Course(
                    title=c_data["title"],
                    slug=c_data["slug"],
                    category=c_data["category"],
                    level=c_data["level"],
                    duration_hours=c_data["duration_hours"],
                    description=c_data["description"],
                    instructor_name="Elena Rostova",
                    instructor_id=elena.id,
                    is_published=True,
                )
                db.add(course)
                db.flush()

                for m_idx, m_data in enumerate(c_data["modules"]):
                    mod = Module(
                        course_id=course.id,
                        title=m_data["title"],
                        description=m_data["description"],
                        order_index=m_idx,
                    )
                    db.add(mod)
                    db.flush()

                    for l_idx, l_data in enumerate(m_data["lessons"]):
                        les = Lesson(
                            module_id=mod.id,
                            title=l_data["title"],
                            slug=l_data["slug"],
                            duration_minutes=l_data["duration_minutes"],
                            lesson_type=l_data["type"],
                            concept_id=l_data.get("concept_id"),
                            content_markdown=l_data["content_markdown"],
                            starter_code=l_data["starter_code"],
                            language=l_data["language"],
                            order_index=l_idx,
                        )
                        db.add(les)
                        db.flush()

                        # Mark completed for Alex Chen on lesson 1
                        if l_idx == 0:
                            lp = LessonProgress(
                                user_id=alex.id,
                                lesson_id=les.id,
                                is_completed=True,
                                time_spent_seconds=1200,
                                completed_at=datetime.now(UTC) - timedelta(days=1),
                            )
                            db.add(lp)

                # Enroll Alex Chen
                enr = CourseEnrollment(
                    user_id=alex.id,
                    course_id=course.id,
                    status=EnrollmentStatus.ACTIVE,
                    progress_percentage=50 if c_data["slug"] == "high-throughput-systems" else 100,
                )
                db.add(enr)

        # 4. Coding Problems with test cases
        print("Creating interactive Code Lab problems with test suites...")
        problems_data = [
            {
                "title": "Sliding Window Rate Limiter",
                "slug": "prob-rate-limiter",
                "difficulty": ProblemDifficulty.MEDIUM,
                "topic": "Concurrency & Algorithms",
                "concept_id": concept_map["concept-rate-limiting"].id,
                "description": """## Problem Specification: Sliding Window Rate Limiter

You are tasked with building the kernel of a real-time rate limiter for a distributed API gateway.
Given a maximum limit of requests $L$ permitted in a sliding time window of $1000$ milliseconds, process a sequential stream of incoming requests.

### Input Format
- Line 1: An integer $L$ indicating the maximum allowed requests in any $1000$ms window.
- Line 2: An integer $N$ indicating the number of requests to process.
- Next $N$ lines: Each line contains a single integer timestamp in milliseconds $T$.

### Output Format
For each request, print `ALLOW` if the request is permitted within the sliding window, or `DENIED` if it would exceed $L$.

### Example
**Input:**
```
3
5
100
200
500
1100
1150
```

**Output:**
```
ALLOW
ALLOW
ALLOW
ALLOW
DENIED
```
*Explanation: At timestamp 1100ms, the request at 100ms (1100 - 100 = 1000ms) has fallen out of the window [101, 1100], so only [200, 500, 1100] are active (total 3 <= 3). At 1150ms, window [151, 1150] has [200, 500, 1100], so adding 1150 would make 4 > 3, hence DENIED.*
""",
                "constraints": [
                    "1 <= L <= 100,000",
                    "1 <= N <= 200,000",
                    "1 <= T <= 10^9, strictly monotonic non-decreasing",
                    "Time limit: 2000ms, Memory limit: 128MB",
                ],
                "starter_code": {
                    "python": """import sys
from collections import deque

def main():
    lines = sys.stdin.read().split()
    if not lines:
        return
    limit = int(lines[0])
    n = int(lines[1])
    timestamps = [int(x) for x in lines[2:2+n]]

    window = deque()
    for t in timestamps:
        cutoff = t - 1000
        # Evict timestamps outside the sliding window
        while window and window[0] <= cutoff:
            window.popleft()

        if len(window) < limit:
            window.append(t)
            print("ALLOW")
        else:
            print("DENIED")

if __name__ == '__main__':
    main()
""",
                    "javascript": """const fs = require('fs');

function main() {
    const input = fs.readFileSync(0, 'utf-8').trim().split(/\\s+/);
    if (!input || input.length < 2) return;
    const limit = parseInt(input[0], 10);
    const n = parseInt(input[1], 10);
    const timestamps = input.slice(2, 2 + n).map(x => parseInt(x, 10));

    const window = [];
    let startIdx = 0;

    for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i];
        const cutoff = t - 1000;
        while (startIdx < window.length && window[startIdx] <= cutoff) {
            startIdx++;
        }
        if ((window.length - startIdx) < limit) {
            window.push(t);
            console.log("ALLOW");
        } else {
            console.log("DENIED");
        }
    }
}
main();
""",
                },
                "test_cases": [
                    ("3\n5\n100\n200\n500\n1100\n1150", "ALLOW\nALLOW\nALLOW\nALLOW\nDENIED", False, "Standard window slide with one eviction"),
                    ("2\n4\n10\n20\n30\n1025", "ALLOW\nALLOW\nDENIED\nALLOW", False, "Limit exceeded then window expiration"),
                    ("1\n3\n100\n1050\n1100", "ALLOW\nDENIED\nALLOW", True, "Hidden Case 1: Exact window boundary cutoff"),
                    ("5\n6\n10\n15\n20\n25\n30\n35", "ALLOW\nALLOW\nALLOW\nALLOW\nALLOW\nDENIED", True, "Hidden Case 2: Burst volume saturation"),
                ],
            },
            {
                "title": "Thread-Safe LRU Cache Eviction",
                "slug": "prob-lru-cache",
                "difficulty": ProblemDifficulty.MEDIUM,
                "topic": "Data Structures & Memory",
                "concept_id": concept_map["concept-ds-memory"].id,
                "description": """## Thread-Safe LRU Cache Eviction

Implement a Least Recently Used (LRU) Cache supporting `get` and `put` operations with $O(1)$ amortized time complexity.

### Input
- Line 1: `capacity`
- Next lines: Operations formatted as `GET key` or `PUT key value`

### Output
For each `GET` operation, output the integer value or `-1` if not found.
""",
                "constraints": ["1 <= capacity <= 10,000", "1 <= operations <= 50,000"],
                "starter_code": {
                    "python": """import sys
from collections import OrderedDict

def main():
    lines = sys.stdin.read().splitlines()
    if not lines:
        return
    cap = int(lines[0].strip())
    cache = OrderedDict()

    for line in lines[1:]:
        parts = line.strip().split()
        if not parts:
            continue
        op = parts[0]
        if op == 'GET':
            k = parts[1]
            if k in cache:
                cache.move_to_end(k)
                print(cache[k])
            else:
                print("-1")
        elif op == 'PUT':
            k, v = parts[1], parts[2]
            if k in cache:
                cache.move_to_end(k)
            cache[k] = v
            if len(cache) > cap:
                cache.popitem(last=False)

if __name__ == '__main__':
    main()
""",
                    "javascript": "console.log('Implement JS LRU Cache');",
                },
                "test_cases": [
                    ("2\nPUT a 1\nPUT b 2\nGET a\nPUT c 3\nGET b\nGET c", "1\n-1\n3", False, "Basic eviction of key b"),
                    ("1\nPUT x 10\nGET x\nPUT y 20\nGET x\nGET y", "10\n-1\n20", True, "Single capacity eviction"),
                ],
            },
            {
                "title": "Unbounded Query Pagination Optimization",
                "slug": "prob-query-pagination",
                "difficulty": ProblemDifficulty.EASY,
                "topic": "Database Architecture",
                "concept_id": concept_map["concept-db-indexes"].id,
                "description": """## Keyset Cursor Generation for High-Volume Records

Generate monotonic cursor tokens based on composite keys `(timestamp, id)` to prevent offset-based database degradation.
""",
                "constraints": ["1 <= N <= 1000"],
                "starter_code": {
                    "python": """import sys

def main():
    lines = sys.stdin.read().splitlines()
    for line in lines:
        if line.strip():
            print(f"CURSOR_{line.strip()}")

if __name__ == '__main__':
    main()
""",
                    "javascript": "console.log('Cursor Generator');",
                },
                "test_cases": [
                    ("item_101\nitem_102", "CURSOR_item_101\nCURSOR_item_102", False, "Basic cursor emission"),
                ],
            },
        ]

        problem_map = {}
        for p_data in problems_data:
            prob = db.execute(select(Problem).where(Problem.slug == p_data["slug"])).scalar_one_or_none()
            if not prob:
                prob = Problem(
                    title=p_data["title"],
                    slug=p_data["slug"],
                    difficulty=p_data["difficulty"],
                    topic=p_data["topic"],
                    concept_id=p_data["concept_id"],
                    description=p_data["description"],
                    constraints=p_data["constraints"],
                    starter_code=p_data["starter_code"],
                    time_limit_ms=2000,
                    memory_limit_mb=128,
                    author_id=elena.id,
                    is_published=True,
                )
                db.add(prob)
                db.flush()

                for tc_idx, (inp, exp, is_hid, expl) in enumerate(p_data["test_cases"]):
                    tc = TestCase(
                        problem_id=prob.id,
                        input_data=inp,
                        expected_output=exp,
                        is_hidden=is_hid,
                        explanation=expl,
                        order_index=tc_idx,
                    )
                    db.add(tc)

            problem_map[p_data["slug"]] = prob

        # 5. Recorded Submissions for Alex Chen
        print("Recording real submissions history and test verdicts...")
        rate_limiter_prob = problem_map["prob-rate-limiter"]
        subs_to_seed = [
            (
                rate_limiter_prob.id,
                "python",
                rate_limiter_prob.starter_code["python"],
                ExecutionVerdict.ACCEPTED,
                4, 4, 38, 14200, None,
                datetime.now(UTC) - timedelta(hours=2),
            ),
            (
                rate_limiter_prob.id,
                "python",
                rate_limiter_prob.starter_code["python"].replace("window[0] <= cutoff", "window[0] < cutoff"),
                ExecutionVerdict.WRONG_ANSWER,
                2, 4, 42, 14100,
                "AssertionError: Boundary check collision failed at cutoff boundary.",
                datetime.now(UTC) - timedelta(hours=5),
            ),
            (
                problem_map["prob-lru-cache"].id,
                "python",
                problem_map["prob-lru-cache"].starter_code["python"],
                ExecutionVerdict.ACCEPTED,
                2, 2, 45, 14500, None,
                datetime.now(UTC) - timedelta(days=1),
            ),
        ]

        for pid, lang, code, verd, passed, total, run_ms, mem_kb, err, dt in subs_to_seed:
            sub = Submission(
                user_id=alex.id,
                problem_id=pid,
                language=lang,
                code=code,
                verdict=verd,
                passed_tests=passed,
                total_tests=total,
                runtime_ms=run_ms,
                memory_kb=mem_kb,
                error_output=err,
                submitted_at=dt,
            )
            db.add(sub)

        # 6. Assessments
        print("Creating formal technical assessments with questions...")
        asmt_data = [
            {
                "title": "Systems Architecture & Concurrency Certification",
                "description": "Rigorous timed assessment evaluating mutex locking, race hazard diagnosis, and sliding window invariants.",
                "category": "Concurrency & Architecture",
                "duration_minutes": 30,
                "passing_score": 70,
                "questions": [
                    {
                        "prompt": "Which of the following conditions is NOT one of the four necessary Coffman conditions required for deadlock?",
                        "type": QuestionType.MCQ,
                        "options": [
                            "Mutual Exclusion",
                            "Hold and Wait",
                            "Memory Paging Thrashing",
                            "Circular Wait Condition"
                        ],
                        "correct_answer": "Memory Paging Thrashing",
                        "points": 25,
                    },
                    {
                        "prompt": "When implementing a sliding window rate limiter, what is the critical flaw of a fixed-counter window when requests arrive at the window boundary?",
                        "type": QuestionType.MCQ,
                        "options": [
                            "It requires unbounded heap memory.",
                            "It permits up to 2x the allowable request quota across the boundary split.",
                            "It causes a kernel deadlock.",
                            "It fails to hash IP addresses."
                        ],
                        "correct_answer": "It permits up to 2x the allowable request quota across the boundary split.",
                        "points": 25,
                    },
                    {
                        "prompt": "Under what condition will an index scan in PostgreSQL completely bypass accessing heap table pages?",
                        "type": QuestionType.MCQ,
                        "options": [
                            "Only when the table has fewer than 100 rows.",
                            "When the query is a Covering Query and pages are marked clean in the visibility map.",
                            "Whenever a foreign key constraint is present.",
                            "Only if the database engine runs in read-only mode."
                        ],
                        "correct_answer": "When the query is a Covering Query and pages are marked clean in the visibility map.",
                        "points": 25,
                    },
                    {
                        "prompt": "What invariant ensures that two concurrent transactions acquiring locks A and B never deadlock?",
                        "type": QuestionType.MCQ,
                        "options": [
                            "Acquiring locks in canonical global address / ID order.",
                            "Releasing locks in random order.",
                            "Using infinite timeouts on spinlocks.",
                            "Disabling thread preemption entirely."
                        ],
                        "correct_answer": "Acquiring locks in canonical global address / ID order.",
                        "points": 25,
                    },
                ]
            }
        ]

        for a_info in asmt_data:
            asmt = db.execute(select(Assessment).where(Assessment.title == a_info["title"])).scalar_one_or_none()
            if not asmt:
                asmt = Assessment(
                    title=a_info["title"],
                    description=a_info["description"],
                    category=a_info["category"],
                    duration_minutes=a_info["duration_minutes"],
                    total_questions=len(a_info["questions"]),
                    passing_score=a_info["passing_score"],
                    instructor_id=elena.id,
                    is_published=True,
                )
                db.add(asmt)
                db.flush()

                for q_idx, q_info in enumerate(a_info["questions"]):
                    q = AssessmentQuestion(
                        assessment_id=asmt.id,
                        prompt=q_info["prompt"],
                        question_type=q_info["type"],
                        options=q_info["options"],
                        correct_answer=q_info["correct_answer"],
                        points=q_info["points"],
                        order_index=q_idx,
                    )
                    db.add(q)
                db.flush()

                # Record successful attempt for Alex Chen
                attempt = AssessmentAttempt(
                    assessment_id=asmt.id,
                    user_id=alex.id,
                    status=AttemptStatus.EVALUATED,
                    score=100.0,
                    max_score=100.0,
                    percentage=100.0,
                    passed=True,
                    started_at=datetime.now(UTC) - timedelta(days=2),
                    submitted_at=datetime.now(UTC) - timedelta(days=2),
                    time_taken_seconds=780,
                    feedback="Exceptional score! Invariants, concurrency models, and index mechanics verified.",
                )
                db.add(attempt)

        # 7. Practical Engineering Projects (Project Studio)
        print("Creating practical engineering project scenarios and rubrics...")
        projects_data = [
            {
                "title": "High-Volume Telemetry Ingestion Engine",
                "slug": "scenario-telemetry-engine",
                "domain": "Backend REST API",
                "difficulty": ProjectDifficulty.SENIOR,
                "context": "Design and implement a resilient HTTP telemetry ingestion service handling bursts of 50,000 req/sec with backpressure and graceful degradation.",
                "acceptance_criteria": [
                    "HTTP POST /telemetry accepts JSON batch payloads under 5ms p99 latency.",
                    "Memory consumption remains bounded under queue saturation.",
                    "Thread pool rejects excess load with HTTP 429 when buffer exceeds high-water mark.",
                ],
                "starter_repo": "https://github.com/codeintellect/telemetry-engine-starter",
                "evaluation_rubric": [
                    {"category": "Throughput & Latency", "weight": 35, "description": "Sub-5ms response time under 10k concurrent simulated connections."},
                    {"category": "Memory Stability", "weight": 35, "description": "Zero memory leaks across 1 hour continuous ingestion test."},
                    {"category": "Code Hygiene & Tests", "weight": 30, "description": "Unit tests verifying backpressure handling and invariant guards."},
                ],
                "milestones": [
                    {
                        "title": "Milestone 1: Non-Blocking Ingestion Handler & Ring Buffer",
                        "description": "Construct the ingestion endpoint with zero-allocation ring buffer integration.",
                        "order_index": 0,
                        "skills_demonstrated": ["Non-Blocking I/O Architecture", "Ring Buffer Ergonomics"],
                    },
                    {
                        "title": "Milestone 2: Distributed Backpressure & Circuit Breaking",
                        "description": "Implement adaptive rate shedding when database persistence falls behind.",
                        "order_index": 1,
                        "skills_demonstrated": ["Circuit Breakers & Fault Tolerance", "Backpressure Regulation"],
                    },
                ],
            },
            {
                "title": "Unbounded Query Pagination in PostgreSQL",
                "slug": "scenario-query-pagination",
                "domain": "Database Optimization",
                "difficulty": ProjectDifficulty.MID_LEVEL,
                "context": "Replace quadratic OFFSET scans with high-throughput Keyset Cursor indexing over a 10M record audit dataset.",
                "acceptance_criteria": [
                    "Query response time remains constant from page 1 to page 50,000.",
                    "Index-Only scan verified with EXPLAIN ANALYZE.",
                ],
                "starter_repo": "https://github.com/codeintellect/keyset-pagination-starter",
                "evaluation_rubric": [
                    {"category": "Query Performance", "weight": 50, "description": "Stable sub-10ms latency regardless of pagination depth."},
                    {"category": "Index Design", "weight": 50, "description": "Covering index matching order criteria exactly."},
                ],
                "milestones": [
                    {
                        "title": "Milestone 1: Keyset Cursor SQL Migration",
                        "description": "Write migration adding composite index and replace offset queries.",
                        "order_index": 0,
                        "skills_demonstrated": ["Keyset Pagination", "B-Tree Covering Index Optimization"],
                    }
                ],
            },
        ]

        for p_info in projects_data:
            proj = db.execute(select(Project).where(Project.slug == p_info["slug"])).scalar_one_or_none()
            if not proj:
                proj = Project(
                    title=p_info["title"],
                    slug=p_info["slug"],
                    domain=p_info["domain"],
                    difficulty=p_info["difficulty"],
                    context=p_info["context"],
                    acceptance_criteria=p_info["acceptance_criteria"],
                    starter_repo=p_info["starter_repo"],
                    evaluation_rubric=p_info["evaluation_rubric"],
                    is_published=True,
                    author_id=elena.id,
                )
                db.add(proj)
                db.flush()

                for m_info in p_info["milestones"]:
                    milestone = ProjectMilestone(
                        project_id=proj.id,
                        title=m_info["title"],
                        description=m_info["description"],
                        order_index=m_info["order_index"],
                        skills_demonstrated=m_info["skills_demonstrated"],
                    )
                    db.add(milestone)
                    db.flush()

                    # Seed sample student submission for Alex Chen
                    if p_info["slug"] == "scenario-query-pagination":
                        sub = ProjectMilestoneSubmission(
                            milestone_id=milestone.id,
                            user_id=alex.id,
                            repo_link="https://github.com/alexchen-dev/keyset-postgres-opt",
                            code_snippet="-- Composite B-Tree Covering Index\nCREATE INDEX idx_audit_created_id ON audit_logs (created_at DESC, id DESC);",
                            notes="Eliminated table heap fetches. Latency reduced from 1450ms to 4ms on page 10,000.",
                            status=MilestoneSubmissionStatus.GRADED,
                            score=95,
                            feedback="Flawless composite index structure and query rewriting. Verified via EXPLAIN ANALYZE.",
                            evaluated_by=elena.id,
                            evaluated_at=datetime.now(UTC) - timedelta(days=1),
                        )
                        db.add(sub)
                    elif p_info["slug"] == "scenario-telemetry-engine" and m_info["order_index"] == 0:
                        sub = ProjectMilestoneSubmission(
                            milestone_id=milestone.id,
                            user_id=alex.id,
                            repo_link="https://github.com/alexchen-dev/telemetry-ring-buffer",
                            code_snippet="class RingBuffer:\n    def __init__(self, size=65536):\n        self.buf = [None] * size\n        self.head = 0\n        self.tail = 0",
                            notes="Implemented lockless ring buffer for request ingestion.",
                            status=MilestoneSubmissionStatus.PENDING_REVIEW,
                        )
                        db.add(sub)

        # 8. Skill Passport items for Alex Chen
        print("Creating verified Skill Passport records...")
        skills_data = [
            ("Distributed Rate Limiter Architecture", "Systems Design & Fault Tolerance", VerifiedLevel.PROFICIENT, "Code Lab Practical Suite: Sliding Window Limiter", "/code-lab?problem=prob-rate-limiter", 94),
            ("Thread-Safe Cache Implementation", "Concurrency & Memory Safety", VerifiedLevel.PRACTITIONER, "Assessment: Systems Architecture & Concurrency", "/assessments", 88),
            ("High-Throughput Pagination Query Optimization", "Database & Query Performance", VerifiedLevel.PROFICIENT, "Project Studio: Unbounded Query Pagination", "/projects", 95),
            ("Defensive Invariant Testing", "Testing & Verification", VerifiedLevel.PRACTITIONER, "Assessment: Defensive Engineering Suite", "/assessments", 85),
        ]
        for sk_name, domain, lvl, src, url, conf in skills_data:
            existing_sk = db.execute(
                select(SkillEvidence).where(SkillEvidence.user_id == alex.id, SkillEvidence.skill_name == sk_name)
            ).scalar_one_or_none()
            if not existing_sk:
                sk = SkillEvidence(
                    user_id=alex.id,
                    skill_name=sk_name,
                    domain=domain,
                    verified_level=lvl,
                    evidence_source=src,
                    evidence_url=url,
                    confidence_score=conf,
                    is_verified=True,
                    demonstrated_at=datetime.now(UTC) - timedelta(days=2),
                )
                db.add(sk)

        # 9. Observatory Study Sessions & Activity Trends
        print("Populating Learning Observatory study sessions & telemetry...")
        for i in range(7):
            dt = datetime.now(UTC) - timedelta(days=i)
            sess = StudySession(
                user_id=alex.id,
                topic="Concurrency & Locking" if i % 2 == 0 else "Data Structures & Memory",
                reading_minutes=25 + (i * 5),
                coding_minutes=45 + (i * 10),
                debugging_minutes=15 + (i * 3),
                testing_minutes=10 + (i * 2),
                revision_minutes=10,
                focused_minutes=85 + (i * 15),
                session_date=dt,
            )
            db.add(sess)

        # 10. Debugging Intelligence Error Patterns
        print("Populating Debugging Intelligence error patterns...")
        error_patterns_data = [
            ("Off-by-One Boundary Condition", 18, 12.4, ErrorTrend.REPEATING, "AssertionError: Boundary check collision failed at cutoff boundary.", "Data Structures & Memory"),
            ("Thread Lock Contention & Starvation", 11, 24.1, ErrorTrend.REPEATING, "RuntimeError: Deadlock detected across mutex acquisition chain.", "Thread Locks & Concurrency"),
            ("Unbounded Memory Allocation", 8, 18.2, ErrorTrend.IMPROVING, "MemoryLimitExceeded: Allocated array exceeded 128MB ceiling.", "Data Structures & Memory"),
            ("Unhandled Async Rejection", 6, 8.5, ErrorTrend.IMPROVING, "UnhandledPromiseRejection: Connection reset by peer.", "Asynchronous Event Loops"),
        ]
        for cat, cnt, fix_m, trend, msg, rel_c in error_patterns_data:
            ep = db.execute(
                select(ErrorPattern).where(ErrorPattern.user_id == alex.id, ErrorPattern.category == cat)
            ).scalar_one_or_none()
            if not ep:
                ep = ErrorPattern(
                    user_id=alex.id,
                    category=cat,
                    occurrence_count=cnt,
                    avg_fix_minutes=fix_m,
                    trend=trend,
                    sample_error_message=msg,
                    related_concept=rel_c,
                    last_encountered=datetime.now(UTC) - timedelta(hours=4),
                )
                db.add(ep)

        # 11. Revision Planner Tasks
        print("Populating Revision Planner learning debt tasks...")
        revision_tasks_data = [
            ("Off-by-One Boundary Recovery: Rate Limiter", RevisionReason.REPEATED_ERRORS, RevisionUrgency.HIGH, "Detected 18 off-by-one errors when timestamps equal cutoff boundary. Practice boundary condition invariant.", 25, problem_map["prob-rate-limiter"].id),
            ("Deadlock Avoidance in Multi-Resource Locks", RevisionReason.WEAK_PREREQUISITE, RevisionUrgency.HIGH, "Prerequisite mastery for Distributed Consensus is weak. Revisit lock hierarchy lesson.", 35, None),
            ("Database Index Slicing & Keyset Curvature", RevisionReason.RETENTION_DECAY, RevisionUrgency.MEDIUM, "Last practiced 7 days ago. Review leaf-node traversal mechanisms.", 20, problem_map["prob-query-pagination"].id),
        ]
        for top, reas, urg, exp, mins, pid in revision_tasks_data:
            rt = db.execute(
                select(RevisionTask).where(RevisionTask.user_id == alex.id, RevisionTask.topic == top)
            ).scalar_one_or_none()
            if not rt:
                rt = RevisionTask(
                    user_id=alex.id,
                    topic=top,
                    reason=reas,
                    urgency=urg,
                    explanation=exp,
                    estimated_minutes=mins,
                    problem_id=pid,
                    is_completed=False,
                )
                db.add(rt)

        # 12. Audit Logs
        print("Populating initial administrative audit logs...")
        audit_events = [
            ("USER_REGISTERED", "user", alex.id, alex.id, {"email": alex.email}),
            ("USER_LOGIN", "user", alex.id, alex.id, {"email": alex.email}),
            ("COURSE_PUBLISHED", "course", "high-throughput-systems", elena.id, {"title": "High-Throughput Systems"}),
            ("ASSESSMENT_EVALUATED", "assessment", "asmt-sys-1", alex.id, {"score": 100}),
            ("PROJECT_MILESTONE_EVALUATED", "project_milestone_submission", "ms-sub-1", elena.id, {"score": 95}),
        ]
        for act, r_type, r_id, u_id, dets in audit_events:
            log = AuditLog(
                user_id=u_id,
                action=act,
                resource_type=r_type,
                resource_id=r_id,
                details=dets,
                ip_address="127.0.0.1",
            )
            db.add(log)

        db.commit()
        print("Database seeding completed successfully!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
