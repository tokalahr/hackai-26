import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, BookOpen, Users, Award, Tag, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { fetchCalendarEventsByDate } from "../services/backend-api";

type EventItem = {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  type: string;
  color: string;
  tags: string[];
};

type CourseItem = {
  id: string;
  code: string;
  note: string;
};

const STORAGE_KEY = "dashboard-manual-courses";

const TAG_COLORS: Record<string, string> = {
  Fitness: "bg-green-100 text-green-700 border-green-300 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/40",
  Academic: "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/40",
  Workshop: "bg-purple-100 text-purple-700 border-purple-300 dark:bg-purple-500/15 dark:text-purple-300 dark:border-purple-500/40",
  Career: "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/40",
  Social: "bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/40",
  Research: "bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/40",
  Competition: "bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/40",
  Deadline: "bg-red-100 text-red-700 border-red-300 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/40",
  Arts: "bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/40",
  Sports: "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/40",
  Other: "bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-700/40 dark:text-slate-200 dark:border-slate-500/40",
};

const EVENT_COLORS: Record<string, string> = {
  Fitness: "bg-green-500",
  Academic: "bg-blue-500",
  Workshop: "bg-purple-500",
  Career: "bg-amber-500",
  Social: "bg-pink-500",
  Research: "bg-cyan-500",
  Competition: "bg-orange-500",
  Deadline: "bg-red-500",
  Arts: "bg-violet-500",
  Sports: "bg-emerald-500",
  Other: "bg-indigo-500",
};

function inferTags(title: string, location: string): string[] {
  const t = title.toLowerCase();
  const l = location.toLowerCase();
  const tags: string[] = [];

  const rules: [string, RegExp][] = [
    ["Fitness", /cardio|kickbox|yoga|zumba|pilates|core crush|hiit|aerobic|stretch|fitness|gym|bootcamp|spin|cycling/],
    ["Sports", /basketball|soccer|football|volleyball|tennis|swimming|baseball|intramural|rec\s?sports|athletic/],
    ["Academic", /lecture|seminar|class|professor|exam|midterm|final|study|tutoring|review session|office hours|colloquium/],
    ["Workshop", /workshop|hands-on|tutorial|training|bootcamp|hackathon|hack\s?ai|lab session/],
    ["Career", /career|job|intern|resume|interview|recruit|employer|networking|career fair|hiring/],
    ["Research", /research|symposium|poster|thesis|dissertation|phd|undergrad.*research|lab.*present/],
    ["Competition", /competition|contest|challenge|hackathon|hack\s?utd|hack\s?ai|game\s?jam/],
    ["Deadline", /deadline|withdraw|drop|registration|signature|last day|due date|petition/],
    ["Arts", /art|music|theater|theatre|concert|exhibit|gallery|performance|dance|choir|orchestra|recital/],
    ["Social", /club|meeting|social|mixer|party|celebration|cultural|festival|food|potluck|welcome/],
  ];

  for (const [tag, pattern] of rules) {
    if (pattern.test(t) || pattern.test(l)) {
      tags.push(tag);
    }
  }

  if (tags.length === 0) tags.push("Other");
  return tags;
}

function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekDates(startFrom: Date): string[] {
  const dayOfWeek = startFrom.getDay();
  const remainingDays = 7 - dayOfWeek;
  return Array.from({ length: remainingDays }, (_, i) => {
    const d = new Date(startFrom);
    d.setDate(startFrom.getDate() + i);
    return formatDateISO(d);
  });
}

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [courseCode, setCourseCode] = useState("");
  const [courseNote, setCourseNote] = useState("");
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as CourseItem[];
      if (Array.isArray(parsed)) setCourses(parsed);
    } catch { setCourses([]); }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    let active = true;

    const loadCurrentWeekEvents = async () => {
      try {
        const dates = getWeekDates(new Date());
        const dailyResults = await Promise.all(dates.map((date) => fetchCalendarEventsByDate(date)));
        if (!active) return;

        const mappedEvents: EventItem[] = [];
        let idCounter = 1;

        for (const day of dailyResults) {
          const dateLabel = day?.date || "This week";
          for (const building of day?.buildings ?? []) {
            for (const room of building.rooms ?? []) {
              for (const event of room.events ?? []) {
                const title = event.summary || "Campus Event";
                const loc = `${building.building || "Campus"} ${room.room || ""}`.trim();
                const tags = inferTags(title, loc);
                mappedEvents.push({
                  id: idCounter,
                  title,
                  date: dateLabel,
                  time: event.start_time || event.end_time || "TBA",
                  location: loc,
                  type: tags[0],
                  color: EVENT_COLORS[tags[0]] || "bg-indigo-500",
                  tags,
                });
                idCounter += 1;
              }
            }
          }
        }

        setEvents(mappedEvents);
      } catch {
        setEvents([]);
      } finally {
        if (active) setIsLoadingEvents(false);
      }
    };

    void loadCurrentWeekEvents();
    return () => { active = false; };
  }, []);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const ev of events) for (const tag of ev.tags) tagSet.add(tag);
    const sorted = [...tagSet].sort((a, b) => {
      if (a === "Other") return 1;
      if (b === "Other") return -1;
      return a.localeCompare(b);
    });
    return sorted;
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeTags.size === 0) return events;
    return events.filter((ev) => ev.tags.some((tag) => activeTags.has(tag)));
  }, [events, activeTags]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const clearTags = () => setActiveTags(new Set());

  const addCourse = () => {
    const trimmedCode = courseCode.trim().toUpperCase();
    const trimmedNote = courseNote.trim();
    if (!trimmedCode) return;
    const next: CourseItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      code: trimmedCode,
      note: trimmedNote || "No notes added yet.",
    };
    setCourses((prev) => [next, ...prev]);
    setCourseCode("");
    setCourseNote("");
  };

  const removeCourse = (id: string) => {
    setCourses((prev) => prev.filter((course) => course.id !== id));
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100">Campus Dashboard</h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">Your campus events and course overview</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campus Events */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Campus events and activities scheduled for this week</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tag filter bar */}
                {allTags.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-500 dark:text-slate-300" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-300 uppercase tracking-wider">Filter by tag</span>
                      {activeTags.size > 0 && (
                        <button onClick={clearTags} className="ml-auto flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                          <X className="w-3 h-3" />
                          Clear
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {allTags.map((tag) => {
                        const isActive = activeTags.has(tag);
                        const count = events.filter((e) => e.tags.includes(tag)).length;
                        return (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                              isActive
                                ? TAG_COLORS[tag] || TAG_COLORS.Other
                                : "bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-700 dark:hover:border-slate-500"
                            }`}
                          >
                            {tag}
                            <span className={`text-[10px] ${isActive ? "opacity-70" : "text-slate-400 dark:text-slate-400"}`}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                    {activeTags.size > 0 && (
                      <p className="text-xs text-slate-400 dark:text-slate-400">
                        Showing {filteredEvents.length} of {events.length} events
                      </p>
                    )}
                  </div>
                )}

                {/* Events list — scrollable */}
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  {isLoadingEvents && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">Loading current week events...</p>
                  )}
                  {!isLoadingEvents && filteredEvents.length === 0 && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {activeTags.size > 0 ? "No events match the selected tags." : "No live events available."}
                    </p>
                  )}
                  {filteredEvents.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/70 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 ${event.color} rounded-lg flex items-center justify-center`}>
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{event.title}</h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                            <Clock className="w-3 h-3" />
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.tags.map((tag) => (
                            <span
                              key={tag}
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${TAG_COLORS[tag] || TAG_COLORS.Other}`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Campus Courses */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  My Courses
                </CardTitle>
                <CardDescription>Add the courses you are taking this term</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <Input value={courseCode} onChange={(event) => setCourseCode(event.target.value)} placeholder="Course code (example: CS 3377)" />
                  <Input value={courseNote} onChange={(event) => setCourseNote(event.target.value)} placeholder="Optional note (example: Tue/Thu 1pm)" />
                  <Button type="button" onClick={addCourse}>Add Course</Button>
                </div>
                <div className="space-y-4">
                  {courses.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">No courses added yet.</p>}
                  {courses.map((course, index) => (
                    <motion.div key={course.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 * index }} className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-indigo-400 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2">{course.code}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-300">{course.note}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCourse(course.id)}>Remove</Button>
                          <Award className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg"><Users className="w-6 h-6 text-indigo-600" /></div>
                <div><CardDescription>This Week's Events</CardDescription><CardTitle className="text-2xl">{events.length}</CardTitle></div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg"><BookOpen className="w-6 h-6 text-purple-600" /></div>
                <div><CardDescription>Enrolled Courses</CardDescription><CardTitle className="text-2xl">{courses.length}</CardTitle></div>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg"><Tag className="w-6 h-6 text-green-600" /></div>
                <div><CardDescription>Event Categories</CardDescription><CardTitle className="text-2xl">{allTags.length}</CardTitle></div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
