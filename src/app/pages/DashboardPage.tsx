import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, BookOpen, Users, Award } from "lucide-react";
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
};

type CourseItem = {
  id: string;
  code: string;
  note: string;
};

const STORAGE_KEY = "dashboard-manual-courses";

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

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return;
      }
      const parsed = JSON.parse(saved) as CourseItem[];
      if (Array.isArray(parsed)) {
        setCourses(parsed);
      }
    } catch {
      setCourses([]);
    }
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
        if (!active) {
          return;
        }

        const mappedEvents: EventItem[] = [];
        let idCounter = 1;

        for (const day of dailyResults) {
          const dateLabel = day?.date || "This week";
          for (const building of day?.buildings ?? []) {
            for (const room of building.rooms ?? []) {
              for (const event of room.events ?? []) {
                if (mappedEvents.length >= 8) {
                  break;
                }
                mappedEvents.push({
                  id: idCounter,
                  title: event.summary || "Campus Event",
                  date: dateLabel,
                  time: event.start_time || event.end_time || "TBA",
                  location: `${building.building || "Campus"} ${room.room || ""}`.trim(),
                  type: "Campus Event",
                  color: "bg-indigo-500",
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
        if (active) {
          setIsLoadingEvents(false);
        }
      }
    };

    void loadCurrentWeekEvents();
    return () => {
      active = false;
    };
  }, []);

  const addCourse = () => {
    const trimmedCode = courseCode.trim().toUpperCase();
    const trimmedNote = courseNote.trim();
    if (!trimmedCode) {
      return;
    }

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-2"
        >
          <h1 className="text-4xl font-bold text-slate-900">
            Campus Dashboard
          </h1>
          <p className="text-lg text-slate-600">
            Your campus events and course overview
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Campus Events */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>
                  Campus events and activities scheduled for this week
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {isLoadingEvents && (
                    <p className="text-sm text-slate-500">Loading current week events...</p>
                  )}
                  {!isLoadingEvents && events.length === 0 && (
                    <p className="text-sm text-slate-500">No live events available.</p>
                  )}
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex gap-4 p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 ${event.color} rounded-lg flex items-center justify-center`}>
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900">
                          {event.title}
                        </h3>
                        <div className="flex flex-col gap-1 mt-1">
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <Clock className="w-3 h-3" />
                            <span>{event.date} at {event.time}</span>
                          </div>
                          <div className="flex items-center gap-1 text-sm text-slate-600">
                            <MapPin className="w-3 h-3" />
                            <span>{event.location}</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="mt-2">
                          {event.type}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Campus Courses */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  My Courses
                </CardTitle>
                <CardDescription>
                  Add the courses you are taking this term
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  <Input
                    value={courseCode}
                    onChange={(event) => setCourseCode(event.target.value)}
                    placeholder="Course code (example: CS 3377)"
                  />
                  <Input
                    value={courseNote}
                    onChange={(event) => setCourseNote(event.target.value)}
                    placeholder="Optional note (example: Tue/Thu 1pm)"
                  />
                  <Button type="button" onClick={addCourse}>Add Course</Button>
                </div>
                <div className="space-y-4">
                  {courses.length === 0 && (
                    <p className="text-sm text-slate-500">No courses added yet.</p>
                  )}
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-2">
                            {course.code}
                          </h3>
                          <p className="text-sm text-slate-600">{course.note}</p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-2">
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeCourse(course.id)}>
                            Remove
                          </Button>
                          <Award className="w-5 h-5 text-slate-400" />
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-lg">
                  <Users className="w-6 h-6 text-indigo-600" />
                </div>
                <div>
                  <CardDescription>Active Study Groups</CardDescription>
                  <CardTitle className="text-2xl">{events.length}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <CardDescription>Enrolled Courses</CardDescription>
                  <CardTitle className="text-2xl">{courses.length}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardDescription>Live Data Points</CardDescription>
                  <CardTitle className="text-2xl">{events.length + courses.length}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

