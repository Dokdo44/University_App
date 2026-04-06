export type MovieStatus = 'want_to_watch' | 'watched' | 'rewatch';

export const STATUS_LABELS: Record<MovieStatus, string> = {
  want_to_watch: '보고 싶음',
  watched:       '봄',
  rewatch:       '다시 보기',
};

export const PLATFORM_OPTIONS = [
  '극장', '넷플릭스', '왓챠', '디즈니+', '웨이브', '애플TV+', '유튜브', '기타',
];

export const GENRE_OPTIONS = [
  '액션', '드라마', '코미디', '로맨스', 'SF', '공포',
  '애니메이션', '다큐', '스릴러', '판타지', '범죄', '기타',
];

export interface CoupleSpace {
  id: string;
  user1Id: string;
  user2Id: string;
  user1Name: string;
  user2Name: string;
  inviteCode: string;
  createdAt: Date;
}

export interface Movie {
  id: string;
  coupleSpaceId: string;
  title: string;
  posterUrl: string;
  status: MovieStatus;
  watchedAt: Date | null;
  platform: string;
  genres: string[];
  ratingUser1: number | null;
  ratingUser2: number | null;
  commentUser1: string;
  commentUser2: string;
  year: string;
  director: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface MovieFormData {
  title: string;
  posterUrl: string;
  status: MovieStatus;
  watchedAt: Date | null;
  platform: string;
  genres: string[];
  ratingUser1: number | null;
  ratingUser2: number | null;
  commentUser1: string;
  commentUser2: string;
  year: string;
  director: string;
}
