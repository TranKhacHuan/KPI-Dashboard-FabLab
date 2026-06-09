import { toast } from "sonner";

export async function executeWithFeedback<T>(
  action: () => Promise<T>,
  messages: { success: string; error?: string }
): Promise<T | null> {
  try {
    const result = await action();
    toast(messages.success);
    return result;
  } catch (error) {
    toast(messages.error ?? "Đã có lỗi xảy ra!");
    console.error(error);
    return null;
  }
}
