"""
ARIA Engine — Academic Intelligence Engine

Takes a student profile and produces:
  A. Personalized skill-tree view
  B. Blindspot analysis
  C. Recommended next-step pathway

Output follows the strict JSON contract defined in the ARIA spec.
"""

from __future__ import annotations
import re
from typing import Any

from .akg import AcademicKnowledgeGraph, build_default_akg
from .sdg import SkillDependencyGraph
from .topic_graph import generate_topic_graph


def _build_sdg_from_akg(akg: AcademicKnowledgeGraph) -> SkillDependencyGraph:
    sdg = SkillDependencyGraph()
    for node_id, node in akg.nodes.items():
        if node.type == "skill":
            sdg.add_skill(node_id)
    for edge in akg.edges:
        if edge.type == "SKILL_REQUIRES_SKILL":
            sdg.add_dependency(edge.target, edge.source)
    return sdg


def _infer_skills_from_courses(
    akg: AcademicKnowledgeGraph, course_ids: set[str]
) -> set[str]:
    """Walk COURSE -> CONCEPT -> SKILL edges to infer skills from completed courses."""
    concepts: set[str] = set()
    for edge in akg.edges:
        if edge.type == "COURSE_TEACHES_CONCEPT" and edge.source in course_ids:
            concepts.add(edge.target)

    skills: set[str] = set()
    for edge in akg.edges:
        if edge.type == "CONCEPT_BUILDS_SKILL" and edge.source in concepts:
            skills.add(edge.target)
    return skills


def _normalize_course_id(raw: str) -> str | None:
    """Try to normalize 'CS 3345' or 'cs3345' to 'CS3345'."""
    m = re.match(r"([A-Za-z]{2,})\s*-?\s*(\d{3,4})", raw.strip())
    if m:
        return f"{m.group(1).upper()}{m.group(2)}"
    return None


def _resolve_courses(akg: AcademicKnowledgeGraph, raw_courses: list[str]) -> set[str]:
    resolved: set[str] = set()
    for raw in raw_courses:
        norm = _normalize_course_id(raw)
        if norm and norm in akg.nodes:
            resolved.add(norm)
        elif raw.upper() in akg.nodes:
            resolved.add(raw.upper())
    return resolved


def _resolve_major(raw_major: str) -> str | None:
    major_lower = raw_major.lower().strip()
    mapping = {
        "computer science": "program:CS_BS",
        "cs": "program:CS_BS",
        "software engineering": "program:SE_BS",
        "se": "program:SE_BS",
        "data science": "program:DS_BS",
        "ds": "program:DS_BS",
    }
    return mapping.get(major_lower)


def _resolve_roles(akg: AcademicKnowledgeGraph, raw_roles: list[str]) -> set[str]:
    resolved: set[str] = set()
    role_map: dict[str, str] = {}
    for nid, node in akg.nodes.items():
        if node.type == "role":
            role_map[node.label.lower()] = nid

    for raw in raw_roles:
        lower = raw.lower().strip()
        if lower in role_map:
            resolved.add(role_map[lower])
        else:
            for label, rid in role_map.items():
                if lower in label or label in lower:
                    resolved.add(rid)
                    break
    return resolved


def generate_aria_output(profile: dict[str, Any]) -> dict[str, Any]:
    """
    Main entry point.

    profile keys:
      - completed_courses: list[str]
      - current_courses: list[str]
      - major: str
      - target_roles: list[str]  (optional)
      - interests: list[str]  (optional)
      - inferred_skills_override: list[str]  (optional, from recommendations)
      - proven_skills: dict[str, float]  (optional, skill_label -> score 0-1 from calibration/quiz)
      - topic: str  (optional, user's topic of interest — generates topic-specific graph)
      - track: str  (optional, "student" or "professional" — affects graph generation)
    """
    topic = profile.get("topic", "").strip()
    track = profile.get("track", "student").strip()

    # Try to generate a topic-specific graph if a topic is provided
    akg = None
    if topic and topic.lower() not in ("", "computer science", "cs"):
        akg = generate_topic_graph(topic, track)

    if akg is None:
        akg = build_default_akg()

    sdg = _build_sdg_from_akg(akg)

    completed = _resolve_courses(akg, profile.get("completed_courses", []))
    current = _resolve_courses(akg, profile.get("current_courses", []))
    major_id = _resolve_major(profile.get("major", ""))
    target_roles = _resolve_roles(akg, profile.get("target_roles", []))
    interests = [i.lower().strip() for i in profile.get("interests", [])]
    extra_skills = set()
    for s in profile.get("inferred_skills_override", []):
        candidate = f"skill:{s}"
        if candidate in akg.nodes:
            extra_skills.add(candidate)

    # Proven skills from calibration/quiz results: score >= 0.5 → unlocked, > 0 → in_progress
    proven_skills: dict[str, float] = profile.get("proven_skills", {})
    proven_unlocked: set[str] = set()
    proven_in_progress: set[str] = set()
    for raw_label, score in proven_skills.items():
        candidate = f"skill:{raw_label}"
        if candidate not in akg.nodes:
            norm = raw_label.replace("_", " ").strip()
            candidate = f"skill:{norm}"
        if candidate in akg.nodes:
            if score >= 0.5:
                proven_unlocked.add(candidate)
            elif score > 0:
                proven_in_progress.add(candidate)

    unlocked_skills = _infer_skills_from_courses(akg, completed) | extra_skills | proven_unlocked
    in_progress_skills = (_infer_skills_from_courses(akg, current) | proven_in_progress) - unlocked_skills

    # --- A. Build Skill Tree ---
    seed_ids = completed | current | unlocked_skills | in_progress_skills
    if major_id:
        seed_ids.add(major_id)
    seed_ids |= target_roles

    # If no seeds, include all nodes (e.g. fresh topic-generated graph)
    if seed_ids:
        subgraph_ids = akg.subgraph_within_hops(seed_ids, max_hops=3)
    else:
        subgraph_ids = set(akg.nodes.keys())

    # Determine relevant skills for roles
    role_skills: set[str] = set()
    for edge in akg.edges:
        if edge.type == "SKILL_REQUIRED_FOR_ROLE" and edge.target in target_roles:
            role_skills.add(edge.source)

    major_courses: set[str] = set()
    if major_id:
        for edge in akg.edges:
            if edge.type == "COURSE_COUNTS_TOWARD_PROGRAM" and edge.target == major_id:
                major_courses.add(edge.source)

    major_skills: set[str] = _infer_skills_from_courses(akg, major_courses)

    high_relevance_ids = role_skills | major_skills | major_courses | target_roles
    if major_id:
        high_relevance_ids.add(major_id)

    interest_ids: set[str] = set()
    for nid, node in akg.nodes.items():
        for interest in interests:
            if interest in node.label.lower():
                interest_ids.add(nid)

    nodes_output: list[dict[str, Any]] = []
    for nid in subgraph_ids:
        node = akg.nodes.get(nid)
        if not node:
            continue

        # Determine state
        if node.type == "course":
            if nid in completed:
                state = "unlocked"
            elif nid in current:
                state = "in_progress"
            else:
                prereqs = akg.get_prerequisites(nid)
                all_met = all(p in completed for p in prereqs) if prereqs else True
                state = "available_next" if all_met else "locked"
        elif node.type == "skill":
            if nid in unlocked_skills:
                state = "unlocked"
            elif nid in in_progress_skills:
                state = "in_progress"
            else:
                skill_prereqs = sdg.get_prereqs(nid)
                all_met = all(p in unlocked_skills for p in skill_prereqs) if skill_prereqs else True
                state = "available_next" if all_met else "locked"
        elif node.type == "concept":
            teaching_courses = {e.source for e in akg._incoming.get(nid, [])
                                if e.type == "COURSE_TEACHES_CONCEPT"}
            if teaching_courses & completed:
                state = "unlocked"
            elif teaching_courses & current:
                state = "in_progress"
            else:
                state = "locked"
        elif node.type == "event":
            state = "available_next"
        elif node.type == "role":
            required = {e.source for e in akg._incoming.get(nid, [])
                        if e.type == "SKILL_REQUIRED_FOR_ROLE"}
            if required and required <= unlocked_skills:
                state = "unlocked"
            elif required & unlocked_skills:
                state = "in_progress"
            else:
                state = "locked"
        else:
            state = "locked"

        # Determine relevance
        if nid in high_relevance_ids:
            relevance = "high"
        elif nid in interest_ids:
            relevance = "medium"
        else:
            relevance = "low"

        prereqs_list = akg.get_prerequisites(nid)
        unlocks_list = akg.get_unlocks(nid)

        nodes_output.append({
            "id": nid,
            "type": node.type,
            "label": node.label,
            "state": state,
            "relevance": relevance,
            "unlocksCount": len(unlocks_list),
            "prerequisites": prereqs_list,
            "unlocks": unlocks_list,
        })

    edges_output = [e.to_dict() for e in akg.edges_in_subgraph(subgraph_ids)]

    # --- B. Blindspots ---
    blindspots: list[dict[str, Any]] = []

    # High-impact skills the student hasn't touched
    for skill_id in sdg.skills:
        if skill_id in unlocked_skills or skill_id in in_progress_skills:
            continue
        impact = sdg.impact_score(skill_id)
        if impact < 0.3:
            continue
        node = akg.nodes.get(skill_id)
        if not node:
            continue

        is_role_relevant = skill_id in role_skills
        is_major_relevant = skill_id in major_skills
        urgency = 0.5
        if is_role_relevant:
            urgency += 0.3
        if is_major_relevant:
            urgency += 0.2

        prereqs_met = sdg.get_prereqs(skill_id) <= unlocked_skills
        reason = f"High-impact skill that unlocks {len(sdg.get_all_dependents(skill_id))} dependent skills"
        if is_role_relevant:
            reason += " and is required for your target role(s)"
        if prereqs_met:
            reason += ". All prerequisites are satisfied — you can start now"
            next_step = f"Begin learning {node.label} through coursework or self-study"
        else:
            missing = sdg.get_prereqs(skill_id) - unlocked_skills
            missing_labels = [akg.nodes[m].label for m in missing if m in akg.nodes]
            reason += f". Missing prerequisites: {', '.join(missing_labels)}"
            next_step = f"First acquire {', '.join(missing_labels)}, then pursue {node.label}"

        blindspots.append({
            "id": skill_id,
            "type": "skill",
            "reason": reason,
            "impact_score": round(impact, 2),
            "urgency_score": round(min(1.0, urgency), 2),
            "next_step": next_step,
        })

    # Courses the student is ignoring (high prereq chain value)
    for cid, cnode in akg.nodes.items():
        if cnode.type != "course" or cid in completed or cid in current:
            continue
        if major_id and cid not in major_courses:
            continue

        taught_skills = set()
        for e in akg.edges:
            if e.type == "COURSE_TEACHES_CONCEPT" and e.source == cid:
                for e2 in akg.edges:
                    if e2.type == "CONCEPT_BUILDS_SKILL" and e2.source == e.target:
                        taught_skills.add(e2.target)

        valuable_skills = taught_skills & role_skills - unlocked_skills
        if not valuable_skills:
            continue

        prereqs_of_course = akg.get_prerequisites(cid)
        prereqs_met = all(p in completed for p in prereqs_of_course)

        impact = min(1.0, len(valuable_skills) * 0.2)
        urgency = 0.6 if prereqs_met else 0.3

        labels = [akg.nodes[s].label for s in valuable_skills if s in akg.nodes]
        blindspots.append({
            "id": cid,
            "type": "course",
            "reason": f"Teaches skills needed for your target role(s): {', '.join(labels[:3])}",
            "impact_score": round(impact, 2),
            "urgency_score": round(urgency, 2),
            "next_step": f"Enroll in {cnode.label}" + (" (prerequisites met)" if prereqs_met else
                          f" (complete prerequisites first: {', '.join(akg.nodes[p].label for p in prereqs_of_course if p not in completed and p in akg.nodes)})"),
        })

    # Events the student should attend
    for eid, enode in akg.nodes.items():
        if enode.type != "event":
            continue
        event_skills_set = {e.target for e in akg._outgoing.get(eid, [])
                           if e.type == "EVENT_DEVELOPS_SKILL"}
        overlap = (event_skills_set & role_skills) - unlocked_skills
        if not overlap:
            continue
        labels = [akg.nodes[s].label for s in overlap if s in akg.nodes]
        blindspots.append({
            "id": eid,
            "type": "event",
            "reason": f"Develops skills aligned with your goals: {', '.join(labels[:3])}",
            "impact_score": round(min(1.0, len(overlap) * 0.25), 2),
            "urgency_score": 0.7,
            "next_step": f"Register for {enode.label}",
        })

    blindspots.sort(key=lambda b: (b["impact_score"] + b["urgency_score"]), reverse=True)
    blindspots = blindspots[:10]

    # --- C. Recommendations ---
    # Next skills: available_next, sorted by impact
    available_skills = []
    for skill_id in sdg.skills:
        if skill_id in unlocked_skills or skill_id in in_progress_skills:
            continue
        prereqs = sdg.get_prereqs(skill_id)
        if prereqs <= unlocked_skills:
            impact = sdg.impact_score(skill_id)
            is_relevant = skill_id in role_skills or skill_id in major_skills
            score = impact + (0.5 if is_relevant else 0.0)
            node = akg.nodes.get(skill_id)
            if node:
                dependents = sdg.get_all_dependents(skill_id)
                dep_labels = [akg.nodes[d].label for d in list(dependents)[:3] if d in akg.nodes]
                available_skills.append({
                    "id": skill_id,
                    "label": node.label,
                    "score": score,
                    "reason": f"Unlocks {len(dependents)} skills" +
                              (f" including {', '.join(dep_labels)}" if dep_labels else ""),
                })

    available_skills.sort(key=lambda s: s["score"], reverse=True)
    next_skills = available_skills[:3]

    # Next courses: available_next, sorted by skill value
    available_courses = []
    for cid, cnode in akg.nodes.items():
        if cnode.type != "course" or cid in completed or cid in current:
            continue
        prereqs = akg.get_prerequisites(cid)
        if not all(p in completed for p in prereqs):
            continue
        taught_concepts = {e.target for e in akg._outgoing.get(cid, [])
                          if e.type == "COURSE_TEACHES_CONCEPT"}
        new_skills: set[str] = set()
        for concept in taught_concepts:
            for e in akg._outgoing.get(concept, []):
                if e.type == "CONCEPT_BUILDS_SKILL" and e.target not in unlocked_skills:
                    new_skills.add(e.target)

        if not new_skills:
            continue

        score = len(new_skills) + (2 if cid in major_courses else 0)
        skill_labels = [akg.nodes[s].label for s in list(new_skills)[:3] if s in akg.nodes]
        available_courses.append({
            "id": cid,
            "label": cnode.label,
            "score": score,
            "reason": f"Teaches new skills: {', '.join(skill_labels)}",
        })

    available_courses.sort(key=lambda c: c["score"], reverse=True)
    next_courses = available_courses[:3]

    # Relevant events
    relevant_events = []
    for eid, enode in akg.nodes.items():
        if enode.type != "event":
            continue
        event_skills_ids = {e.target for e in akg._outgoing.get(eid, [])
                           if e.type == "EVENT_DEVELOPS_SKILL"}
        new_event_skills = event_skills_ids - unlocked_skills
        if new_event_skills:
            labels = [akg.nodes[s].label for s in list(new_event_skills)[:3] if s in akg.nodes]
            relevant_events.append({
                "id": eid,
                "label": enode.label,
                "reason": f"Develops: {', '.join(labels)}",
            })

    # Suggested projects
    projects = []
    if unlocked_skills:
        if f"skill:Web Development" in unlocked_skills or f"skill:JavaScript" in unlocked_skills:
            projects.append({
                "title": "Build a Full-Stack Portfolio App",
                "skills": ["Web Development", "API Design", "Git"],
                "reason": "Combines your web skills into a tangible portfolio piece",
            })
        if f"skill:Machine Learning" in unlocked_skills or f"skill:Data Analysis" in unlocked_skills:
            projects.append({
                "title": "Kaggle Competition Entry",
                "skills": ["Machine Learning", "Data Analysis", "Python"],
                "reason": "Apply ML skills to real-world datasets and build credibility",
            })
        if f"skill:Algorithm Design" in unlocked_skills:
            projects.append({
                "title": "LeetCode 30-Day Challenge",
                "skills": ["Algorithm Design", "Problem Solving"],
                "reason": "Strengthen interview-ready algorithm skills",
            })
        if f"skill:Linux/Unix" in unlocked_skills and f"skill:Git" in unlocked_skills:
            projects.append({
                "title": "Open Source Contribution",
                "skills": ["Git", "Linux/Unix", "Team Collaboration"],
                "reason": "Gain real-world collaboration experience and build your profile",
            })
        if f"skill:Database Management" in unlocked_skills or f"skill:SQL Querying" in unlocked_skills:
            projects.append({
                "title": "Design and Deploy a Relational Database",
                "skills": ["Database Management", "SQL Querying", "System Design"],
                "reason": "Practical database design experience for DBA or backend roles",
            })

    if not projects:
        projects.append({
            "title": "Personal Project in Your Area of Interest",
            "skills": ["Problem Solving", "Git"],
            "reason": "Start building practical experience in any area",
        })

    return {
        "skillTree": {
            "nodes": nodes_output,
            "edges": edges_output,
        },
        "blindspots": blindspots,
        "recommendations": {
            "nextSkills": next_skills,
            "nextCourses": next_courses,
            "events": relevant_events,
            "projects": projects[:3],
        },
    }
