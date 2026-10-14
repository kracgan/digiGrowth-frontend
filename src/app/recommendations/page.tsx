"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Info,
  CalendarCheck,
  GraduationCap,
  TrendingUp,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loader2 } from "lucide-react";
import { recommendationService } from "@/services/recommendation.service";

export default function RecommendationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["recommendations"],
    queryFn: () => recommendationService.getRecommendations(),
  });

  const statusMutation = useMutation({
    mutationFn: ({
      ruleId,
      status,
    }: {
      ruleId: string;
      status: "completed" | "dismissed";
    }) => recommendationService.updateStatus(ruleId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-recs"] });
    },
  });

  const recommendations = (data?.recommendations as any[]) || [];
  const primary = data?.primary;
  const secondaryRecs = recommendations.filter(
    (r) => !primary || r.ruleId !== primary.ruleId
  );

  return (
    <AppShell>
      <PageHeader
        title="Actionable Growth Recommendations"
        description="Deterministic recommendations based strictly on your recorded metrics, goals, and content planner. No hallucinations or generic fluff."
      />

      {/* Principle Callout */}
      <div className="mb-8 p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Explainable Rule Engine
            </h4>
            <p className="text-xs text-slate-300">
              Each recommendation shows the exact observation that triggered it and links directly to an action.
            </p>
          </div>
        </div>
        <div className="text-xs text-blue-300 font-semibold shrink-0">
          Deterministic & Tested
        </div>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorState message={(error as any).message} onRetry={() => refetch()} />
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Evaluating business signals...</p>
        </div>
      ) : recommendations.length === 0 ? (
        <EmptyState
          icon={<CheckCircle2 className="w-8 h-8 text-emerald-600" />}
          title="All caught up!"
          description="You've executed or dismissed all current growth recommendations. Record next month's results to receive new insights."
        />
      ) : (
        <div className="space-y-8">
          {/* Primary Lead Recommendation Card (PRD 8) */}
          {primary && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                <span>Primary Recommended Priority</span>
              </div>

              <Card className="border-blue-300 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="brand" size="sm">
                        Rule ID: {primary.ruleId}
                      </Badge>
                      <Badge variant="neutral" size="sm">
                        Effort: {primary.effort}
                      </Badge>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {primary.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({
                          ruleId: primary.ruleId,
                          status: "dismissed",
                        })
                      }
                      className="text-slate-400 hover:text-slate-600"
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        statusMutation.mutate({
                          ruleId: primary.ruleId,
                          status: "completed",
                        })
                      }
                      leftIcon={<CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    >
                      Mark Done
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white border border-blue-100 mb-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-xs">
                  <span className="font-bold text-slate-900 block mb-1">
                    Why this suggestion appears:
                  </span>
                  {primary.reason}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-blue-100/80">
                  <div className="text-xs text-slate-700 flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>Suggested Action: {primary.suggestedAction}</span>
                  </div>

                  <Link href={primary.actionRoute || "/planner"}>
                    <Button
                      size="md"
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      Take Action Now
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}

          {/* Secondary Suggestions List */}
          {secondaryRecs.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                Additional Recommendations ({secondaryRecs.length})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {secondaryRecs.map((rec) => (
                  <Card
                    key={rec.ruleId}
                    className="flex flex-col justify-between hover:border-slate-300"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="neutral" size="sm">
                          Effort: {rec.effort}
                        </Badge>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                ruleId: rec.ruleId,
                                status: "dismissed",
                              })
                            }
                            className="p-1 text-slate-400 hover:text-slate-600 rounded text-xs"
                            title="Dismiss"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() =>
                              statusMutation.mutate({
                                ruleId: rec.ruleId,
                                status: "completed",
                              })
                            }
                            className="p-1 text-emerald-600 hover:text-emerald-700 rounded text-xs font-semibold"
                            title="Done"
                          >
                            Done
                          </button>
                        </div>
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 mb-2">
                        {rec.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed mb-4">
                        {rec.reason}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-500 line-clamp-1 max-w-[180px]">
                        {rec.suggestedAction}
                      </span>

                      <Link href={rec.actionRoute || "/planner"}>
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                        >
                          Execute
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
