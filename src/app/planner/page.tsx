"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  CalendarCheck,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Clock,
  Send,
  Calendar,
  Filter,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loader2 } from "lucide-react";
import { plannerService } from "@/services/planner.service";
import { formatDate } from "@/utils/format";

const PLATFORMS = [
  "Instagram",
  "WhatsApp Business",
  "Google Business Profile",
  "Facebook",
  "YouTube / Shorts",
  "Email / Newsletter",
  "Local Event / Flyers",
  "Other",
];

const ACTIVITY_TYPES = [
  "Product Showcase",
  "Behind the Scenes",
  "Customer Review / Testimonial",
  "Educational / Tip",
  "Offer / Promotion",
  "Announcement / Update",
  "Poll / Question",
];

const STATUSES = [
  { value: "all", label: "All Statuses" },
  { value: "planned", label: "Planned" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
  { value: "published", label: "Published" },
];

export default function PlannerPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [modalForm, setModalForm] = useState({
    date: "",
    platform: "Instagram",
    type: "Product Showcase",
    description: "",
    status: "planned",
  });
  const [formError, setFormError] = useState<string | null>(null);

  React.useEffect(() => {
    setModalForm((prev) => ({
      ...prev,
      date: new Date().toISOString().split("T")[0],
    }));
  }, []);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["planner-items", statusFilter, platformFilter],
    queryFn: () =>
      plannerService.getItems({
        status: statusFilter,
        platform: platformFilter,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => plannerService.createItem(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-planner"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to create activity");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) =>
      plannerService.updateItem(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-planner"] });
      setIsModalOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to update activity");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => plannerService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planner-items"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-planner"] });
    },
  });

  const resetForm = () => {
    setEditingItem(null);
    setModalForm({
      date: new Date().toISOString().split("T")[0],
      platform: "Instagram",
      type: "Product Showcase",
      description: "",
      status: "planned",
    });
    setFormError(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setModalForm({
      date: new Date(item.date).toISOString().split("T")[0],
      platform: item.platform,
      type: item.type,
      description: item.description,
      status: item.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.description.trim()) {
      setFormError("Please enter a description or post idea.");
      return;
    }

    if (editingItem) {
      updateMutation.mutate({
        id: editingItem._id,
        payload: modalForm,
      });
    } else {
      createMutation.mutate(modalForm);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    updateMutation.mutate({
      id,
      payload: { status: newStatus },
    });
  };

  const items = data?.items || [];

  return (
    <AppShell>
      <PageHeader
        title="Marketing Planner"
        description="Plan your social posts, customer messages, and promotions in advance so you never scramble on busy days."
        action={
          <Button
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Plan New Activity
          </Button>
        }
      />

      {/* Filters Row */}
      <div className="mb-6 p-4 rounded-xl bg-white border border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="w-44">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUSES.map((st) => (
                <option key={st.value} value={st.value}>
                  {st.label}
                </option>
              ))}
            </Select>
          </div>

          <div className="w-44">
            <Select
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="all">All Channels</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Showing {items.length} marketing activities
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
          <p className="text-xs">Loading marketing schedule...</p>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="No planned activities found"
          description="Build consistent digital habits by scheduling 2 to 3 posts for the upcoming week."
          actionLabel="Schedule Your First Post"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="space-y-3">
          {items.map((item: any) => {
            const isDone =
              item.status === "completed" || item.status === "published";

            return (
              <div
                key={item._id}
                className="p-5 rounded-xl border border-slate-200 bg-white shadow-xs hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-xs ${
                      isDone
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-blue-50 text-blue-600 border border-blue-200"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Calendar className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {item.platform}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {item.type}
                      </Badge>
                      <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                        <Clock className="w-3 h-3" />
                        {formatDate(item.date)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
                      {item.description}
                    </p>

                    {item.lessonId && (
                      <div className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Linked to Lesson: {item.lessonId.title}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status selector & Actions */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                  <div className="w-32">
                    <Select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item._id, e.target.value)
                      }
                      className="text-xs py-1.5"
                    >
                      <option value="planned">Planned</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="published">Published</option>
                    </Select>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Activity"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          "Are you sure you want to delete this marketing activity?"
                        )
                      ) {
                        deleteMutation.mutate(item._id);
                      }
                    }}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Activity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? "Edit Marketing Activity" : "Plan New Marketing Activity"}
        description="Schedule a dated post, promo, or customer touchpoint."
      >
        {formError && (
          <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
            {formError}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Scheduled Date"
              type="date"
              required
              value={modalForm.date}
              onChange={(e) =>
                setModalForm({ ...modalForm, date: e.target.value })
              }
            />

            <Select
              label="Platform / Channel"
              value={modalForm.platform}
              onChange={(e) =>
                setModalForm({ ...modalForm, platform: e.target.value })
              }
            >
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Activity Type"
              value={modalForm.type}
              onChange={(e) =>
                setModalForm({ ...modalForm, type: e.target.value })
              }
            >
              {ACTIVITY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>

            <Select
              label="Status"
              value={modalForm.status}
              onChange={(e) =>
                setModalForm({ ...modalForm, status: e.target.value })
              }
            >
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="published">Published</option>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Activity Description / Post Idea
            </label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Reel showing our new sourdough batch coming out of the oven at 7 AM. CTA to order on WhatsApp."
              className="w-full rounded-lg border border-slate-300 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
              value={modalForm.description}
              onChange={(e) =>
                setModalForm({ ...modalForm, description: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingItem ? "Save Changes" : "Create Activity"}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
