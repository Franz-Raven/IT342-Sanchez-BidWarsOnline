import { useState, useCallback } from 'react';

interface UseActiveSessionOptions<T> {
  checkSession: () => Promise<{ hasActiveSession: boolean; session?: T }>;
  onSessionFound?: (session: T) => void;
}

export function useActiveSession<T>({ checkSession, onSessionFound }: UseActiveSessionOptions<T>) {
  const [showModal, setShowModal] = useState(false);
  const [sessionData, setSessionData] = useState<T | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const check = useCallback(async () => {
    setIsChecking(true);
    try {
      const result = await checkSession();
      if (result.hasActiveSession && result.session) {
        setSessionData(result.session);
        setShowModal(true);
        if (onSessionFound) {
          onSessionFound(result.session);
        }
      }
    } catch (err) {
      console.error('Failed to check active session:', err);
    } finally {
      setIsChecking(false);
    }
  }, [checkSession, onSessionFound]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSessionData(null);
  }, []);

  return {
    showModal,
    sessionData,
    isChecking,
    check,
    closeModal,
    setShowModal,
  };
}
