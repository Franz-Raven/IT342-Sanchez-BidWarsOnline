import { apiRequest } from "@/shared/api/api";
import { PlaceBetRequest, PlaceBetResponse } from "@/shared/types/game";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
  };
  timestamp: string;
}

export async function placeBet(payload: PlaceBetRequest) {
  const result = await apiRequest<ApiResponse<PlaceBetResponse>>("/games/bet", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!result.success) {
    throw new Error(result.error?.message || "Failed to place bet");
  }
  return result.data;
}



