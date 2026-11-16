import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CategoryKey,
  StatusKey,
  categoryStyle,
  colors,
  fonts,
  radii,
  status as statusColors,
  type as t,
} from '../theme';
import {
  IconBack,
  IconBug,
  IconChevronDown,
  IconChevronRight,
  IconPill,
  IconSyringe,
} from './Icons';

/* ------------------------------------------------------------------ Avatar */

export function Avatar({ name, size = 96 }: { name: string; size?: number }) {
  const letter = (name.trim().charAt(0) || '?').toUpperCase();
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        backgroundColor: colors.ball,
        alignItems: 'center',
        justifyContent: 'center',
        // Mancha orgánica: radios ligeramente distintos en cada esquina.
        borderTopLeftRadius: size * 0.5,
        borderTopRightRadius: size * 0.44,
        borderBottomRightRadius: size * 0.5,
        borderBottomLeftRadius: size * 0.46,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.display,
          fontSize: size * 0.54,
          lineHeight: size * 0.66,
          color: colors.ink,
          includeFontPadding: false,
        }}
      >
        {letter}
      </Text>
    </View>
  );
}

/* --------------------------------------------------------------- IconButton */

export function IconButton({
  label,
  onPress,
  onTeal,
  ring,
  children,
}: {
  label: string;
  onPress: () => void;
  onTeal?: boolean;
  ring?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.iconButton,
        onTeal && { backgroundColor: colors.onTealGlass },
        ring && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.line },
        pressed && { opacity: 0.7 },
      ]}
    >
      {children}
    </Pressable>
  );
}

/* ------------------------------------------------------------------- TopBar */

export function TopBar({
  title,
  onBack,
  right,
  onTeal,
  ring,
}: {
  title?: string;
  onBack: () => void;
  right?: React.ReactNode;
  onTeal?: boolean;
  ring?: boolean;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ paddingTop: insets.top }}>
      <View style={styles.topBar}>
        <IconButton label="Volver" onPress={onBack} onTeal={onTeal} ring={ring}>
          <IconBack color={onTeal ? colors.onTeal : colors.ink} />
        </IconButton>
        {title ? (
          <Text
            numberOfLines={1}
            accessibilityRole="header"
            style={[t.screenTitle, { flex: 1, color: onTeal ? colors.onTeal : colors.ink }]}
          >
            {title}
          </Text>
        ) : (
          <View style={{ flex: 1 }} />
        )}
        {right}
      </View>
    </View>
  );
}

/* ------------------------------------------------------------------ Buttons */

export function PrimaryButton({
  label,
  onPress,
  loading,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const off = Boolean(loading || disabled);
  return (
    <Pressable
      onPress={onPress}
      disabled={off}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: off, busy: Boolean(loading) }}
      style={({ pressed }) => [
        styles.primary,
        pressed && { backgroundColor: colors.tealPressed },
        disabled && { opacity: 0.55 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors.onTeal} />
      ) : (
        <>
          {icon}
          <Text style={styles.primaryText}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

/** Botón pill de contorno. */
export function GhostButton({
  label,
  onPress,
  tone = 'ink',
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: 'ink' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const color = tone === 'danger' ? colors.danger : colors.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: Boolean(disabled) }}
      style={({ pressed }) => [
        styles.ghost,
        { borderColor: color },
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.5 },
        style,
      ]}
    >
      <Text style={[t.label, { color }]}>{label}</Text>
    </Pressable>
  );
}

/** Botón de solo texto. */
export function TextButton({
  label,
  onPress,
  icon,
  color = colors.teal,
  underline,
  disabled,
  style,
}: {
  label: string;
  onPress: () => void;
  icon?: React.ReactNode;
  color?: string;
  underline?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.textButton, pressed && { opacity: 0.6 }, style]}
    >
      {icon}
      <Text
        style={[
          t.bodySemi,
          { color },
          underline && { textDecorationLine: 'underline' as const },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/* --------------------------------------------------------------------- Chip */

export function Chip({
  label,
  selected,
  onPress,
  height = 44,
  icon,
  iconColor,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  height?: number;
  icon?: (color: string) => React.ReactNode;
  iconColor?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={({ pressed }) => [
        styles.chip,
        {
          height,
          borderRadius: height / 2,
          backgroundColor: selected ? colors.ink : colors.surface,
          borderColor: selected ? colors.ink : colors.line,
        },
        pressed && { opacity: 0.8 },
      ]}
    >
      {icon ? icon(selected ? colors.onTeal : iconColor ?? colors.ink) : null}
      <Text style={[t.label, { color: selected ? colors.onTeal : colors.ink }]}>{label}</Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------- CategoryIcon */

export function CategoryIcon({
  categoria,
  size = 44,
}: {
  categoria: string;
  size?: number;
}) {
  // Tolera ambos nombres que puede traer la API: desparasitacion_* y antiparasitario_*.
  const key: CategoryKey =
    categoria === 'vacuna'
      ? 'vacuna'
      : /intern/i.test(categoria)
      ? 'desparasitacion_interna'
      : 'desparasitacion_externa';
  const { bg, fg } = categoryStyle[key];
  const iconSize = Math.round(size * 0.55);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.3,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {key === 'vacuna' ? (
        <IconSyringe size={iconSize} color={fg} />
      ) : key === 'desparasitacion_interna' ? (
        <IconPill size={iconSize} color={fg} />
      ) : (
        <IconBug size={iconSize} color={fg} />
      )}
    </View>
  );
}

/* -------------------------------------------------------------- StatusPill */

export function StatusPill({ status, label }: { status: StatusKey; label: string }) {
  const c = statusColors[status];
  return (
    <View style={[styles.pill, { backgroundColor: c.bg }]}>
      <Text style={[t.tiny, { color: c.fg, fontFamily: fonts.textSemi }]}>{label}</Text>
    </View>
  );
}

/* -------------------------------------------------------------------- Tile */

export function Tile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.tile}>
      <Text style={[t.tiny, { color: colors.inkSoft }]}>{label}</Text>
      <Text numberOfLines={1} style={{ fontFamily: fonts.displaySemi, fontSize: 14, color: colors.ink }}>
        {value}
      </Text>
    </View>
  );
}

/* -------------------------------------------------------------- DetailLine */

export function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <Text style={[t.tiny, { color: colors.inkSoft }]}>{label}</Text>
      <Text style={[t.body, { color: colors.ink }]}>{value}</Text>
    </View>
  );
}

/* ------------------------------------------------------------- SelectField */

export function SelectField({
  categoria,
  title,
  subtitle,
  onPress,
  label = 'Tratamiento',
}: {
  categoria?: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
  /** Nombre del campo para lectores de pantalla. */
  label?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${title}. Toca para cambiar`}
      style={({ pressed }) => [styles.select, pressed && { opacity: 0.85 }]}
    >
      {categoria ? <CategoryIcon categoria={categoria} size={44} /> : null}
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ fontFamily: fonts.displaySemi, fontSize: 18, lineHeight: 22, color: colors.ink }}>
          {title}
        </Text>
        {subtitle ? <Text style={[t.small, { color: colors.inkSoft }]}>{subtitle}</Text> : null}
      </View>
      <IconChevronDown color={colors.ink} />
    </Pressable>
  );
}

/* --------------------------------------------------------------- TextField */

export function TextField({ label, style, ...input }: { label: string } & TextInputProps) {
  return (
    <View style={{ gap: 8 }}>
      <Text style={[t.label, { color: colors.inkLabel }]}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.placeholder}
        accessibilityLabel={label}
        {...input}
        style={[styles.input, input.multiline && styles.inputMultiline, style]}
      />
    </View>
  );
}

/* ---------------------------------------------------------------- LinkRow */

/** Fila de navegación: icono en cuadrito, texto y flecha. */
export function LinkRow({
  icon,
  label,
  onPress,
  iconBg = colors.mint,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  iconBg?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.85 }]}
    >
      <View style={[styles.linkIcon, { backgroundColor: iconBg }]}>{icon}</View>
      <Text style={[t.rowTitle, { color: colors.ink, flex: 1, fontFamily: fonts.textMedium }]}>
        {label}
      </Text>
      <IconChevronRight color={colors.inkSoft} size={20} />
    </Pressable>
  );
}

/* ---------------------------------------------------------------- ErrorBox */

export function ErrorBox({ message }: { message: string }) {
  return (
    <View accessibilityRole="alert" style={styles.errorBox}>
      <Text style={[t.small, { color: colors.danger, fontFamily: fonts.textMedium }]}>{message}</Text>
    </View>
  );
}

/* ------------------------------------------------------------------ styles */

const styles = StyleSheet.create({
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    height: 64,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primary: {
    height: 56,
    borderRadius: radii.button,
    backgroundColor: colors.teal,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryText: {
    fontFamily: fonts.displaySemi,
    fontSize: 18,
    color: colors.onTeal,
  },
  ghost: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textButton: {
    minHeight: 44,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 18,
    borderWidth: 1.5,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.tile,
    padding: 12,
    gap: 3,
  },
  select: {
    minHeight: 76,
    borderRadius: radii.field,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  input: {
    minHeight: 52,
    borderRadius: radii.button,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: fonts.text,
    fontSize: 15,
    color: colors.ink,
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  linkRow: {
    minHeight: 60,
    backgroundColor: colors.surface,
    borderRadius: radii.row,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  linkIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorBox: {
    backgroundColor: colors.dangerBg,
    borderRadius: radii.tile,
    padding: 14,
  },
});
