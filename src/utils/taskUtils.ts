import type { Department, Role, TaskStatus } from "@/store/app-store";
import { iso } from "./dateUtils";

export function generateTaskId(department: Department, taskCount: number): string {
  const prefix = department === "Kỹ thuật" ? "KT" : "ST";
  return `${prefix}-${String(taskCount).padStart(3, "0")}`;
}

export function getDefaultTaskStatus(role: Role): TaskStatus {
  return role === "leader" ? "duoc_duyet" : "chua_duyet";
}

export function getDefaultApprovalDate(role: Role): string | undefined {
  return role === "leader" ? iso(new Date()) : undefined;
}
