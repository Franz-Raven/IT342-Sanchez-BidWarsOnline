import { useState, useEffect } from 'react';
import { getWallet } from '@/features/wallet/api/wallet';

export function useWallet() {
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWallet();

    // Listen for wallet change events
    const handleWalletChange = () => {
      loadWallet();
    };

    window.addEventListener('walletChange', handleWalletChange);
    return () => window.removeEventListener('walletChange', handleWalletChange);
  }, []);

  const loadWallet = async () => {
    try {
      const res = await getWallet();
      if (res.success && res.data) {
        setBalance(parseFloat(res.data.balance));
      }
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch wallet:', err);
      setError('Failed to load wallet');
      setIsLoading(false);
    }
  };

  const updateBalance = (newBalance: number) => {
    setBalance(newBalance);
    window.dispatchEvent(new Event('walletChange'));
  };

  return {
    balance,
    setBalance: updateBalance,
    isLoading,
    error,
    refresh: loadWallet,
  };
}




