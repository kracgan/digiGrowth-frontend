"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  BarChart3,
  TrendingUp,
  Target,
  Plus,
  Save,
  Calendar,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { KPICard } from "@/components/ui/KPICard";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loader2 } from "lucide-react";
import { metricsService } from "@/services/metrics.service";
import { formatNumber, formatPercent, formatMonthName } from "@/utils/format";

export default function BusinessResultsPage() {
  const queryClient = useQueryClient();

  // Selected entry month
  const [selectedMonth, setSelectedMonth] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    month: "",
    source: "Manual Records",
    followers: 0,
    posts: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    enquiries: 0,
    orders: 0,
    reviews: 0,
    rating: 5,
    notes: "",
  });

  React.useEffect(() => {
    const current = new Date().toISOString().slice(0, 7);
    setSelectedMonth(current);
    setFormData((prev) => ({ ...prev, month: current }));
  }, []);

  // Goals Modal State
  const [isGoalsModalOpen, setIsGoalsModalOpen] = useState(false);
  const [goalsForm, setGoalsForm] = useState({
    followersTarget: 1000,
    enquiriesTarget: 50,
    reviewsTarget: 20,
  });

  const [notification, setNotification] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["monthly-metrics"],
    queryFn: () => metricsService.getMonthlyMetrics(),
  });

  const upsertMutation = useMutation({
    mutationFn: (payload: any) => metricsService.upsertMonthlyMetrics(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-recs"] });
      queryClient.invalidateQueries({ queryKey: ["recommendations"] });
      setNotification("Monthly metrics successfully saved and updated!");
      setTimeout(() => setNotification(null), 4000);
    },
    onError: (err: any) => {
      setFormError(err.message || "Failed to save metrics");
    },
  });

  const updateGoalsMutation = useMutation({
    mutationFn: (payload: any) => metricsService.updateGoals(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["monthly-metrics"] });
      setIsGoalsModalOpen(false);
      setNotification("Monthly goals updated successfully!");
      setTimeout(() => setNotification(null), 4000);
    },
  });

  const records = data?.records || [];
  const latest = data?.latest;
  const goals = data?.goals;

  const handleSaveMetrics = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    upsertMutation.mutate(formData);
  };

  const handleOpenGoals = () => {
    if (goals) {
      setGoalsForm({
        followersTarget: goals.followersTarget || 1000,
        enquiriesTarget: goals.enquiriesTarget || 50,
        reviewsTarget: goals.reviewsTarget || 20,
      });
    }
    setIsGoalsModalOpen(true);
  };

  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    updateGoalsMutation.mutate(goalsForm);
  };

  // Prepare chart series
  const chartData = records.map((r: any) => ({
    name: formatMonthName(r.month),
    month: r.month,
    followers: r.followers,
    enquiries: r.enquiries,
    orders: r.orders,
    conversionRate: r.conversionRate,
  }));

  return (
    <AppShell>
      <PageHeader
        title="Business Results & Goals"
        description="Record your monthly figures once every 30 days. Digital Growth analyzes trends, tests your conversion rate, and sets your next milestones."
        action={
          <Button
            variant="outline"
            onClick={handleOpenGoals}
            leftIcon={<Target className="w-4 h-4" />}
          >
            Adjust Monthly Goals
          </Button>
        }
      />

      {notification && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{notification}</span>
        </div>
      )}

      {error && (
        <div className="mb-6">
          <ErrorState message={(error as any).message} onRetry={() => refetch()} />
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
          <p className="text-xs">Loading performance data...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Performance Signals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Audience Scale"
              value={formatNumber(latest?.followers || 0)}
              comparison={goals ? `Goal: ${goals.followersTarget}` : "vs last month"}
              statusText={
                goals && (latest?.followers || 0) >= goals.followersTarget
                  ? "Target Exceeded"
                  : "In Progress"
              }
              statusVariant={
                goals && (latest?.followers || 0) >= goals.followersTarget
                  ? "healthy"
                  : "neutral"
              }
            />

            <KPICard
              label="Customer Inquiries"
              value={formatNumber(latest?.enquiries || 0)}
              comparison="monthly messages"
              statusText={
                latest?.enquiries && latest.enquiries > 30 ? "Strong Demand" : "Baseline"
              }
              statusVariant="healthy"
            />

            <KPICard
              label="Orders & Sales"
              value={formatNumber(latest?.orders || 0)}
              comparison="completed deals"
              statusText={
                latest?.orders && latest.orders > 15 ? "Solid Revenue" : "Room to Grow"
              }
              statusVariant="healthy"
            />

            <KPICard
              label="Conversion Rate"
              value={formatPercent(latest?.conversionRate)}
              comparison="Orders ÷ Enquiries"
              statusText="Rule Formula"
              statusVariant="healthy"
            />
          </div>

          {/* Interactive Trends Charts */}
          {chartData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Audience & Inquiries Trend */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Audience & Inquiries Growth</CardTitle>
                    <span className="text-xs text-slate-400">
                      Monthly follower scale vs. warm buyer inquiries
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                      <YAxis fontSize={11} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          color: "#fff",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="followers"
                        stroke="#2563eb"
                        strokeWidth={2}
                        name="Followers"
                        dot={{ r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="enquiries"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="Enquiries"
                        dot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Chart 2: Monthly Orders */}
              <Card>
                <CardHeader>
                  <div>
                    <CardTitle>Completed Orders by Month</CardTitle>
                    <span className="text-xs text-slate-400">
                      Transactions resulting from marketing channels
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={11} stroke="#94a3b8" />
                      <YAxis fontSize={11} stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          color: "#fff",
                          borderRadius: "8px",
                          fontSize: "12px",
                        }}
                      />
                      <Bar
                        dataKey="orders"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Orders"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Monthly Metric Entry Form */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle>Record Monthly Business Signals</CardTitle>
                <span className="text-xs text-slate-500">
                  Select month and enter figures from manual sales records or Instagram/Google insights.
                </span>
              </div>
              <Badge variant="brand" size="sm">
                Upsert Safe (MET-01)
              </Badge>
            </CardHeader>

            <CardContent>
              {formError && (
                <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
                  {formError}
                </div>
              )}

              <form onSubmit={handleSaveMetrics} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <Input
                    label="Month (YYYY-MM)"
                    type="month"
                    required
                    value={formData.month}
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                  />

                  <Select
                    label="Data Source (MET-02)"
                    value={formData.source}
                    onChange={(e) =>
                      setFormData({ ...formData, source: e.target.value })
                    }
                  >
                    <option value="Manual Records">Manual Records / Notebook</option>
                    <option value="Instagram Insights">Instagram Insights</option>
                    <option value="Google Business Profile">Google Business Profile</option>
                    <option value="WhatsApp Business Chat Count">WhatsApp Business Chats</option>
                    <option value="Other">Other</option>
                  </Select>

                  <Input
                    label="Average Rating (0–5)"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        rating: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* Numeric Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <Input
                    label="Total Followers"
                    type="number"
                    min="0"
                    value={formData.followers}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        followers: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />

                  <Input
                    label="Published Posts"
                    type="number"
                    min="0"
                    value={formData.posts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        posts: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />

                  <Input
                    label="Total Likes"
                    type="number"
                    min="0"
                    value={formData.likes}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        likes: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />

                  <Input
                    label="Total Comments"
                    type="number"
                    min="0"
                    value={formData.comments}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        comments: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />

                  <Input
                    label="Total Shares"
                    type="number"
                    min="0"
                    value={formData.shares}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        shares: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />

                  <Input
                    label="Customer Enquiries"
                    type="number"
                    min="0"
                    value={formData.enquiries}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        enquiries: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />

                  <Input
                    label="Completed Orders"
                    type="number"
                    min="0"
                    value={formData.orders}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        orders: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />

                  <Input
                    label="New Customer Reviews"
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        reviews: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Monthly Notes & Observations
                  </label>
                  <Input
                    placeholder="e.g. Launched new menu, WhatsApp responses were 2x faster this month."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-500 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-blue-600" />
                    <span>
                      Rates are automatically computed: Conversion = (Orders ÷ Enquiries) × 100
                    </span>
                  </div>

                  <Button
                    type="submit"
                    isLoading={upsertMutation.isPending}
                    leftIcon={<Save className="w-4 h-4" />}
                  >
                    Save Month Results
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Historical Data Table */}
          <Card>
            <CardHeader>
              <CardTitle>Historical Monthly Records</CardTitle>
              <span className="text-xs text-slate-400">
                {records.length} months recorded
              </span>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="p-3">Month</th>
                      <th className="p-3">Source</th>
                      <th className="p-3">Followers</th>
                      <th className="p-3">Posts</th>
                      <th className="p-3">Enquiries</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Conversion</th>
                      <th className="p-3">Engagement</th>
                      <th className="p-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {records.map((r: any) => (
                      <tr key={r.month} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">
                          {formatMonthName(r.month)}
                        </td>
                        <td className="p-3 text-slate-500">{r.source}</td>
                        <td className="p-3 font-medium">{formatNumber(r.followers)}</td>
                        <td className="p-3">{r.posts}</td>
                        <td className="p-3 font-semibold text-blue-600">
                          {r.enquiries}
                        </td>
                        <td className="p-3 font-semibold text-emerald-600">
                          {r.orders}
                        </td>
                        <td className="p-3 font-bold">
                          {r.conversionRate !== null
                            ? `${r.conversionRate}%`
                            : "—"}
                        </td>
                        <td className="p-3 text-slate-500">
                          {r.engagementRate !== null
                            ? `${r.engagementRate}%`
                            : "—"}
                        </td>
                        <td className="p-3 text-amber-600 font-medium">
                          ★ {r.rating}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Adjust Goals Modal */}
      <Modal
        isOpen={isGoalsModalOpen}
        onClose={() => setIsGoalsModalOpen(false)}
        title="Set Monthly Growth Goals"
        description="Define your targets so Digital Growth can track progress and recommend actions."
      >
        <form onSubmit={handleSaveGoals} className="space-y-4">
          <Input
            label="Follower Target"
            type="number"
            min="0"
            required
            value={goalsForm.followersTarget}
            onChange={(e) =>
              setGoalsForm({
                ...goalsForm,
                followersTarget: parseInt(e.target.value, 10) || 0,
              })
            }
          />

          <Input
            label="Monthly Enquiries Target"
            type="number"
            min="0"
            required
            value={goalsForm.enquiriesTarget}
            onChange={(e) =>
              setGoalsForm({
                ...goalsForm,
                enquiriesTarget: parseInt(e.target.value, 10) || 0,
              })
            }
          />

          <Input
            label="Monthly Reviews Target"
            type="number"
            min="0"
            required
            value={goalsForm.reviewsTarget}
            onChange={(e) =>
              setGoalsForm({
                ...goalsForm,
                reviewsTarget: parseInt(e.target.value, 10) || 0,
              })
            }
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsGoalsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={updateGoalsMutation.isPending}
            >
              Update Targets
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}
