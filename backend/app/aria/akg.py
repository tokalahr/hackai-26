"""
Academic Knowledge Graph (AKG)

Nodes: Courses, Concepts, Skills, Professors, Programs, Events, Career Roles
Edges: typed directed relationships between nodes
"""

from __future__ import annotations
from typing import Any

NODE_TYPES = {"course", "concept", "skill", "professor", "program", "event", "role"}

EDGE_TYPES = {
    "COURSE_TEACHES_CONCEPT",
    "CONCEPT_BUILDS_SKILL",
    "SKILL_REQUIRES_SKILL",
    "COURSE_PREREQ_COURSE",
    "COURSE_COUNTS_TOWARD_PROGRAM",
    "SKILL_REQUIRED_FOR_ROLE",
    "EVENT_DEVELOPS_SKILL",
}


class AKGNode:
    __slots__ = ("id", "type", "label", "metadata")

    def __init__(self, id: str, type: str, label: str, metadata: dict[str, Any] | None = None):
        self.id = id
        self.type = type
        self.label = label
        self.metadata = metadata or {}

    def to_dict(self) -> dict[str, Any]:
        return {"id": self.id, "type": self.type, "label": self.label, **self.metadata}


class AKGEdge:
    __slots__ = ("source", "target", "type")

    def __init__(self, source: str, target: str, type: str):
        self.source = source
        self.target = target
        self.type = type

    def to_dict(self) -> dict[str, str]:
        return {"source": self.source, "target": self.target, "type": self.type}


class AcademicKnowledgeGraph:
    def __init__(self):
        self.nodes: dict[str, AKGNode] = {}
        self.edges: list[AKGEdge] = []
        self._outgoing: dict[str, list[AKGEdge]] = {}
        self._incoming: dict[str, list[AKGEdge]] = {}

    def add_node(self, id: str, type: str, label: str, **metadata: Any) -> AKGNode:
        node = AKGNode(id, type, label, metadata)
        self.nodes[id] = node
        return node

    def add_edge(self, source: str, target: str, type: str) -> AKGEdge:
        edge = AKGEdge(source, target, type)
        self.edges.append(edge)
        self._outgoing.setdefault(source, []).append(edge)
        self._incoming.setdefault(target, []).append(edge)
        return edge

    def neighbors(self, node_id: str, direction: str = "both") -> set[str]:
        result: set[str] = set()
        if direction in ("out", "both"):
            for e in self._outgoing.get(node_id, []):
                result.add(e.target)
        if direction in ("in", "both"):
            for e in self._incoming.get(node_id, []):
                result.add(e.source)
        return result

    def subgraph_within_hops(self, seed_ids: set[str], max_hops: int = 2) -> set[str]:
        visited: set[str] = set(seed_ids)
        frontier = set(seed_ids)
        for _ in range(max_hops):
            next_frontier: set[str] = set()
            for nid in frontier:
                for neighbor in self.neighbors(nid):
                    if neighbor not in visited:
                        visited.add(neighbor)
                        next_frontier.add(neighbor)
            frontier = next_frontier
            if not frontier:
                break
        return visited

    def edges_in_subgraph(self, node_ids: set[str]) -> list[AKGEdge]:
        return [e for e in self.edges if e.source in node_ids and e.target in node_ids]

    def get_prerequisites(self, node_id: str) -> list[str]:
        prereqs: list[str] = []
        for e in self._incoming.get(node_id, []):
            if e.type in ("COURSE_PREREQ_COURSE", "SKILL_REQUIRES_SKILL"):
                prereqs.append(e.source)
        return prereqs

    def get_unlocks(self, node_id: str) -> list[str]:
        unlocks: list[str] = []
        for e in self._outgoing.get(node_id, []):
            if e.type in ("COURSE_PREREQ_COURSE", "SKILL_REQUIRES_SKILL",
                          "COURSE_TEACHES_CONCEPT", "CONCEPT_BUILDS_SKILL",
                          "SKILL_REQUIRED_FOR_ROLE"):
                unlocks.append(e.target)
        return unlocks


def build_default_akg() -> AcademicKnowledgeGraph:
    g = AcademicKnowledgeGraph()

    # --- Courses (UTD CS curriculum representative set) ---
    courses = [
        ("CS1200", "Introduction to CS", {"credits": 1}),
        ("CS1336", "Programming Fundamentals", {"credits": 3}),
        ("CS1337", "Computer Science I", {"credits": 3}),
        ("CS2305", "Discrete Mathematics I", {"credits": 3}),
        ("CS2336", "Computer Science II", {"credits": 3}),
        ("CS3305", "Discrete Mathematics II", {"credits": 3}),
        ("CS3345", "Data Structures & Algorithms", {"credits": 3}),
        ("CS3354", "Software Engineering", {"credits": 3}),
        ("CS3377", "Systems Programming in Unix", {"credits": 3}),
        ("CS4337", "Organization of Programming Languages", {"credits": 3}),
        ("CS4341", "Digital Logic & Computer Design", {"credits": 3}),
        ("CS4347", "Database Systems", {"credits": 3}),
        ("CS4348", "Operating Systems Concepts", {"credits": 3}),
        ("CS4349", "Advanced Algorithm Design", {"credits": 3}),
        ("CS4375", "Introduction to Machine Learning", {"credits": 3}),
        ("CS4384", "Automata Theory", {"credits": 3}),
        ("CS4390", "Computer Networks", {"credits": 3}),
        ("CS4485", "Computer Science Project", {"credits": 4}),
        ("MATH2413", "Calculus I", {"credits": 4}),
        ("MATH2414", "Calculus II", {"credits": 4}),
        ("MATH2418", "Linear Algebra", {"credits": 4}),
        ("STAT3360", "Probability & Statistics", {"credits": 3}),
    ]
    for cid, label, meta in courses:
        g.add_node(cid, "course", label, **meta)

    # --- Concepts ---
    concepts = [
        "Programming Basics", "Object-Oriented Programming", "Data Structures",
        "Algorithm Analysis", "Sorting & Searching", "Graph Algorithms",
        "Discrete Math Foundations", "Combinatorics", "Database Design",
        "Relational Algebra", "SQL", "Operating Systems", "Process Management",
        "Memory Management", "Networking Protocols", "TCP/IP",
        "Software Design Patterns", "Agile Development", "Version Control",
        "Unix Systems", "Shell Scripting", "Machine Learning Fundamentals",
        "Supervised Learning", "Neural Networks", "Statistical Inference",
        "Linear Algebra Concepts", "Calculus Foundations", "Automata & Formal Languages",
        "Programming Language Paradigms", "Digital Logic",
    ]
    for c in concepts:
        g.add_node(f"concept:{c}", "concept", c)

    # --- Skills ---
    skills = [
        "Python", "Java", "C++", "C", "JavaScript", "TypeScript",
        "SQL Querying", "Git", "Linux/Unix", "Algorithm Design",
        "Data Analysis", "Software Architecture", "API Design",
        "Database Management", "System Design", "Network Programming",
        "Machine Learning", "Deep Learning", "Statistical Modeling",
        "Problem Solving", "Technical Writing", "Team Collaboration",
        "Agile/Scrum", "CI/CD", "Cloud Computing", "Containerization",
        "Web Development", "Mobile Development", "Cybersecurity Basics",
        "DevOps", "Data Visualization",
    ]
    for s in skills:
        g.add_node(f"skill:{s}", "skill", s)

    # --- Programs ---
    programs = [
        ("program:CS_BS", "B.S. Computer Science"),
        ("program:SE_BS", "B.S. Software Engineering"),
        ("program:DS_BS", "B.S. Data Science"),
    ]
    for pid, label in programs:
        g.add_node(pid, "program", label)

    # --- Career Roles ---
    roles = [
        ("role:SWE", "Software Engineer"),
        ("role:DS", "Data Scientist"),
        ("role:SRE", "Site Reliability Engineer"),
        ("role:PM", "Product Manager"),
        ("role:MLE", "Machine Learning Engineer"),
        ("role:DBA", "Database Administrator"),
        ("role:SecEng", "Security Engineer"),
        ("role:FullStack", "Full-Stack Developer"),
        ("role:DevOps", "DevOps Engineer"),
        ("role:SystemsEng", "Systems Engineer"),
    ]
    for rid, label in roles:
        g.add_node(rid, "role", label)

    # --- Events ---
    events = [
        ("event:HackUTD", "HackUTD Hackathon", {"recurring": True, "semester": "Fall"}),
        ("event:HackAI", "HackAI Hackathon", {"recurring": True, "semester": "Spring"}),
        ("event:CareerFair", "CS Career Fair", {"recurring": True, "semester": "Both"}),
        ("event:ACM_Workshop", "ACM Workshop Series", {"recurring": True, "semester": "Both"}),
        ("event:Research_Symposium", "Undergraduate Research Symposium", {"recurring": True, "semester": "Spring"}),
    ]
    for eid, label, meta in events:
        g.add_node(eid, "event", label, **meta)

    # --- COURSE_PREREQ_COURSE edges ---
    prereqs = [
        ("CS1337", "CS1336"), ("CS2336", "CS1337"), ("CS2305", "CS1337"),
        ("CS3305", "CS2305"), ("CS3345", "CS2336"), ("CS3345", "CS2305"),
        ("CS3354", "CS2336"), ("CS3377", "CS2336"),
        ("CS4337", "CS3345"), ("CS4347", "CS3345"),
        ("CS4348", "CS3377"), ("CS4349", "CS3345"), ("CS4349", "CS3305"),
        ("CS4375", "CS3345"), ("CS4375", "STAT3360"), ("CS4375", "MATH2418"),
        ("CS4384", "CS3305"), ("CS4390", "CS3345"),
        ("CS4485", "CS3354"),
        ("MATH2414", "MATH2413"), ("MATH2418", "MATH2413"),
        ("STAT3360", "MATH2414"),
    ]
    for course, prereq in prereqs:
        g.add_edge(prereq, course, "COURSE_PREREQ_COURSE")

    # --- COURSE_TEACHES_CONCEPT edges ---
    course_concepts = {
        "CS1336": ["Programming Basics"],
        "CS1337": ["Programming Basics", "Object-Oriented Programming"],
        "CS2336": ["Object-Oriented Programming", "Data Structures"],
        "CS2305": ["Discrete Math Foundations"],
        "CS3305": ["Combinatorics", "Discrete Math Foundations"],
        "CS3345": ["Data Structures", "Algorithm Analysis", "Sorting & Searching", "Graph Algorithms"],
        "CS3354": ["Software Design Patterns", "Agile Development", "Version Control"],
        "CS3377": ["Unix Systems", "Shell Scripting"],
        "CS4337": ["Programming Language Paradigms"],
        "CS4347": ["Database Design", "Relational Algebra", "SQL"],
        "CS4348": ["Operating Systems", "Process Management", "Memory Management"],
        "CS4349": ["Algorithm Analysis", "Graph Algorithms"],
        "CS4375": ["Machine Learning Fundamentals", "Supervised Learning", "Neural Networks"],
        "CS4384": ["Automata & Formal Languages"],
        "CS4390": ["Networking Protocols", "TCP/IP"],
        "MATH2413": ["Calculus Foundations"],
        "MATH2418": ["Linear Algebra Concepts"],
        "STAT3360": ["Statistical Inference"],
    }
    for course_id, concept_list in course_concepts.items():
        for concept in concept_list:
            g.add_edge(course_id, f"concept:{concept}", "COURSE_TEACHES_CONCEPT")

    # --- CONCEPT_BUILDS_SKILL edges ---
    concept_skills = {
        "Programming Basics": ["Python", "Java", "C++", "Problem Solving"],
        "Object-Oriented Programming": ["Java", "C++", "Software Architecture"],
        "Data Structures": ["Algorithm Design", "Problem Solving"],
        "Algorithm Analysis": ["Algorithm Design"],
        "Sorting & Searching": ["Algorithm Design"],
        "Graph Algorithms": ["Algorithm Design"],
        "Discrete Math Foundations": ["Problem Solving"],
        "Database Design": ["Database Management", "SQL Querying"],
        "Relational Algebra": ["SQL Querying"],
        "SQL": ["SQL Querying", "Database Management"],
        "Operating Systems": ["Linux/Unix", "System Design"],
        "Process Management": ["System Design"],
        "Memory Management": ["C", "System Design"],
        "Networking Protocols": ["Network Programming"],
        "TCP/IP": ["Network Programming"],
        "Software Design Patterns": ["Software Architecture", "API Design"],
        "Agile Development": ["Agile/Scrum", "Team Collaboration"],
        "Version Control": ["Git"],
        "Unix Systems": ["Linux/Unix", "C"],
        "Shell Scripting": ["Linux/Unix"],
        "Machine Learning Fundamentals": ["Machine Learning", "Data Analysis"],
        "Supervised Learning": ["Machine Learning"],
        "Neural Networks": ["Deep Learning", "Machine Learning"],
        "Statistical Inference": ["Statistical Modeling", "Data Analysis"],
        "Linear Algebra Concepts": ["Data Analysis"],
        "Calculus Foundations": ["Statistical Modeling"],
        "Programming Language Paradigms": ["Problem Solving"],
    }
    for concept, skill_list in concept_skills.items():
        for skill in skill_list:
            g.add_edge(f"concept:{concept}", f"skill:{skill}", "CONCEPT_BUILDS_SKILL")

    # --- SKILL_REQUIRES_SKILL edges ---
    skill_prereqs = [
        ("Machine Learning", "Python"), ("Machine Learning", "Statistical Modeling"),
        ("Machine Learning", "Data Analysis"),
        ("Deep Learning", "Machine Learning"),
        ("Software Architecture", "Problem Solving"),
        ("API Design", "Software Architecture"),
        ("System Design", "Software Architecture"),
        ("Network Programming", "Linux/Unix"),
        ("CI/CD", "Git"), ("CI/CD", "Linux/Unix"),
        ("Cloud Computing", "Linux/Unix"), ("Cloud Computing", "System Design"),
        ("Containerization", "Linux/Unix"),
        ("DevOps", "CI/CD"), ("DevOps", "Cloud Computing"), ("DevOps", "Containerization"),
        ("Web Development", "JavaScript"), ("Web Development", "Git"),
        ("Data Visualization", "Data Analysis"), ("Data Visualization", "Python"),
        ("Database Management", "SQL Querying"),
        ("Cybersecurity Basics", "Network Programming"), ("Cybersecurity Basics", "Linux/Unix"),
    ]
    for skill, prereq in skill_prereqs:
        g.add_edge(f"skill:{prereq}", f"skill:{skill}", "SKILL_REQUIRES_SKILL")

    # --- COURSE_COUNTS_TOWARD_PROGRAM edges ---
    cs_core = [
        "CS1200", "CS1336", "CS1337", "CS2305", "CS2336", "CS3305",
        "CS3345", "CS3354", "CS3377", "CS4337", "CS4341", "CS4347",
        "CS4348", "CS4349", "CS4384", "CS4485",
        "MATH2413", "MATH2414", "MATH2418", "STAT3360",
    ]
    for cid in cs_core:
        g.add_edge(cid, "program:CS_BS", "COURSE_COUNTS_TOWARD_PROGRAM")

    se_core = [
        "CS1336", "CS1337", "CS2305", "CS2336", "CS3345",
        "CS3354", "CS3377", "CS4347", "CS4485",
    ]
    for cid in se_core:
        g.add_edge(cid, "program:SE_BS", "COURSE_COUNTS_TOWARD_PROGRAM")

    ds_core = [
        "CS1336", "CS1337", "CS2305", "CS2336", "CS3345",
        "CS4347", "CS4375", "MATH2413", "MATH2414", "MATH2418", "STAT3360",
    ]
    for cid in ds_core:
        g.add_edge(cid, "program:DS_BS", "COURSE_COUNTS_TOWARD_PROGRAM")

    # --- SKILL_REQUIRED_FOR_ROLE edges ---
    role_skills = {
        "role:SWE": ["Java", "Python", "Algorithm Design", "Git", "Software Architecture",
                      "API Design", "Agile/Scrum", "Problem Solving"],
        "role:DS": ["Python", "Machine Learning", "Statistical Modeling", "Data Analysis",
                     "SQL Querying", "Data Visualization"],
        "role:SRE": ["Linux/Unix", "Python", "Cloud Computing", "Containerization",
                      "System Design", "Network Programming", "CI/CD"],
        "role:PM": ["Technical Writing", "Agile/Scrum", "Team Collaboration", "Problem Solving"],
        "role:MLE": ["Python", "Machine Learning", "Deep Learning", "Data Analysis",
                      "Cloud Computing", "Software Architecture"],
        "role:DBA": ["SQL Querying", "Database Management", "Linux/Unix", "System Design"],
        "role:SecEng": ["Cybersecurity Basics", "Network Programming", "Linux/Unix",
                         "Python", "System Design"],
        "role:FullStack": ["JavaScript", "TypeScript", "Python", "SQL Querying",
                            "Git", "Web Development", "API Design"],
        "role:DevOps": ["DevOps", "CI/CD", "Cloud Computing", "Containerization",
                         "Linux/Unix", "Git"],
        "role:SystemsEng": ["C", "C++", "Linux/Unix", "System Design",
                             "Network Programming"],
    }
    for role_id, skill_list in role_skills.items():
        for skill in skill_list:
            g.add_edge(f"skill:{skill}", role_id, "SKILL_REQUIRED_FOR_ROLE")

    # --- EVENT_DEVELOPS_SKILL edges ---
    event_skills = {
        "event:HackUTD": ["Web Development", "Team Collaboration", "Git", "API Design", "Problem Solving"],
        "event:HackAI": ["Machine Learning", "Python", "Data Analysis", "Team Collaboration"],
        "event:CareerFair": ["Technical Writing", "Team Collaboration"],
        "event:ACM_Workshop": ["Python", "Algorithm Design", "Git", "Problem Solving"],
        "event:Research_Symposium": ["Technical Writing", "Data Analysis", "Problem Solving"],
    }
    for event_id, skill_list in event_skills.items():
        for skill in skill_list:
            g.add_edge(event_id, f"skill:{skill}", "EVENT_DEVELOPS_SKILL")

    return g
