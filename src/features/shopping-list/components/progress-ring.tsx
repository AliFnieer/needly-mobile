import Svg, { Circle } from 'react-native-svg';
import { type ReactNode } from 'react';
import { View } from 'react-native';

type ProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  trackColor?: string;
  color?: string;
  children?: ReactNode;
};

/**
 * Circular progress donut. Matches the Figma "progress-ring-component":
 * a track stroked with the outline color, plus an amber arc that sweeps
 * clockwise from the top (dash rendering is kept frame-friendly with a
 * `rotation` transform and a negative `rotation` on the group, so it renders
 * identically in light/dark). Values clamp to [0,1]; children (e.g. the
 * percentage label) render in the center.
 */
export function ProgressRing({
  progress,
  size = 48,
  strokeWidth = 4.5,
  trackColor = '#E6E2DE',
  color = '#F5B82E',
  children,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - clamped);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation={-90}
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children}
    </View>
  );
}