import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useHouseholdsQuery } from '@/hooks/use-households';
import { useDeleteHistoryEntryMutation, useHouseholdHistoryQuery, type ShoppingHistoryEntry } from '@/hooks/use-history';
import { useUserLookupQuery } from '@/hooks/use-users';
import { formatRelativeTime } from '@/utils/format-relative-time';

import { AvatarStack } from '@/features/shopping-list/components/avatar-stack';
import { HouseholdPickerModal } from '@/features/shopping-list/components/lists-overview-screen';
import { ConfirmModal } from '@/features/shopping-list/components/shopping-modals';
import { useShoppingTokens } from '@/features/shopping-list/components/shopping-tokens';

type DayGroup = {
  key: string;
  label: string;
  entries: ShoppingHistoryEntry[];
};

function dayKey(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

type TFunction = ReturnType<typeof useTranslation>['t'];

function dayLabel(date: Date, language: string, t: TFunction): string {
  const now = new Date();
  const sameDay = (a: Date, b: Date) => dayKey(a) === dayKey(b);
  if (sameDay(date, now)) return t('history.today');
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (sameDay(date, yesterday)) return t('history.yesterday');
  return new Intl.DateTimeFormat(language === 'ar' ? 'ar-EG' : 'en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function groupByDay(entries: ShoppingHistoryEntry[], language: string, t: TFunction): DayGroup[] {
  const map = new Map<string, DayGroup>();
  for (const entry of entries) {
    const date = new Date(entry.completed_at);
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

export function HistoryScreen() {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const householdsQuery = useHouseholdsQuery();
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ShoppingHistoryEntry | null>(null);

  const households = householdsQuery.data ?? [];
  const activeHouseholdId = selectedHouseholdId ?? households[0]?.id ?? null;
  const activeHousehold = households.find((h) => h.id === activeHouseholdId) ?? null;
  const noHouseholds = !householdsQuery.isLoading && households.length === 0;

  const historyQuery = useHouseholdHistoryQuery(activeHouseholdId ?? 0);
  const deleteMutation = useDeleteHistoryEntryMutation(activeHouseholdId ?? 0);

  const entries = historyQuery.data ?? [];
  const isEmpty = !historyQuery.isLoading && entries.length === 0;

  const groups = groupByDay(entries, language, t);

  const members = activeHousehold?.members.map((member) => ({ userId: member.user_id })) ?? [];

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
    } catch {
      /* error surfaced via the mutation */
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={['top']}
      style={{ direction, backgroundColor: colors.background }}>
      <View
        style={{
          height: 60,
          paddingHorizontal: 20,
          backgroundColor: colors.card,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Text style={[text.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {t('history.title')}
          </Text>
          <Text style={[text.headerSubtitle, { color: colors.secondary }]} numberOfLines={1}>
            {noHouseholds
              ? t('shopping.noHouseholds')
              : activeHousehold
                ? `${activeHousehold.name} · ${t('shopping.householdOf', { count: activeHousehold.members.length })}`
                : ''}
          </Text>
        </View>
        {activeHousehold ? (
          <Pressable
            accessibilityRole="button"
            hitSlop={8}
            onPress={() => setPickerOpen(true)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 6, paddingHorizontal: 10 }}>
            <AvatarStack members={members} size={24} max={3} />
            <IconSymbol name="chevron.down" size={14} color={colors.secondary} />
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={historyQuery.isRefetching}
            onRefresh={() => historyQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }}>
        {noHouseholds ? (
          <EmptyState
            icon="clock.fill"
            title={t('history.noHouseholds')}
            hint={t('history.noHouseholdsHint')}
            color={colors.secondary}
          />
        ) : historyQuery.isLoading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[text.footer, { color: colors.secondary, marginTop: 8, textAlign: 'center' }]}>
              {t('history.loading')}
            </Text>
          </View>
        ) : historyQuery.isError ? (
          <View style={{ gap: 8, paddingVertical: 32 }}>
            <Text style={[text.cardTitle, { color: colors.text, textAlign: 'center' }]}>
              {t('history.errorLoad')}
            </Text>
            <Pressable
              onPress={() => historyQuery.refetch()}
              style={{
                alignSelf: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: colors.accent,
              }}>
              <Text style={[text.fabLabel, { color: colors.accentText }]}>{t('history.retry')}</Text>
            </Pressable>
          </View>
        ) : isEmpty ? (
          <EmptyState
            icon="clock.fill"
            title={t('history.empty')}
            hint={t('history.emptyHint')}
            color={colors.secondary}
          />
        ) : (
          groups.map((group) => (
            <View key={group.key} style={{ gap: 12 }}>
              <Text style={[text.eyebrow, { color: colors.secondary, textTransform: 'uppercase' }]}>
                {group.label}
              </Text>
              {group.entries.map((entry) => (
                <HistoryRow
                  key={entry.id}
                  entry={entry}
                  onDelete={() => setDeleteTarget(entry)}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {deleteTarget ? (
        <ConfirmModal
          title={t('history.deleteTitle')}
          body={t('history.deleteBody', { name: deleteTarget.name })}
          confirmLabel={t('history.deleteConfirm')}
          saving={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}

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

type HistoryRowProps = {
  entry: ShoppingHistoryEntry;
  onDelete: () => void;
};

function HistoryRow({ entry, onDelete }: HistoryRowProps) {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const { data: user } = useUserLookupQuery(entry.completed_by);
  const completedByName =
    user ? `${user.first_name} ${user.last_name}`.trim() : t('history.userLabel', { id: entry.completed_by });
  const quantityLabel = entry.unit
    ? `${formatQuantity(entry.quantity)} × ${entry.unit}`
    : String(formatQuantity(entry.quantity));
  const categoryName = entry.category?.name;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 14,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        gap: 12,
      }}>
      <View
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          backgroundColor: colors.success,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <IconSymbol name="checkmark" size={14} color={colors.card} />
      </View>
      <View style={{ flex: 1, gap: 2, alignItems: 'flex-start' }}>
        <Text style={[text.itemName, { color: colors.text }]} numberOfLines={1}>
          {entry.name}
        </Text>
        <Text style={[text.badge, { color: colors.borderStrong }]} numberOfLines={1}>
          {categoryName ? `${quantityLabel} · ${categoryName}` : quantityLabel}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
          <AvatarStack members={[{ userId: entry.completed_by }]} size={18} strokeWidth={1.5} max={1} />
          <Text style={[text.footer, { color: colors.secondary }]} numberOfLines={1}>
            {t('history.completedBy', { name: completedByName })}
          </Text>
        </View>
      </View>
      <View style={{ alignItems: 'flex-end', gap: 10 }}>
        <Text style={[text.completedMeta, { color: colors.secondary }]}>
          {formatRelativeTime(entry.completed_at, language)}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('history.deleteEntry')}
          onPress={onDelete}
          hitSlop={8}>
          <IconSymbol name="trash" size={16} color={colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

type EmptyStateProps = {
  icon: 'cart.fill' | 'clock.fill';
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

function formatQuantity(quantity: number): string {
  return String(quantity);
}