import React from 'react';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';
import { colors } from '../theme';

type IconProps = { size?: number; color?: string; strokeWidth?: number };

function Base({
  size = 22,
  color = colors.ink,
  strokeWidth = 2,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

export const IconBack = (p: IconProps) => (
  <Base {...p}>
    <Path d="M15 5l-7 7 7 7" />
  </Base>
);

export const IconChevronRight = (p: IconProps) => (
  <Base {...p}>
    <Path d="M9 5l7 7-7 7" />
  </Base>
);

export const IconChevronDown = (p: IconProps) => (
  <Base {...p}>
    <Path d="M6 9l6 6 6-6" />
  </Base>
);

export const IconClose = (p: IconProps) => (
  <Base strokeWidth={2.2} {...p}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Base>
);

export const IconPlus = (p: IconProps) => (
  <Base strokeWidth={2.2} {...p}>
    <Path d="M12 5v14M5 12h14" />
  </Base>
);

export const IconCheck = (p: IconProps) => (
  <Base strokeWidth={2.6} {...p}>
    <Path d="M5 12.5l4.5 4.5L19 7.5" />
  </Base>
);

export const IconMore = ({ size = 22, color = colors.ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Circle cx="5" cy="12" r="1.8" />
    <Circle cx="12" cy="12" r="1.8" />
    <Circle cx="19" cy="12" r="1.8" />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Base strokeWidth={1.9} {...p}>
    <Rect x="3.5" y="5" width="17" height="15" rx="3" />
    <Path d="M3.5 10h17M8 3v4M16 3v4" />
  </Base>
);

export const IconPaw = ({ size = 22, color = colors.ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Circle cx="6" cy="10" r="2" />
    <Circle cx="10" cy="5.5" r="2" />
    <Circle cx="16" cy="5.5" r="2" />
    <Circle cx="20" cy="10" r="2" />
    <Path d="M12 11c-3 0-6 3.5-6 6 0 2 1.7 2.8 3.2 2.5 1-.2 1.8-.5 2.8-.5s1.8.3 2.8.5c1.5.3 3.2-.5 3.2-2.5 0-2.5-3-6-6-6z" />
  </Svg>
);

export const IconMapPin = (p: IconProps) => (
  <Base strokeWidth={1.9} {...p}>
    <Path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
    <Circle cx="12" cy="9.5" r="2.5" />
  </Base>
);

// Jeringa: vacuna
export const IconSyringe = (p: IconProps) => (
  <Base strokeWidth={1.8} {...p}>
    <Path d="M18 2l4 4M17 7l3-3M19 9l-8.5 8.5-4-4L15 5M6.5 13.5L3 17l4 4 3.5-3.5M9 11l4 4" />
  </Base>
);

// Insecto: desparasitante externo
export const IconBug = (p: IconProps) => (
  <Base strokeWidth={1.8} {...p}>
    <Ellipse cx="12" cy="13.5" rx="5" ry="6.5" />
    <Path d="M12 7v13M7 12H3M7 16H4M17 12h4M17 16h3M9 4l2 3M15 4l-2 3" />
  </Base>
);

// Cápsula: desparasitante interno
export const IconPill = (p: IconProps) => (
  <Base strokeWidth={1.8} {...p}>
    <Rect x="3" y="8.5" width="18" height="7" rx="3.5" transform="rotate(-35 12 12)" />
    <Path d="M9.2 15.2l5.6-6.4" />
  </Base>
);

export const IconGrid = (p: IconProps) => (
  <Base {...p}>
    <Path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z" />
  </Base>
);

export const IconClock = (p: IconProps) => (
  <Base strokeWidth={2.2} {...p}>
    <Circle cx="12" cy="12" r="8.5" />
    <Path d="M12 7.5V12l3 2" />
  </Base>
);

export const IconBag = (p: IconProps) => (
  <Base {...p}>
    <Path d="M5 8h14l-1 12H6L5 8z" />
    <Path d="M9 8V7a3 3 0 0 1 6 0v1" />
  </Base>
);

export const IconNavigation = ({ size = 22, color = colors.ink }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M3 11l18-8-8 18-2-8-8-2z" />
  </Svg>
);

export const IconPhone = (p: IconProps) => (
  <Base {...p}>
    <Path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </Base>
);

export const IconLocate = (p: IconProps) => (
  <Base {...p}>
    <Circle cx="12" cy="12" r="3.2" />
    <Circle cx="12" cy="12" r="7.2" />
    <Path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
  </Base>
);

export const IconCross = (p: IconProps) => (
  <Base strokeWidth={2.6} {...p}>
    <Path d="M12 5.5v13M5.5 12h13" />
  </Base>
);
