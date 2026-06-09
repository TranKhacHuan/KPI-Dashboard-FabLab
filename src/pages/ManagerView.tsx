import { useMemo, useState } from "react";
import { useAppStore, statusLabel, statusTone } from "@/store/app-store";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ListChecks, CheckCircle2, TrendingUp, Users as UsersIcon } from "lucide-react";
import { TimeRangeFilter } from "@/components/filters/TimeRangeFilter";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { format } from "date-fns";
import { useFilteredTasks } from "@/hooks/useFilteredTasks";
import { useCurrentUser } from "@/hooks/useUser";

export default function ManagerView({ path: _path }: { path: string }) {
  const { users } = useAppStore();
  const me = useCurrentUser();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [quarter, setQuarter] = useState<string>("all");

  const allTasksYear = useFilteredTasks({ year });
  const filteredByQ = useFilteredTasks({ year, quarter });

  const userMap = useMemo(
    () => Object.fromEntries(users.map((u) => [u.id, u])),
    [users]
  );

  const totals = {
    total: filteredByQ.length,
    completed: filteredByQ.filter((t) => t.trangThai === "hoan_thanh").length,
    inProgress: filteredByQ.filter((t) => t.trangThai === "duoc_duyet").length,
    members: users.filter((u) => u.role === "member" || u.role === "leader").length,
  };
  const completionRate = totals.total
    ? Math.round((totals.completed / totals.total) * 100)
    : 0;

  const perMember = useMemo(() => {
    const members = users.filter((u) => u.role === "member" || u.role === "leader");
    return members.map((m) => {
      const mt = filteredByQ.filter((t) => t.nguoiThucHien === m.id);
      const done = mt.filter((t) => t.trangThai === "hoan_thanh").length;
      return {
        id: m.id,
        name: m.name,
        total: mt.length,
        done,
        rate: mt.length ? Math.round((done / mt.length) * 100) : 0,
      };
    });
  }, [users, filteredByQ]);

  const perQuarter = useMemo(() => {
    return [1, 2, 3, 4].map((q) => {
      const qt = allTasksYear.filter((t) => t.quy === q);
      const done = qt.filter((t) => t.trangThai === "hoan_thanh").length;
      return {
        quarter: `Q${q}`,
        total: qt.length,
        done,
        rate: qt.length ? Math.round((done / qt.length) * 100) : 0,
      };
    });
  }, [allTasksYear]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Manager · {me.department}
          </p>
          <h1 className="font-display text-4xl font-bold mt-1">Báo cáo hiệu suất</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Theo dõi tỷ lệ hoàn thành công việc theo nhân viên và theo quý.
          </p>
        </div>
        <div className="flex gap-2">
          <TimeRangeFilter
            year={year}
            quarter={quarter}
            onYearChange={setYear}
            onQuarterChange={setQuarter}
            yearWidth="w-[120px]"
            quarterWidth="w-[140px]"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Tổng task" value={totals.total} icon={ListChecks} tone="primary" />
        <StatCard label="Đang thực hiện" value={totals.inProgress} icon={TrendingUp} tone="gold" />
        <StatCard
          label="Hoàn thành"
          value={totals.completed}
          icon={CheckCircle2}
          tone="success"
          hint={`${completionRate}% tỷ lệ`}
        />
        <StatCard label="Thành viên" value={totals.members} icon={UsersIcon} tone="primary" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="flex items-baseline justify-between mb-4">
            <div>
              <h2 className="font-display text-xl font-semibold">
                Tỷ lệ hoàn thành theo nhân viên
              </h2>
              <p className="text-xs text-muted-foreground">
                {quarter === "all" ? "Cả năm" : `Quý ${quarter}`} · {year}
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {perMember.map((m) => (
              <div key={m.id}>
                <div className="flex items-center justify-between mb-1.5 text-sm">
                  <span className="font-medium">{m.name}</span>
                  <span className="text-muted-foreground">
                    {m.done}/{m.total} ·{" "}
                    <span className="font-semibold text-foreground">{m.rate}%</span>
                  </span>
                </div>
                <Progress value={m.rate} className="h-2" />
              </div>
            ))}
            {perMember.length === 0 && (
              <p className="text-muted-foreground text-sm">Chưa có dữ liệu.</p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-4">
            <h2 className="font-display text-xl font-semibold">Hoàn thành theo quý</h2>
            <p className="text-xs text-muted-foreground">Năm {year}</p>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={perQuarter} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="quarter" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} unit="%" />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                  formatter={(v: number, _n, p: { payload: { done: number; total: number } }) => [
                    `${v}% (${p.payload.done}/${p.payload.total})`,
                    "Hoàn thành",
                  ]}
                />
                <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
                  {perQuarter.map((_, i) => (
                    <Cell
                      key={i}
                      fill={i % 2 === 0 ? "hsl(var(--primary))" : "hsl(var(--accent))"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="font-display text-xl font-semibold mb-4">Chi tiết công việc</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <th className="py-3 pr-4 whitespace-nowrap">Mã CV</th>
                <th className="py-3 pr-4 whitespace-nowrap">Tên công việc</th>
                <th className="py-3 pr-4 whitespace-nowrap">Phòng ban</th>
                <th className="py-3 pr-4 whitespace-nowrap">Nhân viên</th>
                <th className="py-3 pr-4 whitespace-nowrap">Quý</th>
                <th className="py-3 pr-4 whitespace-nowrap">Hạn</th>
                <th className="py-3 pr-4 whitespace-nowrap">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {filteredByQ.map((t) => (
                <tr
                  key={t.maCV}
                  className="border-b border-border/50 hover:bg-muted/40 transition-smooth"
                >
                  <td className="py-3 pr-4 font-mono text-xs whitespace-nowrap">{t.maCV}</td>
                  <td className="py-3 pr-4 font-medium min-w-[200px]">{t.tenCV}</td>
                  <td className="py-3 pr-4 whitespace-nowrap text-xs">{t.tenPB}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">{userMap[t.nguoiThucHien]?.name}</td>
                  <td className="py-3 pr-4 whitespace-nowrap">Q{t.quy}</td>
                  <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                    {format(new Date(t.ngayMucTieu), "dd/MM/yyyy")}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${statusTone[t.trangThai]}`}
                    >
                      {statusLabel[t.trangThai]}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredByQ.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-muted-foreground">
                    Không có dữ liệu.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
