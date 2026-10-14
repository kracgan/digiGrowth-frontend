"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Clock,
  Sparkles,
  CalendarCheck,
  Calendar,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loader2 } from "lucide-react";
import { courseService } from "@/services/course.service";
import { plannerService } from "@/services/planner.service";

import { useParams } from "next/navigation";

export default function LessonViewerPage() {
  const routerParams = useParams();
  const courseId = (routerParams?.courseId as string) || "";
  const lessonId = (routerParams?.lessonId as string) || "";
  const router = useRouter();
  const queryClient = useQueryClient();

  // State for quiz answers
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [plannerAdded, setPlannerAdded] = useState(false);
  const [addingToPlanner, setAddingToPlanner] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["lesson-detail", lessonId],
    queryFn: () => courseService.getLessonById(lessonId),
  });

  const markCompleteMutation = useMutation({
    mutationFn: () => courseService.updateLessonProgress(lessonId, "completed"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-detail", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
      queryClient.invalidateQueries({ queryKey: ["courses-list"] });
    },
  });

  const quizMutation = useMutation({
    mutationFn: (answers: number[]) =>
      courseService.submitQuiz(lessonId, answers),
    onSuccess: (res) => {
      setQuizResult(res);
      setQuizSubmitted(true);
      queryClient.invalidateQueries({ queryKey: ["lesson-detail", lessonId] });
      queryClient.invalidateQueries({ queryKey: ["course-detail", courseId] });
    },
  });

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    if (quizSubmitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = (questionsCount: number) => {
    const answers: number[] = [];
    for (let i = 0; i < questionsCount; i++) {
      answers.push(selectedAnswers[i] !== undefined ? selectedAnswers[i] : -1);
    }
    quizMutation.mutate(answers);
  };

  const handleAddToPlanner = async (task: any) => {
    setAddingToPlanner(true);
    try {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await plannerService.createItem({
        date: tomorrow,
        platform: task.defaultPlatform || "Instagram",
        type: task.defaultType || "Educational / Tip",
        description: `${task.title}: ${task.description}`,
        status: "planned",
        lessonId: lessonId,
      });
      setPlannerAdded(true);
      queryClient.invalidateQueries({ queryKey: ["dashboard-planner"] });
      queryClient.invalidateQueries({ queryKey: ["planner-items"] });
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToPlanner(false);
    }
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Loading lesson material...</p>
        </div>
      </AppShell>
    );
  }

  if (error || !data?.lesson) {
    return (
      <AppShell>
        <ErrorState
          message={(error as any)?.message || "Lesson not found"}
          onRetry={() => refetch()}
        />
      </AppShell>
    );
  }

  const { lesson, progress, prevLesson, nextLesson } = data;
  const isCompleted = progress?.status === "completed";

  return (
    <AppShell>
      {/* Top Navigation Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href={`/learn/${courseId}`}
          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Course Syllabus</span>
        </Link>

        <div className="flex items-center gap-2">
          {isCompleted ? (
            <Badge variant="success" size="sm" className="gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Lesson Completed</span>
            </Badge>
          ) : (
            <Button
              size="sm"
              variant="outline"
              isLoading={markCompleteMutation.isPending}
              onClick={() => markCompleteMutation.mutate()}
            >
              Mark Complete
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Lesson Content (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card>
            <div className="border-b border-slate-100 pb-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="brand" size="sm">
                  Lesson {lesson.order}
                </Badge>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {lesson.durationMinutes} min read
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {lesson.title}
              </h1>

              {/* Learning Objectives */}
              {lesson.objectives && lesson.objectives.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                  <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                    Learning Objectives
                  </h4>
                  <ul className="space-y-1.5 text-xs text-blue-800">
                    {lesson.objectives.map((obj: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1 shrink-0" />
                        <span>{obj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Content Blocks */}
            <div className="space-y-5 text-sm text-slate-800 leading-relaxed">
              {lesson.contentBlocks?.map((block: any, idx: number) => {
                if (block.type === "heading") {
                  return (
                    <h3
                      key={idx}
                      className="text-lg font-bold text-slate-900 pt-2"
                    >
                      {block.heading}
                    </h3>
                  );
                }
                if (block.type === "text") {
                  return <p key={idx}>{block.text}</p>;
                }
                if (block.type === "list") {
                  return (
                    <ul key={idx} className="space-y-2 pl-4 list-disc">
                      {block.items?.map((item: string, j: number) => (
                        <li key={j} className="text-xs sm:text-sm text-slate-700">
                          {item}
                        </li>
                      ))}
                    </ul>
                  );
                }
                if (block.type === "callout") {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-slate-900 text-white text-xs leading-relaxed shadow-sm"
                    >
                      <span className="font-bold text-blue-400 block mb-1">
                        Practical Insight:
                      </span>
                      {block.callout}
                    </div>
                  );
                }
                if (block.type === "tip") {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5"
                    >
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block mb-0.5">
                          Owner Tip:
                        </span>
                        {block.tip}
                      </div>
                    </div>
                  );
                }
                if (block.type === "example") {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-mono"
                    >
                      <span className="font-bold block mb-1 font-sans">
                        Example Template:
                      </span>
                      {block.text}
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </Card>

          {/* Interactive Knowledge Check (Quiz) */}
          {lesson.quizQuestions && lesson.quizQuestions.length > 0 && (
            <Card className="border-indigo-100">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                      Knowledge Check
                    </span>
                    <CardTitle className="text-base">
                      Quick Quiz (Score 70%+ to pass)
                    </CardTitle>
                  </div>
                </div>
                {progress?.quizScore > 0 && (
                  <Badge variant="brand" size="sm">
                    Best Score: {progress.quizScore}%
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {quizResult && (
                  <div
                    className={`p-4 rounded-xl border text-xs ${
                      quizResult.passed
                        ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                        : "bg-amber-50 border-amber-200 text-amber-900"
                    }`}
                  >
                    <div className="font-bold text-sm mb-1">
                      {quizResult.passed
                        ? "🎉 Quiz Passed!"
                        : "Keep Learning & Try Again"}
                    </div>
                    <p>
                      You scored {quizResult.scorePercent}% ({quizResult.correctCount} of {quizResult.totalQuestions} correct).
                    </p>
                  </div>
                )}

                {lesson.quizQuestions.map((q: any, qIdx: number) => {
                  const feedback = quizResult?.feedback?.[qIdx];

                  return (
                    <div
                      key={qIdx}
                      className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3"
                    >
                      <p className="text-xs font-bold text-slate-900">
                        {qIdx + 1}. {q.question}
                      </p>

                      <div className="space-y-2">
                        {q.options?.map((opt: string, optIdx: number) => {
                          const isSelected = selectedAnswers[qIdx] === optIdx;
                          const isCorrect = feedback?.correctOptionIndex === optIdx;
                          const isWrong =
                            feedback &&
                            isSelected &&
                            !feedback.isCorrect;

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => handleSelectOption(qIdx, optIdx)}
                              className={`w-full text-left p-3 rounded-lg text-xs transition-all border flex items-center justify-between ${
                                isCorrect
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold"
                                  : isWrong
                                  ? "bg-rose-50 border-rose-300 text-rose-900"
                                  : isSelected
                                  ? "bg-blue-50 border-blue-400 text-blue-900 font-medium"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{opt}</span>
                              {isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {feedback && (
                        <p className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
                          <span className="font-bold">Explanation: </span>
                          {feedback.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-500">
                    {Object.keys(selectedAnswers).length} of{" "}
                    {lesson.quizQuestions.length} answered
                  </span>

                  <Button
                    size="sm"
                    isLoading={quizMutation.isPending}
                    onClick={() => handleSubmitQuiz(lesson.quizQuestions.length)}
                  >
                    {quizSubmitted ? "Submit Again" : "Submit Quiz"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation to Next / Prev Lesson */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            {prevLesson ? (
              <Link href={`/learn/${courseId}/${prevLesson._id}`}>
                <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                  {prevLesson.title}
                </Button>
              </Link>
            ) : <div />}

            {nextLesson ? (
              <Link href={`/learn/${courseId}/${nextLesson._id}`}>
                <Button size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Next: {nextLesson.title}
                </Button>
              </Link>
            ) : (
              <Link href={`/learn/${courseId}`}>
                <Button size="sm" variant="success">
                  Finish Course
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Sidebar Column (4 Cols): Practical Task & Operating Loop */}
        <div className="lg:col-span-4 space-y-6">
          {/* PRD LEARN-05: Practical Action at Lesson End */}
          {lesson.practicalTask && (
            <Card className="border-blue-200 bg-gradient-to-b from-blue-50/70 to-white">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                      Learn → Do Action
                    </span>
                    <CardTitle className="text-base">
                      {lesson.practicalTask.title}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-xs text-slate-700 leading-relaxed">
                  {lesson.practicalTask.description}
                </p>

                <div className="p-3 rounded-lg bg-white border border-blue-100 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Target Channel:</span>
                    <span className="font-semibold text-slate-800">
                      {lesson.practicalTask.defaultPlatform}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Post Type:</span>
                    <span className="font-semibold text-slate-800">
                      {lesson.practicalTask.defaultType}
                    </span>
                  </div>
                </div>

                {plannerAdded ? (
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Added to Planner!
                    </span>
                    <Link
                      href="/planner"
                      className="font-bold underline hover:text-emerald-950"
                    >
                      View Planner →
                    </Link>
                  </div>
                ) : (
                  <Button
                    className="w-full"
                    size="sm"
                    isLoading={addingToPlanner}
                    onClick={() => handleAddToPlanner(lesson.practicalTask)}
                    leftIcon={<CalendarCheck className="w-4 h-4" />}
                  >
                    Add to Marketing Planner
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Operating Loop Reminder */}
          <div className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs text-xs space-y-2">
            <h4 className="font-bold text-slate-900">
              The Digital Growth Loop
            </h4>
            <p className="text-slate-500 leading-relaxed">
              Every lesson ends with a real-world task. Once scheduled and published, you record results at month-end to see what converted.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
