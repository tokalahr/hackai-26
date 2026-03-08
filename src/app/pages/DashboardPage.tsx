import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Calendar, Clock, MapPin, BookOpen, Users, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { fetchCourses, fetchCourseTrends } from "../services/backend-api";

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
  id: number;
  title: string;
  courseLabel: string;
};

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoadingLiveData, setIsLoadingLiveData] = useState(true);

  useEffect(() => {
    let active = true;

    const loadLiveData = async () => {
      try {
        const liveCourses = await fetchCourses({ offset: 0 });
        if (!active || liveCourses.length === 0) {
          return;
        }

        const mappedCourses = liveCourses.slice(0, 3).map((course, index) => ({
          id: index + 1,
          title:
            `${course.subject_prefix ?? ""} ${course.course_number ?? ""}`.trim() || `Course ${index + 1}`,
          courseLabel: course.title || course.description || "Course details",
        }));
        setCourses(mappedCourses);

        const first = liveCourses[0];
        if (!first?.subject_prefix || !first?.course_number) {
          return;
        }

        const trendSections = await fetchCourseTrends(first.subject_prefix, first.course_number);
        if (!active || trendSections.length === 0) {
          return;
        }

        const mappedEvents = trendSections.slice(0, 5).map((section, index) => {
          const meeting = section.meetings?.[0];
          return {
            id: index + 1,
            title: `${first.subject_prefix} ${first.course_number} Section ${section.section_number ?? "N/A"}`,
            date: meeting?.start_date || "Upcoming",
            time: meeting?.start_time || "TBA",
            location: `${meeting?.location?.building || "Campus"} ${meeting?.location?.room || "TBD"}`,
            type: "Nebula Trend",
            color: "bg-indigo-500",
          };
        });
        setEvents(mappedEvents);
      } catch {
        setCourses([]);
        setEvents([]);
      } finally {
        if (active) {
          setIsLoadingLiveData(false);
        }
      }
    };

    void loadLiveData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
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
                  {!isLoadingLiveData && events.length === 0 && (
                    <p className="text-sm text-slate-500">No live events available.</p>
                  )}
                  {events.map((event, index) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
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
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  My Assignments
                </CardTitle>
                <CardDescription>
                  Current assignments and their progress
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingLiveData && (
                  <p className="text-sm text-slate-500 mb-3">Loading live Nebula data...</p>
                )}
                <div className="space-y-4">
                  {!isLoadingLiveData && courses.length === 0 && (
                    <p className="text-sm text-slate-500">No live course data available.</p>
                  )}
                  {courses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="p-4 rounded-lg border border-slate-200 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-2">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-600">{course.courseLabel}</p>
                        </div>
                        <div className="flex-shrink-0">
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
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
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
