import { Calendar, Building2, User, Pencil, Trash2, Send, CheckCircle2, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAppStore, statusLabel, statusTone, type Task } from "@/store/app-store";
import { format } from "date-fns";
import { useState } from "react";
import { TaskDialog } from "./TaskDialog";
import { getTaskPermissions } from "@/utils/taskPermissions";
import { useUser, useCurrentUser } from "@/hooks/useUser";
import { useTaskAction } from "@/hooks/useTaskAction";

interface Props {
  task: Task;
  showAssignee?: boolean;
  showActions?: boolean;
}

export function TaskCard({ task, showAssignee = true, showActions = true }: Props) {
  const { deleteTask, submitForApproval, completeTask } = useAppStore();
  const me = useCurrentUser();
  const assignee = useUser(task.nguoiThucHien);
  const creator = useUser(task.nguoiTao);

  const { canEdit, canDelete, canSubmit, canComplete } = getTaskPermissions(task, me);

  const [editing, setEditing] = useState(false);

  const deleteAction = useTaskAction(deleteTask, { success: "Đã xóa task!", error: "Không thể xóa task." });
  const submitAction = useTaskAction(submitForApproval, { success: "Đã gửi yêu cầu duyệt!", error: "Lỗi khi gửi duyệt." });
  const completeAction = useTaskAction(completeTask, { success: "Đã hoàn thành task!", error: "Lỗi khi cập nhật." });

  const isLoading = deleteAction.loading || submitAction.loading || completeAction.loading;

  return (
    <>
      <Card className="group relative overflow-hidden border-border bg-card p-5 transition-smooth hover:shadow-elegant hover:-translate-y-0.5">
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-primary opacity-60 group-hover:opacity-100 transition-smooth" />

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-[10px] tracking-wider text-muted-foreground">{task.maCV}</span>
              <Badge variant="outline" className={`text-[10px] h-5 ${statusTone[task.trangThai]}`}>
                {statusLabel[task.trangThai]}
              </Badge>
            </div>
            <h3 className="font-display text-lg font-semibold leading-tight text-foreground">{task.tenCV}</h3>
            {task.moTa && <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{task.moTa}</p>}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-primary" />
            <span>{format(new Date(task.ngayMucTieu), "dd/MM/yyyy")}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{task.tenPB}</span>
          </div>
          {showAssignee && assignee && (
            <div className="flex items-center gap-1.5 col-span-2">
              <User className="h-3.5 w-3.5 text-accent" />
              <span className="truncate">{assignee.name}</span>
              {creator && creator.id !== assignee.id && (
                <span className="text-[10px] italic">· tạo bởi {creator.name}</span>
              )}
            </div>
          )}
        </div>

        {showActions && (canEdit || canDelete || canSubmit || canComplete) && (
          <div className="mt-4 flex flex-wrap gap-2 pt-3 border-t border-border">
            {canEdit && (
              <Button size="sm" variant="outline" onClick={() => setEditing(true)} disabled={isLoading}>
                <Pencil className="h-3.5 w-3.5 mr-1" /> Sửa
              </Button>
            )}
            {canDelete && (
              <Button
                size="sm"
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => deleteAction.execute(task.maCV)}
                disabled={isLoading}
              >
                {deleteAction.loading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                )}{" "}
                Xóa
              </Button>
            )}
            {canSubmit && (
              <Button
                size="sm"
                onClick={() => submitAction.execute(task.maCV)}
                disabled={isLoading}
                className="bg-gradient-primary text-primary-foreground"
              >
                {submitAction.loading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5 mr-1" />
                )}{" "}
                Gửi duyệt
              </Button>
            )}
            {canComplete && (
              <Button
                size="sm"
                onClick={() => completeAction.execute(task.maCV)}
                disabled={isLoading}
                className="bg-success/90 hover:bg-success text-white"
              >
                {completeAction.loading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                )}{" "}
                Đánh dấu hoàn thành
              </Button>
            )}
          </div>
        )}
      </Card>

      <TaskDialog open={editing} onOpenChange={setEditing} task={task} />
    </>
  );
}
