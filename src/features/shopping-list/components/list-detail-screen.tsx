import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useHouseholdsQuery } from '@/hooks/use-households';
import {
  useCreateShoppingItemMutation,
  useDeleteShoppingItemMutation,
  useDeleteShoppingListMutation,
  useShoppingListQuery,
  useToggleShoppingItemMutation,
  useUpdateShoppingListMutation,
  type ShoppingItem,
} from '@/hooks/use-shopping-lists';
import { formatRelativeTime } from '@/utils/format-relative-time';

import { AvatarStack } from './avatar-stack';
import { ConfirmModal, ListFormModal } from './shopping-modals';
import { useShoppingTokens } from './shopping-tokens';

const CATEGORY_DOTS = ['#006C45', '#3B82F6', '#F59E0B', '#7B5800', '#5C6470'];

export function ListDetailScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const id = Number(listId);
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const listQuery = useShoppingListQuery(id);
  const list = listQuery.data;

  const householdId = list?.household_id ?? 0;
  const toggleMutation = useToggleShoppingItemMutation(householdId);
  const deleteItemMutation = useDeleteShoppingItemMutation(householdId);
  const addItemMutation = useCreateShoppingItemMutation(householdId);
  const updateListMutation = useUpdateShoppingListMutation(householdId);
  const deleteListMutation = useDeleteShoppingListMutation(householdId);

  const householdsQuery = useHouseholdsQuery();
  const activeHousehold = householdsQuery.data?.find((h) => h.id === householdId) ?? null;
  const memberAvatars =
    activeHousehold?.members.map((member) => ({ userId: member.user_id })) ?? [];

  const [quickAdd, setQuickAdd] = useState('');
  const [renaming, setRenaming] = useState(false);
  const [renamingValue, setRenamingValue] = useState('');
  const [renamingError, setRenamingError] = useState<string>();
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [removeItemTarget, setRemoveItemTarget] = useState<ShoppingItem | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const items = list?.items ?? [];
  const doneCount = items.filter((item) => item.is_completed).length;
  const totalCount = items.length;

  const activeItems = items.filter((item) => !item.is_completed);
  const completedItems = items.filter((item) => item.is_completed);
  const grouped = groupByCategory(activeItems);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/shopping');
  };

  const canSaveQuickAdd = quickAdd.trim().length >= 1;

  const submitQuickAdd = async () => {
    const name = quickAdd.trim();
    if (name.length === 0) return;
    try {
      await addItemMutation.mutateAsync({ listId: id, item: { name } });
      setQuickAdd('');
    } catch {
      /* error surfaced via mutation; keep input for retry */
    }
  };

  const saveRename = async () => {
    const name = renamingValue.trim();
    if (name.length < 2) {
      setRenamingError(t('shopping.nameHint'));
      return;
    }
    setRenamingError(undefined);
    try {
      await updateListMutation.mutateAsync({ listId: id, name });
      setRenaming(false);
    } catch (error) {
      setRenamingError(error instanceof Error ? error.message : t('shopping.errorSave'));
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteListMutation.mutateAsync(id);
      goBack();
    } catch {
      /* surface error below modal */
    } finally {
      setDeleteTarget(false);
    }
  };

  const confirmRemoveItem = async () => {
    if (!removeItemTarget) return;
    try {
      await deleteItemMutation.mutateAsync(removeItemTarget.id);
    } finally {
      setRemoveItemTarget(null);
    }
  };

  const toggleItem = (item: ShoppingItem) => {
    toggleMutation.mutate({ itemId: item.id, isCompleted: !item.is_completed });
  };

  if (!listQuery.isLoading && !list) {
    return (
      <SafeAreaView className="flex-1" edges={['top']} style={{ backgroundColor: colors.background }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32 }}>
          <Text style={[text.cardTitle, { color: colors.text }]}>{t('shopping.errorLoad')}</Text>
          <Pressable
            onPress={goBack}
            style={{ paddingHorizontal: 20, paddingVertical: 10, borderRadius: 999, backgroundColor: colors.accent }}>
            <Text style={[text.fabLabel, { color: colors.accentText }]}>{t('shopping.retry')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

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
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
          <Pressable
            accessibilityRole="button"
            onPress={goBack}
            hitSlop={8}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: colors.background,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <IconSymbol name="chevron.left" size={16} color={colors.text} />
          </Pressable>
          <View style={{ gap: 2, flexShrink: 1 }}>
            <Text style={[text.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {list?.name ?? ''}
            </Text>
            <Text style={[text.headerSubtitle, { color: colors.secondary }]} numberOfLines={1}>
              {t('shopping.completedText', { done: doneCount, total: totalCount })}
            </Text>
          </View>
        </View>
        <AvatarStack members={memberAvatars} size={28} max={3} />
      </View>

      {listQuery.isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 32 }}>
          {grouped.length === 0 && completedItems.length === 0 ? (
            <View style={{ gap: 8, paddingVertical: 32 }}>
              <IconSymbol name="cart.fill" size={48} color={colors.secondary} style={{ alignSelf: 'center' }} />
              <Text style={[text.cardTitle, { color: colors.text, textAlign: 'center' }]}>{t('shopping.noItems')}</Text>
              <Text style={[text.footer, { color: colors.secondary, textAlign: 'center' }]}>
                {t('shopping.noItemsHint')}
              </Text>
            </View>
          ) : (
            <>
              {grouped.map((group, groupIndex) => (
                <View key={group.key} style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
                    <View
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: CATEGORY_DOTS[groupIndex % CATEGORY_DOTS.length],
                      }}
                    />
                    <Text style={[text.categoryLabel, { color: colors.secondary, textTransform: 'uppercase' }]}>
                      {group.key === 'uncategorized' ? t('shopping.uncategorized') : group.name}
                    </Text>
                  </View>
                  {group.items.map((item) => (
                    <ItemRow
                      key={item.id}
                      item={item}
                      toggling={toggleMutation.isPending}
                      onToggle={() => toggleItem(item)}
                      onRemove={() => setRemoveItemTarget(item)}
                    />
                  ))}
                </View>
              ))}

              {completedItems.length > 0 ? (
                <View style={{ gap: 8 }}>
                  <Pressable
                    onPress={() => setShowCompleted((value) => !value)}
                    accessibilityRole="button"
                    accessibilityState={{ expanded: showCompleted }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingVertical: 8,
                    }}>
                    <Text style={[text.completedToggle, { color: colors.secondary }]}>
                      {t('shopping.completedSection', { count: completedItems.length })}
                    </Text>
                    <IconSymbol name={showCompleted ? 'chevron.up' : 'chevron.down'} size={16} color={colors.secondary} />
                  </Pressable>
                  {showCompleted
                    ? completedItems.map((item) => (
                        <CompletedRow
                          key={item.id}
                          item={item}
                          onRemove={() => setRemoveItemTarget(item)}
                        />
                      ))
                    : null}
                </View>
              ) : null}
            </>
          )}
        </ScrollView>
      )}

      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          gap: 12,
          backgroundColor: colors.card,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: 'row',
          alignItems: 'center',
          flexShrink: 1,
        }}>
        <View
          style={{
            flex: 1,
            height: 44,
            borderRadius: 22,
            paddingHorizontal: 16,
            backgroundColor: colors.background,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <IconSymbol name="plus" size={16} color={colors.secondary} />
          <TextInput
            value={quickAdd}
            onChangeText={setQuickAdd}
            placeholder={t('shopping.quickAddPlaceholder')}
            placeholderTextColor={colors.secondary}
            style={[text.quickAdd, { color: colors.text, flex: 1, paddingVertical: 0 }]}
            autoCorrect={false}
            returnKeyType="send"
            onSubmitEditing={submitQuickAdd}
          />
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={submitQuickAdd}
          disabled={!canSaveQuickAdd}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: canSaveQuickAdd ? colors.accent : colors.badge,
            borderWidth: 1,
            borderColor: canSaveQuickAdd ? colors.borderStrong : colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {addItemMutation.isPending ? (
            <ActivityIndicator color={canSaveQuickAdd ? colors.accentText : colors.secondary} size="small" />
          ) : (
            <IconSymbol name="arrow.up" size={18} color={canSaveQuickAdd ? colors.accentText : colors.secondary} />
          )}
        </Pressable>
      </View>

      <ListFormModal
        visible={renaming}
        mode="rename"
        value={renamingValue}
        onChange={setRenamingValue}
        error={renamingError}
        saving={updateListMutation.isPending}
        onClose={() => !updateListMutation.isPending && setRenaming(false)}
        onSubmit={saveRename}
      />

      {deleteTarget ? (
        <ConfirmModal
          title={t('shopping.deleteTitle')}
          body={t('shopping.deleteBody', { name: list?.name ?? '' })}
          confirmLabel={t('shopping.deleteConfirm')}
          saving={deleteListMutation.isPending}
          onCancel={() => setDeleteTarget(false)}
          onConfirm={confirmDelete}
        />
      ) : null}

      {removeItemTarget ? (
        <ConfirmModal
          title={t('shopping.removeItemTitle')}
          body={t('shopping.removeItemBody', { name: removeItemTarget.name })}
          confirmLabel={t('shopping.removeItem')}
          saving={deleteItemMutation.isPending}
          onCancel={() => setRemoveItemTarget(null)}
          onConfirm={confirmRemoveItem}
        />
      ) : null}
    </SafeAreaView>
  );
}

function groupByCategory(items: ShoppingItem[]): { key: string; name: string; items: ShoppingItem[] }[] {
  const map = new Map<string, ShoppingItem[]>();
  for (const item of items) {
    const key = item.category?.name ?? 'uncategorized';
    const bucket = map.get(key) ?? [];
    bucket.push(item);
    map.set(key, bucket);
  }
  return Array.from(map.entries()).map(([key, groupItems]) => ({
    key,
    name: key,
    items: groupItems,
  }));
}

type ItemRowProps = {
  item: ShoppingItem;
  toggling: boolean;
  onToggle: () => void;
  onRemove: () => void;
};

function ItemRow({ item, toggling, onToggle, onRemove }: ItemRowProps) {
  const { t } = useTranslation();
  const { colors, text } = useShoppingTokens();
  const recurrence = item.recurrence_rule ? t(`shopping.recurrence.${item.recurrence_rule}`) : '';
  const quantityLabel = item.unit
    ? `${formatQuantity(item.quantity)} × ${item.unit}`
    : String(formatQuantity(item.quantity));

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
      <Pressable
        onPress={onToggle}
        disabled={toggling}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.is_completed }}
        hitSlop={8}
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          borderWidth: 2,
          borderColor: colors.borderStrong,
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        {item.is_completed ? <IconSymbol name="checkmark" size={14} color={colors.card} /> : null}
      </Pressable>
      <View style={{ flex: 1, gap: 2, alignItems: 'flex-start' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 }}>
          <Text style={[text.itemName, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          {recurrence ? (
            <View
              style={{
                backgroundColor: colors.badge,
                borderRadius: 6,
                paddingHorizontal: 8,
                paddingVertical: 4,
              }}>
              <Text style={[text.badge, { color: colors.borderStrong }]}>🔁 {recurrence}</Text>
            </View>
          ) : null}
        </View>
        {quantityLabel ? (
          <Text style={[text.badge, { color: colors.borderStrong }]} numberOfLines={1}>
            {quantityLabel}
          </Text>
        ) : null}
      </View>
      <Pressable onPress={onRemove} accessibilityRole="button" hitSlop={8}>
        <IconSymbol name="trash" size={18} color={colors.error} />
      </Pressable>
    </View>
  );
}

function CompletedRow({ item, onRemove }: { item: ShoppingItem; onRemove: () => void }) {
  const { colors, text, language } = useShoppingTokens();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        opacity: 0.6,
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
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
        <Text
          style={[text.itemName, { color: colors.text, textDecorationLine: 'line-through' }]}
          numberOfLines={1}>
          {item.name}
        </Text>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Text style={[text.completedMeta, { color: colors.secondary }]}>
          {formatRelativeTime(item.updated_at ?? item.created_at, language)}
        </Text>
        <Pressable onPress={onRemove} accessibilityRole="button" hitSlop={8}>
          <IconSymbol name="trash" size={18} color={colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

function formatQuantity(quantity: number): string {
  return String(quantity);
}