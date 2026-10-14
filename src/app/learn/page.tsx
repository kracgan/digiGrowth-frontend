"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  GraduationCap,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loader2 } from "lucide-react";
import { courseService } from "@/services/course.service";

export default function LearnPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const { data: coursesData, isLoading, error, refetch } = useQuery({
    queryKey: ["courses-list"],
    queryFn: () => courseService.getCourses(),
  });

  const courses = (coursesData as any[]) || [];

  const categories = [
    { id: "all", label: "All Courses" },
    { id: "Marketing Basics", label: "Marketing Basics" },
    { id: "Social Media", label: "Social Media" },
    { id: "Messaging", label: "Messaging" },
    { id: "Local SEO", label: "Local SEO" },
    { id: "Content Planning", label: "Planning" },
  ];

  const filteredCourses =
    activeCategory === "all"
      ? courses
      : courses.filter((c) => c.category === activeCategory);

  const completedCount = courses.filter(
    (c) => c.enrollmentStatus === "completed"
  ).length;

  return (
    <AppShell>
      <PageHeader
        title="Guided Marketing Curriculum"
        description="Practical, bite-sized lessons designed for small business owners. Complete a lesson, take a quiz, and execute the task."
      />

      {/* Progress Metric Banner */}
      <div className="mb-8 p-4 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-blue-900">
              8 Core Digital Marketing Pillars
            </h3>
            <p className="text-xs text-blue-700">
              {completedCount} of {courses.length} courses completed across your workspace.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            5–10 min practical lessons
          </Badge>
          <Badge variant="success" size="sm">
            Action items included
          </Badge>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="mb-6">
        <Tabs
          tabs={categories}
          activeTab={activeCategory}
          onChange={setActiveCategory}
        />
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState message={(error as any).message} onRetry={() => refetch()} />
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Loading curriculum...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const isCompleted = course.enrollmentStatus === "completed";
            const inProgress = course.enrollmentStatus === "in_progress";

            return (
              <Card
                key={course._id}
                className="flex flex-col justify-between hover:border-blue-300 transition-all"
              >
                <div>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Badge variant="neutral" size="sm">
                        {course.category}
                      </Badge>
                      <Badge
                        variant={
                          isCompleted
                            ? "success"
                            : inProgress
                            ? "brand"
                            : "neutral"
                        }
                        size="sm"
                      >
                        {isCompleted
                          ? "Completed"
                          : inProgress
                          ? "In Progress"
                          : "Not Started"}
                      </Badge>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.estimatedDuration}
                    </span>
                  </CardHeader>

                  <CardTitle className="text-base font-bold mb-2">
                    {course.title}
                  </CardTitle>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                    {course.description}
                  </p>
                </div>

                <div>
                  {/* Progress bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                      <span>Completion</span>
                      <span className="font-semibold text-slate-800">
                        {course.progressPercent || 0}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-300"
                        style={{ width: `${course.progressPercent || 0}%` }}
                      />
                    </div>
                  </div>

                  <CardFooter className="p-0 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" />
                      {course.lessonsCount} practical lessons
                    </span>

                    <Link href={`/learn/${course._id || course.slug}`}>
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "primary"}
                        rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      >
                        {isCompleted
                          ? "Review Course"
                          : inProgress
                          ? "Continue"
                          : "Start Learning"}
                      </Button>
                    </Link>
                  </CardFooter>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
