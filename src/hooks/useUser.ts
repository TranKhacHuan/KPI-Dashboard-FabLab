import { useAppStore, type User } from "@/store/app-store";

export function useUser(id: string): User | undefined {
  return useAppStore((s) => s.users.find((u) => u.id === id));
}

export function useCurrentUser(): User {
  return useAppStore((s) => s.users.find((u) => u.id === s.currentUserId)!);
}
