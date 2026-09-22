import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppHeader } from '@/components/ui/app-header';
import {
  useCategoriesQuery,
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useReorderCategoriesMutation,
  useUpdateCategoryMutation,
  type ShoppingCategory,
} from '@/hooks/use-categories';
import { useHouseholdsQuery } from '@/hooks/use-households';
import type { CreateCategoryInput } from '@/services/categories-api';

import { CategoryFormSheet } from './category-form-sheet';
import { ConfirmModal } from './shopping-modals';
import { useShoppingTokens } from './shopping-tokens';

export function CategoryManagerScreen() {
  const { householdId: householdIdParam } = useLocalSearchParams<{ householdId?: string }>();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const householdsQuery = useHouseholdsQuery();
  const households = householdsQuery.data ?? [];
  const householdId = Number(householdIdParam ?? households[0]?.id ?? 0);
  const activeHousehold = households.find((household) => household.id === householdId) ?? null;

  const categoriesQuery = useCategoriesQuery(householdId);
  const createCategoryMutation = useCreateCategoryMutation(householdId);
  const updateCategoryMutation = useUpdateCategoryMutation(householdId);
  const deleteCategoryMutation = useDeleteCategoryMutation(householdId);
  const reorderMutation = useReorderCategoriesMutation(householdId);

  const [form, setForm] = useState<{ mode: 'create' | 'edit'; category?: ShoppingCategory } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ShoppingCategory | null>(null);

  const categories = [...(categoriesQuery.data ?? [])].sort(
    (a, b) => (a.sort_order ?? a.id) - (b.sort_order ?? b.id),
  );
  const saving = createCategoryMutation.isPending || updateCategoryMutation.isPending;

  const moveCategory = (index: number, delta: -1 | 1) => {
    const target = index + delta;
    if (target < 0 || target >= categories.length || reorderMutation.isPending) return;
    const next = [...categories];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    reorderMutation.mutate(next.map((category) => category.id));
  };

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  const openCreate = () => {
    createCategoryMutation.reset();
    updateCategoryMutation.reset();
    setForm({ mode: 'create' });
  };

  const openEdit = (category: ShoppingCategory) => {
    createCategoryMutation.reset();
    updateCategoryMutation.reset();
    setForm({ mode: 'edit', category });
  };

  const submitForm = async (input: CreateCategoryInput) => {
    if (!form) return;
    try {
      if (form.mode === 'edit' && form.category) {
        await updateCategoryMutation.mutateAsync({ categoryId: form.category.id, input });
      } else {
        await createCategoryMutation.mutateAsync(input);
      }
      setForm(null);
    } catch {
      /* surface error: keep sheet open for retry */
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategoryMutation.mutateAsync(deleteTarget.id);
      setDeleteTarget(null);
    } catch {
      /* surface error below modal */
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      edges={['top']}
      style={{ direction, backgroundColor: colors.background }}>
      <AppHeader back onBack={goBack} title={t('shopping.categoryManagerTitle')} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, gap: 16, paddingBottom: 32 }}>
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <Text style={[text.eyebrow, { color: colors.secondary, textTransform: 'uppercase' }]}>
              {t('shopping.categoryManagerInfo')}
            </Text>
            {categories.length > 0 ? (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 11,
                  backgroundColor: colors.badge,
                }}>
                <Text style={[text.badge, { color: colors.secondary }]}>
                  {t('shopping.categoryCount', { count: categories.length })}
                </Text>
              </View>
            ) : null}
          </View>
          <Text style={[text.cardSubtitle, { color: colors.secondary }]}>
            {t('shopping.categoryManagerHint', { household: activeHousehold?.name ?? '' })}
          </Text>
        </View>

        {categoriesQuery.isLoading ? (
          <View style={{ paddingVertical: 32, alignItems: 'center' }}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : categories.length === 0 ? (
          <View style={{ gap: 8, paddingVertical: 32 }}>
            <IconSymbol name="cart.fill" size={48} color={colors.secondary} style={{ alignSelf: 'center' }} />
            <Text style={[text.cardTitle, { color: colors.text, textAlign: 'center' }]}>
              {t('shopping.noCategories')}
            </Text>
            <Text style={[text.footer, { color: colors.secondary, textAlign: 'center' }]}>
              {t('shopping.noCategoriesHint')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {categories.map((category, index) => (
              <Pressable
                key={category.id}
                onPress={() => openEdit(category)}
                accessibilityRole="button"
                accessibilityLabel={t('shopping.editCategory')}
                style={{
                  padding: 12,
                  backgroundColor: colors.card,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 }}>
                  <Text style={[text.itemName, { color: colors.text }]} numberOfLines={1}>
                    {category.name}
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={{ gap: 4 }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('shopping.moveUp')}
                      disabled={index === 0 || reorderMutation.isPending}
                      hitSlop={6}
                      onPress={() => moveCategory(index, -1)}
                      style={{
                        width: 28,
                        height: 20,
                        borderRadius: 6,
                        backgroundColor: index === 0 ? colors.badge : colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <IconSymbol name="chevron.up" size={12} color={index === 0 ? colors.secondary : colors.text} />
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={t('shopping.moveDown')}
                      disabled={index === categories.length - 1 || reorderMutation.isPending}
                      hitSlop={6}
                      onPress={() => moveCategory(index, 1)}
                      style={{
                        width: 28,
                        height: 20,
                        borderRadius: 6,
                        backgroundColor: index === categories.length - 1 ? colors.badge : colors.background,
                        borderWidth: 1,
                        borderColor: colors.border,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                      <IconSymbol
                        name="chevron.down"
                        size={12}
                        color={index === categories.length - 1 ? colors.secondary : colors.text}
                      />
                    </Pressable>
                  </View>
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <IconSymbol name="pencil" size={14} color={colors.secondary} />
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={{ paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }}>
        <Pressable
          onPress={openCreate}
          accessibilityRole="button"
          style={{
            height: 50,
            borderRadius: 12,
            backgroundColor: colors.accent,
            borderWidth: 1,
            borderColor: colors.borderStrong,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 8,
          }}>
          <IconSymbol name="plus" size={18} color={colors.accentText} />
          <Text style={[text.fabLabel, { color: colors.accentText }]}>{t('shopping.addNewCategory')}</Text>
        </Pressable>
      </View>

      <CategoryFormSheet
        key={form ? (form.mode === 'edit' ? form.category?.id ?? 'edit' : 'create') : 'closed'}
        visible={form !== null}
        mode={form?.mode ?? 'create'}
        category={form?.category ?? null}
        saving={saving}
        error={
          form && (createCategoryMutation.error ?? updateCategoryMutation.error)
            ? (createCategoryMutation.error ?? updateCategoryMutation.error)?.message
            : null
        }
        onClose={() => !saving && setForm(null)}
        onSubmit={submitForm}
        onDelete={
          form?.mode === 'edit' && form.category
            ? () => {
                setDeleteTarget(form.category ?? null);
                setForm(null);
              }
            : undefined
        }
      />

      {deleteTarget ? (
        <ConfirmModal
          title={t('shopping.deleteCategoryTitle')}
          body={t('shopping.deleteCategoryBody', { name: deleteTarget.name })}
          confirmLabel={t('shopping.deleteConfirm')}
          saving={deleteCategoryMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </SafeAreaView>
  );
}