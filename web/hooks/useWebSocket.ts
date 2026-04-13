import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface UseWebSocketOptions {
  onGameResult?: (result: any) => void;
  onWalletUpdate?: (balance: number) => void;
  gameType?: 'MINES' | 'HILO' | 'PLINKO';
}

export function useWebSocket({ onGameResult, onWalletUpdate, gameType }: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const stompClientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    const socket = new SockJS('http://localhost:8080/ws-gaming');
    const stompClient = new Client({
      webSocketFactory: () => socket,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      onConnect: () => {
        console.log('WebSocket connected');
        setIsConnected(true);

        // Subscribe to wallet updates
        stompClient.subscribe('/user/topic/wallet', (message) => {
          try {
            const walletUpdate = JSON.parse(message.body);
            if (onWalletUpdate) {
              onWalletUpdate(walletUpdate.balance);
            }
            window.dispatchEvent(new Event('walletChange'));
          } catch (err) {
            console.error('Failed to parse wallet update:', err);
          }
        });

        // Subscribe to game results
        stompClient.subscribe('/user/topic/game-results', (message) => {
          try {
            const gameResult = JSON.parse(message.body);
            
            // Filter by game type if specified
            if (gameType && gameResult.gameType !== gameType) {
              return;
            }
            
            if (onGameResult) {
              onGameResult(gameResult);
            }
          } catch (err) {
            console.error('Failed to parse game result:', err);
          }
        });
      },
      onDisconnect: () => {
        console.log('WebSocket disconnected');
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame);
        setIsConnected(false);
      },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
      if (stompClientRef.current?.active) {
        stompClientRef.current.deactivate();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { isConnected, client: stompClientRef.current };
}
