"""Concept Dependency Graph service for visual DAG representation."""

from typing import Any, Dict, List
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.concept import ConceptDependency, ConceptMasteryStatus, ConceptNode, UserConceptMastery


class DependencyGraphService:
    """Builds visual graph representation of programming concepts and dependencies."""

    @classmethod
    def get_user_graph(cls, db: Session, user_id: str) -> List[Dict[str, Any]]:
        """Returns all concept nodes with current learner mastery and prerequisite connections."""
        nodes = db.execute(select(ConceptNode)).scalars().all()
        dependencies = db.execute(select(ConceptDependency)).scalars().all()
        masteries = db.execute(
            select(UserConceptMastery).where(UserConceptMastery.user_id == user_id)
        ).scalars().all()

        mastery_map = {m.concept_id: m for m in masteries}

        # Map dependencies: source requires target (prerequisite)
        prereqs_map: Dict[str, List[str]] = {n.id: [] for n in nodes}
        for d in dependencies:
            if d.source_concept_id in prereqs_map:
                prereqs_map[d.source_concept_id].append(d.target_concept_id)

        # Build node id map
        id_to_node_id = {n.id: n.node_id for n in nodes}

        graph: List[Dict[str, Any]] = []
        for n in nodes:
            m = mastery_map.get(n.id)
            prereq_node_ids = [id_to_node_id.get(p_id, p_id) for p_id in prereqs_map.get(n.id, [])]

            mastery_pct = m.mastery_percentage if m else 0
            status_val = m.status.value if m else ("locked" if prereq_node_ids else "in_progress")
            practice_acc = m.practice_accuracy if m else 0.0
            last_pr = m.last_practiced.isoformat() if m and m.last_practiced else "2026-10-10T12:00:00Z"

            graph.append({
                "id": n.node_id,
                "db_id": n.id,
                "title": n.title,
                "category": n.category,
                "description": n.description,
                "mastery_percentage": mastery_pct,
                "status": status_val,
                "prerequisites": prereq_node_ids,
                "practice_accuracy": practice_acc,
                "last_practiced": last_pr,
                "recommended_next": n.recommended_next or "Explore practical exercises",
            })

        return graph
