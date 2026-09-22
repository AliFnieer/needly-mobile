import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Platform, KeyboardAvoidingView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { typographyFor } from '@/constants/theme';
import { resolveConflictKeepMine, resolveConflictUseTheirs } from '@/offline/outbox';
import { useOutboxStore, type ConflictState } from '@/offline/outbox-store';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

function describe(local: ConflictState['local'], server: ConflictState['server']) {
  const quantity = local.quantity ?? server.quantity;
  const unit = (local.unit ?? server.unit).trim();
  return {
    name: local.name ?? server.name,
    quantity,
    unit,
    hasUnit: unit.length > 0,
  };
}

export function ConflictResolutionSheet() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const conflict = useOutboxStore((state) => state.conflict);
  const [saving, setSaving] = useState<'mine' | 'theirs' | null>(null);

  if (!conflict) return null;

  const mine = describe(conflict.local, conflict.server);
  const theirs = describe({}, conflict.server);

  const onRequestClose = () => {
    if (saving !== null) return;
    // No dismissing: the queued change stays pending until the user picks a version.
  };

  const onKeepMine = async () => {
    setSaving('mine');
    try {
      await resolveConflictKeepMine();
    } catch {
      // Leave the conflict open so the user can retry.
    } finally {
      setSaving(null);
    }
  };

  const onUseTheirs = () => {
    setSaving('theirs');
    resolveConflictUseTheirs();
    setSaving(null);
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onRequestClose}>
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
            <View className="gap-xs">
              <Text style={[typography.h3]} className={cls('text-on-surface', 'text-on-surface-dark')}>
                {t('conflict.title')}
              </Text>
              <Text
                style={[typography['body-sm']]}
                className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
                {t('conflict.body')}
              </Text>
            </View>

            <View className="gap-sm">
              <View
                className={cls(
                  'gap-xs rounded-lg border border-outline-variant bg-surface-container-low p-md',
                  'gap-xs rounded-lg border border-outline-variant-dark bg-surface-container-low-dark p-md',
                )}>
                <Text
                  style={[typography['label-md']]}
                  className={cls('uppercase text-on-surface-variant', 'uppercase text-on-surface-variant-dark')}>
                  {t('conflict.yourChange')}
                </Text>
                <Text style={[typography.h3]} className={cls('text-on-surface', 'text-on-surface-dark')}>
                  {mine.name}
                </Text>
                <Text
                  style={[typography['body-sm']]}
                  className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
                  {mine.hasUnit ? t('conflict.quantityUnit', { quantity: mine.quantity, unit: mine.unit }) : String(mine.quantity)}
                </Text>
              </View>

              <View
                className={cls(
                  'gap-xs rounded-lg border border-outline-variant bg-surface-container-low p-md',
                  'gap-xs rounded-lg border border-outline-variant-dark bg-surface-container-low-dark p-md',
                )}>
                <Text
                  style={[typography['label-md']]}
                  className={cls('uppercase text-on-surface-variant', 'uppercase text-on-surface-variant-dark')}>
                  {t('conflict.newerVersion')}
                </Text>
                <Text style={[typography.h3]} className={cls('text-on-surface', 'text-on-surface-dark')}>
                  {theirs.name}
                </Text>
                <Text
                  style={[typography['body-sm']]}
                  className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
                  {theirs.hasUnit ? t('conflict.quantityUnit', { quantity: theirs.quantity, unit: theirs.unit }) : String(theirs.quantity)}
                </Text>
              </View>
            </View>

            <View className="flex-row gap-sm">
              <View className="flex-1">
                <Button
                  title={t('conflict.useTheirs')}
                  variant="secondary"
                  onPress={onUseTheirs}
                  loading={saving === 'theirs'}
                  disabled={saving !== null}
                />
              </View>
              <View className="flex-1">
                <Button
                  title={t('conflict.keepMine')}
                  onPress={onKeepMine}
                  loading={saving === 'mine'}
                  disabled={saving !== null}
                />
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}