import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCategoriesQuery, useCreateCategoryMutation } from '@/hooks/use-categories';
import { useHouseholdsQuery } from '@/hooks/use-households';
import {
  useCreateShoppingItemMutation,
  useDeleteShoppingItemMutation,
  useDeleteShoppingListMutation,
  useShoppingListQuery,
  useToggleShoppingItemMutation,
  useUpdateShoppingItemMutation,
  useUpdateShoppingListMutation,
  type ShoppingItem,
} from '@/hooks/use-shopping-lists';
import type { CreateShoppingItemInput, ShoppingCategory } from '@/services/shopping-lists-api';
import { formatRelativeTime } from '@/utils/format-relative-time';

import { AvatarStack } from './avatar-stack';
import { ItemFormSheet } from './item-form-sheet';
import { ConfirmModal, ListFormModal } from './shopping-modals';
import { useShoppingTokens } from './shopping-tokens';
import { useShoppingStore } from '@/stores/shopping-store';

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
  const storeItems = useShoppingStore((state) => state.items);
  const setStoreItems = useShoppingStore((state) => state.setItems);
  const applyStoreToggle = useShoppingStore((state) => state.applyToggle);
  const applyStoreRemove = useShoppingStore((state) => state.applyRemove);
  const applyStoreUpdate = useShoppingStore((state) => state.applyUpdate);
  const toggleMutation = useToggleShoppingItemMutation(householdId);
  const deleteItemMutation = useDeleteShoppingItemMutation(householdId);
  const addItemMutation = useCreateShoppingItemMutation(householdId);
  const updateItemMutation = useUpdateShoppingItemMutation(householdId);
  const updateListMutation = useUpdateShoppingListMutation(householdId);
  const deleteListMutation = useDeleteShoppingListMutation(householdId);

  const householdsQuery = useHouseholdsQuery();
  const activeHousehold = householdsQuery.data?.find((h) => h.id === householdId) ?? null;
  const memberAvatars =
    activeHousehold?.members.map((member) => ({ userId: member.user_id })) ?? [];

  const [renaming, setRenaming] = useState(false);
  const [renamingValue, setRenamingValue] = useState('');
  const [renamingError, setRenamingError] = useState<string>();
  const [deleteTarget, setDeleteTarget] = useState(false);
  const [removeItemTarget, setRemoveItemTarget] = useState<ShoppingItem | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [formNonce, setFormNonce] = useState(0);
  const [itemForm, setItemForm] = useState<{
    mode: 'create' | 'edit';
    item?: ShoppingItem;
  } | null>(null);

  const items = storeItems;

  const categoriesQuery = useCategoriesQuery(householdId);
  const createCategoryMutation = useCreateCategoryMutation(householdId);

  const categoryOptions = useMemo<ShoppingCategory[]>(() => {
    const fromApi = (categoriesQuery.data ?? []).slice();
    const seen = new Set<number>(fromApi.map((category) => category.id));
    for (const current of list?.items ?? []) {
      if (current.category && current.category_id != null && !seen.has(current.category_id)) {
        seen.add(current.category_id);
        fromApi.push(current.category);
      }
    }
    return fromApi;
  }, [categoriesQuery.data, list]);

  useEffect(() => {
    setStoreItems(list?.items ?? []);
  }, [list, setStoreItems]);

  const doneCount = items.filter((item) => item.is_completed).length;
  const totalCount = items.length;

  const activeItems = items.filter((item) => !item.is_completed);
  const completedItems = items.filter((item) => item.is_completed);
  const grouped = groupByCategory(activeItems);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/shopping');
  };

  const openCreateSheet = () => {
    addItemMutation.reset();
    updateItemMutation.reset();
    setFormNonce((value) => value + 1);
    setItemForm({ mode: 'create' });
  };

  const openEditSheet = (item: ShoppingItem) => {
    addItemMutation.reset();
    updateItemMutation.reset();
    setFormNonce((value) => value + 1);
    setItemForm({ mode: 'edit', item });
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
    applyStoreRemove(removeItemTarget.id);
    try {
      await deleteItemMutation.mutateAsync(removeItemTarget.id);
    } catch {
      setStoreItems(list?.items ?? []);
    } finally {
      setRemoveItemTarget(null);
    }
  };

  const toggleItem = (item: ShoppingItem) => {
    const next = !item.is_completed;
    applyStoreToggle(item.id, next);
    toggleMutation.mutate({ itemId: item.id, isCompleted: next }, {
      onError: () => applyStoreToggle(item.id, !next),
    });
  };

  const submitItemForm = async (input: CreateShoppingItemInput) => {
    const target = itemForm;
    if (!target) return;
    try {
      if (target.mode === 'edit' && target.item) {
        const updated = await updateItemMutation.mutateAsync({
          itemId: target.item.id,
          input: { ...input, base_updated_at: target.item.updated_at },
        });
        applyStoreUpdate(updated);
      } else {
        await addItemMutation.mutateAsync({ listId: id, item: input });
      }
      setItemForm(null);
    } catch {
      /* error recorded on mutation and surfaced via the sheet's `error` prop */
    }
  };

  const createCategoryHandler = async (name: string): Promise<ShoppingCategory | null> => {
    try {
      return await createCategoryMutation.mutateAsync({ name: name.trim() });
    } catch {
      return null;
    }
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
            <IconSymbol name={direction === 'rtl' ? 'chevron.right' : 'chevron.left'} size={16} color={colors.text} />
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
          contentContainerStyle={{ padding: 16, gap: 24, paddingBottom: 96 }}>
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
              {grouped.map((group) => (
                <View key={group.key} style={{ gap: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
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
                      onEdit={() => openEditSheet(item)}
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
                            onToggle={() => toggleItem(item)}
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
          position: 'absolute',
          bottom: 20,
          ...(language === 'ar' ? { left: 20 } : { right: 20 }),
        }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('shopping.addItem')}
          onPress={openCreateSheet}
          style={{
            width: 56,
            height: 56,
            borderRadius: 28,
            backgroundColor: colors.accent,
            borderWidth: 1.5,
            borderColor: colors.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            elevation: 6,
            shadowColor: '#131C26',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}>
          <IconSymbol name="plus" size={26} color={colors.accentText} />
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

      <ItemFormSheet
        key={`${formNonce}:${itemForm?.mode ?? 'closed'}:${itemForm?.item?.id ?? ''}`}
        visible={itemForm !== null}
        mode={itemForm?.mode ?? 'create'}
        listName={list?.name ?? ''}
        item={itemForm?.item ?? null}
        categories={categoryOptions}
        saving={addItemMutation.isPending || updateItemMutation.isPending}
        error={
          itemForm && (addItemMutation.error ?? updateItemMutation.error)
            ? (addItemMutation.error ?? updateItemMutation.error)?.message
            : null
        }
        onCreateCategory={createCategoryHandler}
        onClose={() => !(addItemMutation.isPending || updateItemMutation.isPending) && setItemForm(null)}
        onSubmit={submitItemForm}
      />
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
  onEdit: () => void;
  onRemove: () => void;
};

function ItemRow({ item, toggling, onToggle, onEdit, onRemove }: ItemRowProps) {
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable onPress={onEdit} accessibilityRole="button" accessibilityLabel={t('shopping.editItem')} hitSlop={8}>
          <IconSymbol name="pencil" size={18} color={colors.secondary} />
        </Pressable>
        <Pressable onPress={onRemove} accessibilityRole="button" accessibilityLabel={t('shopping.removeItem')} hitSlop={8}>
          <IconSymbol name="trash" size={18} color={colors.error} />
        </Pressable>
      </View>
    </View>
  );
}

function CompletedRow({ item, onToggle, onRemove }: { item: ShoppingItem; onToggle: () => void; onRemove: () => void }) {
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
        <Pressable
          onPress={onToggle}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: true }}
          hitSlop={8}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: colors.success,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <IconSymbol name="checkmark" size={14} color={colors.card} />
        </Pressable>
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