"""
Skill Dependency Graph (SDG)

A directed graph of skills and their prerequisite skills.
Built from the AKG's SKILL_REQUIRES_SKILL edges, with added transitive
dependency analysis.
"""

from __future__ import annotations
from typing import Any


class SkillDependencyGraph:
    def __init__(self):
        self.skills: set[str] = set()
        self._prereqs: dict[str, set[str]] = {}
        self._dependents: dict[str, set[str]] = {}

    def add_skill(self, skill_id: str) -> None:
        self.skills.add(skill_id)
        self._prereqs.setdefault(skill_id, set())
        self._dependents.setdefault(skill_id, set())

    def add_dependency(self, skill_id: str, prereq_id: str) -> None:
        self.add_skill(skill_id)
        self.add_skill(prereq_id)
        self._prereqs[skill_id].add(prereq_id)
        self._dependents[prereq_id].add(skill_id)

    def get_prereqs(self, skill_id: str) -> set[str]:
        return self._prereqs.get(skill_id, set())

    def get_dependents(self, skill_id: str) -> set[str]:
        return self._dependents.get(skill_id, set())

    def get_all_prereqs(self, skill_id: str) -> set[str]:
        """Transitive closure of prerequisites."""
        visited: set[str] = set()
        stack = list(self.get_prereqs(skill_id))
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            stack.extend(self.get_prereqs(current))
        return visited

    def get_all_dependents(self, skill_id: str) -> set[str]:
        """Transitive closure of dependents (what this skill enables)."""
        visited: set[str] = set()
        stack = list(self.get_dependents(skill_id))
        while stack:
            current = stack.pop()
            if current in visited:
                continue
            visited.add(current)
            stack.extend(self.get_dependents(current))
        return visited

    def impact_score(self, skill_id: str) -> float:
        """How many skills does mastering this skill transitively unlock."""
        total = len(self.skills)
        if total == 0:
            return 0.0
        dependents = len(self.get_all_dependents(skill_id))
        return min(1.0, dependents / max(total * 0.3, 1))

    def depth(self, skill_id: str) -> int:
        """Longest prerequisite chain depth."""
        prereqs = self.get_prereqs(skill_id)
        if not prereqs:
            return 0
        return 1 + max(self.depth(p) for p in prereqs)

    def topological_order(self) -> list[str]:
        """Return skills in topological order (no prereqs first)."""
        in_degree: dict[str, int] = {s: 0 for s in self.skills}
        for s in self.skills:
            for p in self._prereqs.get(s, set()):
                in_degree[s] = in_degree.get(s, 0) + 1

        queue = [s for s in self.skills if in_degree[s] == 0]
        result: list[str] = []
        while queue:
            queue.sort()
            node = queue.pop(0)
            result.append(node)
            for dep in self._dependents.get(node, set()):
                in_degree[dep] -= 1
                if in_degree[dep] == 0:
                    queue.append(dep)
        return result

    def to_dict(self) -> dict[str, Any]:
        return {
            "skills": sorted(self.skills),
            "dependencies": {
                s: sorted(self._prereqs[s]) for s in sorted(self.skills) if self._prereqs[s]
            },
        }
