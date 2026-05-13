import { create } from "zustand";

const API_URL = "https://script.google.com/macros/s/AKfycbzrvI9lS7QKZPPO8dWiL6IXnNgJydVv-C-KLAhzuuJMLJ1Q2Br-XthB1Y12wx78gGACfw/exec";

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

const iso = (d: Date) => d.toISOString().slice(0, 10);
const quarterOf = (date: string): 1 | 2 | 3 | 4 => {
  const m = new Date(date).getMonth() + 1;
  return Math.ceil(m / 3) as 1 | 2 | 3 | 4;
};

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

// Helper for Google Apps Script requests
async function apiRequest(params: any, method: "GET" | "POST" = "GET") {
  const url = new URL(API_URL);

  if (method === "GET") {
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    const response = await fetch(url.toString(), {
      method: "GET",
      mode: "cors",
      redirect: "follow",
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  } else {
    // POST request using form data to ensure compatibility with Apps Script doPost(e.parameter)
    const formData = new URLSearchParams();
    Object.keys(params).forEach(key => formData.append(key, params[key]));

    const response = await fetch(API_URL, {
      method: "POST",
      mode: "cors",
      redirect: "follow",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });
    if (!response.ok) throw new Error("Network response was not ok");
    return response.json();
  }
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
      const data = await apiRequest({ action: "getData" }, "GET");
      set({
        users: data.users || [],
        tasks: data.tasks || [],
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch data:", error);
      set({ isLoading: false });
    }
  },

  createTask: async (t) => {
    set({ isLoading: true });
    const ngayTao = iso(new Date());
    const prefix = t.tenPB === "Kỹ thuật" ? "KT" : "ST";
    const idx = get().tasks.filter((x) => x.tenPB === t.tenPB).length + 1;
    const maCV = `${prefix}-${String(idx).padStart(3, "0")}`;

    const data = {
      ...t,
      maCV,
      ngayTao,
      trangThai: t.trangThai ?? "chua_duyet",
      quy: quarterOf(ngayTao),
      nam: new Date().getFullYear(),
    };

    try {
      await apiRequest({ action: "createTask", data: JSON.stringify(data) }, "POST");
      set({ tasks: [data as Task, ...get().tasks], isLoading: false });
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
        isLoading: false 
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
        isLoading: false 
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
      ngayDuyet: iso(new Date())
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

export const userById = (id: string) => {
  const users = useAppStore.getState().users;
  return users.find((u) => u.id === id);
};
