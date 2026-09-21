import { View, Text } from 'react-native';

import { typographyFor } from '@/constants/theme';
import { useUserLookupQuery } from '@/hooks/use-users';
import { useLanguage } from '@/providers/language-provider';

const AVATAR_PALETTE = ['#F5B82E', '#3B82F6', '#006C45', '#7B5800', '#D99512', '#5C6470'];

type AvatarEntry = {
  userId: number;
  name?: string;
};

type AvatarStackProps = {
  members: AvatarEntry[];
  size?: number;
  strokeWidth?: number;
  max?: number;
  /** Static tint per avatar slot, used to keep shadow-less circles legible. */
  palette?: string[];
};

/**
 * Overlapping member avatars (Figma "avatar-frame" / "member-stack": 32px
 * circles, 2px white stroke, -8px overlap). We render initials because the API
 * exposes no avatar images; names come from the user lookup cache when
 * available, falling back to a short user id label.
 */
export function AvatarStack({
  members,
  size = 32,
  strokeWidth = 2,
  max = 4,
  palette = AVATAR_PALETTE,
}: AvatarStackProps) {
  const { language } = useLanguage();
  const typography = typographyFor(language);
  const visible = members.slice(0, max);
  const overflow = members.length - visible.length;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: strokeWidth }}>
      {visible.map((member, index) => (
        <AvatarCircle
          key={member.userId}
          name={member.name}
          userId={member.userId}
          size={size}
          strokeWidth={strokeWidth}
          background={palette[index % palette.length]}
          style={{ marginLeft: index === 0 ? 0 : -(size / 4) }}
        />
      ))}
      {overflow > 0 ? (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: '#E6E2DE',
            borderWidth: strokeWidth,
            borderColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: -(size / 4),
          }}>
          <Text style={[typography['label-md'], { color: '#131C26' }]}>+{overflow}</Text>
        </View>
      ) : null}
    </View>
  );
}

type AvatarCircleProps = {
  name?: string;
  userId: number;
  size: number;
  strokeWidth: number;
  background: string;
  style?: Record<string, unknown>;
};

function AvatarCircle({ name, userId, size, strokeWidth, background, style }: AvatarCircleProps) {
  const { language } = useLanguage();
  const typography = typographyFor(language);
  const { data: user } = useUserLookupQuery(name ? undefined : userId);
  const label =
    name ??
    (user ? `${user.first_name} ${user.last_name}`.trim() : `#${userId}`);
  const initials = label
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return (
    <View
      style={[
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: background,
          borderWidth: strokeWidth,
          borderColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        },
        style,
      ]}>
      <Text style={[typography['label-md'], { color: '#FFFFFF', fontWeight: '700' }]} numberOfLines={1}>
        {initials || '?'}
      </Text>
    </View>
  );
}