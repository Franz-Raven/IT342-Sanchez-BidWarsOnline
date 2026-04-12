import { WalletResponse } from "@/types/wallet";
import { apiRequest } from "@/lib/api";

export async function getWallet(): Promise<WalletResponse> {
  return apiRequest<WalletResponse>("/wallet/me");
}
