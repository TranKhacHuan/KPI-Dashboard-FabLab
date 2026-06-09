import type { Task, User } from "@/store/app-store";

export interface TaskPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canSubmit: boolean;
  canComplete: boolean;
}

export function getTaskPermissions(task: Task, currentUser: User): TaskPermissions {
  const isOwner =
    task.nguoiThucHien === currentUser.id || task.nguoiTao === currentUser.id;
  const isPrivileged =
    (currentUser.role === "leader" || currentUser.role === "manager") &&
    (currentUser.department === "Tất cả" || task.tenPB === currentUser.department);

  return {
    canDelete: isPrivileged,
    canEdit:
      (isPrivileged || (isOwner && task.trangThai === "chua_duyet")) &&
      task.trangThai !== "hoan_thanh",
    canSubmit:
      isOwner && task.trangThai === "chua_duyet" && currentUser.role === "member",
    canComplete: isOwner && task.trangThai === "duoc_duyet",
  };
}
