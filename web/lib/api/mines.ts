import { MinesBetRequest, MinesResult } from "@/types/mines";

const API_BASE_URL = 'http://localhost:8080';

export async function placeMinesBet(request: MinesBetRequest): Promise<MinesResult> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/api/games/mines/bet`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to place bet');
  }

  return response.json();
}
