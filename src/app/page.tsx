"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  MessageCircle,
  FileText,
  GraduationCap,
  ArrowRight,
  Calendar,
  Lightbulb,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { KPICard } from "@/components/ui/KPICard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { metricsService } from "@/services/metrics.service";
import { courseService } from "@/services/course.service";
import { plannerService } from "@/services/planner.service";
import { recommendationService } from "@/services/recommendation.service";
import { useAuthStore } from "@/store/auth.store";
import { formatNumber, formatDate } from "@/utils/format";

export default function DashboardHomePage() {
  const { user, organization } = useAuthStore();

  // Queries
  const {
    data: metricsData,
    isLoading: loadingMetrics,
    error: metricsError,
    refetch: refetchMetrics,
  } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: () => metricsService.getMonthlyMetrics(),
  });

  const {
    data: coursesData,
    isLoading: loadingCourses,
  } = useQuery({
    queryKey: ["dashboard-courses"],
    queryFn: () => courseService.getCourses(),
  });

  const {
    data: plannerData,
    isLoading: loadingPlanner,
  } = useQuery({
    queryKey: ["dashboard-planner"],
    queryFn: () => plannerService.getItems({ limit: "5" }),
  });

  const {
    data: recsData,
    isLoading: loadingRecs,
  } = useQuery({
    queryKey: ["dashboard-recs"],
    queryFn: () => recommendationService.getRecommendations(),
  });

  const latest = metricsData?.latest;
  const goals = metricsData?.goals;
  const courses = (coursesData as any[]) || [];
  const plannerItems = (plannerData?.items as any[]) || [];
  const primaryRec = recsData?.primary;

  // Find in-progress or next course
  const inProgressCourse =
    courses.find((c) => c.enrollmentStatus === "in_progress") ||
    courses.find((c) => c.enrollmentStatus === "enrolled") ||
    courses[0];

  return (
    <AppShell>
      {/* Welcome Banner */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
            Business Growth Operating Loop
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
            Welcome back, {user?.name || "Business Owner"}
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-blue-100 max-w-xl">
            {organization?.name
              ? `${organization.name} (${organization.category})`
              : "Your business workspace"}
            {" • "}Goal: {organization?.primaryGoal || "Get more customer enquiries"}
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link href="/planner">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Plan Post
            </Button>
          </Link>
          <Link href="/business-results">
            <Button
              variant="primary"
              size="sm"
              className="bg-blue-500 hover:bg-blue-600 shadow-none"
            >
              Record Month
            </Button>
          </Link>
        </div>
      </div>

      {metricsError && (
        <div className="mb-8">
          <ErrorState
            message={(metricsError as any).message}
            onRetry={() => refetchMetrics()}
          />
        </div>
      )}

      {/* Row 1: Strict KPI Cards Standard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Total Audience"
          value={formatNumber(latest?.followers || 0)}
          trend={
            latest?.changes?.followers !== null && latest?.changes?.followers !== undefined
              ? {
                  value: `${latest.changes.followers >= 0 ? "+" : ""}${latest.changes.followers}%`,
                  direction: latest.changes.followers >= 0 ? "up" : "down",
                }
              : undefined
          }
          comparison={goals ? `Target: ${goals.followersTarget}` : "vs last month"}
          statusText={
            goals && (latest?.followers || 0) >= goals.followersTarget
              ? "Goal Met"
              : "On Track"
          }
          statusVariant={
            goals && (latest?.followers || 0) >= goals.followersTarget
              ? "healthy"
              : "neutral"
          }
          icon={<Users className="w-4 h-4" />}
        />

        <KPICard
          label="Monthly Enquiries"
          value={formatNumber(latest?.enquiries || 0)}
          trend={
            latest?.changes?.enquiries !== null && latest?.changes?.enquiries !== undefined
              ? {
                  value: `${latest.changes.enquiries >= 0 ? "+" : ""}${latest.changes.enquiries}%`,
                  direction: latest.changes.enquiries >= 0 ? "up" : "down",
                }
              : undefined
          }
          comparison="warm leads"
          statusText={
            latest?.enquiries && latest.enquiries > 30 ? "Strong Interest" : "Needs Attention"
          }
          statusVariant={
            latest?.enquiries && latest.enquiries > 30 ? "healthy" : "warning"
          }
          icon={<MessageCircle className="w-4 h-4" />}
        />

        <KPICard
          label="Published Posts"
          value={latest?.posts || 0}
          trend={
            latest?.posts && latest.posts >= 8
              ? { value: "Consistent", direction: "up" }
              : { value: "Cadence Low", direction: "neutral" }
          }
          comparison="this month"
          statusText={
            latest?.posts && latest.posts >= 8 ? "Active" : "Schedule 2/week"
          }
          statusVariant={
            latest?.posts && latest.posts >= 8 ? "healthy" : "warning"
          }
          icon={<FileText className="w-4 h-4" />}
        />

        <KPICard
          label="Conversion Score"
          value={
            latest?.conversionRate !== null && latest?.conversionRate !== undefined
              ? `${latest.conversionRate}%`
              : "Not available"
          }
          comparison="Orders ÷ Enquiries"
          statusText={
            latest?.conversionRate && latest.conversionRate > 20
              ? "High Conversion"
              : "Formula Checked"
          }
          statusVariant="healthy"
          icon={<GraduationCap className="w-4 h-4" />}
        />
      </div>

      {/* Row 2: Operational Modules Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Left Column (2 spans): Primary Recommendation & Active Learning */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Recommendation Card */}
          {primaryRec ? (
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Lightbulb className="w-4 h-4" />
                  </span>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                      Top Recommended Action
                    </span>
                    <CardTitle className="text-base sm:text-lg">
                      {primaryRec.title}
                    </CardTitle>
                  </div>
                </div>
                <Badge variant="brand" size="sm">
                  Effort: {primaryRec.effort}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="p-3.5 rounded-xl bg-white border border-blue-100 mb-4 text-xs text-slate-700 leading-relaxed shadow-xs">
                  <span className="font-semibold text-slate-900 block mb-0.5">
                    Why this suggestion appears:
                  </span>
                  {primaryRec.reason}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{primaryRec.suggestedAction}</span>
                  </div>

                  <Link href={primaryRec.actionRoute || "/planner"}>
                    <Button
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Execute Action
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>System Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-slate-500">
                  Record monthly metrics or complete your first lesson to receive personalized growth guidance.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Active Learning Track Card */}
          <Card>
            <CardHeader>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Guided Learning Path
                </span>
                <CardTitle className="mt-0.5">Continue Learning</CardTitle>
              </div>
              <Link
                href="/learn"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>View All 8 Courses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </CardHeader>
            <CardContent>
              {inProgressCourse ? (
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">
                        {inProgressCourse.category}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {inProgressCourse.estimatedDuration}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {inProgressCourse.title}
                    </h4>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {inProgressCourse.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="pt-2 w-full max-w-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-slate-900">
                          {inProgressCourse.progressPercent || 0}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{
                            width: `${inProgressCourse.progressPercent || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/learn/${inProgressCourse._id || inProgressCourse.slug}`}
                    className="shrink-0"
                  >
                    <Button
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      {inProgressCourse.progressPercent > 0
                        ? "Resume Lesson"
                        : "Start Course"}
                    </Button>
                  </Link>
                </div>
              ) : (
                <EmptyState
                  title="No courses enrolled"
                  description="Explore our 8 foundational marketing courses designed for small business owners."
                  actionLabel="Browse Courses"
                  onAction={() => {}}
                />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column (1 span): Upcoming Marketing Activities */}
        <div>
          <Card className="h-full flex flex-col justify-between">
            <div>
              <CardHeader>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Marketing Planner
                  </span>
                  <CardTitle className="mt-0.5">Upcoming Activities</CardTitle>
                </div>
                <Link
                  href="/planner"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  Planner →
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {plannerItems.length > 0 ? (
                  plannerItems.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-slate-900">
                          {item.platform}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-2 flex items-center justify-between">
                        <Badge
                          variant={
                            item.status === "published" || item.status === "completed"
                              ? "success"
                              : "neutral"
                          }
                          size="sm"
                        >
                          {item.status}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {item.type}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 mb-3">
                      No upcoming activities scheduled.
                    </p>
                    <Link href="/planner">
                      <Button size="sm" variant="outline">
                        Schedule a Post
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </div>

            <div className="pt-4 border-t border-slate-100 text-center">
              <Link href="/planner">
                <Button variant="ghost" size="sm" className="w-full text-xs">
                  Open Marketing Planner
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
