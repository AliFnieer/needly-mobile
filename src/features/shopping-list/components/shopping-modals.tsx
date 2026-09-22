import { Platform, Modal, KeyboardAvoidingView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { typographyFor } from '@/constants/theme';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';
import { useTranslation } from 'react-i18next';

type ListFormModalProps = {
  visible: boolean;
  mode: 'create' | 'rename' | null;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

export function ListFormModal({
  visible,
  mode,
  value,
  onChange,
  error,
  saving,
  onClose,
  onSubmit,
}: ListFormModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const title = mode === 'rename' ? t('shopping.renameTitle') : t('shopping.newTitle');
  const submitLabel = mode === 'rename' ? t('shopping.save') : t('shopping.create');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, direction }}>
        <View
          className={cls('flex-1 justify-center bg-black/40 p-xl', 'flex-1 justify-center bg-black/60 p-xl')}>
          <View
            className={cls(
              'gap-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-xl',
              'gap-lg rounded-xl border border-outline-variant-dark bg-surface-container-lowest-dark p-xl',
            )}>
            <Text style={[typography.h3]} className={cls('text-on-surface', 'text-on-surface-dark')}>
              {title}
            </Text>
            <TextField
              label={t('shopping.nameLabel')}
              value={value}
              onChangeText={onChange}
              placeholder={t('shopping.namePlaceholder')}
              error={error}
              autoCapitalize="words"
              autoComplete="off"
            />
            <Text
              style={[typography['body-sm']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {t('shopping.nameHint')}
            </Text>
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <Button title={t('shopping.cancel')} variant="secondary" onPress={onClose} disabled={saving} />
              </View>
              <View className="flex-1">
                <Button title={submitLabel} onPress={onSubmit} loading={saving} />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type ConfirmModalProps = {
  title: string;
  body: string;
  confirmLabel: string;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmModal({ title, body, confirmLabel, saving, onCancel, onConfirm }: ConfirmModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCancel}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1, direction }}>
        <View
          className={cls('flex-1 justify-center bg-black/40 p-xl', 'flex-1 justify-center bg-black/60 p-xl')}>
          <View
            className={cls(
              'gap-lg rounded-xl border border-outline-variant bg-surface-container-lowest p-xl',
              'gap-lg rounded-xl border border-outline-variant-dark bg-surface-container-lowest-dark p-xl',
            )}>
            <Text style={[typography.h3]} className={cls('text-on-surface', 'text-on-surface-dark')}>
              {title}
            </Text>
            <Text style={[typography['body-md']]} className={cls('text-on-surface', 'text-on-surface-dark')}>
              {body}
            </Text>
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <Button title={t('shopping.cancel')} variant="secondary" onPress={onCancel} disabled={saving} />
              </View>
              <View className="flex-1">
                <Button title={confirmLabel} variant="secondary" onPress={onConfirm} loading={saving} />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}