"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ShieldCheck,
  Search,
  Users,
  Activity,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import { ErrorState } from "@/components/ui/ErrorState";
import { Loader2 } from "lucide-react";
import { adminService } from "@/services/admin.service";
import { formatDate } from "@/utils/format";

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("users");
  const [searchTerm, setSearchTerm] = useState("");

  const {
    data: usersData,
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["admin-users", searchTerm],
    queryFn: () => adminService.getUsers({ search: searchTerm }),
  });

  const {
    data: auditData,
    isLoading: loadingAudit,
  } = useQuery({
    queryKey: ["admin-audit-logs"],
    queryFn: () => adminService.getAuditLogs(),
    enabled: activeTab === "audit",
  });

  const toggleStatusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: "active" | "suspended";
    }) => adminService.toggleUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users = (usersData?.users as any[]) || [];
  const auditLogs = (auditData as any[]) || [];

  return (
    <AppShell>
      <PageHeader
        title="Administration Console"
        description="Monitor user workspaces, platform security, and system audit logs."
      />

      <div className="mb-6">
        <Tabs
          tabs={[
            { id: "users", label: "User Workspaces", badge: users.length },
            { id: "audit", label: "Security Audit Logs" },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />
      </div>

      {activeTab === "users" && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-4">
            <div className="max-w-md w-full">
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Total registered workspaces: {users.length}
            </div>
          </div>

          {usersError && (
            <ErrorState message={(usersError as any).message} />
          )}

          {loadingUsers ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs">Loading user list...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>User / Email</TableHead>
                  <TableHead>Business Workspace</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Account Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {users.map((u: any) => (
                  <TableRow key={u._id}>
                    <TableCell>
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-xs text-slate-400">{u.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-slate-800">
                        {u.organization?.name || "—"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {u.organization?.category || "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="brand" size="sm">
                        {u.role || "owner"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.status === "active" ? "success" : "danger"}
                        size="sm"
                      >
                        {u.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">
                      {formatDate(u.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={u.status === "active" ? "danger" : "outline"}
                        isLoading={toggleStatusMutation.isPending}
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            id: u._id,
                            status: u.status === "active" ? "suspended" : "active",
                          })
                        }
                      >
                        {u.status === "active" ? "Suspend" : "Activate"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}

      {activeTab === "audit" && (
        <div>
          {loadingAudit ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-2" />
              <p className="text-xs">Loading audit trail...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <tr>
                  <TableHead>Action</TableHead>
                  <TableHead>Target Type</TableHead>
                  <TableHead>Target ID</TableHead>
                  <TableHead>Timestamp</TableHead>
                </tr>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log: any) => (
                  <TableRow key={log._id}>
                    <TableCell className="font-mono text-xs font-semibold text-blue-600">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-xs">{log.targetType}</TableCell>
                    <TableCell className="text-xs text-slate-500 font-mono">
                      {log.targetId || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </AppShell>
  );
}
