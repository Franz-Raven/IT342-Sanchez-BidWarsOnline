import { HiloBetRequest, HiloResult } from '@/types/hilo';

const API_BASE_URL = 'http://localhost:8080';

export async function placeHiloBet(request: HiloBetRequest): Promise<HiloResult> {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`${API_BASE_URL}/api/games/hilo/bet`, {
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

  const data = await response.json();
  return data.data;
}
