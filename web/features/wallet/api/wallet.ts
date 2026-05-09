import { WalletResponse } from "@/features/wallet/types/wallet";
import { apiRequest } from "@/shared/api/api";

export async function getWallet(): Promise<WalletResponse> {
  return apiRequest<WalletResponse>("/wallet/me");
}




