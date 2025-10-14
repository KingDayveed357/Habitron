// app/components/habit/HabitForm.tsx
import React from 'react';
import { View, ScrollView } from 'react-native';
import { HabitFormHeader } from './FormHeader';
import { HabitAISuggestions } from './AISuggestions';
import { HabitBasicInfo } from './BasicInfo';
import { HabitGoalSettings } from './GoalSettings';
import { HabitFrequency } from './frequency';
import { HabitColorPicker } from './colorPicker';
import { HabitDescription } from './description';
import { HabitPreview } from './preview';
import { IconPickerModal } from './IconPickerModal';
import { useHabitForm } from '@/hooks/useHabitForm';
import { CreateHabitRequest, UpdateHabitRequest } from '@/types/habit';

interface HabitFormCreateProps {
  mode: 'create';
  initialData?: Partial<CreateHabitRequest>;
  onSubmit: (data: CreateHabitRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface HabitFormEditProps {
  mode: 'edit';
  initialData: Partial<CreateHabitRequest>;
  onSubmit: (data: UpdateHabitRequest) => Promise<void>;
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
  const {
    formData,
    errors,
    isIconModalVisible,
    setIsIconModalVisible,
    updateField,
    validateForm,
    handleSubmit,
    // Frequency states
    selectedDays,
    weeklyCount,
    monthlyDays,
    allDaysSelected,
    toggleDailyDay,
    toggleAllDays,
    toggleMonthlyDay,
    setWeeklyCount,
    // Categories
    categories,
    isAddingCategory,
    customCategory,
    setCustomCategory,
    setIsAddingCategory,
    addCustomCategory,
    // Icon modal
    iconModalTab,
    setIconModalTab,
  } = useHabitForm({
    initialData,
    onSubmit,
  });

  const showAISuggestions = mode === 'create';
  const showPreview = mode === 'create';

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
          {/* AI Suggestions - Only in Create Mode */}
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

          {/* Basic Information */}
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

          {/* Color Picker */}
          <HabitColorPicker
            selectedColor={formData.bg_color}
            onColorChange={(color) => updateField('bg_color', color)}
          />

          {/* Goal Settings */}
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

          {/* Frequency */}
          <HabitFrequency
            frequencyType={formData.frequency_type}
            onFrequencyTypeChange={(type) => updateField('frequency_type', type)}
            // Daily
            selectedDays={selectedDays}
            allDaysSelected={allDaysSelected}
            onToggleDailyDay={toggleDailyDay}
            onToggleAllDays={toggleAllDays}
            // Weekly
            weeklyCount={weeklyCount}
            onWeeklyCountChange={setWeeklyCount}
            // Monthly
            monthlyDays={monthlyDays}
            onToggleMonthlyDay={toggleMonthlyDay}
          />

          {/* Preview - Only in Create Mode */}
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

          {/* Description */}
          <HabitDescription
            description={formData.description || ''}
            onDescriptionChange={(text) => updateField('description', text)}
            error={errors.description}
          />
        </View>
      </ScrollView>

      {/* Icon Picker Modal */}
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