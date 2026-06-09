import { useState } from "react";
import { executeWithFeedback } from "@/utils/asyncAction";

export function useTaskAction(
  storeAction: (maCV: string) => Promise<void>,
  messages: { success: string; error?: string }
) {
  const [loading, setLoading] = useState(false);

  const execute = async (maCV: string): Promise<boolean> => {
    setLoading(true);
    const result = await executeWithFeedback(() => storeAction(maCV), messages);
    setLoading(false);
    return result !== null;
  };

  return { loading, execute };
}
