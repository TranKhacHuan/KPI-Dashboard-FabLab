import { create } from "zustand";
import { apiRequest } from "@/api/client";
import { iso, quarterOf } from "@/utils/dateUtils";
import { generateTaskId } from "@/utils/taskUtils";

export type Role = "member" | "leader" | "manager";
export type Department = "Kỹ thuật" | "STEM" | "Tất cả";
export type TaskStatus = "chua_duyet" | "cho_duyet" | "duoc_duyet" | "khong_chap_thuan" | "hoan_thanh";

export interface User {
  id: string;
  name: string;
  role: Role;
  department: Department;
  avatar?: string;
}

export interface Task {
  maCV: string;
  tenCV: string;
  ngayMucTieu: string; // ISO date
  tenPB: Department;
  ngayTao: string;
  nguoiTao: string; // user id
  nguoiThucHien: string; // user id (assignee)
  ngayDuyet?: string;
  trangThai: TaskStatus;
  moTa?: string;
  quy: 1 | 2 | 3 | 4;
  nam: number;
}

interface AppState {
  users: User[];
  tasks: Task[];
  isLoading: boolean;
  currentUserId: string;
  setCurrentUser: (id: string) => void;
  fetchData: () => Promise<void>;
  createTask: (t: Omit<Task, "maCV" | "ngayTao" | "trangThai" | "quy" | "nam"> & { trangThai?: TaskStatus }) => Promise<void>;
  updateTask: (maCV: string, patch: Partial<Task>) => Promise<void>;
  deleteTask: (maCV: string) => Promise<void>;
  approveTask: (maCV: string) => Promise<void>;
  rejectTask: (maCV: string) => Promise<void>;
  submitForApproval: (maCV: string) => Promise<void>;
  completeTask: (maCV: string) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  users: [],
  tasks: [],
  isLoading: false,
  currentUserId: "u3",

  setCurrentUser: (id) => set({ currentUserId: id }),

  fetchData: async () => {
    set({ isLoading: true });
    try {
      const data = await apiRequest({ action: "getData" }, "GET") as { users: User[]; tasks: Task[] };
      set({
        users: data.users || [],
        tasks: data.tasks || [],
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      set({ isLoading: false });
    }
  },

  createTask: async (t) => {
    set({ isLoading: true });
    const ngayTao = iso(new Date());
    const idx = get().tasks.filter((x) => x.tenPB === t.tenPB).length + 1;
    const maCV = generateTaskId(t.tenPB, idx);

    const data: Task = {
      ...t,
      maCV,
      ngayTao,
      trangThai: t.trangThai ?? "chua_duyet",
      quy: quarterOf(ngayTao),
      nam: new Date().getFullYear(),
    };

    try {
      await apiRequest({ action: "createTask", data: JSON.stringify(data) }, "POST");
      set({ tasks: [data, ...get().tasks], isLoading: false });
    } catch (error) {
      console.error("Failed to create task:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateTask: async (maCV, patch) => {
    set({ isLoading: true });
    try {
      await apiRequest({ action: "updateTask", maCV, data: JSON.stringify(patch) }, "POST");
      set({
        tasks: get().tasks.map((t) => (t.maCV === maCV ? { ...t, ...patch } : t)),
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  deleteTask: async (maCV) => {
    set({ isLoading: true });
    try {
      await apiRequest({ action: "deleteTask", maCV }, "POST");
      set({
        tasks: get().tasks.filter((t) => t.maCV !== maCV),
        isLoading: false,
      });
    } catch (error) {
      console.error("Failed to delete task:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  approveTask: async (maCV) => {
    await get().updateTask(maCV, {
      trangThai: "duoc_duyet",
      ngayDuyet: iso(new Date()),
    });
  },

  rejectTask: async (maCV) => {
    await get().updateTask(maCV, { trangThai: "khong_chap_thuan" });
  },

  submitForApproval: async (maCV) => {
    await get().updateTask(maCV, { trangThai: "cho_duyet" });
  },

  completeTask: async (maCV) => {
    await get().updateTask(maCV, { trangThai: "hoan_thanh" });
  },
}));

export const statusLabel: Record<TaskStatus, string> = {
  chua_duyet: "Chưa duyệt",
  cho_duyet: "Chờ duyệt",
  duoc_duyet: "Được duyệt",
  khong_chap_thuan: "Không chấp thuận",
  hoan_thanh: "Hoàn thành",
};

export const statusTone: Record<TaskStatus, string> = {
  chua_duyet: "bg-muted text-muted-foreground border-border",
  cho_duyet: "bg-warning/15 text-warning border-warning/30",
  duoc_duyet: "bg-primary/10 text-primary border-primary/20",
  khong_chap_thuan: "bg-destructive/10 text-destructive border-destructive/20",
  hoan_thanh: "bg-success/15 text-success border-success/30",
};
