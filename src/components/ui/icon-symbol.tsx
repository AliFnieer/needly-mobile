// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING = {
  'house.fill': 'home',
  'gearshape.fill': 'settings',
  'person.3.fill': 'groups',
  'cart.fill': 'shopping-cart',
  'checkmark.circle.fill': 'check-circle',
  'checkmark': 'check',
  'circle': 'radio-button-unchecked',
  'person.fill.badge.plus': 'person-add',
  'plus': 'add',
  'minus': 'remove',
  'xmark': 'close',
  'pencil': 'edit',
  'trash': 'delete',
  'arrow.clockwise': 'refresh',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'arrow.up': 'arrow-upward',
  'ellipsis': 'more-horiz',
  'tag.fill': 'local-offer',
  'paintpalette.fill': 'palette',
  'circle.lefthalf.filled': 'brightness-auto',
  'sun.max.fill': 'light-mode',
  'moon.fill': 'dark-mode',
  'globe': 'language',
  'translate': 'translate',
  'chevron.down': 'keyboard-arrow-down',
  'chevron.up': 'keyboard-arrow-up',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
