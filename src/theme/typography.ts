import { Platform, TextStyle } from 'react-native';

// iOS uses SF Pro; fallback for dev on Android
const fontFamily = Platform.select({ ios: undefined, android: 'Roboto' });

export const typography = {
  // Display
  display1: { fontSize: 32, fontWeight: '700', lineHeight: 40, color: '#191F28', fontFamily } as TextStyle,
  display2: { fontSize: 28, fontWeight: '700', lineHeight: 36, color: '#191F28', fontFamily } as TextStyle,

  // Title
  title1:   { fontSize: 22, fontWeight: '700', lineHeight: 30, color: '#191F28', fontFamily } as TextStyle,
  title2:   { fontSize: 18, fontWeight: '700', lineHeight: 26, color: '#191F28', fontFamily } as TextStyle,
  title3:   { fontSize: 16, fontWeight: '600', lineHeight: 24, color: '#191F28', fontFamily } as TextStyle,

  // Body
  body1:    { fontSize: 16, fontWeight: '400', lineHeight: 24, color: '#191F28', fontFamily } as TextStyle,
  body2:    { fontSize: 14, fontWeight: '400', lineHeight: 22, color: '#191F28', fontFamily } as TextStyle,

  // Label
  label1:   { fontSize: 14, fontWeight: '600', lineHeight: 20, color: '#191F28', fontFamily } as TextStyle,
  label2:   { fontSize: 12, fontWeight: '600', lineHeight: 18, color: '#191F28', fontFamily } as TextStyle,

  // Caption
  caption:  { fontSize: 12, fontWeight: '400', lineHeight: 18, color: '#8B95A1', fontFamily } as TextStyle,
  caption2: { fontSize: 11, fontWeight: '400', lineHeight: 16, color: '#8B95A1', fontFamily } as TextStyle,
} as const;
