import React, { useEffect, useRef } from 'react';
import {
  AccessibilityInfo,
  Animated,
  DimensionValue,
  Easing,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { colors, floatingShadow, radii } from '../theme';
import { IconBack } from './Icons';
import { IconButton } from './Primitives';

type Tone = 'strong' | 'soft' | 'hero';

const TONE: Record<Tone, string> = {
  strong: colors.skeleton,
  soft: colors.divider,
  hero: colors.tealPressed,
};

export function SkeletonGroup({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let loop: Animated.CompositeAnimation | null = null;
    let cancelled = false;
    const useNativeDriver = Platform.OS !== 'web';
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (reduced || cancelled) return;
      loop = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.55,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver,
          }),
        ])
      );
      loop.start();
    });
    return () => {
      cancelled = true;
      loop?.stop();
    };
  }, [opacity]);

  return (
    <Animated.View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={label}
      accessibilityState={{ busy: true }}
      style={[{ opacity }, style]}
    >
      {children}
    </Animated.View>
  );
}

export function Skeleton({
  width = '100%',
  height,
  radius,
  tone = 'soft',
  style,
}: {
  width?: DimensionValue;
  height: number;
  radius?: number;
  tone?: Tone;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius: radius ?? height / 2,
          backgroundColor: TONE[tone],
          flexShrink: 0,
        },
        style,
      ]}
    />
  );
}

export function SkeletonRow({ boxed, trailing = true }: { boxed?: boolean; trailing?: boolean }) {
  return (
    <View style={[styles.row, boxed && styles.rowBoxed]}>
      <Skeleton width={48} height={48} />
      <View style={styles.rowText}>
        <Skeleton width={140} height={16} tone="strong" />
        <Skeleton width={110} height={12} />
      </View>
      {trailing ? <Skeleton width={74} height={28} /> : null}
    </View>
  );
}

export function SkeletonList({
  rows = 3,
  label,
  boxed,
  style,
}: {
  rows?: number;
  label: string;
  boxed?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SkeletonGroup label={label} style={[styles.list, style]}>
      {Array.from({ length: rows }, (_, index) => (
        <SkeletonRow key={index} boxed={boxed} />
      ))}
    </SkeletonGroup>
  );
}

export function PetDetailSkeleton({ top, onBack }: { top: number; onBack?: () => void }) {
  return (
    <View style={styles.screen}>
      <View style={[styles.hero, { paddingTop: top }]}>
        <View style={styles.heroTop}>
          {onBack ? (
            <IconButton label="Volver" onPress={onBack} onTeal>
              <IconBack color={colors.onTeal} />
            </IconButton>
          ) : (
            <Skeleton width={44} height={44} tone="hero" />
          )}
          <View style={{ flex: 1 }} />
          <Skeleton width={44} height={44} tone="hero" />
        </View>
        <SkeletonGroup label="Cargando la ficha" style={styles.heroRow}>
          <View style={{ flex: 1, gap: 12 }}>
            <Skeleton width={150} height={34} radius={radii.small} tone="hero" />
            <Skeleton width={200} height={14} tone="hero" />
          </View>
          <Skeleton width={72} height={72} tone="hero" />
        </SkeletonGroup>
      </View>
      <SkeletonGroup label="Cargando el carnet" style={styles.detailBody}>
        <View style={styles.floatCard}>
          <Skeleton width={130} height={14} />
          <View style={styles.between}>
            <Skeleton width={170} height={44} radius={radii.small} tone="strong" />
            <Skeleton width={88} height={72} radius={radii.tile} />
          </View>
          <View style={styles.between}>
            <Skeleton width={120} height={20} tone="strong" />
            <Skeleton width={84} height={28} />
          </View>
        </View>
        <Skeleton width={150} height={20} tone="strong" style={{ marginTop: 8 }} />
        <SkeletonRow boxed />
        <SkeletonRow boxed />
        <SkeletonRow boxed />
      </SkeletonGroup>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    height: 72,
  },
  rowBoxed: {
    padding: 12,
    borderRadius: radii.row,
    backgroundColor: colors.surface,
  },
  rowText: {
    flex: 1,
    gap: 8,
  },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  hero: {
    backgroundColor: colors.teal,
    borderBottomLeftRadius: radii.hero,
    borderBottomRightRadius: radii.hero,
    paddingHorizontal: 20,
    paddingBottom: 60,
    gap: 12,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailBody: {
    marginTop: -40,
    paddingHorizontal: 20,
    gap: 8,
  },
  floatCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 20,
    gap: 12,
    ...floatingShadow,
  },
  between: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
