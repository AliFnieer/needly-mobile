import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

import { IconSymbol } from '@/components/ui/icon-symbol';
import type {
  CreateShoppingItemInput,
  RecurrenceRule,
  ShoppingCategory,
  ShoppingItem,
} from '@/services/shopping-lists-api';

import { useShoppingTokens } from './shopping-tokens';

const RECURRENCE_OPTIONS = ['', 'daily', 'weekly', 'biweekly', 'monthly'] as const;
const DEFAULT_UNITS = ['kg', 'g', 'L', 'ml', 'pcs', 'pack'];

type ItemFormSheetProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  listName: string;
  item?: ShoppingItem | null;
  categories: ShoppingCategory[];
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: CreateShoppingItemInput) => void;
  onCreateCategory: (name: string) => Promise<ShoppingCategory | null>;
};

export function ItemFormSheet({
  visible,
  mode,
  listName,
  item,
  categories,
  saving,
  error,
  onClose,
  onSubmit,
  onCreateCategory,
}: ItemFormSheetProps) {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const [name, setName] = useState(item?.name ?? '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [unit, setUnit] = useState(item?.unit ?? '');
  const [customUnit, setCustomUnit] = useState(item?.unit ?? '');
  const [showCustomUnit, setShowCustomUnit] = useState(
    !!item?.unit && !DEFAULT_UNITS.includes(item.unit),
  );
  const [categoryId, setCategoryId] = useState<number | null>(item?.category_id ?? null);
  const [recurrence, setRecurrence] = useState<RecurrenceRule>(item?.recurrence_rule ?? '');
  const [newCategoryOpen, setNewCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [extraCategory, setExtraCategory] = useState<ShoppingCategory | null>(null);

  const parsedQuantity = parseFloat(quantity);
  const validQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0;
  const canSubmit = name.trim().length >= 1 && validQuantity;

  const stepQuantity = (delta: number) => {
    const base = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1;
    const next = Math.round(Math.max(0.5, base + delta) * 10) / 10;
    setQuantity(String(next));
  };

  const unitOptions = DEFAULT_UNITS.includes(unit) ? DEFAULT_UNITS : [...DEFAULT_UNITS, unit];

  const submit = () => {
    if (!canSubmit || saving) return;
    const finalUnit = (showCustomUnit ? customUnit.trim() : unit.trim()) || undefined;
    const payload: CreateShoppingItemInput = {
      name: name.trim(),
      quantity: parsedQuantity,
      category_id: categoryId,
    };
    if (finalUnit) payload.unit = finalUnit;
    if (recurrence !== '') payload.recurrence_rule = recurrence;
    onSubmit(payload);
  };

  const repeatLabel =
    recurrence !== '' ? t(`shopping.recurrence.${recurrence}`) : t('shopping.never');
  const nextDue = mode === 'edit' && item?.next_due_at ? shortestDate(item.next_due_at, language) : null;

  const allCategories = extraCategory
    ? categories.some((category) => category.id === extraCategory.id)
      ? categories
      : [...categories, extraCategory]
    : categories;

  const selectedCategory =
    categoryId != null ? allCategories.find((category) => category.id === categoryId) ?? null : null;

  const submitNewCategory = async () => {
    const nextName = newCategoryName.trim();
    if (nextName.length < 1 || creatingCategory) return;
    setCreatingCategory(true);
    try {
      const created = await onCreateCategory(nextName);
      if (created && !saving) {
        setExtraCategory(created);
        setCategoryId(created.id);
        setNewCategoryName('');
        setNewCategoryOpen(false);
      }
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, direction, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
          }}
          accessibilityRole="button"
        />
        <View
          onStartShouldSetResponder={() => true}
          style={{
            maxHeight: '92%',
            backgroundColor: colors.card,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 12,
          }}>
          <View style={{ alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border }} />

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingTop: 20,
              paddingBottom: 20,
              gap: 20,
            }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={[text.headerTitle, { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>
              {mode === 'edit' ? t('shopping.editItemTitle') : t('shopping.addItemTitle', { list: listName })}
            </Text>
            <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" disabled={saving}>
              <IconSymbol name="xmark" size={20} color={colors.secondary} />
            </Pressable>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[text.categoryLabel, { fontSize: 11, color: colors.secondary, textTransform: 'uppercase' }]}>
              {t('shopping.itemNameLabel')}
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder={t('shopping.itemNamePlaceholder')}
              placeholderTextColor={colors.secondary}
              style={{
                height: 48,
                paddingHorizontal: 16,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                color: colors.text,
                ...text.itemName,
              }}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 16 }}>
            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[text.categoryLabel, { fontSize: 11, color: colors.secondary, textTransform: 'uppercase' }]}>
                {t('shopping.quantityLabel')}
              </Text>
              <View
                style={{
                  height: 48,
                  paddingHorizontal: 8,
                  backgroundColor: colors.background,
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <StepperButton label="–" onPress={() => stepQuantity(-0.5)} />
                <TextInput
                  value={quantity}
                  onChangeText={(value) => {
                    if (/^\d*\.?\d*$/.test(value)) setQuantity(value);
                  }}
                  keyboardType="decimal-pad"
                  style={[
                    text.quantity,
                    { flex: 1, textAlign: 'center', paddingVertical: 0, color: colors.text, fontSize: 20 },
                  ]}
                />
                <StepperButton label="+" onPress={() => stepQuantity(0.5)} />
              </View>
            </View>

            <View style={{ flex: 1, gap: 6 }}>
              <Text style={[text.categoryLabel, { fontSize: 11, color: colors.secondary, textTransform: 'uppercase' }]}>
                {t('shopping.unitLabel')}
              </Text>
              <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 6, flex: 1 }}>
                {unitOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option}
                    selected={!showCustomUnit && unit === option}
                    onPress={() => {
                      setUnit(option);
                      setShowCustomUnit(false);
                    }}
                  />
                ))}
                <Chip
                  label={`+ ${t('shopping.newUnit')}`}
                  selected={showCustomUnit}
                  onPress={() => setShowCustomUnit(true)}
                />
              </View>
            </View>
          </View>

          {showCustomUnit ? (
            <TextInput
              value={customUnit}
              onChangeText={setCustomUnit}
              placeholder={t('shopping.customUnitPlaceholder')}
              placeholderTextColor={colors.secondary}
              style={{
                height: 44,
                paddingHorizontal: 14,
                backgroundColor: colors.background,
                borderWidth: 1,
                borderColor: colors.borderStrong,
                borderRadius: 12,
                color: colors.text,
                ...text.itemName,
              }}
              autoCapitalize="none"
              autoCorrect={false}
            />
          ) : null}

          <View style={{ gap: 6 }}>
            <Text style={[text.categoryLabel, { fontSize: 11, color: colors.secondary, textTransform: 'uppercase' }]}>
              {t('shopping.categoryLabel')}
            </Text>
            <ScrollView
              horizontal
              keyboardShouldPersistTaps="handled"
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              style={{ flexGrow: 0 }}>
              <CategoryPill
                label={t('shopping.uncategorized')}
                selected={categoryId === null}
                onPress={() => setCategoryId(null)}
              />
              {allCategories.map((category) => (
                <CategoryPill
                  key={category.id}
                  label={category.name}
                  selected={categoryId === category.id}
                  onPress={() => setCategoryId(categoryId === category.id ? null : category.id)}
                />
              ))}
              {!newCategoryOpen ? (
                <CategoryPill
                  label={`+ ${t('shopping.newCategory')}`}
                  dashed
                  onPress={() => setNewCategoryOpen(true)}
                />
              ) : null}
            </ScrollView>
            {newCategoryOpen ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TextInput
                  value={newCategoryName}
                  onChangeText={setNewCategoryName}
                  placeholder={t('shopping.newCategoryPlaceholder')}
                  placeholderTextColor={colors.secondary}
                  autoFocus
                  autoCapitalize="words"
                  autoCorrect={false}
                  onSubmitEditing={submitNewCategory}
                  style={{
                    flex: 1,
                    height: 44,
                    paddingHorizontal: 14,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.borderStrong,
                    borderRadius: 12,
                    color: colors.text,
                    ...text.itemName,
                  }}
                />
                <Pressable
                  onPress={submitNewCategory}
                  disabled={creatingCategory || newCategoryName.trim().length < 1}
                  accessibilityRole="button"
                  hitSlop={8}
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor:
                      creatingCategory || newCategoryName.trim().length < 1 ? colors.badge : colors.accent,
                    borderWidth: 1,
                    borderColor:
                      creatingCategory || newCategoryName.trim().length < 1 ? colors.border : colors.borderStrong,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  {creatingCategory ? (
                    <ActivityIndicator color={colors.accentText} size="small" />
                  ) : (
                    <IconSymbol name="plus" size={18} color={colors.accentText} />
                  )}
                </Pressable>
              </View>
            ) : null}

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[text.completedMeta, { color: colors.borderStrong }]}>
                {selectedCategory
                  ? t('shopping.categorySelected', { category: selectedCategory.name })
                  : t('shopping.categorySelectedNone')}
              </Text>
            </View>
          </View>

          <View style={{ gap: 6 }}>
            <Text style={[text.categoryLabel, { fontSize: 11, color: colors.secondary, textTransform: 'uppercase' }]}>
              {t('shopping.repeatLabel')}
            </Text>
            <View style={{ flexWrap: 'wrap', flexDirection: 'row', gap: 8 }}>
              {RECURRENCE_OPTIONS.map((option) => {
                const label = option === '' ? t('shopping.never') : t(`shopping.recurrence.${option}`);
                return (
                  <Chip
                    key={option}
                    label={label}
                    selected={recurrence === option}
                    onPress={() => setRecurrence(option)}
                  />
                );
              })}
            </View>
            {recurrence !== '' ? (
              <Text style={[text.completedMeta, { color: colors.borderStrong }]}>
                {t('shopping.repeatsEvery', { rule: repeatLabel })}
                {nextDue ? ` · ${t('shopping.nextDue', { date: nextDue })}` : ''}
              </Text>
            ) : null}
          </View>
          </ScrollView>

          <View
            style={{
              paddingHorizontal: 20,
              paddingTop: 12,
              paddingBottom: 28,
            }}>
            {error ? (
              <Text
                style={[
                  text.toastMeta,
                  { color: colors.error, textAlign: 'center', marginBottom: 10 },
                ]}>
                {error}
              </Text>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <ActionButton
                  label={t('shopping.cancel')}
                  secondary
                  onPress={onClose}
                  disabled={saving}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ActionButton
                  label={t('shopping.saveItem')}
                  onPress={submit}
                  disabled={!canSubmit || saving}
                  loading={saving}
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function StepperButton({ label, onPress }: { label: string; onPress: () => void }) {
  const { colors } = useShoppingTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      hitSlop={6}
      style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: colors.card,
        borderWidth: 1,
        borderColor: colors.border,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Text style={{ color: colors.text, fontSize: 20, lineHeight: 24, fontWeight: '700', fontFamily: 'sans-serif' }}>
        {label}
      </Text>
    </Pressable>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors, text } = useShoppingTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: selected ? colors.accent : colors.background,
        borderWidth: 1,
        borderColor: selected ? colors.borderStrong : colors.border,
      }}>
      <Text style={[text.itemName, { color: colors.text }]}>{label}</Text>
    </Pressable>
  );
}

type ActionButtonProps = {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  loading?: boolean;
};

function ActionButton({ label, onPress, secondary, disabled, loading }: ActionButtonProps) {
  const { colors, text } = useShoppingTokens();
  const inactive = disabled && !loading;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={{
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: secondary ? colors.background : inactive ? colors.badge : colors.accent,
        borderWidth: 1,
        borderColor: secondary || inactive ? colors.border : colors.borderStrong,
      }}>
      {loading ? (
        <ActivityIndicator color={secondary ? colors.secondary : colors.accentText} size="small" />
      ) : (
        <Text
          style={[
            text.fabLabel,
            { color: secondary || inactive ? colors.secondary : colors.accentText, textAlign: 'center' },
          ]}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}

function CategoryPill({
  label,
  dashed,
  selected = false,
  onPress,
}: {
  label: string;
  dashed?: boolean;
  selected?: boolean;
  onPress: () => void;
}) {
  const { colors, text } = useShoppingTokens();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={{
        height: 40,
        paddingHorizontal: 14,
        borderRadius: 20,
        backgroundColor: selected ? colors.accent : colors.background,
        borderWidth: 1,
        borderColor: dashed ? colors.border : selected ? colors.borderStrong : colors.border,
        borderStyle: dashed ? 'dashed' : 'solid',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      }}>
      <Text style={[text.itemName, { color: selected ? colors.accentText : colors.text }]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function shortestDate(iso: string, language: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return date.toLocaleDateString(language.startsWith('ar') ? 'ar-EG' : 'en-US', { weekday: 'short' });
  } catch {
    return date.toLocaleDateString();
  }
}