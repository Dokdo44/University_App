// Toss-style color system
export const colors = {
  // Brand
  primary:       '#3182F6',
  primaryLight:  '#EBF3FF',
  primaryDark:   '#1B64DA',

  // Surface
  background:    '#F2F4F6',
  surface:       '#FFFFFF',
  surfaceSecond: '#F8F9FA',

  // Text
  textPrimary:   '#191F28',
  textSecondary: '#8B95A1',
  textTertiary:  '#B0B8C1',
  textInverse:   '#FFFFFF',

  // Border
  border:        '#E5E8EB',
  borderLight:   '#F2F4F6',

  // Semantic
  success:       '#00C471',
  successLight:  '#E8FAF3',
  warning:       '#F7AE00',
  warningLight:  '#FFF8E6',
  error:         '#F04452',
  errorLight:    '#FFF0F1',

  // Course block palette (시간표 색상)
  course: [
    '#3182F6', // blue
    '#00C471', // green
    '#F7AE00', // yellow
    '#E040FB', // purple
    '#FF6D3B', // orange
    '#00B8D9', // teal
    '#F04452', // red
    '#6554C0', // violet
  ],
} as const;
