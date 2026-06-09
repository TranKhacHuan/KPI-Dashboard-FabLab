import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppStore, type Task, type Department } from "@/store/app-store";
import { getDefaultTaskStatus, getDefaultApprovalDate } from "@/utils/taskUtils";

interface FormValues {
  tenCV: string;
  moTa: string;
  ngayMucTieu: string;
  tenPB: Department;
  assignee: string;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task;
  forAssignee?: string;
  title?: string;
}

export function TaskDialog({ open, onOpenChange, task, forAssignee, title }: Props) {
  const { users, currentUserId, createTask, updateTask } = useAppStore();
  const current = users.find((u) => u.id === currentUserId)!;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    defaultValues: {
      tenCV: "",
      moTa: "",
      ngayMucTieu: "",
      tenPB: current?.department ?? "Kỹ thuật",
      assignee: forAssignee ?? currentUserId,
    },
  });

  useEffect(() => {
    if (!open) return;
    reset(
      task
        ? {
            tenCV: task.tenCV,
            moTa: task.moTa ?? "",
            ngayMucTieu: task.ngayMucTieu,
            tenPB: task.tenPB,
            assignee: task.nguoiThucHien,
          }
        : {
            tenCV: "",
            moTa: "",
            ngayMucTieu: "",
            tenPB: current?.department ?? "Kỹ thuật",
            assignee: forAssignee ?? currentUserId,
          }
    );
  }, [task, open, current?.department, currentUserId, forAssignee, reset]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (task) {
        await updateTask(task.maCV, {
          tenCV: values.tenCV,
          moTa: values.moTa,
          ngayMucTieu: values.ngayMucTieu,
          tenPB: values.tenPB,
          nguoiThucHien: values.assignee,
        });
        toast("Cập nhật thành công!");
      } else {
        await createTask({
          tenCV: values.tenCV,
          moTa: values.moTa,
          ngayMucTieu: values.ngayMucTieu,
          tenPB: values.tenPB,
          nguoiTao: current.id,
          nguoiThucHien: values.assignee,
          trangThai: getDefaultTaskStatus(current.role),
          ngayDuyet: getDefaultApprovalDate(current.role),
        });
        toast("Tạo task thành công!");
      }
      onOpenChange(false);
    } catch {
      toast("Đã có lỗi xảy ra!");
    }
  };

  const memberOptions = users.filter(
    (u) => u.role === "member" && u.department === current?.department
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">
            {title ?? (task ? "Chỉnh sửa task" : "Tạo task mới")}
          </DialogTitle>
          <DialogDescription>Điền thông tin công việc bên dưới.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="tenCV">Tên công việc</Label>
              <Input
                id="tenCV"
                {...register("tenCV", { required: "Vui lòng nhập tên công việc" })}
                placeholder="VD: Refactor module xác thực"
              />
              {errors.tenCV && (
                <p className="text-xs text-destructive">{errors.tenCV.message}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="moTa">Mô tả</Label>
              <Textarea id="moTa" {...register("moTa")} rows={3} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="ngay">Ngày mục tiêu</Label>
                <Input
                  id="ngay"
                  type="date"
                  {...register("ngayMucTieu", { required: "Vui lòng chọn ngày mục tiêu" })}
                />
                {errors.ngayMucTieu && (
                  <p className="text-xs text-destructive">{errors.ngayMucTieu.message}</p>
                )}
              </div>
              <div className="grid gap-2">
                <Label>Phòng ban</Label>
                <Controller
                  name="tenPB"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(v) => field.onChange(v as Department)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kỹ thuật">Kỹ thuật</SelectItem>
                        <SelectItem value="STEM">STEM</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            {forAssignee && current?.role === "leader" && (
              <div className="grid gap-2">
                <Label>Giao cho</Label>
                <Controller
                  name="assignee"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {memberOptions.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            {m.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            )}
          </div>

          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-gradient-primary text-primary-foreground hover:opacity-90 min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang xử lý...
                </>
              ) : task ? (
                "Lưu thay đổi"
              ) : (
                "Tạo task"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
