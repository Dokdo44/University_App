import { useEffect, useState } from 'react';
import { User }                from 'firebase/auth';
import { authService }         from '../services/firebase';

export function useAuth() {
  const [user,    setUser]    = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = authService.onAuthChange(u => {
      setUser(u);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { user, loading, isAuthenticated: user !== null };
}
