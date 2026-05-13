import { useAppStore } from "@/store/app-store";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const roleLabel = { member: "Member", leader: "Leader", manager: "Manager" } as const;

export function TopBar() {
  const { users, currentUserId, setCurrentUser } = useAppStore();
  const current = users.find((u) => u.id === currentUserId);
  if (!current) return null;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-border bg-background/80 px-4 backdrop-blur-md md:px-8">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-foreground" />
        <div className="hidden sm:flex flex-col leading-tight">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Workspace</span>
          <span className="font-display text-sm font-semibold">Quản lý công việc team</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground">
          <span>Đang xem với vai trò</span>
        </div>
        <Select value={currentUserId} onValueChange={setCurrentUser}>
          <SelectTrigger className="w-full max-w-[280px] md:w-[280px] h-11 rounded-xl border-border bg-card shadow-soft">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {users.map((u) => (
              <SelectItem key={u.id} value={u.id}>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{u.name}</span>
                  <Badge variant="outline" className="text-[10px] h-5 border-primary/30 text-primary">
                    {roleLabel[u.role]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">· {u.department}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-elegant">
          {current.name.split(" ").pop()?.[0]}
        </div>
      </div>
    </header>
  );
}
