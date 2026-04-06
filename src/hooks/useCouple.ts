import { useEffect, useState } from 'react';
import { User }                from 'firebase/auth';
import { CoupleSpace }         from '../types/movie';
import { getCoupleSpaceId, getCoupleSpace } from '../services/coupleService';

interface UseCoupleResult {
  coupleSpace:    CoupleSpace | null;
  loading:        boolean;
  isUser1:        boolean;
  myName:         string;
  partnerName:    string;
  refresh:        () => void;
}

export function useCouple(user: User | null): UseCoupleResult {
  const [coupleSpace, setCoupleSpace] = useState<CoupleSpace | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [tick,        setTick]        = useState(0);

  useEffect(() => {
    if (!user) { setCoupleSpace(null); setLoading(false); return; }

    setLoading(true);
    getCoupleSpaceId(user.uid)
      .then(spaceId => spaceId ? getCoupleSpace(spaceId) : null)
      .then(space   => { setCoupleSpace(space); setLoading(false); })
      .catch(()     => setLoading(false));
  }, [user?.uid, tick]);

  const isUser1     = coupleSpace?.user1Id === user?.uid;
  const myName      = isUser1 ? (coupleSpace?.user1Name ?? '') : (coupleSpace?.user2Name ?? '');
  const partnerName = isUser1 ? (coupleSpace?.user2Name ?? '') : (coupleSpace?.user1Name ?? '');

  return {
    coupleSpace,
    loading,
    isUser1,
    myName,
    partnerName,
    refresh: () => setTick(t => t + 1),
  };
}
