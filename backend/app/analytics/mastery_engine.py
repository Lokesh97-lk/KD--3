"""Concept Mastery calculation engine based on actual recorded evidence."""

from datetime import UTC, datetime
from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.analytics import LearningEvent
from app.models.base import utc_now
from app.models.concept import ConceptDependency, ConceptMasteryStatus, ConceptNode, UserConceptMastery
from app.models.course import Lesson, LessonProgress
from app.models.problem import ExecutionVerdict, Problem, Submission


class MasteryEngine:
    """Calculates student concept mastery from actual submissions and completed lessons."""

    @classmethod
    def update_concept_mastery(
        cls,
        db: Session,
        user_id: str,
        concept_node_id: str,
    ) -> Optional[UserConceptMastery]:
        """Calculates and persists mastery score for a user on a given concept."""
        # Find concept
        stmt_c = select(ConceptNode).where(
            (ConceptNode.id == concept_node_id) | (ConceptNode.node_id == concept_node_id)
        )
        concept = db.execute(stmt_c).scalar_one_or_none()
        if not concept:
            return None

        # Count completed lessons related to this concept
        stmt_lessons = (
            select(LessonProgress)
            .join(Lesson, LessonProgress.lesson_id == Lesson.id)
            .where(
                LessonProgress.user_id == user_id,
                LessonProgress.is_completed == True,
                Lesson.concept_id == concept.id,
            )
        )
        completed_lessons = len(db.execute(stmt_lessons).scalars().all())

        # Count total lessons for concept
        total_lessons = len(
            db.execute(select(Lesson).where(Lesson.concept_id == concept.id)).scalars().all()
        ) or 1

        lesson_ratio = min(1.0, completed_lessons / total_lessons)

        # Count accepted submissions for problems linked to this concept
        stmt_prob = select(Problem.id).where(Problem.concept_id == concept.id)
        prob_ids = db.execute(stmt_prob).scalars().all()

        practice_accuracy = 0.0
        solved_problems = 0
        total_problems = len(prob_ids) or 1

        if prob_ids:
            # Submissions on these problems
            stmt_subs = select(Submission).where(
                Submission.user_id == user_id,
                Submission.problem_id.in_(prob_ids),
            )
            subs = db.execute(stmt_subs).scalars().all()
            if subs:
                acc_subs = [s for s in subs if s.verdict == ExecutionVerdict.ACCEPTED]
                solved_prob_ids = {s.problem_id for s in acc_subs}
                solved_problems = len(solved_prob_ids)
                practice_accuracy = round(len(acc_subs) / len(subs), 2)

        problem_ratio = min(1.0, solved_problems / total_problems)

        # Composite mastery formula: 40% lesson completion, 60% practical problem solving
        raw_mastery = int((lesson_ratio * 40.0) + (problem_ratio * 60.0))

        # Check prerequisite health
        stmt_prereqs = select(ConceptDependency).where(ConceptDependency.source_concept_id == concept.id)
        prereqs = db.execute(stmt_prereqs).scalars().all()

        prereq_weak = False
        prereq_locked = False
        for pr in prereqs:
            stmt_p_mastery = select(UserConceptMastery).where(
                UserConceptMastery.user_id == user_id,
                UserConceptMastery.concept_id == pr.target_concept_id,
            )
            pm = db.execute(stmt_p_mastery).scalar_one_or_none()
            if not pm or pm.mastery_percentage < 30:
                prereq_locked = True
                break
            elif pm.mastery_percentage < 60:
                prereq_weak = True

        if raw_mastery >= 80:
            status = ConceptMasteryStatus.MASTERED
        elif raw_mastery > 0:
            status = ConceptMasteryStatus.PREREQUISITE_WEAK if prereq_weak else ConceptMasteryStatus.IN_PROGRESS
        else:
            status = ConceptMasteryStatus.LOCKED if prereq_locked else ConceptMasteryStatus.IN_PROGRESS

        # Persist or update
        stmt_m = select(UserConceptMastery).where(
            UserConceptMastery.user_id == user_id,
            UserConceptMastery.concept_id == concept.id,
        )
        record = db.execute(stmt_m).scalar_one_or_none()
        if record:
            record.mastery_percentage = max(record.mastery_percentage, raw_mastery)
            record.practice_accuracy = max(record.practice_accuracy, practice_accuracy)
            record.status = status
            record.last_practiced = utc_now()
        else:
            record = UserConceptMastery(
                user_id=user_id,
                concept_id=concept.id,
                mastery_percentage=raw_mastery,
                practice_accuracy=practice_accuracy,
                status=status,
                last_practiced=utc_now(),
            )
            db.add(record)

        db.commit()
        db.refresh(record)
        return record
