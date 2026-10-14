"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  PlayCircle,
  HelpCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loader2 } from "lucide-react";
import { courseService } from "@/services/course.service";

import { useParams } from "next/navigation";

export default function CourseDetailPage() {
  const routerParams = useParams();
  const courseId = (routerParams?.courseId as string) || "";
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["course-detail", courseId],
    queryFn: () => courseService.getCourseById(courseId),
  });

  const enrollMutation = useMutation({
    mutationFn: () => courseService.enrollCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses-list"] });
    },
  });

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Loading course syllabus...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !data?.course) {
    return (
      <AppShell>
        <ErrorState
          message={(error as any)?.message || "Course not found"}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  const { course, lessons, enrollment, progressPercent } = data;
  const isEnrolled = !!enrollment;
  const firstLesson = lessons[0];

  return (
    <AppShell>
      <div className="mb-4">
        <Link
          href="/learn"
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Courses</span>
        </Link>
      </div>

      {/* Course Hero Banner */}
      <div className="mb-8 p-6 sm:p-8 rounded-2xl bg-white border border-slate-200 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm">
                {course.category}
              </Badge>
              <Badge variant="neutral" size="sm">
                Level: {course.level}
              </Badge>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {course.estimatedDuration}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {course.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="shrink-0 p-5 rounded-xl bg-slate-50 border border-slate-200/80 min-w-[240px]">
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Course Progress
            </div>
            <div className="text-2xl font-bold text-slate-900 mb-2">
              {progressPercent || 0}%
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent || 0}%` }}
              />
            </div>

            {firstLesson && (
              <Link
                href={`/learn/${course._id}/${firstLesson._id}`}
                className="w-full block"
              >
                <Button
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {progressPercent > 0 ? "Resume Lessons" : "Start First Lesson"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Syllabus & Lessons List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Course Syllabus</h2>
          <span className="text-xs text-slate-500">
            {lessons.length} lessons with knowledge checks
          </span>
        </div>

        <div className="space-y-3">
          {lessons.map((lesson: any, index: number) => {
            const isCompleted = lesson.status === "completed";

            return (
              <div
                key={lesson._id}
                className="p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-200 transition-all shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg font-bold text-xs ${
                      isCompleted
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      index + 1
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {lesson.title}
                      </h3>
                      <Badge
                        variant={isCompleted ? "success" : "neutral"}
                        size="sm"
                      >
                        {isCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>

                    {lesson.objectives && lesson.objectives[0] && (
                      <p className="text-xs text-slate-500 mt-1">
                        Goal: {lesson.objectives[0]}
                      </p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {lesson.durationMinutes} mins
                      </span>
                      {lesson.practicalTask && (
                        <span className="flex items-center gap-1 text-blue-600 font-medium">
                          <Sparkles className="w-3 h-3" />
                          Practical Task: {lesson.practicalTask.title}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/learn/${course._id}/${lesson._id}`}
                  className="shrink-0"
                >
                  <Button
                    size="sm"
                    variant={isCompleted ? "outline" : "primary"}
                    rightIcon={<PlayCircle className="w-3.5 h-3.5" />}
                  >
                    {isCompleted ? "Review" : "Launch"}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
