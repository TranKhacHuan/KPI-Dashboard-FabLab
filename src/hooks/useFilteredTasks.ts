import { useMemo } from "react";
import { useAppStore, type Task, type Department, type TaskStatus } from "@/store/app-store";

interface FilterOptions {
  userId?: string;
  department?: Department;
  year?: number;
  quarter?: number | string | "all";
  status?: TaskStatus | "all";
}

export function useFilteredTasks({
  userId,
  department,
  year,
  quarter,
  status,
}: FilterOptions): Task[] {
  const tasks = useAppStore((s) => s.tasks);

  return useMemo(() => {
    return tasks.filter((t) => {
      if (userId && t.nguoiThucHien !== userId && t.nguoiTao !== userId) return false;
      if (department && department !== "Tất cả" && t.tenPB !== department) return false;
      if (year !== undefined && t.nam !== year) return false;
      if (quarter && quarter !== "all" && t.quy !== Number(quarter)) return false;
      if (status && status !== "all" && t.trangThai !== status) return false;
      return true;
    });
  }, [tasks, userId, department, year, quarter, status]);
}
