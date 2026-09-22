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
import type { CreateCategoryInput, ShoppingCategory } from '@/services/categories-api';

import { useShoppingTokens } from './shopping-tokens';

type CategoryFormSheetProps = {
  visible: boolean;
  mode: 'create' | 'edit';
  category?: ShoppingCategory | null;
  saving: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (input: CreateCategoryInput) => void;
  onDelete?: () => void;
};

export function CategoryFormSheet({
  visible,
  mode,
  category,
  saving,
  error,
  onClose,
  onSubmit,
  onDelete,
}: CategoryFormSheetProps) {
  const { t } = useTranslation();
  const { colors, text, language } = useShoppingTokens();
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const [name, setName] = useState(category?.name ?? '');

  const canSave = name.trim().length >= 1;

  const submit = () => {
    if (!canSave || saving) return;
    onSubmit({ name: name.trim() });
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
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20, gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[text.headerTitle, { color: colors.text, flexShrink: 1 }]} numberOfLines={1}>
                {mode === 'edit' ? t('shopping.editCategory') : t('shopping.addNewCategory')}
              </Text>
              <Pressable onPress={onClose} hitSlop={8} accessibilityRole="button" disabled={saving}>
                <IconSymbol name="xmark" size={20} color={colors.secondary} />
              </Pressable>
            </View>

            <View style={{ gap: 6 }}>
              <Text style={[text.categoryLabel, { fontSize: 11, color: colors.secondary, textTransform: 'uppercase' }]}>
                {t('shopping.categoryNameLabel')}
              </Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder={t('shopping.newCategoryPlaceholder')}
                placeholderTextColor={colors.secondary}
                autoFocus
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
              />
            </View>

            {mode === 'edit' && onDelete ? (
              <Pressable
                onPress={onDelete}
                disabled={saving}
                accessibilityRole="button"
                style={{
                  height: 44,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: colors.error,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}>
                <IconSymbol name="trash" size={16} color={colors.error} />
                <Text style={[text.fabLabel, { color: colors.error }]}>{t('shopping.deleteConfirm')}</Text>
              </Pressable>
            ) : null}
          </ScrollView>

          <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 28 }}>
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
                <View style={{ height: 48, borderRadius: 12 }}>
                  <Pressable
                    onPress={onClose}
                    disabled={saving}
                    accessibilityRole="button"
                    style={{
                      flex: 1,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                    }}>
                    <Text style={[text.fabLabel, { color: colors.secondary }]}>{t('shopping.cancel')}</Text>
                  </Pressable>
                </View>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={submit}
                  disabled={!canSave || saving}
                  accessibilityRole="button"
                  style={{
                    height: 48,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: !canSave || saving ? colors.badge : colors.accent,
                    borderWidth: 1,
                    borderColor: !canSave || saving ? colors.border : colors.borderStrong,
                  }}>
                  {saving ? (
                    <ActivityIndicator color={colors.accentText} size="small" />
                  ) : (
                    <Text style={[text.fabLabel, { color: !canSave || saving ? colors.secondary : colors.accentText }]}>
                      {mode === 'edit' ? t('shopping.save') : t('shopping.create')}
                    </Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}