import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { AppHeader } from '@/components/ui/app-header';
import { TextField } from '@/components/ui/text-field';
import { typographyFor } from '@/constants/theme';
import {
  useAddHouseholdMemberMutation,
  useCreateHouseholdMutation,
  useDeleteHouseholdMutation,
  useHouseholdsQuery,
  useRemoveHouseholdMemberMutation,
  useUpdateHouseholdMutation,
  type Household,
  type HouseholdMember,
} from '@/hooks/use-households';
import { useUserLookupQuery } from '@/hooks/use-users';
import { useAuth } from '@/providers/auth-provider';
import { useLanguage } from '@/providers/language-provider';
import { useTheme } from '@/providers/theme-provider';

const HOUSEHOLDS_ICON = 'person.3.fill';

export function HouseholdsScreen() {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls, colors } = useTheme();
  const { user } = useAuth();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';

  const householdsQuery = useHouseholdsQuery();
  const createMutation = useCreateHouseholdMutation();
  const updateMutation = useUpdateHouseholdMutation();
  const deleteMutation = useDeleteHouseholdMutation();
  const addMemberMutation = useAddHouseholdMemberMutation();
  const removeMemberMutation = useRemoveHouseholdMemberMutation();

  const [formMode, setFormMode] = useState<'create' | 'rename' | null>(null);
  const [formTarget, setFormTarget] = useState<Household | null>(null);
  const [formName, setFormName] = useState('');
  const [formError, setFormError] = useState<string>();
  const [actionError, setActionError] = useState<string>();
  const [memberTarget, setMemberTarget] = useState<Household | null>(null);
  const [memberUserId, setMemberUserId] = useState('');
  const [memberError, setMemberError] = useState<string>();
  const [removeTarget, setRemoveTarget] = useState<{ household: Household; member: HouseholdMember } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Household | null>(null);

  const households = householdsQuery.data ?? [];
  const isEmpty = !householdsQuery.isLoading && households.length === 0;

  const openCreate = () => {
    setFormTarget(null);
    setFormName('');
    setFormError(undefined);
    setActionError(undefined);
    setFormMode('create');
  };

  const openRename = (household: Household) => {
    setFormTarget(household);
    setFormName(household.name);
    setFormError(undefined);
    setActionError(undefined);
    setFormMode('rename');
  };

  const closeForm = () => {
    if (createMutation.isPending || updateMutation.isPending) return;
    setFormMode(null);
  };

  const saveForm = async () => {
    const name = formName.trim();
    if (name.length < 2) {
      setFormError(t('households.nameHint'));
      return;
    }
    setFormError(undefined);
    try {
      if (formMode === 'rename' && formTarget) {
        await updateMutation.mutateAsync({ housegroupId: formTarget.id, name });
      } else {
        await createMutation.mutateAsync(name);
      }
      setFormMode(null);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : t('households.errorSave'));
    }
  };

  const openAddMember = (household: Household) => {
    setMemberTarget(household);
    setMemberUserId('');
    setMemberError(undefined);
  };

  const saveMember = async (userId: number) => {
    if (!memberTarget || !Number.isInteger(userId) || userId <= 0) {
      setMemberError(t('households.errorSave'));
      return;
    }
    setMemberError(undefined);
    try {
      await addMemberMutation.mutateAsync({ householdId: memberTarget.id, userId });
      setMemberTarget(null);
    } catch (error) {
      setMemberError(error instanceof Error ? error.message : t('households.errorSave'));
    }
  };

  const removeMember = async (household: Household, member: HouseholdMember) => {
    try {
      await removeMemberMutation.mutateAsync({ householdId: household.id, userId: member.user_id });
      setActionError(undefined);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('households.errorSave'));
    }
    setRemoveTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      setActionError(undefined);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : t('households.errorSave'));
    }
    setDeleteTarget(null);
  };

  return (
    <SafeAreaView
        className={cls('flex-1 bg-surface', 'flex-1 bg-surface-dark')}
        edges={['top']}
        style={{ direction }}>
      <AppHeader title={t('households.title')} subtitle={t('households.caption')} />
      <ScrollView
        className={cls('flex-1', 'flex-1')}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={householdsQuery.isRefetching}
            onRefresh={() => householdsQuery.refetch()}
            tintColor={colors.primary}
          />
        }
        contentContainerClassName="gap-xl px-xl pt-lg pb-xxl">
        <Button title={t('households.new')} onPress={openCreate} loading={createMutation.isPending} />

        {actionError ? (
          <View className={cls('rounded-md p-md bg-error-container', 'rounded-md p-md bg-error-container-dark')}>
            <Text
              style={[typography['body-sm']]}
              className={cls('text-center text-on-error-container', 'text-center text-on-error-container-dark')}>
              {actionError}
            </Text>
          </View>
        ) : null}

        {householdsQuery.isLoading ? (
          <View className="items-center justify-center py-xxl">
            <ActivityIndicator color={colors.primary} />
            <Text
              style={[typography['body-sm']]}
              className={cls('mt-sm text-center text-on-surface-variant', 'mt-sm text-center text-on-surface-variant-dark')}>
              {t('households.loading')}
            </Text>
          </View>
        ) : householdsQuery.isError ? (
          <View className="gap-sm py-xxl">
            <Text
              style={[typography['body-md']]}
              className={cls('text-center text-error', 'text-center text-error-dark')}>
              {t('households.errorLoad')}
            </Text>
            <Button title={t('households.retry')} variant="secondary" onPress={() => householdsQuery.refetch()} />
          </View>
        ) : isEmpty ? (
          <View className="gap-sm py-xxl">
            <IconSymbol
              name={HOUSEHOLDS_ICON}
              size={48}
              color={colors['outline-variant']}
              style={{ alignSelf: 'center' }}
            />
            <Text
              style={[typography.h3]}
              className={cls('text-center text-on-surface', 'text-center text-on-surface-dark')}>
              {t('households.empty')}
            </Text>
            <Text
              style={[typography['body-sm']]}
              className={cls('text-center text-on-surface-variant', 'text-center text-on-surface-variant-dark')}>
              {t('households.emptyHint')}
            </Text>
          </View>
        ) : (
          households.map((household) => (
            <HouseholdCard
              key={household.id}
              household={household}
              currentUserId={user?.id}
              typography={typography}
              cls={cls}
              colors={colors}
              t={t}
              onRename={openRename}
              onDelete={setDeleteTarget}
              onAddMember={openAddMember}
              onRemoveMember={(member) => setRemoveTarget({ household, member })}
            />
          ))
        )}
      </ScrollView>

      <FormModal
        visible={formMode !== null}
        mode={formMode}
        value={formName}
        onChange={setFormName}
        error={formError}
        saving={formMode === 'rename' ? updateMutation.isPending : createMutation.isPending}
        onClose={closeForm}
        onSubmit={saveForm}
      />

      <MemberModal
        visible={memberTarget !== null}
        household={memberTarget}
        userId={memberUserId}
        onChangeUserId={setMemberUserId}
        error={memberError}
        saving={addMemberMutation.isPending}
        onClose={() => setMemberTarget(null)}
        onSubmit={saveMember}
      />

      {removeTarget ? (
        <ConfirmModal
          title={t('households.removeMemberTitle', { name: `#${removeTarget.member.user_id}` })}
          body={t('households.removeMemberBody')}
          confirmLabel={t('households.removeMember')}
          saving={removeMemberMutation.isPending}
          onCancel={() => setRemoveTarget(null)}
          onConfirm={() => removeMember(removeTarget.household, removeTarget.member)}
        />
      ) : null}

      {deleteTarget ? (
        <ConfirmModal
          title={t('households.deleteTitle')}
          body={t('households.deleteBody', { name: deleteTarget.name })}
          confirmLabel={t('households.deleteConfirm')}
          saving={deleteMutation.isPending}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </SafeAreaView>
  );
}

type MemberRowProps = {
  member: HouseholdMember;
  currentUserId?: number;
  isOwner: boolean;
  onRemoveMember: (member: HouseholdMember) => void;
};

function MemberRow({ member, currentUserId, isOwner, onRemoveMember }: MemberRowProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls, colors } = useTheme();
  const typography = typographyFor(language);
  const self = currentUserId !== undefined && member.user_id === currentUserId;
  const memberOwner = member.role === 'owner';
  const { data: user } = useUserLookupQuery(self ? undefined : member.user_id);

  return (
    <View className="min-h-12 flex-row items-center gap-md px-sm">
      <View
        className={cls(
          'h-8 w-8 items-center justify-center rounded-full bg-surface-container',
          'h-8 w-8 items-center justify-center rounded-full bg-surface-container-dark',
        )}>
        <Text style={[typography['label-md']]} className={cls('text-on-surface', 'text-on-surface-dark')}>
          #{member.user_id}
        </Text>
      </View>
      <View className="shrink flex-1">
        <Text style={[typography['body-md']]} className={cls('text-on-surface', 'text-on-surface-dark')}>
          {self
            ? t('households.you')
            : user
              ? `${user.first_name} ${user.last_name}`.trim()
              : t('households.userLabel', { id: member.user_id })}
        </Text>
        <Text
          style={[typography['body-sm']]}
          className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
          {memberOwner ? t('households.roleOwner') : t('households.roleMember')}
        </Text>
      </View>
      {!memberOwner && isOwner ? (
        <Pressable
          onPress={() => onRemoveMember(member)}
          accessibilityRole="button"
          hitSlop={8}
          style={{ padding: 4 }}>
          <IconSymbol name="trash" size={18} color={colors.error} />
        </Pressable>
      ) : null}
    </View>
  );
}

type HouseholdCardProps = {
  household: Household;
  currentUserId?: number;
  typography: ReturnType<typeof typographyFor>;
  cls: (light: string, dark: string) => string;
  colors: Record<string, string>;
  t: ReturnType<typeof useTranslation>['t'];
  onRename: (household: Household) => void;
  onDelete: (household: Household) => void;
  onAddMember: (household: Household) => void;
  onRemoveMember: (member: HouseholdMember) => void;
};

function HouseholdCard({
  household,
  currentUserId,
  typography,
  cls,
  colors,
  t,
  onRename,
  onDelete,
  onAddMember,
  onRemoveMember,
}: HouseholdCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isOwner = household.owner_id === currentUserId;
  const count = household.members.length;

  return (
    <View
      className={cls(
        'overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest',
        'overflow-hidden rounded-xl border border-outline-variant-dark bg-surface-container-lowest-dark',
      )}>
      <Pressable
        onPress={() => setExpanded((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        android_ripple={{ color: `${colors['on-surface']}22` }}
        className="min-h-16 flex-row items-center gap-md px-md">
        <View
          className={cls(
            'h-10 w-10 items-center justify-center rounded-lg bg-primary-container',
            'h-10 w-10 items-center justify-center rounded-lg bg-primary-container-dark',
          )}>
          <IconSymbol name={HOUSEHOLDS_ICON} size={20} color={colors['on-primary-container']} />
        </View>
        <View className="shrink flex-1 gap-xs">
          <Text
            style={[typography['body-lg']]}
            className={cls('text-on-surface', 'text-on-surface-dark')}
            numberOfLines={1}>
            {household.name}
          </Text>
          <Text
            style={[typography['body-sm']]}
            className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
            {t('households.memberCount', { count })}
            {isOwner ? ` · ${t('households.roleOwner')}` : ''}
          </Text>
        </View>
        <IconSymbol
          name={expanded ? 'chevron.down' : 'chevron.right'}
          size={20}
          color={colors['on-surface-variant']}
        />
      </Pressable>

      {expanded ? (
        <View className={cls('border-t border-outline-variant', 'border-t border-outline-variant-dark')}>
          <View className="gap-sm p-md">
            <Text
              style={[typography['label-md']]}
              className={cls('uppercase text-on-surface-variant', 'uppercase text-on-surface-variant-dark')}>
              {t('households.members')}
            </Text>
            {household.members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                currentUserId={currentUserId}
                isOwner={isOwner}
                onRemoveMember={onRemoveMember}
              />
            ))}

            <View className="mt-xs flex-row flex-wrap gap-sm">
              <Button title={t('households.addMember')} variant="secondary" onPress={() => onAddMember(household)} />
              <Button title={t('households.renameTitle')} variant="secondary" onPress={() => onRename(household)} />
              <Button title={t('households.delete')} variant="secondary" onPress={() => onDelete(household)} />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

type FormModalProps = {
  visible: boolean;
  mode: 'create' | 'rename' | null;
  value: string;
  onChange: (text: string) => void;
  error?: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

function FormModal({ visible, mode, value, onChange, error, saving, onClose, onSubmit }: FormModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const title = mode === 'rename' ? t('households.renameTitle') : t('households.newTitle');
  const submitLabel = mode === 'rename' ? t('households.save') : t('households.create');

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
              label={t('households.nameLabel')}
              value={value}
              onChangeText={onChange}
              placeholder={t('households.namePlaceholder')}
              error={error}
              autoCapitalize="words"
              autoComplete="off"
            />
            <Text
              style={[typography['body-sm']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {t('households.nameHint')}
            </Text>
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <Button title={t('households.cancel')} variant="secondary" onPress={onClose} disabled={saving} />
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

type MemberModalProps = {
  visible: boolean;
  household: Household | null;
  userId: string;
  onChangeUserId: (text: string) => void;
  error?: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (userId: number) => void;
};

function MemberModal({
  visible,
  household,
  userId,
  onChangeUserId,
  error,
  saving,
  onClose,
  onSubmit,
}: MemberModalProps) {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const { cls, colors } = useTheme();
  const typography = typographyFor(language);
  const direction = language === 'ar' ? 'rtl' : 'ltr';
  const { data: user, isFetching, isError } = useUserLookupQuery(
    userId.trim() === '' ? undefined : Number(userId),
  );

  const alreadyMember =
    household?.members.some((member) => String(member.user_id) === userId.trim()) ?? false;
  const lookupId = Number(userId.trim());
  const canAdd = Number.isInteger(lookupId) && lookupId > 0 && !alreadyMember && !isFetching && Boolean(user);
  const checked = Number.isInteger(lookupId) && lookupId > 0 && !isFetching;

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
              {t('households.addMemberTitle')}
            </Text>
            <Text
              style={[typography['body-sm']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {household ? household.name : ''}
            </Text>
            <TextField
              label={t('households.userIdLabel')}
              value={userId}
              onChangeText={onChangeUserId}
              placeholder="12345"
              error={error}
              keyboardType="number-pad"
              autoComplete="off"
            />
            {isFetching ? (
              <View className="flex-row items-center gap-sm">
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[typography['body-sm']]}
                  className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
                  {t('households.userCheck')}
                </Text>
              </View>
            ) : checked && user && alreadyMember ? (
              <Text style={[typography['body-sm']]} className={cls('text-error', 'text-error-dark')}>
                {t('households.userAlreadyMember')}
              </Text>
            ) : checked && user ? (
              <Text style={[typography['body-md']]} className={cls('text-primary', 'text-primary-dark')}>
                {t('households.userFound', {
                  name: `${user.first_name} ${user.last_name}`.trim(),
                })}
              </Text>
            ) : checked && isError ? (
              <Text style={[typography['body-sm']]} className={cls('text-error', 'text-error-dark')}>
                {t('households.userNotFound', { id: userId.trim() })}
              </Text>
            ) : null}
            <Text
              style={[typography['body-sm']]}
              className={cls('text-on-surface-variant', 'text-on-surface-variant-dark')}>
              {t('households.userLookupHint')}
            </Text>
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <Button title={t('households.cancel')} variant="secondary" onPress={onClose} disabled={saving} />
              </View>
              <View className="flex-1">
                <Button
                  title={t('households.addMember')}
                  onPress={() => onSubmit(Number(userId.trim()))}
                  loading={saving}
                  disabled={!canAdd}
                />
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

function ConfirmModal({ title, body, confirmLabel, saving, onCancel, onConfirm }: ConfirmModalProps) {
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
            <Text
              style={[typography['body-md']]}
              className={cls('text-on-surface', 'text-on-surface-dark')}>
              {body}
            </Text>
            <View className="flex-row gap-sm">
              <View className="flex-1">
                <Button title={t('households.cancel')} variant="secondary" onPress={onCancel} disabled={saving} />
              </View>
              <View className="flex-1">
                <Button
                  title={confirmLabel}
                  variant="secondary"
                  onPress={onConfirm}
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