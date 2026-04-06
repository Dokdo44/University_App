import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { firestore } from './firebase';
import { CoupleSpace } from '../types/movie';

const COUPLE_SPACES = 'couple_spaces';
const USERS_META    = 'users_meta';

// ── helpers ────────────────────────────────────────────────────────────
function randomCode(len = 6): string {
  return Math.random().toString(36).toUpperCase().slice(2, 2 + len);
}

function toSpace(id: string, data: any): CoupleSpace {
  return {
    id,
    user1Id:   data.user1Id,
    user2Id:   data.user2Id   ?? '',
    user1Name: data.user1Name ?? '',
    user2Name: data.user2Name ?? '',
    inviteCode: data.inviteCode,
    createdAt: data.createdAt?.toDate?.() ?? new Date(),
  };
}

// ── user meta ──────────────────────────────────────────────────────────
export async function getUserMeta(userId: string) {
  const snap = await getDoc(doc(firestore, USERS_META, userId));
  return snap.exists() ? snap.data() : null;
}

export async function setUserMeta(userId: string, displayName: string, coupleSpaceId: string | null) {
  await setDoc(doc(firestore, USERS_META, userId), { displayName, coupleSpaceId }, { merge: true });
}

export async function getCoupleSpaceId(userId: string): Promise<string | null> {
  const meta = await getUserMeta(userId);
  return meta?.coupleSpaceId ?? null;
}

// ── couple space ───────────────────────────────────────────────────────
export async function createCoupleSpace(userId: string, displayName: string): Promise<CoupleSpace> {
  const spaceRef  = doc(collection(firestore, COUPLE_SPACES));
  const inviteCode = randomCode();

  const data = {
    user1Id:   userId,
    user2Id:   '',
    user1Name: displayName,
    user2Name: '',
    inviteCode,
    createdAt: serverTimestamp(),
  };

  await setDoc(spaceRef, data);
  await setUserMeta(userId, displayName, spaceRef.id);

  return toSpace(spaceRef.id, { ...data, createdAt: new Date() });
}

export async function joinCoupleSpace(
  userId: string,
  displayName: string,
  inviteCode: string,
): Promise<CoupleSpace> {
  const q    = query(collection(firestore, COUPLE_SPACES), where('inviteCode', '==', inviteCode.toUpperCase()));
  const snap = await getDocs(q);

  if (snap.empty) throw new Error('유효하지 않은 초대 코드입니다.');

  const spaceDoc = snap.docs[0];
  const data     = spaceDoc.data();

  if (data.user2Id) throw new Error('이미 파트너가 있는 공간입니다.');
  if (data.user1Id === userId) throw new Error('자신의 초대 코드로 참여할 수 없습니다.');

  await updateDoc(spaceDoc.ref, { user2Id: userId, user2Name: displayName });
  await setUserMeta(userId, displayName, spaceDoc.id);

  return toSpace(spaceDoc.id, { ...data, user2Id: userId, user2Name: displayName });
}

export async function getCoupleSpace(spaceId: string): Promise<CoupleSpace | null> {
  const snap = await getDoc(doc(firestore, COUPLE_SPACES, spaceId));
  if (!snap.exists()) return null;
  return toSpace(snap.id, snap.data());
}
