import { useEffect, useMemo, useState } from "react";
import { useAppStore, statusLabel } from "@/store/app-store";
import { TaskCard } from "@/components/tasks/TaskCard";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Plus, ListChecks, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function MemberView({ path }: { path: string }) {
  console.log("Rendering MemberView, path:", path);
  const { tasks, currentUserId, users } = useAppStore();
  const me = users.find((u) => u.id === currentUserId)!;
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quarter, setQuarter] = useState<string>("all");

  useEffect(() => {
    if (path === "/my-tasks") setActiveTab("duoc_duyet");
    else setActiveTab("all");
  }, [path]);

  const myTasks = useMemo(
    () => tasks.filter((t) => 
      (t.nguoiThucHien === currentUserId || t.nguoiTao === currentUserId) && 
      t.nam === year && 
      (quarter === "all" || String(t.quy) === quarter)
    ),
    [tasks, currentUserId, year, quarter]
  );

  const counts = useMemo(() => {
    const c = { chua_duyet: 0, cho_duyet: 0, duoc_duyet: 0, hoan_thanh: 0, khong_chap_thuan: 0 };
    myTasks.forEach((t) => (c[t.trangThai]++));
    return c;
  }, [myTasks]);

  const filterByStatus = (key?: string) =>
    key && key !== "all" ? myTasks.filter((t) => t.trangThai === key) : myTasks;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">Member · {me.department}</p>
          <h1 className="font-display text-4xl font-bold mt-1">Xin chào, {me.name.split(" ").pop()} 👋</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Tạo, chỉnh sửa và theo dõi công việc cá nhân. Task chưa duyệt có thể CRUD; task đã được duyệt sẽ bị khóa chỉnh sửa.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-[100px] h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[year - 1, year, year + 1].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={quarter} onValueChange={setQuarter}>
            <SelectTrigger className="w-[130px] h-11"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả quý</SelectItem>
              <SelectItem value="1">Quý 1</SelectItem>
              <SelectItem value="2">Quý 2</SelectItem>
              <SelectItem value="3">Quý 3</SelectItem>
              <SelectItem value="4">Quý 4</SelectItem>
            </SelectContent>
          </Select>
          <Button size="lg" onClick={() => setOpen(true)} className="bg-gradient-primary text-primary-foreground shadow-elegant hover:opacity-90 ml-auto md:ml-0">
            <Plus className="h-4 w-4 mr-2" /> Tạo task mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng task" value={myTasks.length} icon={ListChecks} tone="primary" />
        <StatCard label="Chờ duyệt" value={counts.cho_duyet} icon={Clock} tone="warning" hint="Đang chờ Leader" />
        <StatCard label="Đang thực hiện" value={counts.duoc_duyet} icon={AlertCircle} tone="gold" />
        <StatCard label="Hoàn thành" value={counts.hoan_thanh} icon={CheckCircle2} tone="success" />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="overflow-x-auto pb-1 scrollbar-none">
          <TabsList className="bg-muted/50 w-full justify-start md:justify-center">
            <TabsTrigger value="all">Tất cả ({myTasks.length})</TabsTrigger>
            <TabsTrigger value="chua_duyet">{statusLabel.chua_duyet} ({counts.chua_duyet})</TabsTrigger>
            <TabsTrigger value="cho_duyet">{statusLabel.cho_duyet} ({counts.cho_duyet})</TabsTrigger>
            <TabsTrigger value="duoc_duyet">{statusLabel.duoc_duyet} ({counts.duoc_duyet})</TabsTrigger>
            <TabsTrigger value="hoan_thanh">{statusLabel.hoan_thanh} ({counts.hoan_thanh})</TabsTrigger>
          </TabsList>
        </div>
        {["all", "chua_duyet", "cho_duyet", "duoc_duyet", "hoan_thanh"].map((k) => (
          <TabsContent key={k} value={k} className="mt-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filterByStatus(k).map((t) => (
                <TaskCard key={t.maCV} task={t} showAssignee={false} />
              ))}
              {filterByStatus(k).length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  Không có task nào ở mục này.
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <TaskDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
