import { useLocation } from "react-router-dom";
import { useAppStore } from "@/store/app-store";
import MemberView from "./MemberView";
import LeaderView from "./LeaderView";
import ManagerView from "./ManagerView";

export default function Index() {
  console.log("Rendering Index page...");
  const { pathname } = useLocation();
  const { users, currentUserId, isLoading } = useAppStore();
  const user = users.find((u) => u.id === currentUserId);
  
  if (isLoading && users.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center animate-pulse">
        <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin mb-4" />
        <div className="text-lg font-medium text-primary">Đang kết nối hệ thống...</div>
        <div className="text-sm text-muted-foreground mt-1">Đang tải dữ liệu từ Google Sheets</div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-8 text-center text-muted-foreground">Không tìm thấy dữ liệu người dùng.</div>;
  }

  const role = user.role;
  
  if (role === "manager") return <ManagerView path={pathname} />;
  if (role === "leader") return <LeaderView path={pathname} />;
  return <MemberView path={pathname} />;
}
