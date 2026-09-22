import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol, type IconSymbolName } from '@/components/ui/icon-symbol';
import { AppHeader } from '@/components/ui/app-header';
import { useHouseholdsQuery } from '@/hooks/use-households';
import { useHouseholdNotificationsQuery, type ActivityNotification } from '@/hooks/use-notifications';
import { useUserLookupQuery } from '@/hooks/use-users';
import { formatRelativeTime } from '@/utils/format-relative-time';

import { AvatarStack } from '@/features/shopping-list/components/avatar-stack';
import { HouseholdPickerModal } from '@/features/shopping-list/components/lists-overview-screen';
import { useShoppingTokens } from '@/features/shopping-list/components/shopping-tokens';

type TFunction = ReturnType<typeof useTranslation>['t'];

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function dayLabel(date: Date, language: string, t: TFunction): string {
  const now = new Date();
  const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
  if (sameDay(date, now)) return t('activity.today');
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return t('activity.yesterday');
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function groupByDay(entries: ActivityNotification[], language: string, t: TFunction): { key: string; label: string; entries: ActivityNotification[] }[] {
  const map = new Map<string, { key: string; label: string; entries: ActivityNotification[] }>();
  for (const entry of entries) {
    const date = new Date(entry.created_at);
    const key = dayKey(date);
    const group = map.get(key);
    if (group) {
      group.entries.push(entry);
    } else {
      map.set(key, { key, label: dayLabel(date, language, t), entries: [entry] });
    }
  }
  return Array.from(map.values());
}

export function ActivityScreen() {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const householdsQuery = useHouseholdsQuery();
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  const households = householdsQuery.data ?? [];
  const activeHouseholdId = selectedHouseholdId ?? households[0]?.id ?? null;
  const activeHousehold = households.find((h) => h.id === activeHouseholdId) ?? null;
  const noHouseholds = !householdsQuery.isLoading && households.length === 0;

  const feedQuery = useHouseholdNotificationsQuery(activeHouseholdId ?? 0);

  const entries = feedQuery.data ?? [];
  const isEmpty = !feedQuery.isLoading && entries.length === 0;
  const groups = groupByDay(entries, language, t);

  const members = activeHousehold?.members.map((member) => ({ userId: member.user_id })) ?? [];

  return (
    <SafeAreaView
      className="flex-1"
      edges={['top']}
      style={{ direction, backgroundColor: colors.background }}>
      <AppHeader
        title={t('activity.title')}
        subtitle={
          noHouseholds
            ? t('shopping.noHouseholds')
            : activeHousehold
              ? `${activeHousehold.name} · ${t('shopping.householdOf', { count: activeHousehold.members.length })}`
              : null
        }
        right={
          activeHousehold ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('shopping.selectHousehold')}
              hitSlop={8}
              onPress={() => setPickerOpen(true)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10 }}>
              <AvatarStack members={members} size={24} max={3} />
              <IconSymbol name="chevron.down" size={14} color={colors.secondary} />
            </Pressable>
          ) : null
        }
      />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={feedQuery.isRefetching}
            onRefresh={() => feedQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }}>
        {noHouseholds ? (
          <EmptyState icon="bell.fill" title={t('activity.noHouseholds')} hint={t('activity.noHouseholdsHint')} color={colors.secondary} />
        ) : feedQuery.isLoading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[text.footer, { color: colors.secondary, marginTop: 8, textAlign: 'center' }]}>
              {t('activity.loading')}
            </Text>
          </View>
        ) : feedQuery.isError ? (
          <View style={{ gap: 8, paddingVertical: 32 }}>
            <Text style={[text.cardTitle, { color: colors.text, textAlign: 'center' }]}>
              {t('activity.errorLoad')}
            </Text>
            <Pressable
              onPress={() => feedQuery.refetch()}
              style={{
                alignSelf: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: colors.accent,
              }}>
              <Text style={[text.fabLabel, { color: colors.accentText }]}>{t('activity.retry')}</Text>
            </Pressable>
          </View>
        ) : isEmpty ? (
          <EmptyState icon="bell.fill" title={t('activity.empty')} hint={t('activity.emptyHint')} color={colors.secondary} />
        ) : (
          groups.map((group) => (
            <View key={group.key} style={{ gap: 12 }}>
              <Text style={[text.eyebrow, { color: colors.secondary, textTransform: 'uppercase' }]}>
                {group.label}
              </Text>
              {group.entries.map((entry) => (
                <ActivityRow key={`${entry.type}:${entry.created_at}:${entry.item_id ?? ''}:${entry.actor_id ?? ''}`} entry={entry} />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      <HouseholdPickerModal
        visible={pickerOpen}
        households={households}
        selectedId={activeHouseholdId}
        onClose={() => setPickerOpen(false)}
        onSelect={(id) => {
          setSelectedHouseholdId(id);
          setPickerOpen(false);
        }}
      />
    </SafeAreaView>
  );
}

function iconForType(type: string): IconSymbolName {
  if (type === 'household.created') return 'house.fill';
  if (type === 'household.member_added') return 'person.fill.badge.plus';
  if (type === 'household.member_removed') return 'person.fill.badge.minus';
  if (type === 'item.completed' || type === 'item.updated') return 'checkmark.circle.fill';
  if (type === 'item.radded') return 'plus.circle.fill';
  if (type === 'item.recurred') return 'arrow.clockwise';
  if (type === 'list.created' || type === 'item.created') return 'plus';
  if (type.endsWith('.deleted')) return 'trash';
  if (type.endsWith('.updated')) return 'pencil';
  return 'bell.fill';
}

type NotificationNames = { item: string | undefined; list: string | undefined; household: string | undefined };

const NT_NAME_FIELDS: Record<string, readonly (keyof NotificationNames)[]> = {
  'item.created': ['item', 'list'],
  'item.updated': ['item', 'list'],
  'item.completed': ['item', 'list'],
  'item.deleted': ['item', 'list'],
  'item.radded': ['item', 'list'],
  'item.recurred': ['item', 'list'],
  'list.created': ['list'],
  'list.updated': ['list'],
  'list.deleted': ['list'],
  'household.created': ['household'],
  'household.updated': ['household'],
  'household.deleted': ['household'],
  'household.member_added': ['household'],
  'household.member_removed': ['household'],
};

// Builds localized title/body from structured names. Older history entries
// recorded before the server attached names fall back to the server text.
function localizedActivityText(entry: ActivityNotification, t: TFunction): { title: string; body: string } {
  const names: NotificationNames = {
    item: entry.item_name,
    list: entry.list_name,
    household: entry.household_name,
  };

  const required = NT_NAME_FIELDS[entry.type];
  if (!required || required.some((key) => !names[key])) {
    return { title: entry.title, body: entry.body };
  }

  const values: Record<string, string> = {};
  for (const key of required) values[key] = names[key] as string;

  const titleKey = `activity.nt.${entry.type}.title`;
  const bodyKey = `activity.nt.${entry.type}.body`;
  const title = t(titleKey, values);
  const body = t(bodyKey, values);
  if (title === titleKey || body === bodyKey) {
    return { title: entry.title, body: entry.body };
  }
  return { title, body };
}

function ActivityRow({ entry }: { entry: ActivityNotification }) {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const { data: user } = useUserLookupQuery(entry.actor_id);
  const actorName = user ? `${user.first_name} ${user.last_name}`.trim() : t('activity.userLabel', { id: entry.actor_id ?? 0 });
  const icon = iconForType(entry.type);
  const { title, body } = localizedActivityText(entry, t);

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
      }}>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: colors.badge,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconSymbol name={icon} size={18} color={colors.accent} />
      </View>
      <View style={{ flex: 1, gap: 2, alignItems: 'flex-start' }}>
        <Text style={[text.itemName, { color: colors.text }]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[text.footer, { color: colors.secondary }]} numberOfLines={2}>
          {body}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
          {entry.actor_id ? (
            <AvatarStack members={[{ userId: entry.actor_id }]} size={18} strokeWidth={1.5} max={1} />
          ) : null}
          <Text style={[text.completedMeta, { color: colors.secondary }]}>
            {actorName} · {formatRelativeTime(entry.created_at, language)}
          </Text>
        </View>
      </View>
    </View>
  );
}

type EmptyStateProps = {
  icon: 'bell.fill';
  title: string;
  hint: string;
  color: string;
};

function EmptyState({ icon, title, hint, color }: EmptyStateProps) {
  const { text } = useShoppingTokens();
  return (
    <View style={{ gap: 8, paddingVertical: 32 }}>
      <IconSymbol name={icon} size={48} color={color} style={{ alignSelf: 'center' }} />
      <Text style={[text.cardTitle, { color: color, textAlign: 'center' }]}>{title}</Text>
      <Text style={[text.footer, { color, textAlign: 'center' }]}>{hint}</Text>
    </View>
  );
}