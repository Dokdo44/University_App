import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { firestore }                      from './firebase';
import { Movie, MovieFormData, MovieStatus } from '../types/movie';

const MOVIES = 'movies';

// ── converters ─────────────────────────────────────────────────────────
function toMovie(id: string, d: any): Movie {
  return {
    id,
    coupleSpaceId: d.coupleSpaceId ?? '',
    title:         d.title         ?? '',
    posterUrl:     d.posterUrl     ?? '',
    status:        d.status        ?? 'want_to_watch',
    watchedAt:     d.watchedAt instanceof Timestamp ? d.watchedAt.toDate() : null,
    platform:      d.platform      ?? '',
    genres:        d.genres        ?? [],
    ratingUser1:   d.ratingUser1   ?? null,
    ratingUser2:   d.ratingUser2   ?? null,
    commentUser1:  d.commentUser1  ?? '',
    commentUser2:  d.commentUser2  ?? '',
    year:          d.year          ?? '',
    director:      d.director      ?? '',
    createdAt:     d.createdAt instanceof Timestamp ? d.createdAt.toDate() : new Date(),
    updatedAt:     d.updatedAt instanceof Timestamp ? d.updatedAt.toDate() : new Date(),
  };
}

function formToFirestore(form: MovieFormData, coupleSpaceId: string) {
  return {
    coupleSpaceId,
    title:        form.title,
    posterUrl:    form.posterUrl,
    status:       form.status,
    watchedAt:    form.watchedAt ? Timestamp.fromDate(form.watchedAt) : null,
    platform:     form.platform,
    genres:       form.genres,
    ratingUser1:  form.ratingUser1,
    ratingUser2:  form.ratingUser2,
    commentUser1: form.commentUser1,
    commentUser2: form.commentUser2,
    year:         form.year,
    director:     form.director,
  };
}

// ── CRUD ───────────────────────────────────────────────────────────────
export async function addMovie(coupleSpaceId: string, form: MovieFormData): Promise<string> {
  const ref = await addDoc(collection(firestore, MOVIES), {
    ...formToFirestore(form, coupleSpaceId),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateMovie(movieId: string, form: Partial<MovieFormData>): Promise<void> {
  const data: any = { updatedAt: serverTimestamp() };
  if (form.title        !== undefined) data.title        = form.title;
  if (form.posterUrl    !== undefined) data.posterUrl    = form.posterUrl;
  if (form.status       !== undefined) data.status       = form.status;
  if (form.watchedAt    !== undefined) data.watchedAt    = form.watchedAt ? Timestamp.fromDate(form.watchedAt) : null;
  if (form.platform     !== undefined) data.platform     = form.platform;
  if (form.genres       !== undefined) data.genres       = form.genres;
  if (form.ratingUser1  !== undefined) data.ratingUser1  = form.ratingUser1;
  if (form.ratingUser2  !== undefined) data.ratingUser2  = form.ratingUser2;
  if (form.commentUser1 !== undefined) data.commentUser1 = form.commentUser1;
  if (form.commentUser2 !== undefined) data.commentUser2 = form.commentUser2;
  if (form.year         !== undefined) data.year         = form.year;
  if (form.director     !== undefined) data.director     = form.director;
  await updateDoc(doc(firestore, MOVIES, movieId), data);
}

export async function deleteMovie(movieId: string): Promise<void> {
  await deleteDoc(doc(firestore, MOVIES, movieId));
}

export async function getMovie(movieId: string): Promise<Movie | null> {
  const snap = await getDoc(doc(firestore, MOVIES, movieId));
  if (!snap.exists()) return null;
  return toMovie(snap.id, snap.data());
}

// ── real-time subscription ─────────────────────────────────────────────
export function subscribeToMovies(
  coupleSpaceId: string,
  onUpdate: (movies: Movie[]) => void,
): () => void {
  const q = query(
    collection(firestore, MOVIES),
    where('coupleSpaceId', '==', coupleSpaceId),
    orderBy('createdAt', 'desc'),
  );

  return onSnapshot(q, snap => {
    const movies = snap.docs.map(d => toMovie(d.id, d.data()));
    onUpdate(movies);
  });
}

// ── filters ────────────────────────────────────────────────────────────
export function filterMovies(
  movies: Movie[],
  opts: { status?: MovieStatus | 'all'; platform?: string; genre?: string },
): Movie[] {
  return movies.filter(m => {
    if (opts.status  && opts.status  !== 'all' && m.status   !== opts.status)  return false;
    if (opts.platform && opts.platform !== 'all' && m.platform !== opts.platform) return false;
    if (opts.genre   && opts.genre   !== 'all' && !m.genres.includes(opts.genre)) return false;
    return true;
  });
}
