import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/app-store";
import { TaskCard } from "@/components/tasks/TaskCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks, Clock, CheckCircle2, X, Users as UsersIcon, UserPlus, Loader2 } from "lucide-react";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { executeWithFeedback } from "@/utils/asyncAction";
import { useCurrentUser } from "@/hooks/useUser";

export default function LeaderView({ path }: { path: string }) {
  const { tasks, users, approveTask, rejectTask } = useAppStore();
  const me = useCurrentUser();

  const [openSelf, setOpenSelf] = useState(false);
  const [openAssign, setOpenAssign] = useState(false);
  const [activeTab, setActiveTab] = useState("approvals");
  const [actionLoading, setActionLoading] = useState<Record<string, "approve" | "reject" | null>>({});

  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  const handleReject = async (maCV: string) => {
    setActionLoading((prev) => ({ ...prev, [maCV]: "reject" }));
    await executeWithFeedback(() => rejectTask(maCV), {
      success: "Đã từ chối task!",
      error: "Có lỗi xảy ra khi từ chối.",
    });
    setActionLoading((prev) => ({ ...prev, [maCV]: null }));
  };

  const handleApprove = async (maCV: string) => {
    setActionLoading((prev) => ({ ...prev, [maCV]: "approve" }));
    await executeWithFeedback(() => approveTask(maCV), {
      success: "Đã duyệt task!",
      error: "Có lỗi xảy ra khi duyệt.",
    });
    setActionLoading((prev) => ({ ...prev, [maCV]: null }));
  };

  useEffect(() => {
    if (path === "/approvals") setActiveTab("approvals");
    else if (path === "/my-tasks") setActiveTab("my");
    else if (path === "/assign") setActiveTab("all");
    else setActiveTab("approvals");
  }, [path]);

  const deptTasks = useMemo(
    () => tasks.filter((t) => t.tenPB === me.department),
    [tasks, me.department]
  );
  const pending = deptTasks.filter((t) => t.trangThai === "cho_duyet");
  const myTasks = tasks.filter((t) => t.nguoiThucHien === me.id);
  const teamMembers = users.filter((u) => u.role === "member" && u.department === me.department);

  const counts = {
    pending: pending.length,
    approved: deptTasks.filter((t) => t.trangThai === "duoc_duyet").length,
    completed: deptTasks.filter((t) => t.trangThai === "hoan_thanh").length,
    members: teamMembers.length,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Leader · {me.department}</p>
          <h1 className="font-display text-4xl font-bold mt-1">Trạm điều phối</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Duyệt task chờ duyệt, tạo task cá nhân và giao việc cho thành viên trong phòng ban.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button onClick={() => setOpenSelf(true)} variant="outline" size="lg">
            <Plus className="h-4 w-4 mr-2" /> Task cá nhân
          </Button>
          <Button
            onClick={() => setOpenAssign(true)}
            size="lg"
            className="bg-gradient-gold text-primary shadow-gold hover:opacity-90"
          >
            <UserPlus className="h-4 w-4 mr-2" /> Giao việc cho member
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Chờ duyệt" value={counts.pending} icon={Clock} tone="warning" />
        <StatCard label="Đã duyệt" value={counts.approved} icon={ListChecks} tone="primary" />
        <StatCard label="Hoàn thành" value={counts.completed} icon={CheckCircle2} tone="success" />
        <StatCard label="Thành viên" value={counts.members} icon={UsersIcon} tone="gold" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="bg-muted/50 w-full justify-start md:justify-center">
            <TabsTrigger value="approvals">Duyệt task ({pending.length})</TabsTrigger>
            <TabsTrigger value="my">Task của tôi ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="all">Toàn phòng ban ({deptTasks.length})</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="approvals" className="mt-6">
          {pending.length === 0 ? (
            <Card className="p-12 text-center text-muted-foreground">
              Hiện không có task nào chờ duyệt.
            </Card>
          ) : (
            <div className="space-y-3">
              {pending.map((t) => {
                const author = userMap[t.nguoiTao];
                return (
                  <Card
                    key={t.maCV}
                    className="p-5 flex flex-col md:flex-row md:items-center gap-4 hover:shadow-elegant transition-smooth"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] tracking-wider text-muted-foreground">
                          {t.maCV}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] h-5 bg-warning/15 text-warning border-warning/30"
                        >
                          Chờ duyệt
                        </Badge>
                      </div>
                      <h3 className="font-display text-lg font-semibold">{t.tenCV}</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Đề xuất bởi{" "}
                        <span className="font-medium text-foreground">{author?.name}</span> · Hạn{" "}
                        {format(new Date(t.ngayMucTieu), "dd/MM/yyyy")}
                      </p>
                      {t.moTa && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{t.moTa}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleReject(t.maCV)}
                        disabled={!!actionLoading[t.maCV]}
                        className="text-destructive hover:text-destructive"
                      >
                        {actionLoading[t.maCV] === "reject" ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <X className="h-4 w-4 mr-1" />
                        )}{" "}
                        Không chấp thuận
                      </Button>
                      <Button
                        onClick={() => handleApprove(t.maCV)}
                        disabled={!!actionLoading[t.maCV]}
                        className="bg-gradient-primary text-primary-foreground"
                      >
                        {actionLoading[t.maCV] === "approve" ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                        )}{" "}
                        Xác nhận
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {myTasks.map((t) => (
              <TaskCard key={t.maCV} task={t} />
            ))}
            {myTasks.length === 0 && (
              <Card className="col-span-full p-12 text-center text-muted-foreground">
                Chưa có task nào.
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {deptTasks.map((t) => (
              <TaskCard key={t.maCV} task={t} showActions={false} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <TaskDialog open={openSelf} onOpenChange={setOpenSelf} title="Tạo task cá nhân" />
      <TaskDialog
        open={openAssign}
        onOpenChange={setOpenAssign}
        forAssignee={teamMembers[0]?.id}
        title="Giao việc cho thành viên"
      />
    </div>
  );
}
