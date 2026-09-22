import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useHouseholdsQuery } from '@/hooks/use-households';
import { useCreateShoppingListMutation, useShoppingListsQuery, type ShoppingList } from '@/hooks/use-shopping-lists';
import { useLanguage } from '@/providers/language-provider';
import { formatRelativeTime } from '@/utils/format-relative-time';

import { AvatarStack } from './avatar-stack';
import { ProgressRing } from './progress-ring';
import { ListFormModal } from './shopping-modals';
import { useShoppingTokens } from './shopping-tokens';

export function ListsOverviewScreen() {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const router = useRouter();

  const householdsQuery = useHouseholdsQuery();
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<number | null>(null);
  const households = householdsQuery.data ?? [];
  const activeHouseholdId = selectedHouseholdId ?? households[0]?.id ?? null;
  const activeHousehold = households.find((h) => h.id === activeHouseholdId) ?? null;

  const listsQuery = useShoppingListsQuery(activeHouseholdId ?? 0);
  const createListMutation = useCreateShoppingListMutation(activeHouseholdId ?? 0);

  const [pickerOpen, setPickerOpen] = useState(false);
  const [formMode, setFormMode] = useState<boolean>(false);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string>();

  const lists = listsQuery.data ?? [];
  const isEmpty = !listsQuery.isLoading && lists.length === 0;
  const noHouseholds = !householdsQuery.isLoading && households.length === 0;

  const openCreate = () => {
    setFormName('');
    setFormError(undefined);
    setFormMode(true);
  };

  const closeForm = () => {
    if (createListMutation.isPending) return;
    setFormMode(false);
  };

  const saveForm = async () => {
    const name = formName.trim();
    if (name.length < 2) {
      setFormError(t('shopping.nameHint'));
      return;
    }
    setFormError(undefined);
    try {
      await createListMutation.mutateAsync(name);
      setFormMode(false);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('shopping.errorSave'));
    }
  };

  const members = activeHousehold?.members.map((member) => ({ userId: member.user_id })) ?? [];

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
        <Pressable
          accessibilityRole="button"
          hitSlop={8}
          onPress={() => setPickerOpen(true)}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ gap: 2 }}>
            <Text style={[text.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {noHouseholds ? t('shopping.noHouseholds') : activeHousehold?.name ?? ''}
            </Text>
            {activeHousehold ? <Text style={[text.headerSubtitle, { color: colors.secondary }]}>
              {t('shopping.householdOf', { count: activeHousehold.members.length })}
            </Text> : null}
          </View>
          <IconSymbol name="chevron.down" size={14} color={colors.secondary} />
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <AvatarStack members={members} size={32} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('shopping.categoryManagerTitle')}
            onPress={() =>
              activeHouseholdId ? router.push(`/shopping/categories?householdId=${activeHouseholdId}`) : undefined
            }
            hitSlop={8}
            style={{
              width: 36,
              height: 32,
              borderRadius: 8,
              backgroundColor: colors.background,
              borderWidth: 1,
              borderColor: colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconSymbol name="tag.fill" size={16} color={colors.secondary} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={listsQuery.isRefetching}
            onRefresh={() => listsQuery.refetch()}
            tintColor={colors.accent}
          />
        }
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 120 }}>
        <Text style={[text.eyebrow, { color: colors.secondary, textTransform: 'uppercase' }]}>
          {t('shopping.activeLists')}
        </Text>

        {noHouseholds ? (
          <EmptyState
            icon="cart.fill"
            title={t('shopping.noHouseholds')}
            hint={t('shopping.noHouseholdsHint')}
            color={colors.secondary}
          />
        ) : listsQuery.isLoading ? (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 32 }}>
            <ActivityIndicator color={colors.accent} />
            <Text style={[text.footer, { color: colors.secondary, marginTop: 8, textAlign: 'center' }]}>
              {t('shopping.loading')}
            </Text>
          </View>
        ) : listsQuery.isError ? (
          <View style={{ gap: 8, paddingVertical: 32 }}>
            <Text style={[text.cardTitle, { color: colors.text, textAlign: 'center' }]}>
              {t('shopping.errorLoad')}
            </Text>
            <Pressable
              onPress={() => listsQuery.refetch()}
              style={{
                alignSelf: 'center',
                paddingHorizontal: 20,
                paddingVertical: 10,
                borderRadius: 999,
                backgroundColor: colors.accent,
              }}>
              <Text style={[text.fabLabel, { color: colors.accentText }]}>{t('shopping.retry')}</Text>
            </Pressable>
          </View>
        ) : isEmpty ? (
          <EmptyState
            icon="cart.fill"
            title={t('shopping.empty')}
            hint={t('shopping.emptyHint')}
            color={colors.secondary}
          />
        ) : (
          lists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              members={members}
              onPress={() =>
                router.push({ pathname: '/shopping/[listId]', params: { listId: String(list.id) } })
              }
            />
          ))
        )}
      </ScrollView>

      {!noHouseholds ? (
        <Pressable
          accessibilityRole="button"
          onPress={openCreate}
          style={{
            position: 'absolute',
            right: 20,
            bottom: 20,
            height: 54,
            paddingHorizontal: 20,
            borderRadius: 27,
            backgroundColor: colors.accent,
            borderWidth: 1.5,
            borderColor: colors.borderStrong,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0px 6px 16px 0px rgba(19, 28, 38, 0.15)',
          }}>
          <IconSymbol name="plus" size={18} color={colors.accentText} />
          <Text style={[text.fabLabel, { color: colors.accentText }]}>{t('shopping.addList')}</Text>
        </Pressable>
      ) : null}

      <ListFormModal
        visible={formMode}
        mode={formMode ? 'create' : null}
        value={formName}
        onChange={setFormName}
        error={formError}
        saving={createListMutation.isPending}
        onClose={closeForm}
        onSubmit={saveForm}
      />

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

type ListCardProps = {
  list: ShoppingList;
  members: { userId: number }[];
  onPress: () => void;
};

function ListCard({ list, members, onPress }: ListCardProps) {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();

  const items = list.items ?? [];
  const doneCount = items.filter((item) => item.is_completed).length;
  const totalCount = items.length;
  const allDone = totalCount > 0 && doneCount === totalCount;
  const progress = totalCount === 0 ? 0 : doneCount / totalCount;
  const percent = Math.round(progress * 100);

  const subtitle = allDone
    ? t('shopping.allCompleted')
    : t('shopping.completedText', { done: doneCount, total: totalCount });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 16,
        padding: 16,
        gap: 16,
        opacity: allDone ? 0.75 : 1,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ gap: 4, flexShrink: 1 }}>
          <Text style={[text.cardTitle, { color: colors.text }]} numberOfLines={1}>
            {list.name}
          </Text>
          <Text
            style={[
              text.cardSubtitle,
              { color: allDone ? colors.success : colors.secondary },
            ]}
            numberOfLines={1}>
            {subtitle}
          </Text>
        </View>
        <ProgressRing progress={progress} size={48} trackColor={colors.track} color={colors.accent}>
          <Text style={[text.ringLabel, { color: colors.text }]}>{percent}%</Text>
        </ProgressRing>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <AvatarStack members={members} size={32} max={3} />
        <Text style={[text.footer, { color: colors.secondary }]} numberOfLines={1}>
          {t('shopping.updatedText', { time: formatRelativeTime(list.updated_at, language) })}
        </Text>
      </View>
    </Pressable>
  );
}

type EmptyStateProps = {
  icon: 'cart.fill';
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

type HouseholdPickerProps = {
  visible: boolean;
  households: { id: number; name: string }[];
  selectedId: number | null;
  onClose: () => void;
  onSelect: (id: number) => void;
};

export function HouseholdPickerModal({ visible, households, selectedId, onClose, onSelect }: HouseholdPickerProps) {
  const { t } = useTranslation();
  const { colors, text } = useShoppingTokens();
  const { language } = useLanguage();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', direction }}
        onPress={onClose}>
        <View style={{ padding: 20, justifyContent: 'flex-end', flex: 1 }}>
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
              overflow: 'hidden',
            }}>
            <Text
              style={[text.eyebrow, { color: colors.secondary, textTransform: 'uppercase', padding: 16, paddingBottom: 8 }]}>
              {t('shopping.selectHousehold')}
            </Text>
            {households.map((household) => {
              const selected = household.id === selectedId;
              return (
                <Pressable
                  key={household.id}
                  onPress={() => onSelect(household.id)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    backgroundColor: selected ? colors.accent : 'transparent',
                  }}>
                  <Text
                    style={[text.cardTitle, { color: selected ? colors.accentText : colors.text }]}
                    numberOfLines={1}>
                    {household.name}
                  </Text>
                  {selected ? <IconSymbol name="checkmark" size={18} color={colors.accentText} /> : null}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}