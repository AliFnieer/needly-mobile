import { StyleSheet, View } from 'react-native';

// Tiny CSS/SVG-free flags rendered from Views so they look consistent on
// iOS, Android and web (flag emoji don't render reliably outside Apple
// platforms). Colors follow the official US and Libyan flag specs.
const US_RED = '#B31942';
const US_NAVY = '#0A3161';
const US_WHITE = '#FFFFFF';
const LY_RED = '#EF3340';
const LY_GREEN = '#00A651';
const LY_BLACK = '#000000';
const LY_WHITE = '#FFFFFF';

const FLAG_BORDER = { borderColor: 'rgba(0, 0, 0, 0.18)', borderWidth: StyleSheet.hairlineWidth };

const US_STRIPES = Array.from({ length: 13 }, (_, index) => (index % 2 === 0 ? US_RED : US_WHITE));

export function AmericanFlag({ width }: { width: number }) {
  const height = width * (2 / 3);
  return (
    <View style={[styles.frame, { width, height }, FLAG_BORDER]}>
      {US_STRIPES.map((color, index) => (
        <View key={index} style={{ flex: 1, backgroundColor: color }} />
      ))}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: width * 0.4,
          height: height * 0.54,
          backgroundColor: US_NAVY,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <View
          style={{
            width: Math.max(2, width * 0.09),
            height: Math.max(2, width * 0.09),
            borderRadius: 99,
            backgroundColor: US_WHITE,
          }}
        />
      </View>
    </View>
  );
}

export function LibyanFlag({ width }: { width: number }) {
  const height = width * (2 / 3);
  return (
    <View style={[styles.frame, { width, height }, FLAG_BORDER]}>
      <View style={{ flex: 1, backgroundColor: LY_RED }} />
      <View style={{ flex: 1, backgroundColor: LY_BLACK, alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={{
            width: Math.max(2, width * 0.18),
            height: Math.max(2, width * 0.18),
            borderRadius: 99,
            backgroundColor: LY_WHITE,
          }}
        />
      </View>
      <View style={{ flex: 1, backgroundColor: LY_GREEN }} />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    borderRadius: 3,
    // Flags must not mirror inside RTL layouts.
    direction: 'ltr',
  },
});