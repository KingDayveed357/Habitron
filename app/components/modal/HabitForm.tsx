// app/components/habit/HabitForm.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { View, ScrollView } from 'react-native';
import { HabitFormHeader } from './FormHeader';
import { HabitAISuggestions } from './AISuggestions';
import { HabitBasicInfo } from './BasicInfo';
import { HabitGoalSettings } from './GoalSettings';
import { HabitFrequency } from './frequency';
import { HabitColorPicker } from './colorPicker';
import { HabitDescription } from './description';
import { HabitPreview } from './preview';
import { HabitReminder } from '../ui/HabitReminder';
import { IconPickerModal } from './IconPickerModal';
import { useHabitForm } from '@/hooks/useHabitForm';
import { CreateHabitRequest, UpdateHabitRequest } from '@/types/habit';
import { HabitReminder as ReminderType } from '@/services/notificationService';

interface HabitFormCreateProps {
  mode: 'create';
  initialData?: Partial<CreateHabitRequest>;
  onSubmit: (data: CreateHabitRequest, reminders?: ReminderType[]) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface HabitFormEditProps {
  mode: 'edit';
  initialData: Partial<CreateHabitRequest> & { id: string };
  onSubmit: (data: UpdateHabitRequest, reminders?: ReminderType[]) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

type HabitFormProps = HabitFormCreateProps | HabitFormEditProps;

export const HabitForm: React.FC<HabitFormProps> = ({
  mode,
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const { user } = require('@/hooks/useAuth').useAuth();
  const [reminders, setReminders] = useState<ReminderType[]>([]);
  
  const {
    formData,
    errors,
    isIconModalVisible,
    setIsIconModalVisible,
    updateField,
    validateForm,
    handleSubmit,
    selectedDays,
    weeklyCount,
    monthlyDays,
    allDaysSelected,
    toggleDailyDay,
    toggleAllDays,
    toggleMonthlyDay,
    setWeeklyCount,
    categories,
    isAddingCategory,
    customCategory,
    setCustomCategory,
    setIsAddingCategory,
    addCustomCategory,
    iconModalTab,
    setIconModalTab,
  } = useHabitForm({
    initialData,
    onSubmit: async (data) => {
      // CRITICAL FIX: Pass reminders to onSubmit
      await onSubmit(data as any, reminders);
    },
  });

  const habitId = mode === 'edit' ? (initialData as any).id : undefined;
  const showAISuggestions = mode === 'create';
  const showPreview = mode === 'create';

  const handleRemindersChange = (newReminders: ReminderType[]) => {
    console.log('📝 Reminders updated in form:', newReminders);
    setReminders(newReminders);
  };

  if (!user) {
    return null;
  }

  return (
    <View className="flex-1">
      <HabitFormHeader
        mode={mode}
        onCancel={onCancel}
        onSave={() => handleSubmit(validateForm)}
        loading={loading}
        disabled={!formData.title.trim()}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="px-4">
          {showAISuggestions && (
            <HabitAISuggestions
              onSelectSuggestion={(suggestion) => {
                if (typeof suggestion === 'string') {
                  updateField('title', suggestion);
                } else {
                  Object.entries(suggestion).forEach(([key, value]) => {
                    updateField(key as any, value);
                  });
                }
              }}
            />
          )}

          <HabitBasicInfo
            title={formData.title}
            icon={formData.icon}
            category={formData.category}
            categories={categories}
            error={errors.title}
            onTitleChange={(text) => updateField('title', text)}
            onIconChange={(icon) => updateField('icon', icon)}
            onCategoryChange={(category) => updateField('category', category)}
            onShowIconModal={() => setIsIconModalVisible(true)}
            isAddingCategory={isAddingCategory}
            customCategory={customCategory}
            onCustomCategoryChange={setCustomCategory}
            onAddCategory={addCustomCategory}
            onToggleAddCategory={() => setIsAddingCategory(!isAddingCategory)}
          />

          <HabitColorPicker
            selectedColor={formData.bg_color}
            onColorChange={(color) => updateField('bg_color', color)}
          />

          <HabitGoalSettings
            targetCount={formData.target_count}
            targetUnit={formData.target_unit}
            onTargetCountChange={(count) => updateField('target_count', count)}
            onTargetUnitChange={(unit) => updateField('target_unit', unit)}
            errors={{
              targetCount: errors.target_count,
              targetUnit: errors.target_unit,
            }}
          />

          <HabitFrequency
            frequencyType={formData.frequency_type}
            onFrequencyTypeChange={(type) => updateField('frequency_type', type)}
            selectedDays={selectedDays}
            allDaysSelected={allDaysSelected}
            onToggleDailyDay={toggleDailyDay}
            onToggleAllDays={toggleAllDays}
            weeklyCount={weeklyCount}
            onWeeklyCountChange={setWeeklyCount}
            monthlyDays={monthlyDays}
            onToggleMonthlyDay={toggleMonthlyDay}
          />

          {/* REMINDER SECTION - Now properly integrated */}
          <HabitReminder
            habitId={habitId}
            habitTitle={formData.title || 'New Habit'}
            userId={user.id}
            mode={mode}
            onRemindersChange={handleRemindersChange}
          />

          <HabitDescription
            description={formData.description || ''}
            onDescriptionChange={(text) => updateField('description', text)}
            error={errors.description}
          />

          {showPreview && (
            <HabitPreview
              title={formData.title}
              icon={formData.icon}
              bgColor={formData.bg_color}
              targetCount={formData.target_count}
              targetUnit={formData.target_unit}
              frequencyType={formData.frequency_type}
              selectedDays={selectedDays}
              weeklyCount={weeklyCount}
              monthlyDays={monthlyDays}
              description={formData.description}
            />
          )}
        </View>
      </ScrollView>

      <IconPickerModal
        visible={isIconModalVisible}
        selectedIcon={formData.icon}
        activeTab={iconModalTab}
        onTabChange={setIconModalTab}
        onSelectIcon={(icon) => {
          updateField('icon', icon);
          setIsIconModalVisible(false);
        }}
        onClose={() => setIsIconModalVisible(false)}
      />
    </View>
  );
};