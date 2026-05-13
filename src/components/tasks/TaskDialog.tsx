import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppStore, type Task, type Department } from "@/store/app-store";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  task?: Task; // edit mode
  forAssignee?: string; // leader giao cho member
  title?: string;
}

export function TaskDialog({ open, onOpenChange, task, forAssignee, title }: Props) {
  const { users, currentUserId, createTask, updateTask } = useAppStore();
  const current = users.find((u) => u.id === currentUserId)!;

  const [tenCV, setTenCV] = useState("");
  const [moTa, setMoTa] = useState("");
  const [ngayMucTieu, setNgayMucTieu] = useState("");
  const [tenPB, setTenPB] = useState<Department>(current.department);
  const [assignee, setAssignee] = useState<string>(forAssignee ?? current.id);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (task) {
      setTenCV(task.tenCV);
      setMoTa(task.moTa ?? "");
      setNgayMucTieu(task.ngayMucTieu);
      setTenPB(task.tenPB);
      setAssignee(task.nguoiThucHien);
    } else {
      setTenCV("");
      setMoTa("");
      setNgayMucTieu("");
      setTenPB(current.department);
      setAssignee(forAssignee ?? current.id);
    }
  }, [task, open, current.department, current.id, forAssignee]);

  const handleSave = async () => {
    if (!tenCV || !ngayMucTieu) return;
    setIsSubmitting(true);
    try {
      if (task) {
        await updateTask(task.maCV, { tenCV, moTa, ngayMucTieu, tenPB, nguoiThucHien: assignee });
        toast("Cập nhật thành công!");
      } else {
        await createTask({
          tenCV,
          moTa,
          ngayMucTieu,
          tenPB,
          nguoiTao: current.id,
          nguoiThucHien: assignee,
          // Leader tạo task (cho mình hoặc giao cho member) -> tự được duyệt
          trangThai: current.role === "leader" ? "duoc_duyet" : "chua_duyet",
          ngayDuyet: current.role === "leader" ? new Date().toISOString().slice(0, 10) : undefined,
        });
        toast("Tạo task thành công!");
      }
      onOpenChange(false);
    } catch (e) {
      toast("Đã có lỗi xảy ra!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const memberOptions = users.filter((u) => u.role === "member" && u.department === tenPB);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{title ?? (task ? "Chỉnh sửa task" : "Tạo task mới")}</DialogTitle>
          <DialogDescription>Điền thông tin công việc bên dưới.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="tenCV">Tên công việc</Label>
            <Input id="tenCV" value={tenCV} onChange={(e) => setTenCV(e.target.value)} placeholder="VD: Refactor module xác thực" />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="moTa">Mô tả</Label>
            <Textarea id="moTa" value={moTa} onChange={(e) => setMoTa(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="ngay">Ngày mục tiêu</Label>
              <Input id="ngay" type="date" value={ngayMucTieu} onChange={(e) => setNgayMucTieu(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label>Phòng ban</Label>
              <Select value={tenPB} onValueChange={(v) => setTenPB(v as Department)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kỹ thuật">Kỹ thuật</SelectItem>
                  <SelectItem value="STEM">STEM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {forAssignee && current.role === "leader" && (
            <div className="grid gap-2">
              <Label>Giao cho</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {memberOptions.map((m) => (
                    <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Hủy</Button>
          <Button onClick={handleSave} disabled={isSubmitting} className="bg-gradient-primary text-primary-foreground hover:opacity-90 min-w-[120px]">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              task ? "Lưu thay đổi" : "Tạo task"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
